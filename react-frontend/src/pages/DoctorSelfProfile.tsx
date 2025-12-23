import React, { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Calendar,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  LogOut,
  CheckCircle,
  XCircle,
  Loader2,
  Edit2,
  Save
} from 'lucide-react';

/* ================= TYPES ================= */

interface DoctorProfile {
  id: string;
  auth_id: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  clinic_name?: string;
  consultation_fee?: number | null;
  location?: string;
}

interface Patient {
  id: string;
  auth_id: string;
  full_name: string;
  phone?: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  status: string;
  reason: string | null;
  patient: Patient | null;
}

/* ================= COMPONENT ================= */

const DoctorSelfProfile: React.FC = () => {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [editDoctor, setEditDoctor] = useState<DoctorProfile | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] =
    useState<'overview' | 'appointments'>('overview');

  /* Cancel Modal */
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  /* ================= FETCH ================= */

  const fetchAppointments = async (doctorId: string) => {
    const { data } = await supabase
      .from('appointments')
      .select(`
        id,
        patient_id,
        appointment_date,
        status,
        reason,
        patient:patients(id, full_name, phone, auth_id)
      `)
      .eq('doctor_id', doctorId)
      .order('appointment_date', { ascending: false });

    setAppointments(data || []);
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      const { data: doctorData } = await supabase
        .from('doctors')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      setDoctor(doctorData);
      setEditDoctor(doctorData);
      await fetchAppointments(doctorData.id);
      setLoading(false);
    })();
  }, []);

  /* ================= REALTIME ================= */

  useEffect(() => {
    if (!doctor) return;

    const channel = supabase
      .channel('doctor-appointments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `doctor_id=eq.${doctor.id}`
        },
        async payload => {
          const appt = payload.new;

          const { data: patient } = await supabase
            .from('patients')
            .select('full_name')
            .eq('id', appt.patient_id)
            .single();

          toast.success(`New appointment booked from ${patient?.full_name}`, {
            duration: 10000,
            closeButton: true
          });

          fetchAppointments(doctor.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctor]);

  /* ================= ACTIONS ================= */

  const saveDoctorProfile = async () => {
    if (!editDoctor) return;

    const { error } = await supabase
      .from('doctors')
      .update({
        full_name: editDoctor.full_name,
        phone: editDoctor.phone,
        specialization: editDoctor.specialization,
        experience: editDoctor.experience,
        clinic_name: editDoctor.clinic_name,
        consultation_fee: editDoctor.consultation_fee,
        location: editDoctor.location
      })
      .eq('id', editDoctor.id);

    if (!error) {
      setDoctor(editDoctor);
      setEditMode(false);
      toast.success('Profile updated successfully', {
        duration: 10000,
        closeButton: true
      });
    }
  };

  const approveAppointment = async (appt: Appointment) => {
    if (!doctor) return;

    await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', appt.id);

    await supabase.from('notifications').insert({
      sender_id: doctor.auth_id,
      receiver_id: appt.patient?.auth_id,
      type: 'appointment_approved',
      message: 'Your appointment has been confirmed'
    });

    toast.success('Appointment approved successfully', {
      duration: 10000,
      closeButton: true
    });

    fetchAppointments(doctor.id);
  };

  const submitCancel = async () => {
    if (!cancelReason || !selectedAppointment || !doctor) return;

    await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        reason: cancelReason
      })
      .eq('id', selectedAppointment.id);

    // 2️⃣ Insert notification for the patient
      await supabase.from('notifications').insert({
        sender_id: doctor.auth_id,
        receiver_id: selectedAppointment.patient?.auth_id,
        type: 'appointment_cancelled',
        message: `Your appointment has been cancelled. Reason: ${cancelReason}`
      });

    toast.error('Appointment cancelled', {
      duration: 10000,
      closeButton: true
    });

    setShowCancelModal(false);
    setCancelReason('');
    fetchAppointments(doctor.id);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 flex justify-between">
          <div className="flex gap-6">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
              <Stethoscope className="text-white w-12 h-12" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{doctor?.full_name}</h1>
              <p className="text-blue-600">{doctor?.specialization}</p>
              <div className="flex gap-4 text-sm text-gray-600 mt-2">
                <span className="flex items-center gap-1">
                  <Mail size={14} /> {doctor?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={14} /> {doctor?.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {doctor?.location}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* TABS */}
        <div className="bg-white rounded-xl shadow">
          <div className="flex border-b">
            {['overview', 'appointments'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-4 font-semibold ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {activeTab === 'overview' && editDoctor && (
            <div className="p-8 space-y-6">
              <div className="flex justify-between">
                <h2 className="text-xl font-bold">Doctor Overview</h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded"
                >
                  <Edit2 size={16} /> {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ['Full Name', 'full_name'],
                  ['Specialization', 'specialization'],
                  ['Phone', 'phone'],
                  ['Location', 'location'],
                  ['Clinic Name', 'clinic_name'],
                  ['Experience (Years)', 'experience'],
                  ['Consultation Fee', 'consultation_fee']
                ].map(([label, key]) => (
                  <div key={key}>
                    <label className="text-sm text-gray-600">{label}</label>
                    <input
                      disabled={!editMode}
                      value={(editDoctor as any)[key] || ''}
                      onChange={e =>
                        setEditDoctor({
                          ...editDoctor,
                          [key]:
                            key.includes('fee') || key.includes('experience')
                              ? Number(e.target.value)
                              : e.target.value
                        })
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                ))}
              </div>

              {editMode && (
                <button
                  onClick={saveDoctorProfile}
                  className="bg-green-600 text-white px-6 py-2 rounded flex items-center gap-2"
                >
                  <Save size={16} /> Save Changes
                </button>
              )}
            </div>
          )}

          {/* APPOINTMENTS — UNCHANGED */}
          {activeTab === 'appointments' && (
            <div className="p-8 space-y-4">
              {appointments.map(appt => (
                <div
                  key={appt.id}
                  className="border rounded-lg p-6 flex justify-between"
                >
                  <div>
                    <h3 className="font-semibold">
                      {appt.patient?.full_name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(appt.appointment_date).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-4 py-1 rounded-full text-sm font-semibold ${
                        appt.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : appt.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {appt.status}
                    </span>

                    {appt.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => approveAppointment(appt)}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded flex items-center gap-1"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appt);
                            setShowCancelModal(true);
                          }}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded flex items-center gap-1"
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* CANCEL MODAL */}
    {showCancelModal && selectedAppointment && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <h2 className="text-lg font-bold mb-4">Cancel Appointment</h2>
          <p className="mb-2">
            Reason for cancelling appointment with <strong>{selectedAppointment.patient?.full_name}</strong>:
          </p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCancelModal(false)}
              className="px-4 py-2 rounded bg-gray-200"
            >
              Close
            </button>
            <button
              onClick={submitCancel}
              className="px-4 py-2 rounded bg-red-600 text-white"
            >
              Cancel Appointment
            </button>
          </div>
        </div>
      </div>
    )}


      <Footer />
    </div>
  );
};

export default DoctorSelfProfile;


