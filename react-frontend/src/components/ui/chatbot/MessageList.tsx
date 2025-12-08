import React from "react";
import { Bot, User } from "lucide-react";
import { Message } from "../../../types/chatbot";

type MessageListProps = {
  messages: Message[];
  step: number | string;
  handleNext: (value: string) => void;
};

const MessageList: React.FC<MessageListProps> = ({ messages, step, handleNext }) => {
  return (
    <div className="flex flex-col space-y-3 px-3 py-2">
      {messages.map((msg) => {
        const isUser = msg.sender === "user";

        return (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${
              isUser ? "justify-end" : "justify-start"
            } animate-fadeIn`}
          >
            {/* Bot Avatar */}
            {!isUser && (
              <div className="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
            )}

            {/* Chat Bubble */}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed transition-all
                ${isUser
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white text-gray-800 rounded-bl-sm"
                }
              `}
              dangerouslySetInnerHTML={{
                __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>"),
              }}
            ></div>

            {/* User Avatar */}
            {isUser && (
              <div className="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;




// import React from "react";
// import { Bot, User } from "lucide-react";
// import { Message } from "../../../types/chatbot";

// type MessageListProps = {
//   messages: Message[];
//   step: number | string;
//   handleNext: (value: string) => void;
// };

// const MessageList: React.FC<MessageListProps> = ({ messages, step, handleNext }) => {
//   return (
//     <>
//       {messages.map((message) => (
//         <div key={message.id} className="flex flex-col">
//           <div
//             className={`flex items-start space-x-3 ${
//               message.sender === "user" ? "justify-end" : "justify-start"
//             }`}
//           >
//             {message.sender === "ai" && (
//               <div className="bg-white rounded-full p-2 flex-shrink-0">
//                 <Bot className="h-4 w-4 text-blue-600" />
//               </div>
//             )}
//             <div
//               className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
//                 message.sender === "user"
//                   ? "bg-white text-gray-800 rounded-br-sm"
//                   : "bg-white text-gray-800 shadow-md rounded-bl-sm"
//               }`}
//             >
//               <div
//                 className="text-sm whitespace-pre-line"
//                 dangerouslySetInnerHTML={{
//                   __html: message.text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>"),
//                 }}
//               ></div>

//               {message.sender === "ai" &&
//                 typeof step === "number" &&
//                 step >= 0 &&
//                 message.text.includes("* skip") && (
//                   <button
//                     onClick={() => handleNext("*")}
//                     className="self-start mt-2 ml-12 px-3 py-1 bg-gray-300 rounded-md text-sm hover:bg-gray-400 transition-colors"
//                   >
//                     Skip
//                   </button>
//                 )}

//               {message.sender === "ai" && message.id === "ai-doctor-prompt" && (
//                 <button
//                   onClick={() => handleNext("yes")}
//                   className="self-start mt-2 ml-12 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
//                 >
//                   Consult Doctor
//                 </button>
//               )}
//             </div>
//             {message.sender === "user" && (
//               <div className="bg-white rounded-full p-2 flex-shrink-0">
//                 <User className="h-4 w-4 text-blue-600" />
//               </div>
//             )}
//           </div>

//           {message.sender === "ai" &&
//             typeof step === "number" &&
//             step >= 0 &&
//             message.text.includes("* skip") && (
//               <button
//                 onClick={() => handleNext("*")}
//                 className="self-start mt-2 ml-12 px-3 py-1 bg-gray-300 rounded-md text-sm hover:bg-gray-400 transition-colors"
//               >
//                 Skip
//               </button>
//             )}
//         </div>
//       ))}
//     </>
//   );
// };

// export default MessageList;
