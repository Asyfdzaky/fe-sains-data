"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface About3Props {
  title?: string;
  description?: string;
  mainImage?: {
    src: string;
    alt: string;
  };
  secondaryImage?: {
    src: string;
    videoSrc?: string;
    alt: string;
  };
  breakout?: {
    src: string;
    videoSrc?: string;
    alt: string;
    title?: string;
    description?: string;
  };
  companiesTitle?: string;
  companies?: Array<{
    src?: string;
    icon?: React.ReactNode;
    alt: string;
  }>;
  achievementsTitle?: string;
  achievementsDescription?: string;
  achievements?: Array<{
    label: string;
    value: string;
  }>;
}

const defaultCompanies = [
  {
    src: "https://shadcnblocks.com/images/block/logos/company/fictional-company-logo-1.svg",
    alt: "Arc",
  },
  {
    src: "https://shadcnblocks.com/images/block/logos/company/fictional-company-logo-2.svg",
    alt: "Descript",
  },
  {
    src: "https://shadcnblocks.com/images/block/logos/company/fictional-company-logo-3.svg",
    alt: "Mercury",
  },
  {
    src: "https://shadcnblocks.com/images/block/logos/company/fictional-company-logo-4.svg",
    alt: "Ramp",
  },
  {
    src: "https://shadcnblocks.com/images/block/logos/company/fictional-company-logo-5.svg",
    alt: "Retool",
  },
  {
    src: "https://shadcnblocks.com/images/block/logos/company/fictional-company-logo-6.svg",
    alt: "Watershed",
  },
];

export const About3 = ({
  title = "About Us",
  description = "Shadcnblocks is a passionate team dedicated to creating innovative solutions that empower businesses to thrive in the digital age.",
  mainImage = {
    src: "https://shadcnblocks.com/images/block/placeholder-1.svg",
    alt: "placeholder",
  },
  secondaryImage = {
    src: "https://shadcnblocks.com/images/block/placeholder-2.svg",
    alt: "placeholder",
  },
  breakout = {
    src: "https://shadcnblocks.com/images/block/block-1.svg",
    alt: "logo",
    title: "Hundreds of blocks at Shadcnblocks.com",
    description:
      "Providing businesses with effective tools to improve workflows, boost efficiency, and encourage growth.",
  },
  companiesTitle = "Valued by clients worldwide",
  companies = defaultCompanies,
}: About3Props = {}) => {
  return (
    <section className="py-32">
      <div className="container mx-auto">
        <div className="mb-14 grid gap-5 text-center md:grid-cols-2 md:text-left">
          <h1 className="text-5xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="grid gap-7 lg:grid-cols-3">
          {/* Main Image */}
          <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-xl lg:col-span-2">
            <img
              src={mainImage.src}
              alt={mainImage.alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60" />
          </div>

          <div className="flex flex-col gap-7 md:flex-row lg:flex-col">
            {/* Breakout Card */}
            <div className="flex flex-col justify-between gap-6 rounded-xl bg-muted p-7 md:w-1/2 lg:w-auto">
              {breakout.videoSrc ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-48 w-full rounded-lg object-cover"
                >
                  <source src={breakout.videoSrc} type="video/webm" />
                </video>
              ) : (
                <img
                  src={breakout.src}
                  alt={breakout.alt}
                  className="h-12 w-auto"
                />
              )}

              <div>
                <p className="mb-2 text-lg font-semibold">{breakout.title}</p>
                <p className="text-muted-foreground">{breakout.description}</p>
              </div>
            </div>

            {/* Secondary Image */}
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl md:w-1/2 lg:w-full">
              {secondaryImage.videoSrc ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                >
                  <source src={secondaryImage.videoSrc} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={secondaryImage.src}
                  alt={secondaryImage.alt}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60" />
            </div>
          </div>
        </div>

        {/* Companies Section */}
        <div className="py-20 border-y border-border/20">
          <h3 className="text-center text-sm font-semibold text-muted-foreground/60 uppercase tracking-widest mb-12">
            {companiesTitle}
          </h3>

          <div className="relative overflow-hidden">
            {/* Gradient fade on edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <motion.div
              className="flex items-center gap-12 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                repeat: Infinity,
                duration: 25,
                ease: "linear",
              }}
            >
              {[...companies, ...companies].map((company, idx) => (
                <div
                  key={company.alt + idx}
                  className="flex items-center gap-12"
                >
                  <span className="text-xl font-medium text-foreground/70 hover:text-foreground transition-colors duration-300">
                    {company.alt}
                  </span>
                  <span className="text-2xl text-muted-foreground/20">•</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
