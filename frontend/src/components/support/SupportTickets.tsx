"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useUser } from "@/contexts/UserContext";
import { motion } from "framer-motion";
import { Plus, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import CreateTicketModal from "./CreateTicketModal";

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority?: "low" | "medium" | "high" | "urgent";
  category?: "technical" | "billing" | "account" | "general" | "game_issue";
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

interface SupportMessage {
  id: string;
  message: string;
  isFromAdmin: boolean;
  createdAt: string;
  sender?: {
    id: number;
    username: string;
  };
}

export default function SupportTickets() {
  const { t } = useTranslation("support");
  const { isLoggedIn } = useUser();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      fetchTickets();
    }
  }, [isLoggedIn]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (ticketId: string) => {
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        const message = await response.json();
        setNewMessage("");
        fetchTickets(); // Refresh tickets to get updated messages
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "closed":
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-500";
      case "high":
        return "text-orange-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Login Required</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to view and create support tickets.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Tickets Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first support ticket to get help with any issues.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Create Support Ticket
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets List */}
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm dark:shadow-none ${
                  selectedTicket?.id === ticket.id ? "ring-2 ring-blue-500" : ""
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-gray-900 dark:text-white font-semibold line-clamp-1">{ticket.subject}</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(ticket.status)}
                    {ticket.priority && (
                      <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-2">{ticket.message}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <span>{ticket.category || "General"}</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Ticket Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm dark:shadow-none">
            {selectedTicket ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedTicket.subject}</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedTicket.status)}
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{selectedTicket.status}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Category: {selectedTicket.category || "General"}</p>
                  <p>Priority: {selectedTicket.priority || "Medium"}</p>
                  <p>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.isFromAdmin
                          ? "bg-blue-50 dark:bg-blue-900 ml-8"
                          : "bg-gray-50 dark:bg-gray-700 mr-8"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {message.isFromAdmin ? "Support Agent" : "You"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{message.message}</p>
                    </div>
                  ))}
                </div>

                {selectedTicket.status !== "closed" && (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === "Enter" && sendMessage(selectedTicket.id)}
                    />
                    <button
                      onClick={() => sendMessage(selectedTicket.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a Ticket</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a ticket from the list to view details and messages.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={fetchTickets}
      />
    </div>
  );
}
