"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import NotFound from "../../not-found";

export default function AdminAffiliatesPage() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user?.role !== 'user') {
      setIsAdmin(true);
    }
    setLoading(false);
  }, [user]);

  if (!isAdmin) return <NotFound />;
  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

  const mock = [
    { id: 'AFF-101', name: 'Ace Partners', clicks: 1234, signups: 56 },
    { id: 'AFF-102', name: 'Beta Media', clicks: 845, signups: 32 },
  ];

  return (
    <div className="px-4">
      <h1 className="text-2xl font-bold text-white mb-4">Affiliates</h1>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-light-bg-secondary dark:bg-dark-bg-tertiary text-light-text dark:text-white shadow-lg border border-light-border dark:border-transparent">
          <thead className="bg-light-bg-tertiary dark:bg-dark-border">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Clicks</th>
              <th className="py-3 px-4 text-left">Signups</th>
            </tr>
          </thead>
          <tbody>
            {mock.map((row) => (
              <tr key={row.id} className="hover:bg-light-bg-tertiary dark:hover:bg-dark-border transition-colors">
                <td className="py-3 px-4">{row.id}</td>
                <td className="py-3 px-4">{row.name}</td>
                <td className="py-3 px-4">{row.clicks}</td>
                <td className="py-3 px-4">{row.signups}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


