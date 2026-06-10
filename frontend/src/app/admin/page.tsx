'use client';

import React, { useEffect, useState } from 'react';
import { Info, Search, Users, DollarSign, Calendar } from "lucide-react";
import { useUser } from '@/contexts/UserContext';
import NotFound from '../not-found';
import { getAdminUsers } from '@/lib/api/admin';
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar: string;
  realBalance: number;
  bonusBalance: number;
  level: number;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const fetchUsers = async (token: string, page: number, limit: number, search?: string) => {
    try {
      setLoading(true);
      const data = await getAdminUsers(token, page, limit, search);
      setUsers(data.users || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user?.role !== 'user') {
      setIsAdmin(true);
      const token = localStorage.getItem('token');
      if (token) {
        fetchUsers(token, currentPage, itemsPerPage, searchTerm || undefined);
      } else {
        setLoading(false);
      }
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user, currentPage, itemsPerPage]);

  const handleSearch = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setCurrentPage(1);
      fetchUsers(token, 1, itemsPerPage, searchTerm || undefined);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'super_admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'support': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (!isAdmin) return <NotFound />;
  
  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-light-text dark:text-white">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage all platform users</p>
      </div>

      {/* Stats Summary */}
      {pagination && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${users.reduce((sum, u) => sum + (u.realBalance || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Page</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pagination.page} / {pagination.totalPages}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Box */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="w-full pl-10 pr-4 py-2 bg-light-bg-tertiary dark:bg-dark-border text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Search
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg shadow-lg overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light-bg-tertiary dark:bg-dark-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-light-bg-tertiary dark:hover:bg-dark-border transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={usr.avatar || '/images/avatar/default.png'}
                          alt={usr.username}
                          className="w-10 h-10 rounded-full border-2 border-gray-600"
                          onError={(e) => {
                            e.currentTarget.src = '/images/avatar/default.png';
                          }}
                        />
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium">{usr.username}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">ID: {usr.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white text-sm">{usr.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getRoleBadgeColor(usr.role)}`}>
                        {usr.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-900 dark:text-white font-semibold">${(usr.realBalance || 0).toFixed(2)}</p>
                        {usr.bonusBalance > 0 && (
                          <p className="text-xs text-green-400">+${usr.bonusBalance.toFixed(2)} bonus</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-medium">
                        Lvl {usr.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(usr.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/admin/user/${usr.id}`)}
                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-500/10 rounded transition"
                        title="View Details"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden">
          {users.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
              No users found
            </div>
          ) : (
            users.map((usr) => (
              <div
                key={usr.id}
                className="p-4 border-b border-light-border dark:border-dark-border hover:bg-light-bg-tertiary dark:hover:bg-dark-border transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={usr.avatar || '/images/avatar/default.png'}
                      alt={usr.username}
                      className="w-12 h-12 rounded-full border-2 border-gray-600"
                      onError={(e) => {
                        e.currentTarget.src = '/images/avatar/default.png';
                      }}
                    />
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">{usr.username}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{usr.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/admin/user/${usr.id}`)}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Role:</span>
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs border ${getRoleBadgeColor(usr.role)}`}>
                      {usr.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Level:</span>
                    <span className="ml-2 text-purple-400">Lvl {usr.level}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Balance:</span>
                    <span className="ml-2 text-gray-900 dark:text-white font-semibold">${(usr.realBalance || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{new Date(usr.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-light-bg-tertiary dark:bg-dark-border gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-3 py-1 bg-light-bg-secondary dark:bg-dark-bg-tertiary text-gray-900 dark:text-white rounded border border-light-border dark:border-transparent"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} users
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-light-bg-secondary dark:bg-dark-bg-tertiary text-gray-900 dark:text-white rounded hover:bg-light-border dark:hover:bg-dark-bg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <div className="flex items-center px-4 py-2 bg-blue-600 text-white rounded">
                {currentPage} / {pagination.totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-4 py-2 bg-light-bg-secondary dark:bg-dark-bg-tertiary text-gray-900 dark:text-white rounded hover:bg-light-border dark:hover:bg-dark-bg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
