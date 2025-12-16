"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, BookOpen, BarChart3, Link } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnimateHero() {
  const [titleNumber, setTitleNumber] = useState(0);

  const titles = useMemo(
    () => [
      "customer behavior",
      "purchasing patterns",
      "valuable insights",
      "data-driven decisions",
      "customer segments",
    ],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev + 1) % titles.length);
    }, 2200);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles.length]);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover -z-10 brightness-[0.4]"
      >
        <source src="/bg/bg.mp4" type="video/mp4" />
      </video>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col items-center justify-center gap-8 py-24 lg:py-40">
          {/* Top Badge */}
          <Button
            variant="secondary"
            size="sm"
            className="gap-3 text-muted-foreground"
          >
            RFM Analysis & Machine Learning <BarChart3 className="h-4 w-4" />
          </Button>

          {/* Title */}
          <div className="flex flex-col gap-4">
            <h1 className="max-w-3xl text-center text-5xl font-regular tracking-tighter text-white md:text-7xl">
              <span>Understand your </span>
              <span className="relative flex w-full justify-center overflow-hidden md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-primary"
                    initial={{ opacity: 0, y: -100 }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed tracking-tight text-gray-300 md:text-xl">
              Segment customers using Recency, Frequency, and Monetary analysis
              powered by machine learning to uncover actionable business
              insights.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-row gap-3">
            <Button size="lg" className="gap-3" asChild>
              <a href="/login">
                Get Started <MoveRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Gradient bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
