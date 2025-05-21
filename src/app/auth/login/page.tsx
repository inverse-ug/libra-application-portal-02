"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;
    const callbackUrl = (formData.get("callbackUrl") as string) || "/";

    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Handle specific error messages from your NextAuth configuration
        if (result.error.includes("verify your email")) {
          setError("Please verify your email before logging in");
        } else if (result.error.includes("verify your phone")) {
          setError("Please verify your phone before logging in");
        } else if (result.error.includes("Ugandan phone number")) {
          setError("Please enter a valid Ugandan phone number");
        } else {
          setError("Invalid email/phone or password");
        }
        return;
      }

      // Successful login - refresh and redirect
      router.refresh();
      router.push(callbackUrl);
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold">
          Sign in to your account
        </h2>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <input type="hidden" name="callbackUrl" value="/" />

          <div>
            <label htmlFor="identifier" className="block text-sm font-medium">
              Email or Phone
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Email or Phone Number"
            />
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
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Password"
            />
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500">
              Forgot your password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
