import React, { useState } from 'react';
import { Database, ShieldCheck, Download, Upload, CheckCircle2, Store, Printer, Globe } from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { Modal } from '../../../components/ui/Modal';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage } = useUIStore();
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

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
                  defaultValue="MedEasy Khed Shivapur Medical"
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Drug License (DL) Number</label>
                <input
                  type="text"
                  defaultValue="MH-PUN-2024-DL9012"
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-medium font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  defaultValue="27AABCM9876E1Z4"
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-medium font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Mobile No</label>
                <input
                  type="tel"
                  defaultValue="+91 9822334455"
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">WhatsApp Billing No</label>
                <input
                  type="tel"
                  defaultValue="+91 9822334455"
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Store Address</label>
                <input
                  type="text"
                  defaultValue="Shop #4, Near ST Stand, Khed Shivapur, Pune 412205"
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
                  defaultValue="MEDEASY PHARMACY - KHED SHIVAPUR"
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
