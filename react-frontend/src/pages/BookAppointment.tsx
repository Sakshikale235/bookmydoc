// pages/BookAppointment.tsx
import React, { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  startOfDay
} from 'date-fns';
import { supabase } from '@/lib/supabaseClient';
import { DoctorProfileCard } from '@/components/appointment/DoctorProfileCard';
import { ReviewsSection } from '@/components/appointment/ReviewsSection';

interface Doctor {
  id: string;
  auth_id?: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experience: number;
  clinic_name: string;
  consultation_fee: number;
  location: string;
  bio: string;
}

interface Patient {
  id: string;
  auth_id?: string;
  full_name: string;
  email: string;
  phone: string;
}

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

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  // State
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Booking states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    phone: '',
    email: '',
    reason: ''
  });

  const timeSlots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
    '05:00 PM',
    '05:30 PM'
  ];

  useEffect(() => {
    fetchData();
  }, [doctorId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!doctorId) {
        navigate('/doctor_consultation');
        return;
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Fetch doctor
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', doctorId)
        .single();

      if (doctorError) throw doctorError;
      setDoctor(doctorData);

      // Fetch patient
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      setPatientInfo({
        name: patientData.full_name || '',
        phone: patientData.phone || '',
        email: patientData.email || '',
        reason: ''
      });

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(
          `
          id,
          rating,
          comment,
          created_at,
          patient:patients(full_name, profile_photo)
        `
        )
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = startOfDay(new Date());

  const isDateDisabled = (date: Date) => isBefore(date, today);

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleNext = () => {
    if (step === 1 && selectedDate && selectedTime) {
      setStep(2);
    } else if (
      step === 2 &&
      patientInfo.name &&
      patientInfo.phone &&
      patientInfo.email
    ) {
      handleBookAppointment();
    }
  };

const handleBookAppointment = async () => {
    try {
      setSubmitting(true);

      const [time, period] = selectedTime!.split(' ');
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;

      const appointmentDate = new Date(selectedDate!);
      appointmentDate.setHours(hour, parseInt(minutes), 0, 0);

      // Check for conflicts
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('id')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', appointmentDate.toISOString())
        .neq('status', 'cancelled');

      if (existingAppointments && existingAppointments.length > 0) {
        alert('This time slot is already booked. Please select another time.');
        setSelectedTime(null);
        setSubmitting(false);
        return;
      }

      // DEBUG: Check what data is being sent
        console.log("APPOINTMENT INSERT DATA:", {
          doctor_id: doctorId,
          patient_id: patient?.id,
          appointment_date: appointmentDate.toISOString(),
          status: 'pending',
          reason: patientInfo.reason || null
        });

      // Insert appointment - THIS IS THE ONLY DATABASE OPERATION
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          doctor_id: doctorId,
          patient_id: patient?.id,
          appointment_date: appointmentDate.toISOString(),
          status: 'pending',
          reason: patientInfo.reason || null
        })
        .select()
        .single();

      if (appointmentError) {
        console.error('Appointment insert error:', appointmentError);
        throw appointmentError;
      }

      console.log('Appointment created successfully:', appointmentData);

      // NO NOTIFICATION CODE AT ALL - If error still occurs, it's from:
      // 1. Database trigger on appointments table
      // 2. Supabase Edge Function
      // 3. Row Level Security policies trying to create notifications
      // SEND EMAIL through Supabase Edge Function
        


      setStep(3);
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      alert(`Error: ${error.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPatientInfo({
      ...patientInfo,
      [e.target.name]: e.target.value
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
      );
    } else {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
      );
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return '0';
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!doctor || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Doctor or Patient not found
          </h2>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  // min-h-screen
  return (
    <div  className="w-full bg-[#340238]"
  style={{ background: 'linear-gradient(90deg, rgb(226, 226, 226), rgb(201, 214, 255))' }}>
       {/* navbar */}
        <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        {/* <Link
          to="/doctor_consultation"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Doctors
        </Link> */}

       

        {/* Single Column Layout - Everything flows vertically */}
        <div className="space-y-6">
          {/* 1. Doctor Profile */}
          <DoctorProfileCard
            doctor={doctor}
            averageRating={calculateAverageRating()}
            totalReviews={reviews.length}
          />

          {/* 2. Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNumber, index) => (
                <React.Fragment key={stepNumber}>
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        step >= stepNumber
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step > stepNumber ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        stepNumber
                      )}
                    </div>
                    <span className="ml-2 text-xs sm:text-sm font-medium text-gray-600 hidden sm:inline">
                      {stepNumber === 1 && 'Date & Time'}
                      {stepNumber === 2 && 'Confirm'}
                      {stepNumber === 3 && 'Done'}
                    </span>
                  </div>
                  {index < 2 && <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* 3. Booking Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
            >
                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <Calendar className="w-6 h-6 mr-3 text-blue-500" />
                      Select Date & Time
                    </h2>

                    {/* Calendar */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {format(currentDate, 'MMMM yyyy')}
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigateMonth('prev')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => navigateMonth('next')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div
                            key={day}
                            className="text-center text-sm font-medium text-gray-500 py-2"
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {monthDays.map((date) => {
                          const isDisabled = isDateDisabled(date);
                          const isSelected = selectedDate && isSameDay(date, selectedDate);

                          return (
                            <motion.button
                              key={date.toISOString()}
                              whileHover={!isDisabled ? { scale: 1.05 } : {}}
                              whileTap={!isDisabled ? { scale: 0.95 } : {}}
                              onClick={() => handleDateSelect(date)}
                              disabled={isDisabled}
                              className={`
                                p-3 text-sm rounded-lg transition-all duration-200
                                ${
                                  isDisabled
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                }
                              `}
                            >
                              {format(date, 'd')}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slots */}
                    {selectedDate && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-blue-500" />
                          Available Slots - {format(selectedDate, 'MMM d, yyyy')}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {timeSlots.map((time) => (
                            <motion.button
                              key={time}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleTimeSelect(time)}
                              className={`
                                p-3 text-sm rounded-lg border-2 transition-all duration-200
                                ${
                                  selectedTime === time
                                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg'
                                    : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                                }
                              `}
                            >
                              {time}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {selectedDate && selectedTime && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 flex justify-end"
                      >
                        <button
                          onClick={handleNext}
                          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
                        >
                          Continue
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <User className="w-6 h-6 mr-3 text-blue-500" />
                      Confirm Details
                    </h2>

                    <div className="space-y-6">
                      <div className="bg-blue-50 rounded-xl p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Appointment Summary
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Doctor:</span>
                            <span className="font-medium">{doctor.full_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium">
                              {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Time:</span>
                            <span className="font-medium">{selectedTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fee:</span>
                            <span className="font-medium text-green-600">
                              ${doctor.consultation_fee}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for Visit (Optional)
                        </label>
                        <textarea
                          name="reason"
                          value={patientInfo.reason}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Briefly describe your symptoms or reason for consultation"
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between">
                      <button
                        onClick={() => setStep(1)}
                        disabled={submitting}
                        className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors flex items-center"
                      >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        Back
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={submitting}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          <>
                            Confirm Booking
                            <CheckCircle className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </motion.div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Appointment Confirmed!
                    </h2>

                    <p className="text-gray-600 mb-8 text-lg">
                      Your appointment has been successfully booked. You will receive a
                      confirmation email shortly.
                    </p>

                    <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Appointment Details:
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Doctor:</span>
                          <span className="font-medium">{doctor.full_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">
                            {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{doctor.clinic_name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link
                        to="/index"
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Back to Home
                      </Link>
                      <Link
                        to="/user_profile"
                        className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        View My Profile
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Reviews Section */}
            <ReviewsSection
              reviews={reviews}
              doctorId={doctorId!}
              patientId={patient.id}
              onReviewSubmitted={fetchData}
            />
          </div>
        </div>
        <Footer/>
      </div>
   
  );
};

export default BookAppointment;