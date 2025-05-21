"use client";

import React, { useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const testimonials = [
  {
    id: 1,
    quote:
      "Studying at Libra was amazing. I gained hands-on cosmetology skills and felt truly welcomed in Uganda.",
    name: "Emily Carson",
    title: "Diploma in Cosmetology",
    location: "Birmingham, United Kingdom",
    image:
      "https://images.pexels.com/photos/16113746/pexels-photo-16113746/free-photo-of-smiling-woman-wearing-a-jacket.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: 2,
    quote:
      "Joining Libra Institute transformed my career path. The practical skills I gained opened so many doors!",
    name: "Daniel M.",
    title: "IT Specialist",
    location: "Kampala, Uganda",
    image:
      "https://images.pexels.com/photos/2379886/pexels-photo-2379886.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: 3,
    quote:
      "Libra gave me real skills in fashion design. I now run my own tailoring shop. The training was practical and life-changing.",
    name: "Sarah K.",
    title: "Business Owner",
    location: "Entebbe, Uganda",
    image:
      "https://images.pexels.com/photos/1211992/pexels-photo-1211992.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

export default function TestimonialCarousel() {
  const autoplayRef = useRef(
    Autoplay({ delay: 10000, stopOnInteraction: true })
  );

  return (
    <div className="h-screen w-full overflow-hidden">
      <Carousel
        className="h-full w-full"
        plugins={[autoplayRef.current]}
        opts={{
          loop: true,
        }}>
        <CarouselContent className="absolute h-full w-full -ml-0">
          {testimonials.map((testimonial) => (
            <CarouselItem
              key={testimonial.id}
              className="relative h-full w-full">
              <div className="h-full w-full">
                {/* Image container with fixed height */}
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={testimonial.image}
                    alt={`Testimonial by ${testimonial.name}`}
                    className="h-full w-full object-cover"
                  />

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>

                {/* Text content - positioned to stay within viewport */}
                <div className="absolute inset-x-0 bottom-10 text-center items-center flex flex-col justify-end p-8 text-white">
                  <p className="text-xl font-medium">{testimonial.quote}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex flex-col">
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm opacity-80">{testimonial.title}</p>
                      <p className="text-sm opacity-80">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation arrows - positioned above the bottom text */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
          <CarouselPrevious className="relative h-8 w-8 rounded-full border-0 backdrop-blur-2xl hover:text-white bg-black/20 hover:bg-black/40 text-white" />
          <CarouselNext className="relative h-8 w-8 rounded-full border-0 backdrop-blur-2xl hover:text-white bg-black/20 hover:bg-black/40 text-white" />
        </div>
      </Carousel>
    </div>
  );
}
