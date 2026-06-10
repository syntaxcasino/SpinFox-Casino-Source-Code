"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { toast } from "react-toastify";

export default function ResetPasswordForm() {
  const { resetPassword } = useUser();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(token, password);
      toast.success("Password reset successful!");
    } catch (err) {
      toast.error("Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return <p className="text-white">Invalid reset link</p>;

  return (
    <div className="flex items-center justify-center h-screen bg-[#171424] p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1f1b2c] p-8 rounded-xl w-full max-w-md space-y-4"
      >
        <h2 className="text-white text-2xl font-bold mb-4">
          Reset Account Password
        </h2>
        <p className="text-white/50 text-md mb-4">
          Please choose a strong password you’ll remember.
        </p>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded border-2 border-[#70828F] placeholder-[#70828F] focus:border-[#896CEF] focus:outline-none text-black"
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 rounded border-2 border-[#70828F] placeholder-[#70828F] focus:border-[#896CEF] focus:outline-none text-black"
          required
        />

        <button
          type="submit"
          className="w-full py-2 px-4 text-white font-bold border-2 border-[#896cef] rounded hover:bg-[#896cef]/20"
          disabled={isLoading}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
