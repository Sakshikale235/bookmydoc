import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '../ui/Badge';

interface AppointmentCardProps {
  appointment: {
    id: string;
    appointment_date: string;
    status: string;
    reason?: string;
    doctor?: {
      full_name: string;
      specialization: string;
    };
  };
  onClick?: () => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onClick
}) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="w-full bg-white rounded-xl shadow-md p-6 cursor-pointer border border-gray-100 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {appointment.doctor?.full_name}
            </h3>
            <p className="text-sm text-gray-600">
              {appointment.doctor?.specialization}
            </p>
          </div>
        </div>
        <Badge variant={getStatusVariant(appointment.status)}>
          {appointment.status}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          {format(new Date(appointment.appointment_date), 'hh:mm a')}
        </div>
        {appointment.reason && (
          <p className="text-sm text-gray-500 mt-3 italic">
            {appointment.reason}
          </p>
        )}
      </div>
    </motion.div>
  );
};