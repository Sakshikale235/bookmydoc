import React from "react";
import { Send } from "lucide-react";

type MessageInputProps = {
  inputText: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

const MessageInput: React.FC<MessageInputProps> = ({
  inputText,
  onInputChange,
  onSend,
  onKeyDown,
  disabled,
}) => {
  return (
    <div className="w-full border-t border-gray-300 bg-white px-4 py-3 flex items-center gap-3">
      {/* Input Box */}
      <input
        type="text"
        value={inputText}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-2xl 
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-inner"
      />

      {/* Send Button */}
      <button
        onClick={onSend}
        disabled={disabled || inputText.trim() === ""}
        className="p-3 bg-blue-600 rounded-full shadow-md hover:bg-blue-700 
                   transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="text-white w-4 h-4" />
      </button>
    </div>
  );
};

export default MessageInput;


// import React from 'react';
// import { Send } from 'lucide-react';

// type MessageInputProps = {
//   inputText: string;
//   onInputChange: (value: string) => void;
//   onSend: () => void;
//   onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
//   disabled?: boolean;
// };

// const MessageInput: React.FC<MessageInputProps> = ({ inputText, onInputChange, onSend, onKeyDown, disabled }) => {
//   return (
//     <div className="border-t border-gray-300 p-4 flex space-x-3 items-center">
//       <input
//         type="text"
//         value={inputText}
//         onChange={e => onInputChange(e.target.value)}
//         onKeyDown={onKeyDown}
//         placeholder="Type your message..."
//         className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         disabled={disabled}
//       />
//       <button
//         onClick={onSend}
//         disabled={disabled || inputText.trim() === ''}
//         className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//         aria-label="Send message"
//       >
//         <Send className="w-4 h-4" />
//       </button>
//     </div>
//   );
// };

// export default MessageInput;
