"use client";
import Image from "next/image";
import AnimateHero from "@/components/animate-hero";
import { About3 } from "@/components/about";
import HowItWorks from "@/components/how-to-works";
import {
  LucideShoppingCart,
  LucideStore,
  LucideCloud,
  LucideLandPlot,
  LucideMegaphone,
  Landmark,
  Megaphone,
  ShoppingCart,
  Store,
  Cloud,
} from "lucide-react";

export default function Home() {
  return (
    <div>
      <AnimateHero />
      <About3
        title="What is RFM & Customer Segmentation?"
        description="RFM Analysis is a data-driven method used to understand customer behavior based on transaction history. By combining Recency, Frequency, and Monetary metrics, businesses can segment customers effectively and make better strategic decisions."
        mainImage={{
          src: "/images/image.png",
          alt: "RFM dashboard visualization",
        }}
        secondaryImage={{
          src: "/images/image1.png",
          videoSrc: "/bg/customer-segementation.mp4",
          alt: "Customer segmentation illustration",
        }}
        breakout={{
          src: "/bg/kmeans-icon.svg",
          videoSrc: "/bg/Video.webm",
          alt: "Machine Learning",
          title: "Powered by Machine Learning",
          description:
            "This system uses K-Means clustering to automatically group customers with similar purchasing behavior after RFM calculation and normalization.",
        }}
        companiesTitle="RFM Analysis is widely used in many industries"
        companies={[
          { alt: "E-commerce" },
          { alt: "Retail" },
          { alt: "SaaS" },
          { alt: "Finance" },
          { alt: "Marketing" },
        ]}
      />
      <HowItWorks />
    </div>
  );
}
