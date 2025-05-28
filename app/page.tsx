"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { FeaturesSection } from "@/components/features-section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TestimonialsSection } from "@/components/testimonials-section";
import { HeroSection } from "@/components/hero-section";
import { AnimatedSection } from "@/components/animated-section";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen flex-col overflow-x-hidden"
    >
      <Header variant="home" />

      {/* Global scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-black z-50 origin-left"
        style={{ scaleX, opacity: 0.7 }}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <AnimatedSection transitionType="slide" className="py-20">
          <FeaturesSection />
        </AnimatedSection>

        {/* How It Works */}
        <AnimatedSection
          transitionType="scale"
          id="how-it-works"
          className="py-32"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-20">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
              >
                How It Works
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-lg text-black/70"
              >
                A simple four-step process to transform your research into
                polished documentation.
              </motion.p>
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
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative p-10 border border-black/20 hover:border-black transition-all duration-300"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="absolute -top-6 -left-6 w-12 h-12 bg-black text-white flex items-center justify-center text-xl font-bold"
                  >
                    {item.step}
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:translate-x-2 transition-transform duration-300">
                    {item.title}
                  </h3>
                  <p className="text-black/70 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Testimonials Section */}
        <AnimatedSection transitionType="fade" className="py-32">
          <TestimonialsSection />
        </AnimatedSection>

        {/* CTA Section */}
        <AnimatedSection
          transitionType="rotate"
          className="py-32 bg-black text-white"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-bold mb-8 tracking-tight"
              >
                Ready to Transform Your Research Documentation?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-xl mb-12 text-white/80 max-w-2xl mx-auto leading-relaxed"
              >
                Join researchers who are saving time and producing better
                documentation with Difras.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Link href={"/workspace"}>
                  <Button className="rounded-full bg-white text-black hover:bg-white/90 transition-all px-10 py-7 text-lg">
                    Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>
      </main>

      <Footer />
    </div>
  );
}
