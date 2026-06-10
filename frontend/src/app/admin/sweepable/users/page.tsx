"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import NotFound from "@/app/not-found";
import { IUser } from "@/types";
import { fetchSweepableUsers, sweepAllUsers } from "@/lib/api";
import { useParams } from "next/navigation";

const SweepableUsers = () => {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sweepableUsers, setSweepableUsers] = useState<IUser[]>([]);

  const params = useParams();
  const userId = params.id;

  useEffect(() => {
    if (user && user?.role !== "user") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const exceedBTC = process.env.SWEEP_BTC || 0.0001;
  const exceedSOL = process.env.SWEEP_SOL || 0.01;
  const exceedETH = process.env.SWEEP_ETH || 0.01;
  const exceedUSDT = process.env.SWEEP_BALANCE || 20;

  useEffect(() => {
    const init = async () => {
      const sweepableUsers = await fetchSweepableUsers();
      const filtered = (sweepableUsers || []).filter((u) => {
        const btc = parseFloat(u.btcBalance || "0");
        const sol = parseFloat(u.solBalance || "0");
        const eth = parseFloat(u.ethBalance || "0");
        const usdt = parseFloat(u.usdtBalance || "0");
        return (
          btc > Number(exceedBTC) ||
          sol > Number(exceedSOL) ||
          eth > Number(exceedETH) ||
          usdt > Number(exceedUSDT)
        );
      });
      setSweepableUsers(filtered);
      setLoading(false);
    };

    init();
  }, []);

  const truncateAddress = (address?: string) => {
    if (!address) return "-";
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}....${address.slice(-6)}`;
  };

  const getSweepableAddress = (user: IUser) => {
    const btc = parseFloat(user.btcBalance || "0");
    const sol = parseFloat(user.solBalance || "0");
    const eth = parseFloat(user.ethBalance || "0");
    const usdt = parseFloat(user.usdtBalance || "0");

    // Prioritize whichever balance > 20
    if (usdt > Number(exceedUSDT) && user.EVMAddress)
      return { type: "USDT", address: user.EVMAddress, amount: usdt };
    if (sol > Number(exceedSOL) && user.SOLAddress)
      return { type: "SOL", address: user.SOLAddress, amount: sol };
    if (btc > Number(exceedBTC) && user.BTCAddress)
      return { type: "BTC", address: user.BTCAddress, amount: btc };

    // If none are over 20
    return null;
  };


  if (!isAdmin) return <NotFound />;
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0d1a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] text-white shadow-lg p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-center sm:text-left">
          Sweepable Users
        </h2>
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded w-full sm:w-auto"
          onClick={() => {
            sweepAllUsers();
          }}
        >
          Sweep All
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto w-full rounded-lg">
        <table className="min-w-full bg-[#1f1f1f] text-white shadow-lg">
          <thead className="rounded-t-lg bg-[#333]">
            <tr>
              <th className="py-3 px-4 text-center">User</th>
              <th className="py-3 px-4 text-center">Amount</th>
              <th className="py-3 px-4 text-center">Type</th>
              <th className="py-3 px-4 text-center">Sweep</th>
            </tr>
          </thead>
          <tbody>
            {sweepableUsers?.length > 0 ? (
              sweepableUsers.map((row, index) => {
                const sweepInfo = getSweepableAddress(row);
                return (
                  <tr key={index} className="hover:bg-[#444] transition-colors">
                    {/* User */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-sm font-medium">
                          {row.username}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-center">
                      {sweepInfo
                        ? `${sweepInfo.amount.toFixed(2)} ${sweepInfo.type}`
                        : "-"}
                    </td>

                    {/* Address & Type */}
                    <td className="py-3 px-4 text-center">
                      {sweepInfo ? (
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-400">
                            {sweepInfo.type}
                          </span>
                          <span
                            className="font-semibold cursor-pointer hover:text-blue-400 transition-colors"
                            title="Click to copy"
                            onClick={() =>
                              navigator.clipboard.writeText(sweepInfo.address)
                            }
                          >
                            {truncateAddress(sweepInfo.address)}
                          </span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Sweep Button */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {}}
                        disabled={!sweepInfo}
                        className={`text-white px-3 py-1 rounded transition-colors ${
                          sweepInfo
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-600 cursor-not-allowed"
                        }`}
                        title="Sweep Funds"
                      >
                        Sweep
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SweepableUsers;
