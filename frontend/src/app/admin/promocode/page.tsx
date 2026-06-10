"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import NotFound from "../../not-found";
import { 
  getAdminPromotions, 
  createPromotion, 
  updatePromotion, 
  deletePromotion 
} from "@/lib/api/admin";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Gift } from "lucide-react";
import { toast } from "react-toastify";

interface Promotion {
  id: number;
  name: string;
  title: string;
  subtitle: string;
  type: string;
  value: number;
  badge: string;
  bonus: string;
  spins: string;
  buttonText: string;
  ctaLabel: string;
  imageSrc: string;
  description: string;
  terms: string;
  active: boolean;
  priority: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPromocodePage() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    type: 'percentage' as 'fixed' | 'percentage',
    value: 0,
    maxUses: 100,
    minDeposit: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    active: true,
  });

  const fetchPromotions = async (token: string) => {
    try {
      setLoading(true);
      const data = await getAdminPromotions(token);
      setPromotions(data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user?.role !== 'user') {
      setIsAdmin(true);
      const token = localStorage.getItem('token');
      if (token) {
        fetchPromotions(token);
      } else {
        setLoading(false);
      }
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const handleCreatePromotion = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await createPromotion(token, formData);
      toast.success('Promotion created successfully');
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        code: '',
        type: 'percentage',
        value: 0,
        maxUses: 100,
        minDeposit: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        active: true,
      });
      fetchPromotions(token);
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast.error('Failed to create promotion');
    }
  };

  const handleToggleActive = async (promotion: Promotion) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await updatePromotion(token, {
        id: promotion.id,
        active: !promotion.active,
      });
      toast.success(`Promotion ${!promotion.active ? 'activated' : 'deactivated'}`);
      fetchPromotions(token);
    } catch (error) {
      console.error('Error toggling promotion:', error);
      toast.error('Failed to update promotion');
    }
  };

  const handleDeletePromotion = async (promotionId: number) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await deletePromotion(token, promotionId);
      toast.success('Promotion deleted successfully');
      fetchPromotions(token);
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Failed to delete promotion');
    }
  };

  if (!isAdmin) return <NotFound />;
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-900 dark:text-white">
        Loading promotions...
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Promo Code Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage promotional campaigns</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          Create Promotion
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Promotions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{promotions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ToggleRight className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Promotions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {promotions.filter(p => p.active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ToggleLeft className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inactive Promotions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {promotions.filter(p => !p.active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-600 dark:text-gray-400">
            No promotions found. Create your first promotion to get started!
          </div>
        ) : (
          promotions.map((promotion) => (
            <div
              key={promotion.id}
              className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-4 shadow-lg border border-light-border dark:border-transparent"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{promotion.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{promotion.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(promotion)}
                    className="p-2 hover:bg-light-bg-tertiary dark:hover:bg-dark-border rounded transition"
                    title={promotion.active ? 'Deactivate' : 'Activate'}
                  >
                    {promotion.active ? (
                      <ToggleRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeletePromotion(promotion.id)}
                    className="p-2 hover:bg-red-500/20 rounded transition"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`font-medium ${promotion.active ? 'text-green-500' : 'text-red-500'}`}>
                    {promotion.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {promotion.value && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Value:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{promotion.value}</span>
                  </div>
                )}

                {promotion.bonus && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Bonus:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{promotion.bonus}</span>
                  </div>
                )}

                {promotion.spins && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Spins:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{promotion.spins}</span>
                  </div>
                )}

                {promotion.startDate && promotion.endDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Period:</span>
                    <span className="text-gray-900 dark:text-white text-xs">
                      {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {promotion.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                    {promotion.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Promotion Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create New Promotion</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Promotion Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg"
                  placeholder="e.g., Welcome Bonus"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg"
                  rows={3}
                  placeholder="Describe the promotion..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Promo Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg"
                    placeholder="WELCOME100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'fixed' | 'percentage'})}
                    className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Value</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Max Uses</label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({...formData, maxUses: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Min Deposit ($)</label>
                <input
                  type="number"
                  value={formData.minDeposit}
                  onChange={(e) => setFormData({...formData, minDeposit: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg"
                  placeholder="20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-sm text-gray-600 dark:text-gray-400">
                  Set as active immediately
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreatePromotion}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Create Promotion
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
