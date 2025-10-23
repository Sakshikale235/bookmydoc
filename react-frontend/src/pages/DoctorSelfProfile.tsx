import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Trash2 } from 'lucide-react';
import { 
  Calendar, 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Bell,
  Settings,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle,
  XCircle,
  Eye,
  Edit3,
  Plus,
  Filter,
  Search
} from 'lucide-react';

interface DoctorProfile {
  id: string;
  auth_id: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experience: number;
  clinic_name: string;
  consultation_fee: number | null;
  location: string;
  bio: string | null;
  assistant_contact: string | null;
  profile_photo: string | null;
  available_slots?: AvailableSlot[];
}

interface AvailableSlot {
  id: string;
  doctor_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isEditingSlots, setIsEditingSlots] = useState(false);
  const navigate = useNavigate();

  // Fetch doctor profile data
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        // Get current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Fetch doctor profile data (limit to 1 record to avoid errors when duplicates exist)
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .eq('auth_id', user.id)
          .limit(1)
          .maybeSingle();

        if (doctorError) {
          console.error('Error fetching doctor profile:', doctorError);
          return;
        }

        // Fetch available slots for the doctor
        if (doctorData?.id) {
          const { data: slotsData, error: slotsError } = await supabase
            .from('available_slots')
            .select('*')
            .eq('doctor_id', doctorData.id);

          if (slotsError) {
            console.error('Error fetching slots:', slotsError);
          } else {
            setAvailableSlots(slotsData || []);
          }
        }

        setDoctor(doctorData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [navigate]);

  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) {
        throw error;
      }

      // Refetch appointments or update local state
      // You'll need to implement this based on how you're managing appointment state
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Failed to update appointment status');
    }
  };

  const updateAvailableSlots = async (slots: AvailableSlot[]) => {
    if (!doctor?.id) return;
    
    try {
      // Delete existing slots
      await supabase
        .from('available_slots')
        .delete()
        .eq('doctor_id', doctor.id);

      // Insert new slots
      const { error } = await supabase
        .from('available_slots')
        .insert(slots.map(slot => ({
          ...slot,
          doctor_id: doctor.id
        })));

      if (error) throw error;
      
      setAvailableSlots(slots);
      setIsEditingSlots(false);
      alert('Availability updated successfully!');
    } catch (error) {
      console.error('Error updating slots:', error);
      alert('Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600 mb-4">Doctor profile not found</p>
        <button
          onClick={() => navigate('/doctor_registration')}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Complete Registration
        </button>
      </div>
    );
  }

  const stats = [
    {
      title: 'Today\'s Appointments',
      value: '12',
      change: '+2 from yesterday',
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Total Patients',
      value: '1,247',
      change: '+15 this week',
      icon: Users,
      color: 'green'
    },
    {
      title: 'Avg. Consultation Time',
      value: '25 min',
      change: '-3 min from last week',
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Monthly Revenue',
      value: '$18,500',
      change: '+12% from last month',
      icon: DollarSign,
      color: 'purple'
    }
  ];

  const appointments = [
    {
      id: 1,
      patient: 'John Smith',
      time: '09:00 AM',
      type: 'Consultation',
      status: 'confirmed',
      phone: '+1 (555) 123-4567',
      reason: 'Chest pain and shortness of breath'
    },
    {
      id: 2,
      patient: 'Sarah Johnson',
      time: '09:30 AM',
      type: 'Follow-up',
      status: 'confirmed',
      phone: '+1 (555) 234-5678',
      reason: 'Blood pressure check'
    },
    {
      id: 3,
      patient: 'Michael Brown',
      time: '10:00 AM',
      type: 'Consultation',
      status: 'pending',
      phone: '+1 (555) 345-6789',
      reason: 'Heart palpitations'
    },
    {
      id: 4,
      patient: 'Emily Davis',
      time: '10:30 AM',
      type: 'Check-up',
      status: 'confirmed',
      phone: '+1 (555) 456-7890',
      reason: 'Routine cardiac screening'
    },
    {
      id: 5,
      patient: 'Robert Wilson',
      time: '11:00 AM',
      type: 'Consultation',
      status: 'cancelled',
      phone: '+1 (555) 567-8901',
      reason: 'Chest discomfort'
    }
  ];

  const recentPatients = [
    {
      id: 1,
      name: 'Alice Cooper',
      lastVisit: '2024-01-10',
      condition: 'Hypertension',
      status: 'Stable'
    },
    {
      id: 2,
      name: 'David Lee',
      lastVisit: '2024-01-08',
      condition: 'Diabetes',
      status: 'Improving'
    },
    {
      id: 3,
      name: 'Maria Garcia',
      lastVisit: '2024-01-05',
      condition: 'Arrhythmia',
      status: 'Under Treatment'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'availability', label: 'Update Slots', icon: Clock },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Available time slots for each day
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="relative">
              {doctor.profile_photo ? (
                <img
                  src={doctor.profile_photo}
                  alt={doctor.full_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-blue-200">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="text-center lg:text-left flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dr. {doctor.full_name}</h1>
              <p className="text-blue-600 font-medium mb-2">{doctor.specialization}</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <Award className="w-4 h-4 mr-1 text-blue-500" />
                  {doctor.qualification}
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {doctor.clinic_name}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {doctor.email}
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {doctor.phone}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                <Bell className="w-6 h-6" />
              </button>
              <button className="p-3 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                              <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                          <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                          <p className="text-xs text-green-600">{stat.change}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Today's Schedule */}
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-4">
                      {appointments.slice(0, 3).map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{appointment.patient}</h3>
                              <p className="text-sm text-gray-600">{appointment.reason}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{appointment.time}</p>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1">{appointment.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Patients */}
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Patients</h2>
                    <div className="space-y-4">
                      {recentPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                              <p className="text-sm text-gray-600">{patient.condition}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Last visit: {patient.lastVisit}</p>
                            <p className="text-sm font-medium text-green-600">{patient.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0">
                    <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search patients..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{appointment.patient}</h3>
                              <p className="text-gray-600 mb-1">{appointment.reason}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {appointment.time}
                                </span>
                                <span className="flex items-center">
                                  <Phone className="w-4 h-4 mr-1" />
                                  {appointment.phone}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-2">{appointment.status}</span>
                            </div>
                            <div className="flex space-x-2">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Eye className="w-5 h-5" />
                              </button>
                              <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                <Edit3 className="w-5 h-5" />
                              </button>
                              {appointment.status === 'pending' && (
                                <>
                                  <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
                                    Confirm
                                  </button>
                                  <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                                    Decline
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'availability' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Manage Availability</h2>
                    {!isEditingSlots ? (
                      <button
                        onClick={() => setIsEditingSlots(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit Slots
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditingSlots(false)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => updateAvailableSlots(availableSlots)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">{day}</h3>
                          {isEditingSlots && (
                            <button
                              onClick={() => {
                                setAvailableSlots([
                                  ...availableSlots,
                                  {
                                    id: crypto.randomUUID(),
                                    doctor_id: doctor.id,
                                    day_of_week: day,
                                    start_time: '09:00',
                                    end_time: '17:00',
                                    is_available: true
                                  }
                                ]);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          {availableSlots
                            .filter(slot => slot.day_of_week === day)
                            .map((slot, index) => (
                              <div key={index} className="flex items-center gap-4">
                                <select
                                  value={slot.start_time}
                                  onChange={(e) => {
                                    const newSlots = availableSlots.map(s =>
                                      s.id === slot.id ? { ...s, start_time: e.target.value } : s
                                    );
                                    setAvailableSlots(newSlots);
                                  }}
                                  disabled={!isEditingSlots}
                                  className="px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                  {timeSlots.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                                <span>to</span>
                                <select
                                  value={slot.end_time}
                                  onChange={(e) => {
                                    const newSlots = availableSlots.map(s =>
                                      s.id === slot.id ? { ...s, end_time: e.target.value } : s
                                    );
                                    setAvailableSlots(newSlots);
                                  }}
                                  disabled={!isEditingSlots}
                                  className="px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                  {timeSlots.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                                {isEditingSlots && (
                                  <button
                                    onClick={() => {
                                      setAvailableSlots(availableSlots.filter(s => s.id !== slot.id));
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'patients' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Patient Records</h2>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Patient
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentPatients.map((patient) => (
                      <motion.div
                        key={patient.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                            <p className="text-sm text-gray-600">Last visit: {patient.lastVisit}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Condition:</span>
                            <span className="text-sm font-medium">{patient.condition}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Status:</span>
                            <span className="text-sm font-medium text-green-600">{patient.status}</span>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                            View Records
                          </button>
                          <button className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
                  
                  <div className="space-y-8">
                    {/* Profile Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            defaultValue="Dr. Sarah Johnson"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Specialty
                          </label>
                          <input
                            type="text"
                            defaultValue="Cardiologist"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            defaultValue="dr.johnson@medicare.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            defaultValue="+1 (555) 123-4567"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Availability Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Auto-confirm appointments</h4>
                            <p className="text-sm text-gray-600">Automatically confirm new appointment requests</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Email notifications</h4>
                            <p className="text-sm text-gray-600">Receive email alerts for new appointments</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;