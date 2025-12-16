import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Index from "./pages/Index";
import Login from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import DoctorConsultation from "./pages/DoctorConsultation";
import SymptomChecker from "./pages/SymptomChecker";
import UserProfile from "./pages/UserProfile";
import DoctorRegistration from "./pages/DoctorRegistration";
import DoctorSelfProfile from "./pages/DoctorSelfProfile";
import BookAppointment from "./pages/BookAppointment";
import ProtectedRoute from "./pages/ProtectedRoute"; // ✅ new
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />

      <BrowserRouter>
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/index"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/symptom_checker"
            element={
              <ProtectedRoute>
                <SymptomChecker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor_consultation"
            element={
              <ProtectedRoute>
                <DoctorConsultation />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/reset-password" 
            element={
              <ResetPassword />} 
              />
          <Route
            path="/user_profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor_registration"
            element={
              <ProtectedRoute>
                <DoctorRegistration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor_selfprofile"
            element={
              <ProtectedRoute>
                <DoctorSelfProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book_appointment/:doctorId"
            element={
              <ProtectedRoute>
                <BookAppointment />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
