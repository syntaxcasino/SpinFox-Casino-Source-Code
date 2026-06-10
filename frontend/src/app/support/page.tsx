"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useUser } from "@/contexts/UserContext";
import { motion } from "framer-motion";
import { MessageCircle, HelpCircle, Ticket, Search, Plus, Send } from "lucide-react";
import LiveSupportChat from "@/components/support/LiveSupportChat";
import SupportTickets from "@/components/support/SupportTickets";
import FaqSection from "@/components/support/FaqSection";

type SupportTab = "faq" | "tickets" | "live-support";

export default function SupportPage() {
  const { t } = useTranslation("support");
  const { isLoggedIn } = useUser();
  const [activeTab, setActiveTab] = useState<SupportTab>("faq");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "faq" as SupportTab, label: "FAQ", icon: HelpCircle },
    { id: "tickets" as SupportTab, label: "Support Tickets", icon: Ticket },
    { id: "live-support" as SupportTab, label: "Live Support", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t("title", "Support Center")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {t("subtitle", "Get help with your account, games, and more")}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t("searchPlaceholder", "Search FAQ or support topics...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm dark:shadow-none"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 flex space-x-1 shadow-sm dark:shadow-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "faq" && (
              <FaqSection searchQuery={searchQuery} />
            )}
            {activeTab === "tickets" && (
              <SupportTickets />
            )}
            {activeTab === "live-support" && (
              <LiveSupportChat />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
