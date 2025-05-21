"use client";

import { useState } from "react";
import Link from "next/link";
import {
  registerApplicantEmail,
  registerApplicantPhone,
} from "@/app/(auth-pages)/actions";
import { useRouter } from "next/navigation";

export default function Register() {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleEmailRegistration(formData: FormData) {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await registerApplicantEmail(formData);

      if (response.success) {
        setMessage(response.message);
        if (response.requiresVerification) {
          // Redirect to verification page after a short delay
          setTimeout(() => {
            router.push("/auth/verify");
          }, 2000);
        }
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePhoneRegistration(formData: FormData) {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await registerApplicantPhone(formData);

      if (response.success) {
        setMessage(response.message);
        if (response.requiresVerification) {
          // Redirect to verification page after a short delay
          setTimeout(() => {
            router.push("/auth/verify");
          }, 2000);
        }
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold">
          Create your account
        </h2>

        <div className="mt-4 flex border border-gray-300 rounded-md">
          <button
            type="button"
            className={`flex-1 py-2 ${
              method === "email" ? "bg-blue-100 text-blue-700" : "bg-white"
            }`}
            onClick={() => setMethod("email")}>
            Register with Email
          </button>
          <button
            type="button"
            className={`flex-1 py-2 ${
              method === "phone" ? "bg-blue-100 text-blue-700" : "bg-white"
            }`}
            onClick={() => setMethod("phone")}>
            Register with Phone
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        {method === "email" ? (
          <form action={handleEmailRegistration} className="mt-8 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label htmlFor="program" className="block text-sm font-medium">
                Program
              </label>
              <select
                id="program"
                name="program"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                <option value="">Select a program</option>
                <option value="program1">Program 1</option>
                <option value="program2">Program 2</option>
                <option value="program3">Program 3</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {loading ? "Creating account..." : "Sign up with Email"}
              </button>
            </div>
          </form>
        ) : (
          <form action={handlePhoneRegistration} className="mt-8 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="e.g., 0755123456"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label htmlFor="program" className="block text-sm font-medium">
                Program
              </label>
              <select
                id="program"
                name="program"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                <option value="">Select a program</option>
                <option value="program1">Program 1</option>
                <option value="program2">Program 2</option>
                <option value="program3">Program 3</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {loading ? "Creating account..." : "Sign up with Phone"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
