import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "@/pages/AuthPage";
import NotFound from "./pages/NotFound";
import DoctorConsultation from "./pages/DoctorConsultation";
import SymptomChecker from "./pages/SymptomChecker";
import UserProfile from "./pages/UserProfile";
import DoctorRegistration from "./pages/DoctorRegistration";
import DoctorSelfProfile from "./pages/DoctorSelfProfile";
import BookAppointment from "./pages/BookAppointment";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/symptom_checker" element={<SymptomChecker />} />
           <Route path="/doctor_consultation" element={<DoctorConsultation />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user_profile" element={<UserProfile />} />
            <Route path="/doctor_registration" element={<DoctorRegistration />} />
            <Route path="/doctor_selfprofile" element={<DoctorSelfProfile />} />
            {/* <Route path="/book_appointment" element={<BookAppointment />} /> */}
            <Route path="/book_appointment/:doctorId" element={<BookAppointment />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
