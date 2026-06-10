'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import NotFound from '@/app/not-found';
import { IUser } from '@/types';
import { fetchUserById } from '@/lib/api';
import { useParams } from 'next/navigation';
import UserSummary from '@/components/userinfo/Summary';
import UserSettings from '@/components/userinfo/UserSettings';
import UserGames from '@/components/userinfo/UserGames';
import UserTransactions from '@/components/userinfo/UserTransactions';

const tabs = ["Summary", "Transactions", "Games", "Settings"];

const UserDetail = () => {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Summary");

  const params = useParams();
  const userId = params.id;

  useEffect(() => {
    if (user && user?.role !== 'user') {
      setIsAdmin(true);

      const token = localStorage.getItem('token');
      if (token) {
        fetchUserById(token, Number(userId))
          .then((res) => {
            setCurrentUser(res || null);
          })
          .catch((err) => {
            console.error('Error fetching users:', err);
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  if (!isAdmin) return <NotFound />;
  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-light-text dark:text-white">Loading...</div>
      </div>
    );
  }

  const tabs = ["Summary", "Settings", "Transactions", "Games"];

  return (
    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text dark:text-white shadow-lg p-4 sm:p-6 border border-light-border dark:border-dark-border rounded-lg">
      {/* Header */}
      <h2 className="text-lg font-semibold mb-4 text-center sm:text-left">
        User Information
      </h2>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-2 w-full">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full px-2 sm:px-3 md:px-4 py-2 rounded-lg font-medium transition text-[10px] sm:text-xs md:text-sm lg:text-base ${activeTab === tab
              ? "bg-primary text-white"
              : "bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-secondary dark:text-gray-400 hover:text-light-text dark:hover:text-white border border-light-border dark:border-transparent"
              }`}
          >
            {tab}
          </button>

        ))}
      </div>

      {/* Content */}
      <div className="mt-6">
        {currentUser && activeTab === "Summary" && <UserSummary user={currentUser} />}
        {currentUser && activeTab === "Settings" && <UserSettings user={currentUser} />}
        {currentUser && activeTab === "Transactions" && (
          <div className="overflow-x-auto">
            <UserTransactions id={currentUser.id} />
          </div>
        )}
        {currentUser && activeTab === "Games" && (
          <div className="overflow-x-auto">
            <UserGames id={currentUser.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
