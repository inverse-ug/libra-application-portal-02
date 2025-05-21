"use client";

import { useState } from "react";
import { requestPasswordReset } from "../../(auth-pages)/actions";
import Link from "next/link";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEmail, setIsEmail] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const formData = new FormData();
      if (isEmail) {
        formData.append("email", identifier);
      } else {
        formData.append("phone", identifier);
      }

      const result = await requestPasswordReset(formData);

      if (result.success) {
        setSuccess(result.message);
        setIdentifier(""); // Clear the input on success
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Logo" className="h-16" />
        </div>

        <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">
          Reset Your Password
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="flex space-x-4 mb-4">
          <button
            type="button"
            onClick={() => setIsEmail(true)}
            className={`w-1/2 py-2 px-4 text-center rounded-md ${
              isEmail ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}>
            Email
          </button>
          <button
            type="button"
            onClick={() => setIsEmail(false)}
            className={`w-1/2 py-2 px-4 text-center rounded-md ${
              !isEmail ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}>
            Phone
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-gray-700">
              {isEmail ? "Email Address" : "Phone Number"}
            </label>
            <input
              id="identifier"
              type={isEmail ? "email" : "tel"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder={
                isEmail ? "Enter your email" : "Enter your phone number"
              }
            />
            {!isEmail && (
              <p className="mt-1 text-sm text-gray-500">
                Format: 0755123456 (Ugandan numbers only)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-blue-600 hover:text-blue-500 text-sm">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
