import React from 'react';
import { motion } from 'framer-motion';
import { StarRating } from '../ui/StarRating';
import { Avatar } from '../ui/Avatar';
import { format } from 'date-fns';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    patient: {
      full_name: string;
      profile_photo?: string;
    };
  };
  variant?: 'default' | 'compact';
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  variant = 'default'
}) => {
  if (variant === 'compact') {
    return (
      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
        <Avatar
          src={review.patient.profile_photo}
          alt={review.patient.full_name}
          size="sm"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-sm">{review.patient.full_name}</h4>
            <StarRating rating={review.rating} size="sm" />
          </div>
          <p className="text-sm text-gray-600">{review.comment}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6"
    >
      <div className="flex items-start space-x-4 mb-4">
        <Avatar
          src={review.patient.profile_photo}
          alt={review.patient.full_name}
          size="md"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {review.patient.full_name}
            </h3>
            <span className="text-sm text-gray-500">
              {format(new Date(review.created_at), 'MMM dd, yyyy')}
            </span>
          </div>
          <div className="mt-2">
            <StarRating rating={review.rating} size="sm" />
          </div>
        </div>
      </div>
      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
    </motion.div>
  );
};
