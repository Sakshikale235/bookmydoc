import React, { useState, useEffect } from 'react';
// import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  LogOut,
  Edit2,
  Plus,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface DoctorProfile {
  id: string;
  auth_id: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification?: string;
  experience: number;
  clinic_name?: string;
  consultation_fee?: number | null;
  location?: string;
}

interface AvailableSlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_date: string;
  status: string;
  reason: string | null;
  created_at?: string;
}

interface Patient {
  id: string;
  auth_id?: string | null;
  full_name: string;
  email?: string;
  phone?: string;
}

interface AppointmentWithPatient extends Appointment {
  patient: Patient | null;
}

const DoctorSelfProfile: React.FC = () => {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'slots'>('overview');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<DoctorProfile>>({});

  // Fetch doctor profile, appointments, and available slots
  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      // Fetch doctor profile
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (doctorError) throw doctorError;
      setDoctor(doctorData);
      setEditData(doctorData);

      // Fetch available slots
      const { data: slotsData, error: slotsError } = await supabase
        .from('available_slots')
        .select('*')
        .eq('doctor_id', doctorData.id)
        .order('day_of_week', { ascending: true });

      if (slotsError) throw slotsError;
      setAvailableSlots(slotsData || []);

      // Fetch appointments
      await fetchAppointments();
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      alert('Error loading profile data');
    } finally {
      setLoading(false);
    }
  };

  // Robust fetchAppointments:
  // - fetch appointments for current doctor
  // - batch fetch patients by id and by auth_id
  // - map patient into appointment.patient (so UI uses appointment.patient)
// ...existing code...

const fetchAppointments = async () => {
  try {
    const {
      data: { user },
      error: userError,

    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error getting current user:", userError);
      return;
    }

    if (!user) {
      console.warn("No authenticated user found");
      return;
    }

    // Get doctor ID
    const { data: doctorRecord, error: doctorError } = await supabase
      .from("doctors")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (doctorError) {
      console.error("Error fetching doctor record:", doctorError);
      return;
    }

    if (!doctorRecord) {
      console.warn("No doctor record found for user:", user.id);
      return;
    }

    // Get appointments
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from("appointments")
      .select("id, doctor_id, patient_id, appointment_date, status, reason, created_at")
      .eq("doctor_id", doctorRecord.id)
      .order("appointment_date", { ascending: true });

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError);
      setAppointments([]);
      return;
    }

    if (!appointmentsData) {
      console.warn("No appointments found for doctor:", doctorRecord.id);
      setAppointments([]);
      return;
    }

    // Attach patient info
    const appointmentsWithPatients: AppointmentWithPatient[] = await Promise.all(
      appointmentsData.map(async (apt: any) => {
        try {
          const { data: patient, error: patientError } = await supabase
            .from("patients")
            .select("id, full_name, email, phone")
            .eq("id", apt.patient_id)
            .single();

          if (patientError) {
            console.error(`Error fetching patient for appointment ${apt.id}:`, patientError);
          }

          return {
            ...apt,
            patient: patient || null,
          };
        } catch (err) {
          console.error(`Unexpected error fetching patient for appointment ${apt.id}:`, err);
          return { ...apt, patient: null };
        }
      })
    );

    setAppointments(appointmentsWithPatients);
  } catch (err) {
    console.error("Unexpected error in fetchAppointments:", err);
    setAppointments([]);
  }
};


// ...existing code...

  useEffect(() => {
    fetchDoctorData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime subscription for appointments for this doctor (refetch on changes)
  useEffect(() => {
    if (!doctor) return;

    const channel = supabase
      .channel(`public:appointments:doctor_id=eq.${doctor.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `doctor_id=eq.${doctor.id}` },
        payload => {
          // simply re-fetch to keep logic simple & consistent
          fetchAppointments();
          if (payload.eventType === "INSERT") {
            const apt = payload.new;

            supabase
              .from("patients")
              .select("full_name")
              .eq("id", apt.patient_id)
              .single()
              .then(({ data: patients }) => {
                const name = patients?.full_name || "a patient";

                // Simple alert
                alert(`New appointment from ${name}`);

                // Or if using toast:
                // toast.success(`New appointment from ${name}`);
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor?.id]);

  // Optional: legacy custom event listener used by your app
  useEffect(() => {
    const handleNotificationReceived = (event: any) => {
      if (doctor) fetchAppointments();
    };

    window.addEventListener('bmcd:notification_received', handleNotificationReceived);

    return () => {
      window.removeEventListener('bmcd:notification_received', handleNotificationReceived);
    };
  }, [doctor?.id]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout');
    }
  };

  const handleEditSave = async () => {
    if (!doctor) return;

    try {
      const { error } = await supabase
        .from('doctors')
        .update(editData)
        .eq('id', doctor.id);

      if (error) throw error;
      setDoctor({ ...doctor, ...(editData as DoctorProfile) });
      setEditMode(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleApproveAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', appointmentId);

      if (error) throw error;
      await fetchAppointments();
      alert('Appointment approved');
    } catch (error) {
      console.error('Error approving appointment:', error);
      alert('Failed to approve appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;
      await fetchAppointments();
      alert('Appointment cancelled');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Doctor profile not found</h2>
          <button
            onClick={() => navigate('/index')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navigation /> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <Stethoscope className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{doctor.full_name}</h1>
                <p className="text-xl text-blue-600 mt-2">{doctor.specialization}</p>
                <p className="text-gray-600 mt-1">{doctor.clinic_name}</p>
                <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {doctor.email}
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {doctor.phone}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {doctor.location}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setEditMode(!editMode)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
              >
                <Edit2 className="w-4 h-4" />
                <span>{editMode ? 'Cancel' : 'Edit'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Experience</p>
              <p className="text-2xl font-bold text-blue-600">{doctor.experience} years</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Consultation Fee</p>
              <p className="text-2xl font-bold text-green-600">${doctor.consultation_fee ?? 'N/A'}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Total Appointments</p>
              <p className="text-2xl font-bold text-purple-600">{appointments.length}</p>
            </div>
          </div>
        </div>

        {/* Edit Mode */}
        {editMode && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={editData.full_name ?? ''}
                  onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <input
                  type="text"
                  value={editData.specialization ?? ''}
                  onChange={(e) => setEditData({ ...editData, specialization: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  value={editData.phone ?? ''}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                <input
                  type="number"
                  value={editData.experience ?? ''}
                  onChange={(e) => setEditData({ ...editData, experience: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
                <input
                  type="text"
                  value={editData.clinic_name ?? ''}
                  onChange={(e) => setEditData({ ...editData, clinic_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee</label>
                <input
                  type="number"
                  value={editData.consultation_fee ?? ''}
                  onChange={(e) => setEditData({ ...editData, consultation_fee: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={editData.location ?? ''}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button onClick={handleEditSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
              <button onClick={() => setEditMode(false)} className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-colors ${
                activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-colors ${
                activeTab === 'appointments' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Appointments
            </button>
            <button
              onClick={() => setActiveTab('slots')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-colors ${
                activeTab === 'slots' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Available Slots
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="text-lg font-medium text-gray-900">{doctor.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Specialization</p>
                      <p className="text-lg font-medium text-gray-900">{doctor.specialization}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Qualification</p>
                      <p className="text-lg font-medium text-gray-900">{doctor.qualification}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="text-lg font-medium text-gray-900">{doctor.experience} years</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Clinic</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-lg font-medium text-gray-900">{doctor.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-lg font-medium text-gray-900">{doctor.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Clinic Name</p>
                      <p className="text-lg font-medium text-gray-900">{doctor.clinic_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="text-lg font-medium text-gray-900">{doctor.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => fetchAppointments()}>
                  <Plus className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No appointments scheduled yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.patient?.full_name || 'Unknown Patient'}
                          </h3>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-3" />
                              {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock className="w-4 h-4 mr-3" />
                              {new Date(appointment.appointment_date).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                            {appointment.patient && (
                              <div className="flex items-center text-gray-600">
                                <Phone className="w-4 h-4 mr-3" />
                                {appointment.patient.phone}
                              </div>
                            )}
                            {appointment.reason && (
                              <div className="text-sm text-gray-600">
                                <strong>Reason:</strong> {appointment.reason}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="mb-4">
                            <span
                              className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                                appointment.status === 'scheduled'
                                ? 'bg-yellow-100 text-yellow-800'
                                : appointment.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'

                              }`}
                            >
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </div>
                          {appointment.status === 'scheduled' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproveAppointment(appointment.id)}
                                className="flex items-center space-x-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(appointment.id)}
                                className="flex items-center space-x-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Available Slots Tab */}
          {activeTab === 'slots' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Slots</h2>

              {availableSlots.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No available slots set yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableSlots.map((slot) => (
                    <div key={slot.id} className="border border-gray-200 rounded-lg p-4">
                      <p className="font-semibold text-gray-900">
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.day_of_week]}
                      </p>
                      <p className="text-gray-600 mt-2">
                        {slot.start_time} - {slot.end_time}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DoctorSelfProfile;
