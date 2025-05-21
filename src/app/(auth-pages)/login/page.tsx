import { Suspense } from "react";
import { Metadata } from "next";
import LoginFormSkeleton from "./_components/form-skeleton";
import LoginForm from "./_components/login-form";
import TestimonialCarousel from "./_components/testimonials-carousel";
import Image from "next/image";
import libra_logo from "@/assets/logo.png";

export default function Page() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center">
            <div className={`flex items-center`}>
              <Image
                src={libra_logo}
                alt="Libra Logo"
                width={100}
                height={100}
              />
            </div>
            <h2 className="mt-6 text-center text-xl lg:text-2xl font-bold text-foreground">
              Log in to your account
            </h2>
          </div>
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="font-medium text-primary hover:text-primary/90">
              Register
            </a>
          </div>
        </div>
      </div>

      {/* Right side - Testimonial Carousel */}
      <div className="hidden lg:block lg:w-1/2 bg-secondary h-screen">
        <TestimonialCarousel />
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Login | Libra Application Portal",
  description: "Login into the Libra Application Portal",
};
