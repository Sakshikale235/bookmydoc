import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Bot, User } from "lucide-react";

type ChatMessage = {
  id: string;
  user_id: string;
  message_text: string;
  sender: "user" | "ai";
  timestamp: string;
};

const ChatHistory: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("user_id", authUser.id)
          .order("timestamp", { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No chat history available</p>
        <p className="text-sm">Start a conversation with the symptom checker to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start space-x-3 ${
            message.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {message.sender === "ai" && (
            <div className="bg-white rounded-full p-2 flex-shrink-0">
              <Bot className="h-4 w-4 text-blue-600" />
            </div>
          )}
          <div
            className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
              message.sender === "user"
                ? "bg-blue-600 text-white rounded-br-sm"
                : "bg-gray-100 text-gray-800 rounded-bl-sm"
            }`}
          >
            <div className="text-sm whitespace-pre-line">
              {message.message_text}
            </div>
            <div className="text-xs opacity-70 mt-1">
              {new Date(message.timestamp).toLocaleString()}
            </div>
          </div>
          {message.sender === "user" && (
            <div className="bg-blue-600 rounded-full p-2 flex-shrink-0">
              <User className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
