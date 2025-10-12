// components/appointment/ReviewsSection.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, ThumbsUp, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  patient: {
    full_name: string;
    profile_photo: string;
  };
}

interface ReviewsSectionProps {
  reviews: Review[];
  doctorId: string;
  patientId: string;
  onReviewSubmitted: () => void; // Callback to refresh reviews
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  doctorId,
  patientId,
  onReviewSubmitted
}) => {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const nextReview = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('reviews')
        .insert({
          doctor_id: doctorId,
          patient_id: patientId,
          rating: reviewRating,
          comment: reviewComment
        });

      if (error) throw error;

      alert('Review submitted successfully!');
      setReviewRating(0);
      setReviewComment('');
      onReviewSubmitted(); // Refresh the reviews
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Reviews Carousel */}
      {reviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Star className="w-6 h-6 mr-3 text-yellow-400 fill-current" />
              Patient Reviews ({reviews.length})
            </h2>
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-xl font-bold text-gray-900">
                {calculateAverageRating()}
              </span>
            </div>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentReviewIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={
                      reviews[currentReviewIndex].patient.profile_photo ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        reviews[currentReviewIndex].patient.full_name
                      )}&size=64`
                    }
                    alt={reviews[currentReviewIndex].patient.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {reviews[currentReviewIndex].patient.full_name}
                    </h3>
                    <div className="flex items-center space-x-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= reviews[currentReviewIndex].rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(
                      new Date(reviews[currentReviewIndex].created_at),
                      'MMM dd, yyyy'
                    )}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {reviews[currentReviewIndex].comment}
                </p>
              </motion.div>
            </AnimatePresence>

            {reviews.length > 1 && (
              <>
                <button
                  onClick={prevReview}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={nextReview}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </>
            )}
          </div>

          {reviews.length > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentReviewIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentReviewIndex
                      ? 'bg-blue-600 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Write a Review */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <ThumbsUp className="w-6 h-6 mr-3 text-blue-500" />
          Write a Review
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your Rating
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || reviewRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {reviewRating > 0 && (
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {reviewRating === 1 && 'Poor'}
                  {reviewRating === 2 && 'Fair'}
                  {reviewRating === 3 && 'Good'}
                  {reviewRating === 4 && 'Very Good'}
                  {reviewRating === 5 && 'Excellent'}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Share your experience with this doctor..."
            />
          </div>

          <button
            onClick={handleSubmitReview}
            disabled={submitting || reviewRating === 0}
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Review
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};