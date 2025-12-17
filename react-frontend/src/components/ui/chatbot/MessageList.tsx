import React from "react";
import { Bot, User } from "lucide-react";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
};

type MessageListProps = {
  messages: Message[];
  step: number | string;
  handleNext: (value: string) => void;
};

const MessageList: React.FC<MessageListProps> = ({ messages, step, handleNext }) => {
  return (
    <>
      {messages.map((message) => (
        <div key={message.id} className="flex flex-col">
          <div
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
                  ? "bg-white text-gray-800 rounded-br-sm"
                  : "bg-white text-gray-800 shadow-md rounded-bl-sm"
              }`}
            >
              <div
                className="text-sm whitespace-pre-line"
                dangerouslySetInnerHTML={{
                  __html: message.text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>"),
                }}
              ></div>

              {message.sender === "ai" &&
                typeof step === "number" &&
                step >= 0 &&
                message.text.includes("* skip") && (
                  <button
                    onClick={() => handleNext("*")}
                    className="self-start mt-2 ml-12 px-3 py-1 bg-gray-300 rounded-md text-sm hover:bg-gray-400 transition-colors"
                  >
                    Skip
                  </button>
                )}

              {message.sender === "ai" && message.id === "ai-doctor-prompt" && (
                <button
                  onClick={() => handleNext("yes")}
                  className="self-start mt-2 ml-12 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                >
                  Consult Doctor
                </button>
              )}
            </div>
            {message.sender === "user" && (
              <div className="bg-white rounded-full p-2 flex-shrink-0">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            )}
          </div>

          {message.sender === "ai" &&
            typeof step === "number" &&
            step >= 0 &&
            message.text.includes("* skip") && (
              <button
                onClick={() => handleNext("*")}
                className="self-start mt-2 ml-12 px-3 py-1 bg-gray-300 rounded-md text-sm hover:bg-gray-400 transition-colors"
              >
                Skip
              </button>
            )}
        </div>
      ))}
    </>
  );
};

export default MessageList;