"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import NotFound from "../../not-found";
import { getAdminSettings, updateAdminSettings } from "@/lib/api/admin";
import { Settings, Save, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";

export default function AdminSettingsPage() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({
    siteName: 'SpinFox',
    siteDescription: 'Premium Crypto Casino',
    maintenanceMode: 'false',
    registrationEnabled: 'true',
    minWithdrawal: '10',
    maxWithdrawal: '10000',
    minDeposit: '5',
    maxDeposit: '50000',
    withdrawalFeePercentage: '2',
    supportEmail: 'support@spinfox.com',
    kycRequired: 'false',
  });

  const fetchSettings = async (token: string) => {
    try {
      setLoading(true);
      const data = await getAdminSettings(token);
      setSettings(prevSettings => ({...prevSettings, ...data}));
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user?.role !== 'user') {
      setIsAdmin(true);
      const token = localStorage.getItem('token');
      if (token) {
        fetchSettings(token);
      } else {
        setLoading(false);
      }
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setSaving(true);
    try {
      await updateAdminSettings(token, settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({...prev, [key]: value}));
  };

  if (!isAdmin) return <NotFound />;
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-900 dark:text-white">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Platform Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure your platform settings and preferences</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* General Settings */}
        <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">General Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Site Name</label>
              <input
                type="text"
                value={settings.siteName || ''}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg"
                placeholder="SpinFox"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Site Description</label>
              <textarea
                value={settings.siteDescription || ''}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg"
                rows={3}
                placeholder="Premium Crypto Casino"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail || ''}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg"
                placeholder="support@spinfox.com"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settings.maintenanceMode === 'true'}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked ? 'true' : 'false')}
                className="w-4 h-4"
              />
              <label htmlFor="maintenanceMode" className="flex items-center gap-2 text-yellow-500 font-medium">
                <AlertTriangle className="w-5 h-5" />
                Maintenance Mode (Site will be unavailable to users)
              </label>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <input
                type="checkbox"
                id="registrationEnabled"
                checked={settings.registrationEnabled === 'true'}
                onChange={(e) => handleChange('registrationEnabled', e.target.checked ? 'true' : 'false')}
                className="w-4 h-4"
              />
              <label htmlFor="registrationEnabled" className="text-blue-400 font-medium">
                Allow New User Registrations
              </label>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <input
                type="checkbox"
                id="kycRequired"
                checked={settings.kycRequired === 'true'}
                onChange={(e) => handleChange('kycRequired', e.target.checked ? 'true' : 'false')}
                className="w-4 h-4"
              />
              <label htmlFor="kycRequired" className="text-purple-400 font-medium">
                Require KYC Verification for Withdrawals
              </label>
            </div>
          </div>
        </div>

        {/* Transaction Limits */}
        <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Transaction Limits</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Min Deposit ($)</label>
              <input
                type="number"
                value={settings.minDeposit || ''}
                onChange={(e) => handleChange('minDeposit', e.target.value)}
                className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg"
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Max Deposit ($)</label>
              <input
                type="number"
                value={settings.maxDeposit || ''}
                onChange={(e) => handleChange('maxDeposit', e.target.value)}
                className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Min Withdrawal ($)</label>
              <input
                type="number"
                value={settings.minWithdrawal || ''}
                onChange={(e) => handleChange('minWithdrawal', e.target.value)}
                className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Max Withdrawal ($)</label>
              <input
                type="number"
                value={settings.maxWithdrawal || ''}
                onChange={(e) => handleChange('maxWithdrawal', e.target.value)}
                className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg"
                placeholder="10000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Withdrawal Fee (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.withdrawalFeePercentage || ''}
                onChange={(e) => handleChange('withdrawalFeePercentage', e.target.value)}
                className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg"
                placeholder="2"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Percentage fee charged on withdrawals
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Settings className="w-6 h-6 text-blue-500 mt-1" />
            <div>
              <h3 className="text-gray-900 dark:text-white font-semibold mb-2">Settings Information</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                These settings control core platform functionality. Changes take effect immediately.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Maintenance mode will prevent all users except admins from accessing the site</li>
                <li>• Transaction limits help manage risk and comply with regulations</li>
                <li>• KYC requirements can be enabled for enhanced security</li>
                <li>• Always test settings in a staging environment before applying to production</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
