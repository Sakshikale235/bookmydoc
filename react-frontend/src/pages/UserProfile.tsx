import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import bgimage from "@/assets/patient_reg.jpg"  ;
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Calendar,
  Bell,
  Mail,
  Phone,
  Edit3,
  Plus,
  Stethoscope,
  ArrowRight,
  Clock,
  MapPin,
  Save,
  X,
  Activity
} from "lucide-react";
import SymptomsSection from "@/components/ui/SymptomsSection";

interface PatientProfile {
  id?: string;
  auth_id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  weight: string;
  height: string;
  blood_group: string;
  age: string;
  gender: string;
  profile_photo: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export default function UserProfile() {
  const [user, setUser] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // For showing upload error if RLS fails
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);

  interface Appointment {
    id: number;
    appointment_date: string;
    status: string;
    reason: string;
    doctor: {
      full_name: string;
      specialization: string;
      clinic_name: string;
    } | null;
  }

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  // Fetch live appointments for the logged-in patient
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user || !user.id) return;
      const { data, error } = await supabase
        .from('appointments')
        .select(`id, appointment_date, status, reason, doctor:doctors(full_name, specialization, clinic_name)`)
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: false });
      if (error) {
        console.error('❌ Error fetching appointments:', error);
        return;
      }
      // Map doctor array to single object as expected by Appointment type
      setAppointments(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data || []).map((appt: any) => ({
          ...appt,
          doctor: Array.isArray(appt.doctor) ? appt.doctor[0] : appt.doctor,
        }))
      );
    };
    fetchAppointments();
  }, [user]);

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'symptoms', label: 'Symptoms & History', icon: Activity }
  ];


  // Fetch logged-in user and their profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        navigate("/login");
        return;
      }

      console.log("🔍 Fetching profile for auth_id:", authUser.id);

      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("auth_id", authUser.id)
        .maybeSingle();

      console.log("📦 Database Response:", { data, error });

      if (error) {
        console.error("❌ Error fetching profile:", error);
        alert("Error loading profile. Please try again.");
      } else if (!data) {
        console.warn("⚠️ No profile found for this user yet.");
        setUser({
          auth_id: authUser.id,
          email: authUser.email,
          full_name: "",
          phone: "",
          address: "",
          weight: "",
          height: "",
          blood_group: "",
          age: "",
          gender: "",
          profile_photo: null,
        });
      } else {
        console.log("✅ Profile Data Fetched Successfully:");
        console.log("📝 Name:", data.full_name || "Not Provided");
        console.log("📞 Phone:", data.phone || "Not Provided");
        console.log("📍 Address:", data.address || "Not Provided");
        console.log("📊 Full Profile Data:", data);
        setUser({ ...data, email: authUser.email });
      }

      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  // Handle avatar upload (profile photo)
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadErrorMsg(null);
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) throw new Error("You must select an image to upload.");
      if (!file.type.startsWith("image/")) {
        throw new Error("Please select a valid image file.");
      }
      if (!user) throw new Error("User not loaded");
      // Use uuid for id (from schema)
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id || user.auth_id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      // Upload to 'profilephoto' bucket
      const { error: uploadError } = await supabase.storage
        .from("profilephoto")
        .upload(filePath, file, { upsert: true });
      if (uploadError) {
        // RLS error handling
        if (uploadError.message && uploadError.message.includes('row-level security')) {
          setUploadErrorMsg('❌ Upload failed due to Supabase Row Level Security (RLS) policy. Please ensure you have a policy that allows authenticated users to upload to this bucket.');
        }
        throw uploadError;
      }
      // Get public URL
      const { data: publicUrlData } = supabase.storage.from("profilephoto").getPublicUrl(filePath);
      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) throw new Error("Could not get public URL for uploaded photo.");
      // Update patient profile_photo in DB
      const { error: updateError } = await supabase
        .from("patients")
        .update({ profile_photo: publicUrl })
        .eq("id", user.id);
      if (updateError) throw updateError;
      setUser({ ...user, profile_photo: publicUrl });
      setUploadErrorMsg(null);
      // Optionally show a toast or alert
    } catch (error: unknown) {
      console.error("Upload error:", error);
      if (error instanceof Error) {
        setUploadErrorMsg(`Error uploading image: ${error.message}`);
      } else {
        setUploadErrorMsg("Error uploading image: Unknown error");
      }
    } finally {
      setUploading(false);
      // Reset file input value so user can re-upload same file if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Update user profile
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates = {
        full_name: user.full_name || null,
        phone: user.phone || null,
        address: user.address || null,
        weight: user.weight ? parseFloat(user.weight) : null,
        height: user.height ? parseFloat(user.height) : null,
        blood_group: user.blood_group || null,
        age: user.age ? parseInt(user.age) : null,
        gender: user.gender || null,
        latitude: user.latitude !== undefined && user.latitude !== null
          ? parseFloat(user.latitude.toString())
          : null,
        longitude: user.longitude !== undefined && user.longitude !== null
          ? parseFloat(user.longitude.toString())
          : null,
      };

      if (!user.id) {
        const { data, error } = await supabase
          .from("patients")
          .insert([{ ...updates, auth_id: user.auth_id }])
          .select()
          .single();

        if (error) throw error;
        setUser({ ...data, email: user.email });
        alert("✅ Profile created successfully!");
      } else {
        const { error } = await supabase
          .from("patients")
          .update(updates)
          .eq("id", user.id);

        if (error) throw error;
        alert("✅ Profile updated successfully!");
      }
      setIsEditing(false);
    } catch (error: unknown) {
      console.error("Update error:", error);
      if (error instanceof Error) {
        alert(`❌ Error saving profile: ${error.message}`);
      } else {
        alert("❌ Error saving profile: Unknown error");
      }
    } finally {
      setSaving(false);
    }
  };


  // 📍 Fetch user's current location and update address + coordinates
  const handleFetchLocation = async () => {
    if (!navigator.geolocation) {
      alert("❌ Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocode using OpenStreetMap
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();

          const locationName =
            data.display_name ||
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          setUser({
            ...user,
            latitude,
            longitude,
            address: locationName,
          });

          alert("✅ Location fetched successfully!");
        } catch (error) {
          console.error("Error fetching address:", error);
          alert("❌ Failed to fetch location details.");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (error.code === 1) alert("❌ Please allow location access.");
        else alert("❌ Unable to fetch your location.");
      }
    );
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">No user found. Please log in.</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen bg-gray-50 "
     style={{ backgroundImage: `url(${bgimage})` }}>
      {/* navbar */}
        <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:px-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="relative">
              {/* Profile Photo with Upload Button */}
              <div className="relative group">
                {user.profile_photo ? (
                  <img
                    src={user.profile_photo}
                    alt="Profile"
                    className="w-24 h-24 object-cover rounded-full border-4 border-blue-500 shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center border-4 border-blue-500 shadow-md">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                {/* Upload Button Overlay */}
                {isEditing && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-colors border-2 border-white"
                      title="Upload Photo"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"/>
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </button>
                  </>
                )}
                {/* Error Message */}
                {uploadErrorMsg && (
                  <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm whitespace-nowrap">
                    {uploadErrorMsg}
                  </div>
                )}
              </div>
            </div>

            <div className="text-center lg:text-left flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.full_name || "Complete Your Profile"}
              </h1>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {user.email}
                </div>


              </div>

              <Link
                to="/doctor_registration"
                className="inline-flex items-center bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 group"
              >
                <Stethoscope className="w-5 h-5 mr-2" />
                Register Yourself as a Doctor
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${activeTab === tab.id
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
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        Profile Settings
                      </h2>
                    </div>
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsEditing(false)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={user.full_name || ""}
                        onChange={(e) => setUser({ ...user, full_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                        disabled={!isEditing}
                        placeholder="Enter your full name"
                      />
                      {uploadErrorMsg && (
                        <div className="mt-2 text-red-600 text-sm text-center">{uploadErrorMsg}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={user.phone || ""}
                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                      />

                    </div>

                    {/* <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={user.address || ""}
                        onChange={(e) => setUser({ ...user, address: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!isEditing}
                        placeholder="Enter your address"
                      />

                    </div> */}

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={user.address || ""}
                          onChange={(e) => setUser({ ...user, address: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                          disabled={!isEditing}
                          placeholder="Enter your address"
                        />

                        {/* 📍 New Button */}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={handleFetchLocation}
                            className="flex items-center justify-center bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <MapPin className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>


                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={user.weight || ""}
                        onChange={(e) => setUser({ ...user, weight: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={user.height || ""}
                        onChange={(e) => setUser({ ...user, height: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Group
                      </label>
                      <select
                        value={user.blood_group || ""}
                        onChange={(e) => setUser({ ...user, blood_group: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!isEditing}
                      >
                        <option value="">Select Blood Group</option>
                        <option>A+</option>
                        <option>A-</option>
                        <option>B+</option>
                        <option>B-</option>
                        <option>AB+</option>
                        <option>AB-</option>
                        <option>O+</option>
                        <option>O-</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="150"
                        value={user.age || ""}
                        onChange={(e) => setUser({ ...user, age: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={user.gender || ""}
                        onChange={(e) => setUser({ ...user, gender: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!isEditing}
                      >
                        <option value="">Select Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>

                    {isEditing && (
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                        >
                          <Save className="w-5 h-5 mr-2" />
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {activeTab === 'appointments' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <Calendar className="w-6 h-6 mr-3 text-blue-500" />
                      My Appointments
                    </h2>
                    <Link
                      to="/doctor_consultation"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Book New
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {appointments.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">No appointments found.</div>
                    ) : (
                      appointments.map((appointment) => {
                        const apptDate = new Date(appointment.appointment_date);
                        const formattedDate = apptDate.toLocaleDateString();
                        const formattedTime = apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                          <div
                            key={appointment.id}
                            className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {appointment.doctor?.full_name || 'Doctor'}
                                  </h3>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                  </span>
                                </div>
                                <p className="text-blue-600 font-medium mb-2">{appointment.doctor?.specialization || ''}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {formattedDate}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {formattedTime}
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {appointment.doctor?.clinic_name || ''}
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                {appointment.status === 'scheduled' && (
                                  <>
                                    <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors">
                                      Reschedule
                                    </button>
                                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                      Cancel
                                    </button>
                                  </>
                                )}
                                {appointment.status === 'completed' && (
                                  <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors">
                                    View Report
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Bell className="w-6 h-6 mr-3 text-blue-500" />
                    Notification Settings
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Appointment Reminders</h3>
                        <p className="text-sm text-gray-600">Get notified about upcoming appointments</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive updates via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                        <p className="text-sm text-gray-600">Get text message alerts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'symptoms' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Activity className="w-6 h-6 mr-3 text-blue-500" />
                    Symptoms & History
                  </h2>
                  <SymptomsSection user={user} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}