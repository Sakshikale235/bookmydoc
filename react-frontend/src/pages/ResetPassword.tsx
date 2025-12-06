import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [tokenPresent, setTokenPresent] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      setTokenPresent(true);
    } else {
      setTokenPresent(false);
    }
  }, []);

  const handleReset = async () => {
    if (!tokenPresent) {
      alert("Invalid or expired reset link.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password reset successful! Please login again.");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Reset Your Password
        </h2>

        {!tokenPresent && (
          <p className="text-red-600 text-center font-medium mb-4">
            Invalid or expired reset link.
          </p>
        )}

        {tokenPresent && (
          <>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
            />

            <button
              onClick={handleReset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Update Password
            </button>
          </>
        )}

        <div className="mt-6 text-center">
          <a href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
