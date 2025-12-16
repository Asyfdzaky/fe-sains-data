"use client";
import { motion } from "framer-motion";
import { Upload, Calculator, Brain, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Upload Data",
    description: "Upload customer transaction data in CSV or Excel format.",
    icon: Upload,
  },
  {
    number: "02",
    title: "RFM Calculation",
    description:
      "Calculate Recency, Frequency, and Monetary values for each customer.",
    icon: Calculator,
  },
  {
    number: "03",
    title: "ML Clustering",
    description:
      "Group customers with similar behavior using K-Means algorithm.",
    icon: Brain,
  },
  {
    number: "04",
    title: "Insights",
    description:
      "Explore customer segments through interactive visualizations.",
    icon: BarChart3,
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-10 overflow-hidden">
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A simple process to understand your customers
          </p>
        </div>

        {/* Steps Horizontal */}
        <div className="flex justify-center gap-4 max-w-6xl mx-auto overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex-shrink-0 w-[240px]">
              <div className="relative h-full rounded-xl bg-muted/50 p-5 border border-border/40 hover:border-primary/50 transition-colors">
                {/* Icon */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <step.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-2xl font-bold text-primary/30">
                    {step.number}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow connector */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-[2px] bg-border/40">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-border/40 rotate-45" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
