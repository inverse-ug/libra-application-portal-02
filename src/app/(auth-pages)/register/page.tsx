import { Suspense } from "react";
import { Metadata } from "next";
import RegisterForm from "./_components/register-form";
import TestimonialCarousel from "../login/_components/testimonials-carousel";
import Image from "next/image";
import libra_logo from "@/assets/logo.png";
import RegisterFormSkeleton from "./form-skeleton";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left side - Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-start p-8">
        <div className="w-full max-w-lg space-y-8 mb-8">
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
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Register to apply for Libra programs
            </p>
          </div>
          <Suspense fallback={<RegisterFormSkeleton />}>
            <RegisterForm />
          </Suspense>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-primary hover:text-primary/90">
              Log in
            </a>
          </div>
        </div>
      </div>

      {/* Right side - Testimonial Carousel */}
      <div className="hidden lg:block lg:w-1/2 bg-secondary sticky top-0 h-screen">
        <TestimonialCarousel />
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Register | Libra Application Portal",
  description: "Create an account on the Libra Application Portal",
};
