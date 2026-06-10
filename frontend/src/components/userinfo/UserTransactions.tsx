"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IUser } from "@/types";
interface UserTransactionsProps {
  id: number;
}

export default function UserTransactions({ id }: UserTransactionsProps) {
  console.log("transactions id", id);

  return (
    <>
      <div className="overflow-x-auto w-full rounded-lg">
        <table className="min-w-full bg-light-bg-secondary dark:bg-dark-bg-tertiary text-light-text dark:text-white shadow-lg border border-light-border dark:border-transparent">
          <thead className="rounded-t-lg bg-light-bg-tertiary dark:bg-dark-border">
            <tr>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Method</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {/* {currentUsers.length > 0 ? (
                currentUsers.map((row, index) => (
                  <tr key={index} className="hover:bg-[#444]">
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-start gap-3">
                      <img
                        src={row.avatar ? row.avatar : `/images/avatar/default.png`}
                        alt={`${row.username} avatar`}
                        className="w-8 h-8 rounded-full object-cover border border-gray-500"
                      />
                      <span className="text-sm font-medium">{row.username}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-left">{row.role}</td>
                  <td className="py-3 px-4 text-left">{row.balance}</td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => router.push(`/admin/user/${row.id}`)}
                      className="text-blue-400 hover:text-blue-600 transition"
                      title="View Details"
                    >
                      <Info className="w-5 h-5 mx-auto" />
                    </button>
                  </td>
                </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-4 text-gray-400"
                  >
                    No users found
                  </td>
                </tr>
              )} */}
          </tbody>
        </table>
      </div>
    </>
  );
}
