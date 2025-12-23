import React, { useState } from "react";
import "boxicons/css/boxicons.min.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import DoctorRegistration from "./DoctorRegistration";
import DoctorSelfProfile from "./DoctorSelfProfile";


const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  // LOGIN STATES
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginShowPassword, setLoginShowPassword] = useState(false); // ⭐ added
  const [resetMsg, setResetMsg] = useState(""); // ⭐ added

  // REGISTER STATES
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regShowPassword, setRegShowPassword] = useState(false); // ⭐ added
  const [selectedRoleUI, setSelectedRoleUI] = useState<"patient" | "doctor">("patient");

  // LOCATION STATES
  const [locationChecked, setLocationChecked] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState<string>("");

  // OTHER STATES
  const [termsChecked, setTermsChecked] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // MOBILE VIEW STATE: 'login' or 'register'
  const [mobileView, setMobileView] = useState<"login" | "register">("login");

  const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

  // 📍 Handle location permission
  const handleLocationAccess = async (checked: boolean) => {
    setLocationChecked(checked);
    if (checked && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lon);

          try {
            const res = await fetch(
              `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json`
            );
            const data = await res.json();
            setAddress(data.display_name || "");
          } catch (err) {
            console.error("Error fetching address:", err);
          }
        },
        (error) => {
          console.error("Location access denied:", error);
          alert("Please allow location access to continue.");
          setLocationChecked(false);
        }
      );
    }
  };

  // ================================
  //        ✅ FORGOT PASSWORD
  // ================================
  const handleForgotPassword = async () => {
    if (!loginEmail) {
      setResetMsg("Please enter your email first.");
      setTimeout(() => setResetMsg(""), 5000);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail.trim(), {
      // redirectTo: "http://localhost:8080/reset-password",
      redirectTo: "https://nugatory-nonfaltering-ayleen.ngrok-free.dev/reset-password",
    });

    if (error) {
      setResetMsg("Error sending reset email: " + error.message);
    } else {
      setResetMsg("Reset link sent!");
    }
    setTimeout(() => setResetMsg(""), 5000);
  };

  // ================================
  //              LOGIN
  // ================================
  const handleLogin = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  setLoading(true);

  try {
    const res = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });

    if (res.error || !res.data.user) {
      alert("Login failed");
      return;
    }

    const user = res.data.user;

    // =========================
    // 1️⃣ CHECK DOCTOR
    // =========================
    const { data: doctor } = await supabase
      .from("doctors")
      .select("*")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (doctor) {
      localStorage.setItem("role", "doctor");

      if (!doctor.profile_completed) {
        navigate("/doctor_registration");
      } else {
        navigate("/doctor_selfprofile");
      }
      return;
    }

    // =========================
    // 2️⃣ CHECK PATIENT
    // =========================
    const { data: patient } = await supabase
      .from("patients")
      .select("id")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (!patient) {
      const role = localStorage.getItem("pending_role");

      // =========================
      // CREATE DOCTOR (FIRST LOGIN)
      // =========================
      if (role === "doctor") {
        const savedDoctor = JSON.parse(
          localStorage.getItem("pending_doctor_data") || "{}"
        );

        await supabase.from("doctors").insert({
          auth_id: user.id,
          full_name: savedDoctor.full_name,
          email: savedDoctor.email,
          phone: savedDoctor.phone,
          profile_completed: false,
        });

        localStorage.removeItem("pending_doctor_data");
        localStorage.removeItem("pending_role");

        localStorage.setItem("role", "doctor");
        navigate("/doctor_registration");
        return;
      }

      // =========================
      // CREATE PATIENT
      // =========================
      const savedPatient = JSON.parse(
        localStorage.getItem("pending_patient_data") || "{}"
      );

      await supabase.from("patients").insert({
        auth_id: user.id,
        ...savedPatient,
      });

      localStorage.removeItem("pending_patient_data");
      localStorage.removeItem("pending_role");
    }

    // =========================
    // PATIENT LOGIN
    // =========================
    localStorage.setItem("role", "patient");
    navigate("/index");

  } catch (err) {
    console.error("login error:", err);
    alert("Unexpected login error.");
  } finally {
    setLoading(false);
  }
};


 // ================================
//            REGISTER (FIXED)
// ================================
const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!termsChecked || !locationChecked) {
    alert("You must accept the Terms and allow location to register.");
    return;
  }

  if (!latitude || !longitude) {
    alert("Fetching location... please wait.");
    return;
  }

  if (!regName || !regPhone || !regEmail || !regPassword) {
    alert("Please fill all the fields.");
    return;
  }

  // 🔹 Save role
  localStorage.setItem("pending_role", selectedRoleUI);

  // 🔹 Save pending data
  if (selectedRoleUI === "patient") {
    localStorage.setItem(
      "pending_patient_data",
      JSON.stringify({
        full_name: regName,
        phone: regPhone,
        email: regEmail.trim(),
        address,
        latitude,
        longitude,
        location_allowed: true,
        terms_accepted: true,
      })
    );
  }

  if (selectedRoleUI === "doctor") {
    localStorage.setItem(
      "pending_doctor_data",
      JSON.stringify({
        full_name: regName,
        phone: regPhone,
        email: regEmail.trim(),
      })
    );
  }

  setLoading(true);

  try {
    // ✅ ONLY AUTH SIGNUP HERE
    const { error } = await supabase.auth.signUp({
      email: regEmail.trim(),
      password: regPassword,
    });

    if (error) throw error;

    alert("Registration successful! Please verify your email and then log in.");
    setIsActive(false);
  } catch (err) {
    console.error("Register error:", err);
    alert("Unexpected error during registration.");
  } finally {
    setLoading(false);
  }
};


  // ============================
  //   STYLES (unchanged)
  // ============================
  const globalStyles: React.CSSProperties = { margin: 0, padding: 0, boxSizing: "border-box", fontFamily: "Arial, sans-serif" };
  const bodyStyles: React.CSSProperties = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(90deg, #e2e2e2, #c9d6ff)", ...globalStyles };
  const containerStyles: React.CSSProperties = { position: "relative", width: "100%", maxWidth: "900px", height: "600px", background: "#fff", borderRadius: "30px", boxShadow: "0 0 30px rgba(0, 0, 0, 0.15)", margin: "20px", overflow: "hidden", overflowY: window.innerWidth < 850 ? "auto" : "hidden" };
  const formBoxStyles: React.CSSProperties = { position: "absolute", right: 0, width: "50%", height: "100%", background: "#fff", display: "flex", alignItems: "center", color: "#333", textAlign: "center", padding: "40px", zIndex: 1, transition: "0.6s ease-in-out" };
  const formBoxActiveStyles: React.CSSProperties = { ...formBoxStyles, right: 0, visibility: isActive ? "hidden" : "visible" };
  const formBoxRegisterStyles: React.CSSProperties = { position: "absolute", left: 0, width: "50%", height: "100%", background: "#fff", display: "flex", alignItems: "center", color: "#333", textAlign: "center", padding: "40px", zIndex: 1 };
  const formBoxRegisterActiveStyles: React.CSSProperties = { ...formBoxRegisterStyles, left: 0, visibility: isActive ? "visible" : "hidden" };
  const formStyles: React.CSSProperties = { width: "100%" };
  const h1Styles: React.CSSProperties = { fontSize: "36px", margin: "5px 0" };
  const inputBoxStyles: React.CSSProperties = { position: "relative", margin: "15px 0" };
  const inputStyles: React.CSSProperties = { width: "100%", padding: "13px 50px 13px 20px", background: "#eee", borderRadius: "8px", border: "none", outline: "none", fontSize: "16px", color: "#333", fontWeight: 500 };
  const iconStyles: React.CSSProperties = { position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", fontSize: "20px", color: "#333", cursor: "pointer" };
  const forgotLinkStyles: React.CSSProperties = { margin: "-15px 0 15px" };
  const forgotLinkAStyles: React.CSSProperties = { fontSize: "14.5px", color: "#2D9CDB", textDecoration: "none", cursor: "pointer" };
  const btnStyles: React.CSSProperties = { width: "100%", height: "48px", backgroundColor: "#2D9CDB", boxShadow: "0 0 10px rgba(0,0,0,0.1)", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "16px", color: "#fff", fontWeight: 600 };
  const pStyles: React.CSSProperties = { fontSize: "14.5px", margin: "10px 0" };
  const socialIconsStyles: React.CSSProperties = { display: "flex", justifyContent: "center" };
  const socialIconAStyles: React.CSSProperties = { display: "inline-flex", padding: "10px", border: "2px solid #ccc", borderRadius: "8px", fontSize: "24px", color: "#333", textDecoration: "none", margin: "0 8px" };
  const checkboxStyles: React.CSSProperties = { margin: "5px 0", textAlign: "left" };
  const checkboxInputStyles: React.CSSProperties = { marginRight: "10px" };
  const checkboxLabelStyles: React.CSSProperties = { fontSize: "12px", color: "#333" };
  const linkStyles: React.CSSProperties = { color: "#2D9CDB", textDecoration: "underline" };
  const toggleBoxStyles: React.CSSProperties = { position: "absolute", width: "100%", height: "100%" };
  const toggleBoxBeforeStyles: React.CSSProperties = { position: "absolute", left: isActive ? "50%" : "-250%", width: "300%", height: "100%", background: "#2D9CDB", borderRadius: "150px", zIndex: 2, transition: "1.8s ease-in-out" };
  const togglePanelStyles: React.CSSProperties = { position: "absolute", width: "50%", height: "100%", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 2 };
  const toggleLeftStyles: React.CSSProperties = { ...togglePanelStyles, left: isActive ? "-50%" : 0, transitionDelay: isActive ? "0.6s" : "1.2s" };
  const toggleRightStyles: React.CSSProperties = { ...togglePanelStyles, right: isActive ? 0 : "-50%", transitionDelay: isActive ? "1.2s" : "0.6s" };
  const togglePanelPStyles: React.CSSProperties = { marginBottom: "20px" };
  const toggleBtnStyles: React.CSSProperties = { width: "160px", height: "46px", background: "transparent", border: "2px solid #fff", borderRadius: "8px", cursor: "pointer", fontSize: "16px", color: "#fff", fontWeight: 600 };
  const roleBtn = (active: boolean): React.CSSProperties => ({flex: 1,padding: "10px",borderRadius: "20px",border: active ? "2px solid #2D9CDB" : "2px solid #ccc",background: active ? "#2D9CDB" : "transparent",color: active ? "#fff" : "#333",fontWeight: 600,cursor: "pointer",transition: "0.3s",});

  // MOBILE MEDIA QUERIES: hide desktop section, show mobile section
  const mediaQueries = `
    @media screen and (max-width: 850px) {
      .container { height: auto; padding-bottom: 30px; }
      .form-box { width: 100%; position: relative; left: 0 !important; right: 0 !important; visibility: visible !important; }
      .toggle-before { left: 0; top: -270%; width: 100%; height: 300%; }
      .desktop-section { display: none !important; }
      .mobile-section { display: block !important; }
    }
    @media screen and (min-width: 851px) {
      .mobile-section { display: none !important; }
    }
  `;

  return (
    <div style={bodyStyles}>
      <style dangerouslySetInnerHTML={{ __html: mediaQueries }} />
      <div style={containerStyles} className={`container ${isActive ? "active" : ""}`}>

        {/* ===== MOBILE SECTION (shows on small screens) ===== */}
        <div className="mobile-section" style={{ display: "none", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 16 }}>
            <button
              onClick={() => setMobileView("login")}
              style={{
                padding: "10px 18px",
                border: "none",
                background: mobileView === "login" ? "#2D9CDB" : "transparent",
                color: mobileView === "login" ? "#fff" : "#2D9CDB",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Login
            </button>
            <button
              onClick={() => setMobileView("register")}
              style={{
                padding: "10px 18px",
                border: "none",
                background: mobileView === "register" ? "#2D9CDB" : "transparent",
                color: mobileView === "register" ? "#fff" : "#2D9CDB",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Register
            </button>
          </div>

          {/* Mobile Login Form — reuses same state and handlers */}
          {mobileView === "login" && (
            <form style={{ width: "100%", maxWidth: 420, margin: "0 auto", overflowY: "auto", maxHeight: "100vh", paddingBottom: 40 }} onSubmit={handleLogin}>
              <h1 style={{ fontSize: 28, margin: "8px 0", textAlign: "center" }}>Login</h1>

              <div style={inputBoxStyles}>
                <input
                  type="email"
                  placeholder="Email"
                  required
                  style={{ ...inputStyles, padding: "12px 40px 12px 12px" }}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={loading}
                />
                <i className="bx bxs-user" style={iconStyles}></i>
              </div>

              <div style={inputBoxStyles}>
                <input
                  type={loginShowPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  style={{ ...inputStyles, padding: "12px 40px 12px 12px" }}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={loading}
                />
                <i
                  className={`bx ${loginShowPassword ? "bxs-lock-open-alt" : "bxs-lock-alt"}`}
                  style={iconStyles}
                  onClick={() => setLoginShowPassword(!loginShowPassword)}
                ></i>
              </div>

              {resetMsg && (
                <p style={{ color: "green", fontSize: "14px", margin: "5px 0" }}>{resetMsg}</p>
              )}

              <div style={forgotLinkStyles}>
                <span onClick={handleForgotPassword} style={forgotLinkAStyles}>
                  Forgot password?
                </span>
              </div>

              <button type="submit" style={btnStyles} disabled={loading}>
                {loading ? "Please wait..." : "Login"}
              </button>

              <p style={pStyles}>or login with social platforms</p>

              <div style={socialIconsStyles}>
                <a href="#" style={socialIconAStyles}><i className="bx bxl-google"></i></a>
                <a href="#" style={socialIconAStyles}><i className="bx bxl-facebook"></i></a>
                <a href="#" style={socialIconAStyles}><i className="bx bxl-github"></i></a>
                <a href="#" style={socialIconAStyles}><i className="bx bxl-linkedin"></i></a>
              </div>
            </form>
          )}

          {/* Mobile Register Form — reuses same state and handlers */}
          {mobileView === "register" && (
            <form style={{ width: "100%", maxWidth: 420, margin: "0 auto", overflowY: "auto", maxHeight: "100vh", paddingBottom: 80 }} onSubmit={handleRegister}>
              <h1 style={{ fontSize: 28, margin: "8px 0", textAlign: "center" }}>Register</h1>


              <div style={inputBoxStyles}>
                <input type="text" placeholder="Name" required style={{ ...inputStyles, padding: "12px 40px 12px 12px" }} value={regName} onChange={(e) => setRegName(e.target.value)} />
                <i className="bx bxs-user" style={iconStyles}></i>
              </div>

              <div style={inputBoxStyles}>
                <input type="tel" placeholder="Phone" required style={{ ...inputStyles, padding: "12px 40px 12px 12px" }} value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
                <i className="bx bxs-phone" style={iconStyles}></i>
              </div>

              <div style={inputBoxStyles}>
                <input type="email" placeholder="Email" required style={{ ...inputStyles, padding: "12px 40px 12px 12px" }} value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                <i className="bx bxs-envelope" style={iconStyles}></i>
              </div>

              <div style={inputBoxStyles}>
                <input
                  type={regShowPassword ? "text" : "password"}
                  placeholder="Create Password"
                  required
                  style={{ ...inputStyles, padding: "12px 40px 12px 12px" }}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
                <i
                  className={`bx ${regShowPassword ? "bxs-lock-open-alt" : "bxs-lock-alt"}`}
                  style={iconStyles}
                  onClick={() => setRegShowPassword(!regShowPassword)}
                ></i>
              </div>

              <div style={checkboxStyles}>
                <label style={{ fontSize: 14 }}>
                  <input type="checkbox" required style={checkboxInputStyles} checked={termsChecked} onChange={(e) => setTermsChecked(e.target.checked)} />{" "}
                  I agree to the Terms of Service and Privacy Policy.
                </label>
              </div>

              <div style={checkboxStyles}>
                <label style={{ fontSize: 14 }}>
                  <input type="checkbox" required style={checkboxInputStyles} checked={locationChecked} onChange={(e) => handleLocationAccess(e.target.checked)} />{" "}
                  I allow this app to access my location for health insights.
                </label>
              </div>

              {/* ===== Role Selection (UI only) ===== */}
<div style={{ display: "flex", gap: 12, margin: "15px 0" }}>
  <button
    type="button"
    style={roleBtn(selectedRoleUI === "patient")}
    onClick={() => setSelectedRoleUI("patient")}
  >
    Patient
  </button>

  <button
    type="button"
    style={roleBtn(selectedRoleUI === "doctor")}
    onClick={() => setSelectedRoleUI("doctor")}
  >
    Doctor
  </button>
</div>


              <button type="submit" style={btnStyles} disabled={loading}>
                {loading ? "Please wait..." : "Register"}
              </button>

              <p style={pStyles}>or Register with social platforms</p>

              <div style={socialIconsStyles}>
                <a href="#" style={socialIconAStyles}><i className="bx bxl-google"></i></a>
                <a href="#" style={socialIconAStyles}><i className="bx bxl-facebook"></i></a>
                <a href="#" style={socialIconAStyles}><i className="bx bxl-github"></i></a>
                <a href="#" style={socialIconAStyles}><i className="bx bxl-linkedin"></i></a>
              </div>
            </form>
          )}
        </div>

        {/* ===== DESKTOP SECTION (exactly your original UI) ===== */}
        <div className="desktop-section">
          {/* Login form */}
          <div style={isActive ? formBoxActiveStyles : formBoxStyles} className="form-box">
            <form style={formStyles} onSubmit={handleLogin}>
              <h1 style={h1Styles}>Login</h1>

              <div style={inputBoxStyles}>
                <input
                  type="email"
                  placeholder="Email"
                  required
                  style={inputStyles}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={loading}
                />
                <i className="bx bxs-user" style={iconStyles}></i>
              </div>

              <div style={inputBoxStyles}>
                <input
                  type={loginShowPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  style={inputStyles}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={loading}
                />
                <i
                  className={`bx ${loginShowPassword ? "bxs-lock-open-alt" : "bxs-lock-alt"}`}
                  style={iconStyles}
                  onClick={() => setLoginShowPassword(!loginShowPassword)}
                ></i>
              </div>

              {/* ⭐ Reset message */}
              {resetMsg && (
                <p style={{ color: "green", fontSize: "14px", margin: "5px 0" }}>{resetMsg}</p>
              )}

              <div style={forgotLinkStyles}>
                <span onClick={handleForgotPassword} style={forgotLinkAStyles}>
                  Forgot password?
                </span>
              </div>

              <button type="submit" style={btnStyles} disabled={loading}>
                {loading ? "Please wait..." : "Login"}
              </button>

              <p style={pStyles}>or login with social platforms</p>

              <div style={socialIconsStyles}>
                <a href="#" style={socialIconAStyles}><i className="bx bxl-google"></i></a>
                <a href="#" style={socialIconAStyles}><i className="bx bxl-facebook"></i></a>
                <a href="#" style={socialIconAStyles}><i className="bx bxl-github"></i></a>
                <a href="#" style={socialIconAStyles}><i className="bx bxl-linkedin"></i></a>
              </div>
            </form>
          </div>

          {/* Registration form */}
          <div style={isActive ? formBoxRegisterActiveStyles : formBoxRegisterStyles} className="form-box">
            <form style={formStyles} onSubmit={handleRegister}>
              <h1 style={h1Styles}>Register</h1>

              <div style={inputBoxStyles}>
                <input type="text" placeholder="Name" required style={inputStyles} value={regName} onChange={(e) => setRegName(e.target.value)} />
                <i className="bx bxs-user" style={iconStyles}></i>
              </div>

              <div style={inputBoxStyles}>
                <input type="tel" placeholder="Phone" required style={inputStyles} value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
                <i className="bx bxs-phone" style={iconStyles}></i>
              </div>

              <div style={inputBoxStyles}>
                <input type="email" placeholder="Email" required style={inputStyles} value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                <i className="bx bxs-envelope" style={iconStyles}></i>
              </div>

              <div style={inputBoxStyles}>
                <input
                  type={regShowPassword ? "text" : "password"}
                  placeholder="Create Password"
                  required
                  style={inputStyles}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
                <i
                  className={`bx ${regShowPassword ? "bxs-lock-open-alt" : "bxs-lock-alt"}`}
                  style={iconStyles}
                  onClick={() => setRegShowPassword(!regShowPassword)}
                ></i>
              </div>

              <div style={checkboxStyles}>
                <input type="checkbox" id="terms" required style={checkboxInputStyles} checked={termsChecked} onChange={(e) => setTermsChecked(e.target.checked)} />
                <label htmlFor="terms" style={checkboxLabelStyles}>I agree to the <a href="#" style={linkStyles}>Terms of Service</a> and <a href="#" style={linkStyles}>Privacy Policy</a>.</label>
              </div>

              <div style={checkboxStyles}>
                <input type="checkbox" id="location" required style={checkboxInputStyles} checked={locationChecked} onChange={(e) => handleLocationAccess(e.target.checked)} />
                <label htmlFor="location" style={checkboxLabelStyles}>I allow this app to access my location for health insights.</label>
              </div>

              {/* ===== Role Selection (UI only) ===== */}
<div style={{ display: "flex", gap: 12, margin: "15px 0" }}>
  <button
    type="button"
    style={roleBtn(selectedRoleUI === "patient")}
    onClick={() => setSelectedRoleUI("patient")}
  >
    Patient
  </button>

  <button
    type="button"
    style={roleBtn(selectedRoleUI === "doctor")}
    onClick={() => setSelectedRoleUI("doctor")}
  >
    Doctor
  </button>
</div>


              <button type="submit" style={btnStyles} disabled={loading}>
                {loading ? "Please wait..." : "Register"}
              </button>

              <p style={pStyles}>or Register with social platforms</p>

              <div style={socialIconsStyles}>
                <a href="#" style={socialIconAStyles}><i className="bx bxl-google"></i></a>
                <a href="#" style={socialIconAStyles}><i className="bx bxl-facebook"></i></a>
                <a href="#" style={socialIconAStyles}><i className="bx bxl-github"></i></a>
                <a href="#" style={socialIconAStyles}><i className="bx bxl-linkedin"></i></a>
              </div>
            </form>
          </div>

          {/* Toggle section */}
          <div style={toggleBoxStyles} className="toggle-box">
            <div style={toggleBoxBeforeStyles} className="toggle-before"></div>

            <div style={toggleLeftStyles} className="toggle-panel toggle-left">
              <h1 style={h1Styles}>Hello, Welcome!</h1>
              <p style={togglePanelPStyles}>Don't have an account?</p>
              <button
                type="button"
                style={toggleBtnStyles}
                onClick={() => setIsActive(true)}
              >
                Register
              </button>
            </div>

            <div style={toggleRightStyles} className="toggle-panel toggle-right">
              <h1 style={h1Styles}>Welcome Back!</h1>
              <p style={togglePanelPStyles}>Already have an account?</p>
              <button
                type="button"
                style={toggleBtnStyles}
                onClick={() => setIsActive(false)}
              >
                Login
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;