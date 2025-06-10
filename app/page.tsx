"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { FeaturesSection } from "@/components/features-section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { AnimatedSection } from "@/components/animated-section";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      <Header variant="home" />
      <main className="flex-1 min-h-[200vh]">
        <HeroSection />
        <AnimatedSection transitionType="slide" className="py-20">
          <FeaturesSection />
        </AnimatedSection>
        <AnimatedSection
          transitionType="scale"
          id="how-it-works"
          className="py-32"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-black dark:text-white">
                How It Works
              </h2>
              <p className="text-lg text-black/70 dark:text-white/70">
                A simple four-step process to transform your research into
                polished documentation.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Describe Your Work",
                  description:
                    "Provide a brief description of your research and what you want to document.",
                },
                {
                  step: "02",
                  title: "Upload Sources",
                  description:
                    "Add sample documents and relevant sources to guide the AI generation.",
                },
                {
                  step: "03",
                  title: "Review & Edit",
                  description:
                    "Review the generated LaTeX document and make any necessary modifications.",
                },
                {
                  step: "04",
                  title: "Download",
                  description:
                    "Download your finalized document in LaTeX format or as a PDF.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="group relative p-10 border border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white transition-all duration-300"
                >
                  <div className="absolute -top-6 -left-6 w-12 h-12 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:translate-x-2 transition-transform duration-300 text-black dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-black/70 dark:text-white/70 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </main>
      <Footer />
    </div>
  );
}