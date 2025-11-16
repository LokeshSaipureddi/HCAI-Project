import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  Plus,
  LogOut,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Menu,
  User,
} from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

interface User {
  id: number;
  email: string;
  username: string;
}

interface Message {
  id: number;
  content: string;
  role: "user" | "assistant";
  created_at: string;
}

interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationWithMessages | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUser();
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "An error occurred" }));
      throw new Error(error.detail || "Request failed");
    }

    return response.json();
  };

  const loadUser = async () => {
    try {
      const userData = await apiFetch("/users/me");
      setUser(userData);
    } catch (error) {
      console.error("Failed to load user:", error);
      // Redirect to login if token is invalid
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const loadConversations = async () => {
    try {
      const data = await apiFetch("/conversations");
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const createNewConversation = async () => {
    try {
      const newConv = await apiFetch("/conversations", {
        method: "POST",
        body: JSON.stringify({ title: "New Chat" }),
      });
      setConversations([newConv, ...conversations]);
      setSelectedConversation({ ...newConv, messages: [] });
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const selectConversation = async (id: number) => {
    try {
      const conv = await apiFetch(`/conversations/${id}`);
      setSelectedConversation(conv);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedConversation || loading) return;

    const userMessage = message;
    setMessage("");
    setLoading(true);

    try {
      await apiFetch(`/conversations/${selectedConversation.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: userMessage }),
      });
      const updatedConv = await apiFetch(
        `/conversations/${selectedConversation.id}`
      );
      setSelectedConversation(updatedConv);
      loadConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessage(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteConv = async (id: number) => {
    try {
      await apiFetch(`/conversations/${id}`, {
        method: "DELETE",
      });
      setConversations(conversations.filter((c) => c.id !== id));
      if (selectedConversation?.id === id) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const startEditing = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveTitle = async (id: number) => {
    try {
      await apiFetch(`/conversations/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title: editTitle }),
      });
      setConversations(
        conversations.map((c) => (c.id === id ? { ...c, title: editTitle } : c))
      );
      if (selectedConversation?.id === id) {
        setSelectedConversation({ ...selectedConversation, title: editTitle });
      }
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update title:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden`}
      >
        <div className="p-3 border-b border-gray-200">
          <Button
            onClick={createNewConversation}
            className="w-full bg-black hover:bg-gray-800 text-white rounded-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <div key={conv.id} className="group relative">
                {editingId === conv.id ? (
                  <div className="flex items-center gap-1 p-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-8 text-sm"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => saveTitle(conv.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.id === conv.id
                        ? "bg-gray-200"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => selectConversation(conv.id)}
                  >
                    <span className="text-sm truncate flex-1">
                      {conv.title}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(conv);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConv(conv.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 bg-white p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">
            {selectedConversation?.title || "ChatBot AI"}
          </h2>
        </div>

        {selectedConversation ? (
          <>
            <ScrollArea className="flex-1 bg-white">
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {selectedConversation.messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-2xl font-semibold mb-3">
                      How can I help you today?
                    </h3>
                    <p className="text-gray-500">
                      Start a conversation by typing a message below
                    </p>
                  </div>
                ) : (
                  selectedConversation.messages.map((msg) => (
                    <div key={msg.id} className="flex gap-4">
                      {msg.role === "assistant" && (
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                      <div
                        className={`flex-1 ${
                          msg.role === "user" ? "flex justify-end" : ""
                        }`}
                      >
                        <div
                          className={`inline-block max-w-[85%] rounded-2xl px-5 py-3 ${
                            msg.role === "user"
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                      {msg.role === "user" && (
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t border-gray-200 bg-white p-4">
              <div className="max-w-3xl mx-auto">
                <div className="flex gap-3 items-end bg-gray-100 rounded-2xl p-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleMessageKeyPress}
                    placeholder="Message ChatBot AI..."
                    disabled={loading}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={loading || !message.trim()}
                    className="bg-black hover:bg-gray-800 rounded-xl h-10 w-10 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-center text-gray-400 mt-3">
                  ChatBot AI can make mistakes. Check important info.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center px-4">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-3xl font-bold mb-3">Welcome to ChatBot AI</h2>
              <p className="text-gray-600 mb-8 max-w-md">
                Start a new conversation or select an existing one from the
                sidebar
              </p>
              <Button
                onClick={createNewConversation}
                className="bg-black hover:bg-gray-800 rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
