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

    # 14. Customer Management Endpoints
    cust_data = {
        "fullName": "Ramesh Patil",
        "mobile": "9876543210",
        "address": "Shivaji Nagar, Kolhapur"
    }
    code, res_cust = make_request("/api/customers", method="POST", data=cust_data, token=admin_token)
    test("POST /api/customers (Create/Upsert Customer)", 201, code, res_cust.get("success") is True)
    created_cust_id = res_cust.get("customer", {}).get("id")

    # 15. Fetch Customers List
    code, res_cust_list = make_request("/api/customers", method="GET", token=admin_token)
    has_ramesh = any(c.get("mobile") == "9876543210" for c in res_cust_list.get("customers", []))
    test("GET /api/customers (List Customers)", 200, code, has_ramesh)

    # 16. Fetch Customer by ID
    if created_cust_id:
        code, res_single_cust = make_request(f"/api/customers/{created_cust_id}", method="GET", token=admin_token)
        test("GET /api/customers/:id (Customer Profile)", 200, code, res_single_cust.get("success") is True)

    # 17. POS Sale Checkout & Invoice Creation
    sale_data = {
        "customerId": created_cust_id,
        "customerName": "Ramesh Patil",
        "customerMobile": "9876543210",
        "doctorName": "Dr. Joshi",
        "paymentMode": "CASH",
        "items": [
            {
                "medicineName": "Dolo 650 Tablet",
                "batchNumber": "DL-2026-99",
                "expiryDate": "2027-12-31",
                "quantity": 2,
                "mrp": 33.60,
                "sellingPrice": 30.00,
                "discountPercent": 0,
                "gstRate": 12.0,
                "total": 60.00
            }
        ],
        "subtotal": 60.00,
        "discountAmount": 0,
        "gstAmount": 7.20,
        "netTotal": 60.00
    }
    code, res_sale = make_request("/api/sales", method="POST", data=sale_data, token=admin_token)
    test("POST /api/sales (Complete POS Sale & Invoice)", 201, code, res_sale.get("success") is True)
    created_invoice_id = res_sale.get("invoice", {}).get("id")

    # 18. Fetch Sales History & Analytics
    code, res_sales_list = make_request("/api/sales", method="GET", token=admin_token)
    has_invoice = any(s.get("id") == created_invoice_id for s in res_sales_list.get("invoices", []))
    test("GET /api/sales (List Invoices & Stats)", 200, code, has_invoice and "stats" in res_sales_list)

    # 19. Fetch Single Invoice Details
    if created_invoice_id:
        code, res_single_inv = make_request(f"/api/sales/{created_invoice_id}", method="GET", token=admin_token)
        test("GET /api/sales/:id (Invoice Details & Items)", 200, code, len(res_single_inv.get("invoice", {}).get("items", [])) > 0)

    # 20. Verify Customer Stats in DB after Sale
    if created_cust_id:
        code, res_cust_after = make_request(f"/api/customers/{created_cust_id}", method="GET", token=admin_token)
        cust_info = res_cust_after.get("customer", {})
        test("VERIFY: Customer lifetime spend & bills updated", 200, code, cust_info.get("totalBills", 0) >= 1)

    # 21. Supplier Management Endpoints
    supplier_data = {
        "name": "Apollo Pharma Distributors",
        "contactPerson": "Sachin Kulkarni",
        "mobile": "9822001122",
        "gstin": "27AABCA1234F1Z5",
        "dlNumber": "MH-KOL-20B-9988",
        "address": "Market Yard, Kolhapur"
    }
    code, res_sup = make_request("/api/suppliers", method="POST", data=supplier_data, token=admin_token)
    test("POST /api/suppliers (Create Supplier)", 201, code, res_sup.get("success") is True)
    created_sup_id = res_sup.get("supplier", {}).get("id")

    # 22. Fetch Suppliers List
    code, res_sup_list = make_request("/api/suppliers", method="GET", token=admin_token)
    has_supplier = any(s.get("name") == "Apollo Pharma Distributors" for s in res_sup_list.get("suppliers", []))
    test("GET /api/suppliers (List Suppliers)", 200, code, has_supplier)

    # 23. Distributor Purchase Inward Entry
    purchase_data = {
        "supplierId": created_sup_id,
        "supplierName": "Apollo Pharma Distributors",
        "supplierInvoiceNumber": "DIST-INV-2026-887",
        "purchaseDate": "2026-10-06",
        "paymentMode": "BANK_TRANSFER",
        "items": [
            {
                "medicineName": "Azithral 500 Tablet",
                "genericName": "Azithromycin 500mg",
                "batchNumber": "AZ-OCT26-01",
                "expiryDate": "2028-09-30",
                "quantity": 20,
                "freeQuantity": 2,
                "purchasePrice": 95.00,
                "mrp": 132.00,
                "sellingPrice": 125.00,
                "gstRate": 12.0,
                "total": 1900.00
            }
        ],
        "subtotal": 1900.00,
        "discountAmount": 0,
        "gstAmount": 228.00,
        "netTotal": 2128.00
    }
    code, res_pur = make_request("/api/purchases", method="POST", data=purchase_data, token=admin_token)
    test("POST /api/purchases (Inward Distributor Invoice & Stock)", 201, code, res_pur.get("success") is True)

    # 24. Fetch Purchase Invoices List
    code, res_pur_list = make_request("/api/purchases", method="GET", token=admin_token)
    has_purchase = any(p.get("invoiceNumber") == "DIST-INV-2026-887" for p in res_pur_list.get("purchases", []))
    test("GET /api/purchases (List Purchase Invoices)", 200, code, has_purchase)

    # 25. Verify Newly Inwarded Medicine & Batch Stock Appears in Inventory Search
    code, res_med_search = make_request("/api/medicines/search?q=azithral&limit=5")
    has_azithral_batch = any(m.get("batch_number") == "AZ-OCT26-01" for m in res_med_search.get("storeMatches", []))
    test("VERIFY: Inwarded batch AZ-OCT26-01 in stockMatches", 200, code, has_azithral_batch)

    # 26. Pharmacy Store Profile Endpoints
    code, res_store = make_request("/api/store", method="GET", token=admin_token)
    test("GET /api/store (Pharmacy Store Profile)", 200, code, res_store.get("success") is True)

    code, res_store_up = make_request(
        "/api/store", 
        method="PUT", 
        data={"storeName": "MedEasy Pharmacy", "dlNumber": "MH-PUN-2026-DL789", "gstin": "27ABCDE1234F1Z5"}, 
        token=admin_token
    )
    test("PUT /api/store (Update Pharmacy Profile & DL)", 200, code, res_store_up.get("success") is True)

    # 27. Cancel / Refund Sale Invoice with Stock Reversal
    if created_invoice_id:
        code, res_cancel = make_request(f"/api/sales/{created_invoice_id}/cancel", method="POST", token=admin_token)
        test("POST /api/sales/:id/cancel (Cancel Invoice & Reverse Stock)", 200, code, res_cancel.get("success") is True)

    # 28. Forgot Password Flow
    forgot_data = {
        "mobile": "8380036778",
        "new_password": "password123"
    }
    code, res = make_request("/api/auth/forgot-password", method="POST", data=forgot_data)
    test("POST /api/auth/forgot-password (Mobile password reset)", 200, code, res.get("success") is True)

    # 29. Logout
    code, res = make_request("/api/auth/logout", method="POST", data={})
    test("POST /api/auth/logout", 200, code, res.get("success") is True)

    print("-" * 70)
    print(f"TEST RESULTS: Total: {total} | Passed: {passed} | Failed: {failed}")
    print("=" * 70)
    return failed == 0

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
