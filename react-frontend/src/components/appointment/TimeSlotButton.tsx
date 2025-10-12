import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimeSlotButtonProps {
  time: string;
  isSelected: boolean;
  isBooked?: boolean;
  onClick: () => void;
}

export const TimeSlotButton: React.FC<TimeSlotButtonProps> = ({
  time,
  isSelected,
  isBooked = false,
  onClick
}) => {
  return (
    <motion.button
      whileHover={!isBooked ? { scale: 1.05 } : {}}
      whileTap={!isBooked ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={isBooked}
      className={`
        relative p-3 text-sm rounded-lg border-2 transition-all duration-200 
        ${isBooked
          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
          : isSelected
          ? 'border-blue-600 bg-blue-600 text-white shadow-lg'
          : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
        }
      `}
    >
      <div className="flex items-center justify-center space-x-2">
        <Clock className="w-4 h-4" />
        <span>{time}</span>
      </div>
      {isBooked && (
        <span className="absolute top-1 right-1 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">
          Booked
        </span>
      )}
    </motion.button>
  );
};
