// // src/pages/LoginPage.tsx
// import React, { useState } from "react";
// import "boxicons/css/boxicons.min.css";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../supabaseClient";

// const LoginPage = () => {
//   const navigate = useNavigate();

//   // LOGIN STATES
//   const [loginEmail, setLoginEmail] = useState("");
//   const [loginPassword, setLoginPassword] = useState("");

//   // REGISTER STATES
//   const [regName, setRegName] = useState("");
//   const [regPhone, setRegPhone] = useState("");
//   const [regEmail, setRegEmail] = useState("");
//   const [regPassword, setRegPassword] = useState("");

//   // LOCATION STATES
//   const [locationChecked, setLocationChecked] = useState(false);
//   const [latitude, setLatitude] = useState<number | null>(null);
//   const [longitude, setLongitude] = useState<number | null>(null);
//   const [address, setAddress] = useState<string>("");

//   // OTHER STATES
//   const [termsChecked, setTermsChecked] = useState(false);
//   const [isActive, setIsActive] = useState(false);

//   const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

//   // 📍 Handle location permission
//   const handleLocationAccess = async (checked: boolean) => {
//     setLocationChecked(checked);
//     if (checked && "geolocation" in navigator) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const lat = position.coords.latitude;
//           const lon = position.coords.longitude;
//           setLatitude(lat);
//           setLongitude(lon);

//           try {
//             const res = await fetch(
//               `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json`
//             );
//             const data = await res.json();
//             setAddress(data.display_name || "");
//           } catch (err) {
//             console.error("Error fetching address:", err);
//           }
//         },
//         (error) => {
//           console.error("Location access denied:", error);
//           alert("Please allow location access to continue.");
//           setLocationChecked(false);
//         }
//       );
//     }
//   };

//   // ✅ LOGIN
//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const email = loginEmail.trim();

//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password: loginPassword,
//     });

//     if (error) {
//       alert("Login failed: " + error.message);
//       return;
//     }

//     const user = data.user;
//     if (!user) {
//       alert("No user found.");
//       return;
//     }

//     if (user.email_confirmed_at === null) {
//       alert("Please confirm your email before logging in.");
//       return;
//     }

//     // Check if user is doctor
//     const { data: doctor, error: docError } = await supabase
//       .from("doctors")
//       .select("id")
//       .eq("auth_id", user.id)
//       .single();

//     if (doctor && !docError) {
//       localStorage.setItem("role", "doctor");
//       localStorage.setItem("isLoggedIn", "true");
//       navigate("/doctor_selfprofile");
//       return;
//     }

//     // Check if user is patient
//     const { data: patient, error: patError } = await supabase
//       .from("patients")
//       .select("id")
//       .eq("auth_id", user.id)
//       .single();

//     if (patient && !patError) {
//       localStorage.setItem("role", "patient");
//       localStorage.setItem("isLoggedIn", "true");
//       navigate("/index");
//       return;
//     }

//     alert("User not found in either doctors or patients table.");
//   };

//   // REGISTER
//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!termsChecked || !locationChecked) {
//       alert("You must accept the Terms and allow location to register.");
//       return;
//     }
//     if (latitude === null || longitude === null) {
//       alert("Fetching location... Please wait a moment and try again.");
//       return;
//     }

//     const email = regEmail.trim();
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password: regPassword,
//     });

//     if (error) {
//       alert("Registration failed: " + error.message);
//       return;
//     }

//     const user = data.user;
//     if (!user) {
//       alert("User not found after registration.");
//       return;
//     }

//     const { error: insertError } = await supabase.from("patients").insert([
//       {
//         auth_id: user.id,
//         full_name: regName,
//         email,
//         phone: regPhone,
//         address,
//         latitude: latitude ?? 0,
//         longitude: longitude ?? 0,
//         location_allowed: true,
//         terms_accepted: true,
//       },
//     ]);

//     if (insertError) {
//       console.error("Error saving patient details:", insertError.message);
//     } else {
//       alert("Registration successful! Please check your email for confirmation.");
//     }

//     setIsActive(false);
//     setRegName("");
//     setRegPhone("");
//     setRegEmail("");
//     setRegPassword("");
//     setTermsChecked(false);
//     setLocationChecked(false);
//   };

//   // ================= STYLES =================
//   const globalStyles: React.CSSProperties = { margin: 0, padding: 0, boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' };
//   const bodyStyles: React.CSSProperties = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(90deg, #e2e2e2, #c9d6ff)', ...globalStyles };
//   const containerStyles: React.CSSProperties = { position: 'relative', width: '100%', maxWidth: '850px', height: '550px', background: '#fff', borderRadius: '30px', boxShadow: '0 0 30px rgba(0, 0, 0, 0.2)', margin: '20px', overflow: 'hidden' };
//   const formBoxStyles: React.CSSProperties = { position: 'absolute', right: 0, width: '50%', height: '100%', background: '#fff', display: 'flex', alignItems: 'center', color: '#333', textAlign: 'center', padding: '40px', zIndex: 1, transition: '0.6s ease-in-out 1.2s, visibility 0s 1s' };
//   const formBoxActiveStyles: React.CSSProperties = { ...formBoxStyles, right: 0, visibility: 'hidden' };
//   const formBoxRegisterStyles: React.CSSProperties = { ...formBoxStyles, left: 0, visibility: 'hidden' };
//   const formBoxRegisterActiveStyles: React.CSSProperties = { ...formBoxRegisterStyles, left: 0, visibility: 'visible' };
//   const formStyles: React.CSSProperties = { width: '100%' };
//   const h1Styles: React.CSSProperties = { fontSize: '36px', margin: '5px 0' };
//   const inputBoxStyles: React.CSSProperties = { position: 'relative', margin: '15px 0' };
//   const inputStyles: React.CSSProperties = { width: '100%', padding: '13px 50px 13px 20px', background: '#eee', borderRadius: '8px', border: 'none', outline: 'none', fontSize: '16px', color: '#333', fontWeight: 500 };
//   const iconStyles: React.CSSProperties = { position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: '#333' };
//   const forgotLinkStyles: React.CSSProperties = { margin: '-15px 0 15px' };
//   const forgotLinkAStyles: React.CSSProperties = { fontSize: '14.5px', color: '#eee', textDecoration: 'none' };
//   const btnStyles: React.CSSProperties = { width: '100%', height: '48px', backgroundColor: '#2D9CDB', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#fff', fontWeight: 600 };
//   const pStyles: React.CSSProperties = { fontSize: '14.5px', margin: '10px 0' };
//   const socialIconsStyles: React.CSSProperties = { display: 'flex', justifyContent: 'center' };
//   const socialIconAStyles: React.CSSProperties = { display: 'inline-flex', padding: '10px', border: '2px solid #ccc', borderRadius: '8px', fontSize: '24px', color: '#333', textDecoration: 'none', margin: '0 8px' };
//   const checkboxStyles: React.CSSProperties = { margin: '5px 0', textAlign: 'left' };
//   const checkboxInputStyles: React.CSSProperties = { marginRight: '10px' };
//   const checkboxLabelStyles: React.CSSProperties = { fontSize: '12px', color: '#333' };
//   const linkStyles: React.CSSProperties = { color: '#2D9CDB', textDecoration: 'underline' };
//   const toggleBoxStyles: React.CSSProperties = { position: 'absolute', width: '100%', height: '100%' };
//   const toggleBoxBeforeStyles: React.CSSProperties = { position: 'absolute', left: isActive ? '50%' : '-250%', width: '300%', height: '100%', background: '#2D9CDB', borderRadius: '150px', zIndex: 2, transition: '1.8s ease-in-out' };
//   const togglePanelStyles: React.CSSProperties = { position: 'absolute', width: '50%', height: '100%', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 2 };
//   const toggleLeftStyles: React.CSSProperties = { ...togglePanelStyles, left: isActive ? '-50%' : 0, transitionDelay: isActive ? '0.6s' : '1.2s' };
//   const toggleRightStyles: React.CSSProperties = { ...togglePanelStyles, right: isActive ? 0 : '-50%', transitionDelay: isActive ? '1.2s' : '0.6s' };
//   const togglePanelPStyles: React.CSSProperties = { marginBottom: '20px' };
//   const toggleBtnStyles: React.CSSProperties = { width: '160px', height: '46px', background: 'transparent', border: '2px solid #fff', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', color: '#fff', fontWeight: 600 };

//   const mediaQueries = `
//     @media screen and (max-width: 650px) {
//       .container { height: calc(100vh - 40px); }
//       .form-box { bottom: 0; width: 100%; height: 70%; }
//       .container.active .form-box { right: 0; bottom: 30%; }
//       .toggle-before { left: 0; top: -270%; width: 100%; height: 300%; }
//       .container.active .toggle-before { left: 0; top: 70%; }
//       .toggle-panel { width: 100%; height: 30%; }
//       .toggle-panel.toggle-left { top: 0; }
//       .container.active .toggle-panel.toggle-left { left: 0; top: -30%; }
//       .toggle-panel.toggle-right { right: 0; bottom: -30%; }
//       .container.active .toggle-panel.toggle-right { bottom: 0; }
//     }
//     @media screen and (max-width: 450px) {
//       .form-box { padding: 20px; }
//       .toggle-panel h1, h1 { font-size: 30px; }
//     }
//   `;

//   return (
//     <div style={bodyStyles}>
//       <style dangerouslySetInnerHTML={{ __html: mediaQueries }} />
//       <div style={containerStyles} className={`container ${isActive ? "active" : ""}`}>
//         {/* Login form */}
//         <div style={isActive ? formBoxActiveStyles : formBoxStyles} className="form-box">
//           <form style={formStyles} onSubmit={handleLogin}>
//             <h1 style={h1Styles}>Login</h1>
//             <div style={inputBoxStyles}>
//               <input type="email" placeholder="Email" required style={inputStyles} value={loginEmail}
//                 onChange={(e) => setLoginEmail(e.target.value)} />
//               <i className="bx bxs-user" style={iconStyles}></i>
//             </div>
//             <div style={inputBoxStyles}>
//               <input type="password" placeholder="Password" required style={inputStyles} value={loginPassword}
//                 onChange={(e) => setLoginPassword(e.target.value)} />
//               <i className="bx bxs-lock-alt" style={iconStyles}></i>
//             </div>
//             <div style={forgotLinkStyles}>
//               <a href="#" style={forgotLinkAStyles}>Forgot password?</a>
//             </div>
//             <button type="submit" style={btnStyles}>Login</button>
//             <p style={pStyles}>or login with social platforms</p>
//             <div style={socialIconsStyles}>
//               <a href="#" style={socialIconAStyles}><i className="bx bxl-google"></i></a>
//               <a href="#" style={socialIconAStyles}><i className="bx bxl-facebook"></i></a>
//               <a href="#" style={socialIconAStyles}><i className="bx bxl-github"></i></a>
//               <a href="#" style={socialIconAStyles}><i className="bx bxl-linkedin"></i></a>
//             </div>
//           </form>
//         </div>

//         {/* Registration form */}
//         <div style={isActive ? formBoxRegisterActiveStyles : formBoxRegisterStyles} className="form-box">
//           <form style={formStyles} onSubmit={handleRegister}>
//             <h1 style={h1Styles}>Register</h1>
//             <div style={inputBoxStyles}>
//               <input type="text" placeholder="Name" required style={inputStyles} value={regName} onChange={(e) => setRegName(e.target.value)} />
//               <i className="bx bxs-user" style={iconStyles}></i>
//             </div>
//             <div style={inputBoxStyles}>
//               <input type="tel" placeholder="Phone" required style={inputStyles} value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
//               <i className="bx bxs-phone" style={iconStyles}></i>
//             </div>
//             <div style={inputBoxStyles}>
//               <input type="email" placeholder="Email" required style={inputStyles} value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
//               <i className="bx bxs-envelope" style={iconStyles}></i>
//             </div>
//             <div style={inputBoxStyles}>
//               <input type="password" placeholder="Create Password" required style={inputStyles} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
//               <i className="bx bxs-lock-alt" style={iconStyles}></i>
//             </div>
//             <div style={checkboxStyles}>
//               <input type="checkbox" id="terms" required style={checkboxInputStyles} checked={termsChecked} onChange={(e) => setTermsChecked(e.target.checked)} />
//               <label htmlFor="terms" style={checkboxLabelStyles}>I agree to the <a href="#" style={linkStyles}>Terms of Service</a> and <a href="#" style={linkStyles}>Privacy Policy</a>.</label>
//             </div>
//             <div style={checkboxStyles}>
//               <input type="checkbox" id="location" required style={checkboxInputStyles} checked={locationChecked} onChange={(e) => handleLocationAccess(e.target.checked)} />
//               <label htmlFor="location" style={checkboxLabelStyles}>I allow this app to access my location for health insights.</label>
//             </div>
//             <button type="submit" style={btnStyles}>Register</button>
//             <p style={pStyles}>or Register with social platforms</p>
//             <div style={socialIconsStyles}>
//               <a href="#" style={socialIconAStyles}><i className="bx bxl-google"></i></a>
//               <a href="#" style={socialIconAStyles}><i className="bx bxl-facebook"></i></a>
//               <a href="#" style={socialIconAStyles}><i className="bx bxl-github"></i></a>
//               <a href="#" style={socialIconAStyles}><i className="bx bxl-linkedin"></i></a>
//             </div>
//           </form>
//         </div>

//         {/* Toggle section */}
//         <div style={toggleBoxStyles} className="toggle-box">
//           <div style={toggleBoxBeforeStyles} className="toggle-before"></div>
//           <div style={toggleLeftStyles} className="toggle-panel toggle-left">
//             <h1 style={h1Styles}>Hello, Welcome!</h1>
//             <p style={togglePanelPStyles}>Don't have an account?</p>
//             <button type="button" style={toggleBtnStyles} onClick={() => setIsActive(true)}>Register</button>
//           </div>
//           <div style={toggleRightStyles} className="toggle-panel toggle-right">
//             <h1 style={h1Styles}>Welcome Back!</h1>
//             <p style={togglePanelPStyles}>Already have an account?</p>
//             <button type="button" style={toggleBtnStyles} onClick={() => setIsActive(false)}>Login</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

import React, { useState } from "react";
import "boxicons/css/boxicons.min.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  // LOGIN STATES
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // REGISTER STATES
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // LOCATION STATES
  const [locationChecked, setLocationChecked] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState<string>("");

  // OTHER STATES
  const [termsChecked, setTermsChecked] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

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
    const email = prompt("Enter your email to reset password:");
    if (!email) return;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: "http://localhost:8080/reset-password",
    });

    if (error) {
      alert("Error sending reset email: " + error.message);
    } else {
      alert("Password reset email sent! Check your inbox.");
    }
  };

  // ================================
  //              LOGIN
  // ================================
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const email = loginEmail.trim();
      const password = loginPassword;
      if (!email || !password) {
        alert("Provide email & password");
        setLoading(false);
        return;
      }

      const res = await supabase.auth.signInWithPassword({ email, password });
      console.log("signInWithPassword full result:", res);

      if (res.error) {
        alert("Login failed: " + (res.error.message || JSON.stringify(res.error)));
        setLoading(false);
        return;
      }

      const user = res.data?.user;
      if (!user) {
        alert("Login succeeded but no user returned.");
        setLoading(false);
        return;
      }

      // CHECK PATIENT FIRST
      const patLookup = await supabase
        .from("patients")
        .select("id, auth_id, full_name")
        .eq("auth_id", user.id)
        .maybeSingle();

      console.log("patient lookup:", patLookup);

      if (patLookup.data && !patLookup.error) {
        localStorage.setItem("role", "patient");
        localStorage.setItem("isLoggedIn", "true");
        navigate("/index");
        setLoading(false);
        return;
      }

      // THEN CHECK DOCTOR (fallback to email)
      const docLookup = await supabase
        .from("doctors")
        .select("id, auth_id, email")
        .eq("auth_id", user.id)
        .maybeSingle();

      console.log("doctor lookup by auth_id:", docLookup);

      if ((!docLookup.data || docLookup.error) && user.email) {
        const byEmail = await supabase
          .from("doctors")
          .select("id, auth_id, email")
          .eq("email", user.email)
          .maybeSingle();

        console.log("doctor lookup by email:", byEmail);

        if (byEmail.data && !byEmail.error) {
          try {
            await supabase
              .from("doctors")
              .update({ auth_id: user.id })
              .eq("id", byEmail.data.id);

            console.log("Updated doctors.auth_id for doctor id:", byEmail.data.id);

            // FIX: update response fields instead of replacing
            docLookup.data = { ...byEmail.data, auth_id: user.id };
            docLookup.error = null;
          } catch (upErr) {
            console.warn("Failed to update doctors.auth_id:", upErr);
          }
        }
      }

      if (docLookup.data && !docLookup.error) {
        localStorage.setItem("role", "doctor");
        localStorage.setItem("isLoggedIn", "true");
        navigate("/doctor_selfprofile");
        setLoading(false);
        return;
      }

      alert("Authenticated but not present in doctors or patients table.");
    } catch (err) {
      console.error("login exception:", err);
      alert("Unexpected error - see console");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  //            REGISTER
  // ================================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsChecked || !locationChecked) {
      alert("You must accept the Terms and allow location to register.");
      return;
    }
    if (latitude === null || longitude === null) {
      alert("Fetching location... Please wait a moment and try again.");
      return;
    }

    const email = regEmail.trim();
    if (!regName || !regPhone || !email || !regPassword) {
      alert("Please fill all registration fields.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: regPassword,
      });

      console.log("signUp result:", { data, error });

      if (error) {
        alert("Registration failed: " + (error.message || JSON.stringify(error)));
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user) {
        alert("User not found after registration.");
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("patients").insert([
        {
          auth_id: user.id,
          full_name: regName,
          email,
          phone: regPhone,
          address,
          latitude: latitude ?? 0,
          longitude: longitude ?? 0,
          location_allowed: true,
          terms_accepted: true,
        },
      ]);

      if (insertError) {
        console.error("Error saving patient details:", insertError);
        alert("Registration succeeded but failed to save profile. Check console.");
      } else {
        alert("Registration successful! Please check your email for confirmation.");
      }

      // reset form
      setIsActive(false);
      setRegName("");
      setRegPhone("");
      setRegEmail("");
      setRegPassword("");
      setTermsChecked(false);
      setLocationChecked(false);
    } catch (err) {
      console.error("Register error:", err);
      alert("Unexpected error during registration. See console.");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  //   STYLES (unchanged)
  // ============================
  const globalStyles: React.CSSProperties = { margin: 0, padding: 0, boxSizing: "border-box", fontFamily: "Arial, sans-serif" };
  const bodyStyles: React.CSSProperties = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(90deg, #e2e2e2, #c9d6ff)", ...globalStyles };
  const containerStyles: React.CSSProperties = { position: "relative", width: "100%", maxWidth: "900px", height: "600px", background: "#fff", borderRadius: "30px", boxShadow: "0 0 30px rgba(0, 0, 0, 0.15)", margin: "20px", overflow: "hidden" };
  const formBoxStyles: React.CSSProperties = { position: "absolute", right: 0, width: "50%", height: "100%", background: "#fff", display: "flex", alignItems: "center", color: "#333", textAlign: "center", padding: "40px", zIndex: 1, transition: "0.6s ease-in-out" };
  const formBoxActiveStyles: React.CSSProperties = { ...formBoxStyles, right: 0, visibility: isActive ? "hidden" : "visible" };
  const formBoxRegisterStyles: React.CSSProperties = { position: "absolute", left: 0, width: "50%", height: "100%", background: "#fff", display: "flex", alignItems: "center", color: "#333", textAlign: "center", padding: "40px", zIndex: 1 };
  const formBoxRegisterActiveStyles: React.CSSProperties = { ...formBoxRegisterStyles, left: 0, visibility: isActive ? "visible" : "hidden" };
  const formStyles: React.CSSProperties = { width: "100%" };
  const h1Styles: React.CSSProperties = { fontSize: "36px", margin: "5px 0" };
  const inputBoxStyles: React.CSSProperties = { position: "relative", margin: "15px 0" };
  const inputStyles: React.CSSProperties = { width: "100%", padding: "13px 50px 13px 20px", background: "#eee", borderRadius: "8px", border: "none", outline: "none", fontSize: "16px", color: "#333", fontWeight: 500 };
  const iconStyles: React.CSSProperties = { position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", fontSize: "20px", color: "#333" };
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

  const mediaQueries = `
    @media screen and (max-width: 850px) {
      .container { height: auto; padding-bottom: 30px; }
      .form-box { width: 100%; position: relative; left: 0 !important; right: 0 !important; visibility: visible !important; }
      .toggle-before { left: 0; top: -270%; width: 100%; height: 300%; }
    }
  `;

  return (
    <div style={bodyStyles}>
      <style dangerouslySetInnerHTML={{ __html: mediaQueries }} />
      <div style={containerStyles} className={`container ${isActive ? "active" : ""}`}>

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
                type="password"
                placeholder="Password"
                required
                style={inputStyles}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={loading}
              />
              <i className="bx bxs-lock-alt" style={iconStyles}></i>
            </div>

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
              <input type="password" placeholder="Create Password" required style={inputStyles} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
              <i className="bx bxs-lock-alt" style={iconStyles}></i>
            </div>

            <div style={checkboxStyles}>
              <input type="checkbox" id="terms" required style={checkboxInputStyles} checked={termsChecked} onChange={(e) => setTermsChecked(e.target.checked)} />
              <label htmlFor="terms" style={checkboxLabelStyles}>I agree to the <a href="#" style={linkStyles}>Terms of Service</a> and <a href="#" style={linkStyles}>Privacy Policy</a>.</label>
            </div>

            <div style={checkboxStyles}>
              <input type="checkbox" id="location" required style={checkboxInputStyles} checked={locationChecked} onChange={(e) => handleLocationAccess(e.target.checked)} />
              <label htmlFor="location" style={checkboxLabelStyles}>I allow this app to access my location for health insights.</label>
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
  );
};

export default LoginPage;
