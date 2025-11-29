import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait for Supabase to detect the recovery token in the URL
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event);
        if (event === "PASSWORD_RECOVERY") {
          setReady(true);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleReset = async () => {
    if (!ready) return alert("Recovery link invalid or expired.");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) return alert(error.message);

    alert("Password updated! Please login again.");
    window.location.href = "/login";
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: 10, marginTop: 20 }}
      />

      <br />

      <button onClick={handleReset} style={{ marginTop: 20 }}>
        Update Password
      </button>

      {!ready && (
        <p style={{ marginTop: 20, color: "red" }}>
          Waiting for recovery token...
        </p>
      )}
    </div>
  );
}
