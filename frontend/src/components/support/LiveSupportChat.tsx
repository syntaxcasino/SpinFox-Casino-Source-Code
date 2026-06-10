"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useUser } from "@/contexts/UserContext";
import { motion } from "framer-motion";
import { MessageCircle, Send, Users, Clock, CheckCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";

interface LiveSupportMessage {
  id: string;
  message: string;
  isFromAdmin: boolean;
  createdAt: string;
  sender?: {
    id: number;
    username: string;
  };
}

interface LiveSupportSession {
  id: string;
  status: "waiting" | "active" | "ended";
  adminId?: string;
  messages?: LiveSupportMessage[];
  createdAt: string;
}

export default function LiveSupportChat() {
  const { t } = useTranslation("support");
  const { isLoggedIn, user } = useUser();
  const [session, setSession] = useState<LiveSupportSession | null>(null);
  const [message, setMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      checkExistingSession();
    }
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (session && session.status === "active") {
      connectToSession();
    }
  }, [session]);

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkExistingSession = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/live-session/any`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSession({
          ...data,
          messages: data.messages || []
        });
      }
    } catch (error) {
      console.error("Error checking existing session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      setIsConnecting(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/live-session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSession({
          ...data,
          messages: data.messages || []
        });
      }
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectToSession = () => {
    if (!session) return;

    const token = localStorage.getItem("token");
    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/live-support`, {
      auth: { token },
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to live support");
      newSocket.emit("join_live_session", { sessionId: session.id });
    });

    newSocket.on("live_message", (data: LiveSupportMessage) => {
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...(prev.messages || []), data],
        };
      });
    });

    newSocket.on("admin_joined", (data) => {
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: "active",
          adminId: data.adminId,
        };
      });
    });

    newSocket.on("session_ended", () => {
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: "ended",
        };
      });
    });

    newSocket.on("session_status_change", (data) => {
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: data.status,
          adminId: data.adminId,
        };
      });
    });

    setSocket(newSocket);
  };

  const sendMessage = async () => {
    if (!message.trim() || !session || !socket) return;

    try {
      socket.emit("send_live_message", {
        sessionId: session.id,
        message: message.trim(),
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusInfo = () => {
    if (!session) return { text: "No session", color: "text-gray-500", icon: MessageCircle };
    
    switch (session.status) {
      case "waiting":
        return { text: "Waiting for agent", color: "text-yellow-500", icon: Clock };
      case "active":
        return { text: "Agent connected", color: "text-green-500", icon: CheckCircle };
      case "ended":
        return { text: "Session ended", color: "text-gray-500", icon: MessageCircle };
      default:
        return { text: "Unknown", color: "text-gray-500", icon: MessageCircle };
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Login Required</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to start a live support session.
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
    <div className="max-w-4xl mx-auto">
      {!session ? (
        // No session - show start button
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Live Support</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Get instant help from our support team. Start a live chat session and we'll connect you with an agent.
          </p>
          <button
            onClick={createNewSession}
            disabled={isConnecting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 mx-auto transition-colors"
          >
            {isConnecting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <MessageCircle className="w-5 h-5" />
            )}
            <span>{isConnecting ? "Connecting..." : "Start Live Chat"}</span>
          </button>
        </div>
      ) : (
        // Active session - show chat
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
          {/* Chat Header */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Support</h3>
                <div className="flex items-center space-x-2">
                  {(() => {
                    const { text, color, icon: Icon } = getStatusInfo();
                    return (
                      <>
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className={`text-sm ${color}`}>{text}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
            {session.status === "active" && (
              <div className="flex items-center space-x-2 text-green-500">
                <Users className="w-4 h-4" />
                <span className="text-sm">Agent Online</span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {/* Admin Joined Notification */}
            {session.status === "active" && session.adminId && (
              <div className="text-center py-2">
                <div className="inline-flex items-center space-x-2 bg-green-900 px-4 py-2 rounded-lg">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-green-200 text-sm">Support agent has joined the conversation</span>
                </div>
              </div>
            )}

            {(!session.messages || session.messages.length === 0) ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  {session.status === "waiting" 
                    ? "Waiting for an agent to join..." 
                    : session.status === "active"
                    ? "Start the conversation..."
                    : "No messages yet"}
                </p>
              </div>
            ) : (
              session.messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isFromAdmin ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
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
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          {session.status === "active" && (
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Waiting Message */}
          {session.status === "waiting" && (
            <div className="bg-yellow-50 dark:bg-yellow-900 px-6 py-4 text-center">
              <p className="text-yellow-800 dark:text-yellow-200">
                You're in the queue. An agent will join shortly...
              </p>
              <div className="mt-2 flex justify-center">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 dark:bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-500 dark:bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-500 dark:bg-yellow-400 rounded-full"></div>
                </div>
              </div>
            </div>
          )}

          {/* Ended Session */}
          {session.status === "ended" && (
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 text-center">
              <p className="text-gray-700 dark:text-gray-300">
                This support session has ended. Start a new session if you need more help.
              </p>
              <button
                onClick={() => setSession(null)}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Start New Session
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
