"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { motion } from "framer-motion";
import { MessageCircle, Ticket, Users, Clock, CheckCircle, AlertCircle, Eye, Send } from "lucide-react";
import { io, Socket } from "socket.io-client";

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority?: "low" | "medium" | "high" | "urgent";
  category?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  messages: any[];
}

interface LiveSupportSession {
  id: string;
  status: "waiting" | "active" | "ended";
  createdAt: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  adminId?: string;
  messages: any[];
}

export default function AdminSupportDashboard() {
  const { t } = useTranslation("admin");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSupportSession[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedSession, setSelectedSession] = useState<LiveSupportSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tickets" | "live-support">("tickets");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    
    // Initialize WebSocket connection for admin
    const token = localStorage.getItem("token");
    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/live-support`, {
      auth: { token },
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Admin connected to live support");
    });

    newSocket.on("live_message", (data) => {
      // Update the selected session with new message
      setSelectedSession(prev => {
        if (!prev || prev.id !== data.sessionId) return prev;
        return {
          ...prev,
          messages: [...(prev.messages || []), data],
        };
      });
      
      // Update the sessions list
      setLiveSessions(prev => prev.map(session => {
        if (session.id === data.sessionId) {
          return {
            ...session,
            messages: [...(session.messages || []), data],
          };
        }
        return session;
      }));
    });

    newSocket.on("new_waiting_session", (data) => {
      // Refresh data when new session is created
      fetchData();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      // Fetch tickets
      const ticketsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        setTickets(ticketsData);
      }

      // Fetch live support sessions
      const sessionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/live-sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setLiveSessions(sessionsData);
      }
    } catch (error) {
      console.error("Error fetching support data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/tickets/${ticketId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const assignLiveSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/live-sessions/${sessionId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminId: "admin-1" }), // Replace with actual admin ID
      });
      
      if (response.ok) {
        // Join the WebSocket room for this session
        if (socket) {
          socket.emit("admin_join_session", { 
            sessionId, 
            adminId: "admin-1" 
          });
        }
        
        // Update the session status locally
        setLiveSessions(prev => prev.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              status: "active",
              adminId: "admin-1"
            };
          }
          return session;
        }));
        
        // If this session is selected, update it too
        setSelectedSession(prev => {
          if (prev && prev.id === sessionId) {
            return {
              ...prev,
              status: "active",
              adminId: "admin-1"
            };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Error assigning session:", error);
    }
  };

  const sendAdminMessage = async (sessionId: string) => {
    if (!adminMessage.trim() || !socket) return;

    try {
      socket.emit("admin_send_message", {
        sessionId,
        message: adminMessage.trim(),
      });
      setAdminMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const sendTicketMessage = async (ticketId: string) => {
    if (!ticketMessage.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          message: ticketMessage.trim()
        }),
      });

      if (response.ok) {
        setTicketMessage("");
        fetchData(); // Refresh data to get updated messages
      }
    } catch (error) {
      console.error("Error sending ticket message:", error);
    }
  };

  const endSession = async (sessionId: string) => {
    if (!socket) return;

    try {
      socket.emit("end_live_session", { sessionId });
      
      // Update session status locally
      setLiveSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            status: "ended"
          };
        }
        return session;
      }));
      
      setSelectedSession(prev => {
        if (prev && prev.id === sessionId) {
          return {
            ...prev,
            status: "ended"
          };
        }
        return prev;
      });
    } catch (error) {
      console.error("Error ending session:", error);
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
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      case "waiting":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "ended":
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "tickets"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <Ticket className="w-4 h-4 inline mr-2" />
            Support Tickets
          </button>
          <button
            onClick={() => setActiveTab("live-support")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "live-support"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Live Support
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{tickets.length}</p>
            </div>
            <Ticket className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Open Tickets</p>
              <p className="text-2xl font-bold text-yellow-500">
                {tickets.filter(t => t.status === "open").length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Live Sessions</p>
              <p className="text-2xl font-bold text-green-500">
                {liveSessions.filter(s => s.status === "active").length}
              </p>
            </div>
            <MessageCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Waiting Sessions</p>
              <p className="text-2xl font-bold text-orange-500">
                {liveSessions.filter(s => s.status === "waiting").length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === "tickets" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Support Tickets</h2>
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
                  <h3 className="text-gray-900 dark:text-white font-semibold">{ticket.subject}</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(ticket.status)}
                    {ticket.priority && (
                      <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{ticket.message}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <span>{ticket.user.username}</span>
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
                  <p><strong>User:</strong> {selectedTicket.user.username} ({selectedTicket.user.email})</p>
                  <p><strong>Category:</strong> {selectedTicket.category || "General"}</p>
                  <p><strong>Priority:</strong> {selectedTicket.priority || "Medium"}</p>
                  <p><strong>Created:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-900 dark:text-white font-semibold mb-2">Initial Message:</h4>
                  <p className="text-gray-700 dark:text-gray-300">{selectedTicket.message}</p>
                </div>

                {/* Messages History */}
                {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="text-gray-900 dark:text-white font-semibold mb-3">Conversation:</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedTicket.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.isFromAdmin ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg ${
                              msg.isFromAdmin
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white"
                            }`}
                          >
                            <div className="text-sm">{msg.message}</div>
                            <div className={`text-xs mt-1 ${
                              msg.isFromAdmin ? "text-blue-200" : "text-gray-500 dark:text-gray-300"
                            }`}>
                              {msg.isFromAdmin ? "Admin" : msg.sender?.username || "User"} • {new Date(msg.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Response Input */}
                <div className="space-y-3">
                  <h4 className="text-gray-900 dark:text-white font-semibold">Respond to Ticket:</h4>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendTicketMessage(selectedTicket.id)}
                      placeholder="Type your response..."
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => sendTicketMessage(selectedTicket.id)}
                      disabled={!ticketMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a Ticket</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a ticket from the list to view details and manage it.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Sessions List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Live Support Sessions</h2>
            {liveSessions.map((session) => (
              <motion.div
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={`bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm dark:shadow-none ${
                  selectedSession?.id === session.id ? "ring-2 ring-blue-500" : ""
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-gray-900 dark:text-white font-semibold">Session #{session.id.slice(0, 8)}</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(session.status)}
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{session.status}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <p><strong>User:</strong> {session.user.username}</p>
                  <p><strong>Messages:</strong> {session.messages?.length || 0}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                  {session.status === "waiting" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        assignLiveSession(session.id);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                      Assign to Me
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Session Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm dark:shadow-none">
            {selectedSession ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Session #{selectedSession.id.slice(0, 8)}</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedSession.status)}
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{selectedSession.status}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>User:</strong> {selectedSession.user.username} ({selectedSession.user.email})</p>
                  <p><strong>Admin:</strong> {selectedSession.adminId || "Unassigned"}</p>
                  <p><strong>Created:</strong> {new Date(selectedSession.createdAt).toLocaleString()}</p>
                  <p><strong>Messages:</strong> {selectedSession.messages?.length || 0}</p>
                </div>

                {selectedSession.status === "waiting" && (
                  <button
                    onClick={() => assignLiveSession(selectedSession.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Assign Session to Me
                  </button>
                )}

                {selectedSession.status === "active" && (
                  <>
                    {/* Chat Messages */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-64 overflow-y-auto">
                      <div className="space-y-3">
                        {selectedSession.messages?.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.isFromAdmin ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-xs px-3 py-2 rounded-lg ${
                                msg.isFromAdmin
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white"
                              }`}
                            >
                              <div className="text-sm">{msg.message}</div>
                              <div className={`text-xs mt-1 ${
                                msg.isFromAdmin ? "text-blue-200" : "text-gray-500 dark:text-gray-300"
                              }`}>
                                {new Date(msg.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>

                    {/* Message Input */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={adminMessage}
                        onChange={(e) => setAdminMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendAdminMessage(selectedSession.id)}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => sendAdminMessage(selectedSession.id)}
                        disabled={!adminMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                    {/* End Session Button */}
                    <button
                      onClick={() => endSession(selectedSession.id)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      End Session
                    </button>
                  </>
                )}

                {selectedSession.status === "ended" && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <p className="text-gray-700 dark:text-gray-300">This session has ended.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a Session</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a live support session from the list to view details.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
