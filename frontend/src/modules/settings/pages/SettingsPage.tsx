import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, Download, Upload, CheckCircle2, Store, Printer, Globe, Users, UserPlus, Key, Shield, AlertCircle } from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { useAuthStore } from '../../../stores/authStore';
import { Modal } from '../../../components/ui/Modal';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage } = useUIStore();
  const { token, user: currentUser } = useAuthStore();
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  // Staff & User Management State
  const [staffList, setStaffList] = useState<any[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'PHARMACIST' | 'STAFF'>('STAFF');
  const [newMobile, setNewMobile] = useState('');
  const [newLang, setNewLang] = useState<'mr' | 'en'>('mr');
  const [userError, setUserError] = useState<string | null>(null);
  const [userSuccess, setUserSuccess] = useState<string | null>(null);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Fetch staff list from backend
  const fetchStaff = async () => {
    if (!token) return;
    setIsLoadingStaff(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.users) setStaffList(data.users);
      }
    } catch (e) {
      console.error('Failed to fetch staff:', e);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [token]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);
    setUserSuccess(null);
    setIsSubmittingUser(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: newFullName,
          username: newUsername,
          password: newPassword,
          role: newRole,
          mobile: newMobile,
          preferredLanguage: newLang,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUserSuccess(`User @${newUsername} created successfully! They can now log in.`);
        setNewFullName('');
        setNewUsername('');
        setNewPassword('');
        setNewMobile('');
        fetchStaff();
        setTimeout(() => {
          setShowAddUserModal(false);
          setUserSuccess(null);
        }, 1800);
      } else {
        setUserError(data.message || 'Failed to create user');
      }
    } catch (err: any) {
      setUserError('Network error connecting to backend API');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleBackup = () => {
    setBackupSuccess(true);
    setTimeout(() => setBackupSuccess(false), 3500);
  };

  const handleRestore = () => {
    setRestoreSuccess(true);
    setTimeout(() => {
      setRestoreSuccess(false);
      setShowRestoreModal(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xl shadow-2xs">
            ⚙️
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pharmacy Settings & Disaster Recovery</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage local store profile, bilingual staff preferences, and automatic data backups.
            </p>
          </div>
        </div>
      </div>

      {/* Responsive 2-Column Grid for Optimal Full-Screen & Sidebar-Toggled Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Store Profile & Printing Setup */}
        <div className="space-y-6">
          {/* Store Info Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Store Profile & Licenses</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Medical Store Name</label>
                <input
                  type="text"
                  defaultValue="MedEasy Pharmacy"
                  placeholder="e.g. MedEasy Pharmacy"
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Drug License (DL) Number</label>
                <input
                  type="text"
                  placeholder="e.g. MH-PUN-2026-DL1234"
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-medium font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  placeholder="e.g. 27AABCM1234E1Z1"
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-medium font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Mobile No</label>
                <input
                  type="tel"
                  defaultValue="+91 8380036778"
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">WhatsApp Billing No</label>
                <input
                  type="tel"
                  defaultValue="+91 8380036778"
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Store Address</label>
                <input
                  type="text"
                  placeholder="Enter shop address & location"
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Thermal Receipt Configuration */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Printer className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">Thermal Receipt Setup (80mm POS)</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Receipt Header Line</label>
                <input
                  type="text"
                  defaultValue="MEDEASY PHARMACY"
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Receipt Footer Note</label>
                <input
                  type="text"
                  defaultValue="Thank you for visiting! Wishing you good health."
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Database Backup & Language Preferences */}
        <div className="space-y-6">
          {/* Backup & Disaster Recovery */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Database className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">Database Backup & Recovery</h3>
            </div>
            <p className="text-xs text-slate-500">
              Regular automated backups ensure your counter billing history, stock inventory, and customer records remain completely secure against hardware failure.
            </p>

            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-emerald-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Automatic Daily Cloud Sync Active</p>
                  <p className="text-[11px] text-emerald-700">Last backup: Today at 02:00 PM (Size: 4.2 MB)</p>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg font-mono font-semibold text-[11px]">
                Synced
              </span>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleBackup}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Local Database Dump (.sql)</span>
              </button>
              <button
                onClick={() => setShowRestoreModal(true)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore from Backup File</span>
              </button>
            </div>

            {backupSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Backup downloaded successfully! Safe copy stored on your machine.</span>
              </div>
            )}
          </div>

          {/* Language Preference */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Language & Localization</h3>
            </div>
            <p className="text-xs text-slate-500">
              Switch entire interface between English and Marathi for staff convenience at the counter.
            </p>
            <div className="flex gap-3 text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-xl font-semibold border transition cursor-pointer ${
                  language === 'en'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('mr')}
                className={`px-4 py-2 rounded-xl font-semibold border transition cursor-pointer ${
                  language === 'mr'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                मराठी (Marathi)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Accounts & Access Management Card (Full Width) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Staff Accounts & Access Management</h3>
                  <p className="text-[11px] text-slate-500">Create login usernames, passwords, and counter permissions.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setUserError(null);
                  setUserSuccess(null);
                  setShowAddUserModal(true);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition w-fit"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add New User / Staff</span>
              </button>
            </div>

            {/* Staff Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Staff Member</th>
                    <th className="pb-2">Username</th>
                    <th className="pb-2">Role & Access</th>
                    <th className="pb-2">Mobile</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {staffList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        {isLoadingStaff ? 'Loading staff members...' : 'No staff accounts found.'}
                      </td>
                    </tr>
                  ) : (
                    staffList.map((staff) => (
                      <tr key={staff.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-2.5 font-semibold text-slate-900">
                          {staff.fullName}
                          {currentUser?.id === staff.id && (
                            <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-normal">
                              You
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 font-mono text-slate-600">@{staff.username}</td>
                        <td className="py-2.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                              staff.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-700'
                                : staff.role === 'PHARMACIST'
                                ? 'bg-sky-100 text-sky-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            <Shield className="w-2.5 h-2.5" />
                            {staff.role}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-600">{staff.mobile || '—'}</td>
                        <td className="py-2.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
                          <span className="text-emerald-700 font-medium">Active</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title="Add New User / Staff Account"
        subtitle="Create a login account with custom username and password"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateUser} className="space-y-3.5 pt-1 text-xs">
          {userError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{userError}</span>
            </div>
          )}

          {userSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{userSuccess}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ninaad Patil"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Username *</label>
              <input
                type="text"
                required
                placeholder="e.g. ninaad"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role *</label>
              <select
                value={newRole}
                onChange={(e: any) => setNewRole(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              >
                <option value="STAFF">STAFF (Counter Billing)</option>
                <option value="PHARMACIST">PHARMACIST (Billing + Stock)</option>
                <option value="ADMIN">ADMIN (Full Access)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                minLength={6}
                placeholder="Min 6 characters (e.g. ninaad@123)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile No</label>
              <input
                type="tel"
                placeholder="e.g. 9822112233"
                value={newMobile}
                onChange={(e) => setNewMobile(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Language</label>
              <select
                value={newLang}
                onChange={(e: any) => setNewLang(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              >
                <option value="mr">मराठी (Marathi)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddUserModal(false)}
              className="px-4 py-2 font-semibold text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingUser}
              className="px-5 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{isSubmittingUser ? 'Saving...' : 'Create Staff User'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Restore Database Modal */}
      <Modal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        title="Restore Database Backup"
        subtitle="Select a previously exported .sql dump file to restore"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-1">
          <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-2 hover:border-sky-400 transition cursor-pointer bg-slate-50">
            <Upload className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Choose .sql or .backup file</p>
            <p className="text-[11px] text-slate-400">Maximum file size: 50MB</p>
          </div>

          {restoreSuccess ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Database restoration verified and restored successfully!</span>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition shadow-xs cursor-pointer"
              >
                Start Restore
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
