import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://localhost:5000"

def make_request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_body)
        except:
            parsed = {"raw": err_body}
        return e.code, parsed
    except Exception as e:
        return 500, {"error": str(e)}

def run_tests():
    print("=" * 70)
    print("RUNNING COMPREHENSIVE AUTOMATED TESTS FOR MEDEASY PHARMACY OS")
    print("=" * 70)
    
    total = 0
    passed = 0
    failed = 0

    def test(name, status_code_expected, actual_code, condition=True):
        nonlocal total, passed, failed
        total += 1
        if actual_code == status_code_expected and condition:
            passed += 1
            print(f"  [PASS] {name} (HTTP {actual_code})")
            return True
        else:
            failed += 1
            print(f"  [FAIL] {name} (Expected {status_code_expected}, Got {actual_code})")
            return False

    # 1. Base Health Check
    code, res = make_request("/api/health")
    test("GET /api/health", 200, code, res.get("success") is True)

    # 2. Database Health Check
    code, res = make_request("/api/db/health")
    test("GET /api/db/health (PostgreSQL connected)", 200, code, res.get("status") == "connected")

    # 3. Login as Admin
    admin_login_data = {"username": "ninaad_nk", "password": "password123"}
    code, res = make_request("/api/auth/login", method="POST", data=admin_login_data)
    admin_token = res.get("token")
    test("POST /api/auth/login (Admin credentials)", 200, code, admin_token is not None and res.get("user", {}).get("role") == "ADMIN")

    # 4. Verify Admin Token
    code, res = make_request("/api/auth/me", token=admin_token)
    test("GET /api/auth/me (Verify Bearer JWT)", 200, code, res.get("user", {}).get("username") == "ninaad_nk")

    # 5. List Users (Admin authorized)
    code, res = make_request("/api/auth/users", token=admin_token)
    test("GET /api/auth/users (Admin can view users)", 200, code, isinstance(res.get("users"), list))

    # 6. Register a Test Staff User
    test_staff_username = "test_staff_auto"
    register_data = {
        "username": test_staff_username,
        "password": "staffpassword123",
        "full_name": "Automated Test Staff",
        "mobile": "9988776655",
        "role": "STAFF",
        "preferred_language": "en"
    }
    code, res = make_request("/api/auth/register", method="POST", data=register_data, token=admin_token)
    # 201 Created or 409 if already exists
    test("POST /api/auth/register (Admin creates STAFF user)", 201 if code == 201 else 409, code, True)

    # 7. Login as Staff User
    staff_login_data = {"username": test_staff_username, "password": "staffpassword123"}
    code, res = make_request("/api/auth/login", method="POST", data=staff_login_data)
    staff_token = res.get("token")
    test("POST /api/auth/login (Staff login)", 200, code, staff_token is not None and res.get("user", {}).get("role") == "STAFF")

    # 8. Test RBAC Security: Staff User CANNOT register users
    code, res = make_request("/api/auth/register", method="POST", data=register_data, token=staff_token)
    test("RBAC Security: STAFF calling POST /api/auth/register blocked", 403, code, res.get("success") is False)

    # 9. Search Master Medicines (Brand: 'dolo')
    code, res = make_request("/api/medicines/master?q=dolo&limit=5")
    test("GET /api/medicines/master?q=dolo (Brand search)", 200, code, res.get("count", 0) > 0)

    # 10. Search Master Medicines (Generic Salt: 'amoxicillin')
    code, res = make_request("/api/medicines/master?q=amoxicillin&limit=5")
    test("GET /api/medicines/master?q=amoxicillin (Salt search)", 200, code, res.get("count", 0) > 0)

    # 11. Unified Medicine Search ('pan')
    code, res = make_request("/api/medicines/search?q=pan&limit=5")
    test("GET /api/medicines/search?q=pan (Unified search)", 200, code, "masterMatches" in res)

    # 12. Inward a Master Medicine into Store Inventory
    # Fetch a master medicine id first
    master_med_id = res.get("masterMatches", [{}])[0].get("id")
    if master_med_id:
        inward_data = {
            "master_medicine_id": master_med_id,
            "batch_number": "BATCH-TEST-AUTO-01",
            "expiry_date": "2028-12-31",
            "quantity": 50,
            "rack_location": "Rack A-01"
        }
        code, res_inward = make_request("/api/medicines/inward-from-master", method="POST", data=inward_data, token=admin_token)
        test("POST /api/medicines/inward-from-master (Inward to stock)", 201, code, res_inward.get("success") is True)

        # 13. Verify inwarded medicine now appears in storeMatches
        code, res_verify = make_request(f"/api/medicines/search?q=pan&limit=5")
        has_store_match = any(m.get("batch_number") == "BATCH-TEST-AUTO-01" for m in res_verify.get("storeMatches", []))
        test("VERIFY: Inwarded medicine appears in storeMatches (In Stock)", 200, code, has_store_match)

    # 14. Forgot Password Flow
    forgot_data = {
        "mobile": "8380036778",
        "new_password": "password123"
    }
    code, res = make_request("/api/auth/forgot-password", method="POST", data=forgot_data)
    test("POST /api/auth/forgot-password (Mobile password reset)", 200, code, res.get("success") is True)

    # 15. Logout
    code, res = make_request("/api/auth/logout", method="POST", data={})
    test("POST /api/auth/logout", 200, code, res.get("success") is True)

    print("-" * 70)
    print(f"TEST RESULTS: Total: {total} | Passed: {passed} | Failed: {failed}")
    print("=" * 70)
    return failed == 0

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
