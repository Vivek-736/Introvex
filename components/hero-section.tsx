// components/hero-section.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowDown } from "lucide-react";
import { motion, useTransform, useScroll } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useScrollPosition } from "@/hooks/use-scroll-position";

// Predefined dot properties to ensure consistency between server and client
const dotProperties = [
  { width: "3.13px", height: "8.14px", top: "11.92%", left: "50.88%" },
  { width: "9.44px", height: "4.51px", top: "73.31%", left: "31.53%" },
  { width: "8.78px", height: "10.74px", top: "97.77%", left: "73.62%" },
  { width: "3.84px", height: "7.28px", top: "57.36%", left: "34.04%" },
  { width: "3.45px", height: "8.32px", top: "74.08%", left: "52.76%" },
  { width: "3.15px", height: "3.65px", top: "62.49%", left: "75.06%" },
  { width: "8.72px", height: "6.12px", top: "89.31%", left: "30.47%" },
  { width: "3.94px", height: "7.60px", top: "21.64%", left: "97.41%" },
  { width: "3.54px", height: "7.28px", top: "92.12%", left: "89.20%" },
  { width: "8.50px", height: "9.33px", top: "43.86%", left: "95.10%" },
  { width: "3.10px", height: "10.33px", top: "55.47%", left: "95.73%" },
  { width: "4.99px", height: "9.07px", top: "67.93%", left: "65.85%" },
  { width: "9.30px", height: "6.42px", top: "74.36%", left: "87.57%" },
  { width: "7.57px", height: "3.19px", top: "40.01%", left: "34.43%" },
  { width: "7.44px", height: "4.86px", top: "48.58%", left: "87.62%" },
  { width: "10.93px", height: "9.48px", top: "37.47%", left: "35.97%" },
  { width: "4.52px", height: "7.67px", top: "90.05%", left: "93.74%" },
  { width: "3.95px", height: "7.13px", top: "37.37%", left: "59.15%" },
  { width: "8.14px", height: "4.78px", top: "86.80%", left: "80.74%" },
  { width: "4.83px", height: "10.60px", top: "94.67%", left: "97.59%" },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollY } = useScrollPosition();
  const [sectionHeight, setSectionHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [inView, setInView] = useState(true);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Transform values based on scroll
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const imageRotate = useTransform(scrollYProgress, [0, 0.5], [0, 5]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const dotOpacityTransform = useTransform(scrollYProgress, [0, 0.2, 0.4], [0, 0.3, 0]);
  const dotYTransform = useTransform(scrollYProgress, [0, 0.5], [0, 50]);
  const gridOpacityTransform = useTransform(scrollYProgress, [0, 0.3], [0, 0.05]);
  const buttonOpacityTransform = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const buttonYTransform = useTransform(scrollYProgress, [0, 0.4], [0, 70]);
  const paragraphOpacityTransform = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const paragraphYTransform = useTransform(scrollYProgress, [0, 0.3], [0, 50]);
  const arrowOpacityTransform = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const arrowYTransform = useTransform(scrollYProgress, [0, 0.1], [0, 50]);
  const boxShadowTransform = useTransform(
    scrollYProgress,
    [0, 0.5],
    ["20px 20px 0px 0px rgba(0,0,0,1)", "10px 10px 0px 0px rgba(0,0,0,0.5)"]
  );
  const dotWidthTransform = useTransform(scrollYProgress, [0, 0.3], ["100%", "80%"]);
  const dot2WidthTransform = useTransform(scrollYProgress, [0, 0.3], ["75%", "60%"]);
  const dot3WidthTransform = useTransform(scrollYProgress, [0, 0.3], ["83.333%", "70%"]);
  const dot4WidthTransform = useTransform(scrollYProgress, [0, 0.3], ["66.667%", "50%"]);
  const dot5WidthTransform = useTransform(scrollYProgress, [0, 0.3], ["100%", "85%"]);
  const dot6WidthTransform = useTransform(scrollYProgress, [0, 0.3], ["80%", "65%"]);

  useEffect(() => {
    if (sectionRef.current) {
      setSectionHeight(sectionRef.current.offsetHeight);
      setViewportHeight(window.innerHeight);
    }

    const handleResize = () => {
      if (sectionRef.current) {
        setSectionHeight(sectionRef.current.offsetHeight);
        setViewportHeight(window.innerHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (sectionRef.current) {
      const sectionTop = sectionRef.current.offsetTop;
      const sectionBottom = sectionTop + sectionHeight;
      setInView(scrollY < sectionBottom - viewportHeight / 2);
    }
  }, [scrollY, sectionHeight, viewportHeight]);

  return (
    <section ref={sectionRef} className="relative min-h-[90vh] container mx-auto sm:max-w-7xl flex items-center">
      <motion.div className="absolute inset-0 z-0" style={{ y: parallaxY }}>
        <motion.div
          className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-black/3"
          style={{ opacity: dotOpacityTransform }}
        />
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            y: dotYTransform,
          }}
        >
          {dotProperties.map((props, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-black/10"
              style={{
                width: props.width,
                height: props.height,
                top: props.top,
                left: props.left,
                opacity: dotOpacityTransform,
                y: dotYTransform,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      <div className="container mx-auto py-20 px-10 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ opacity: textOpacity, y: textY }}
          >
            <motion.h1
              className="text-3xl md:text-7xl font-bold mb-6 leading-tight tracking-tight"
              style={{ transformOrigin: "left center" }}
            >
              Research{" "}
              <motion.span
                className="relative inline-block"
                style={{
                  transformOrigin: "center",
                  scale: useTransform(scrollYProgress, [0, 0.2], [1, 1.1]),
                }}
              >
                Documentation
              </motion.span>{" "}
              Simplified
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl mb-10 text-black/70 leading-relaxed"
              style={{
                opacity: paragraphOpacityTransform,
                y: paragraphYTransform,
              }}
            >
              Transform your research into structured LaTeX documents with our
              AI-powered platform designed specifically for academics.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row items-start gap-4"
              style={{ opacity: buttonOpacityTransform, y: buttonYTransform }}
            >
              <Button className="rounded-full bg-black text-white hover:bg-black/90 transition-all px-8 py-6 text-base">
                Start Writing <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="rounded-full md:block hidden border-black text-black hover:bg-black hover:text-white transition-all px-8 py-6 text-base"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative h-[500px] hidden md:block"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            style={{
              scale: imageScale,
              rotate: imageRotate,
              transformOrigin: "center center",
            }}
          >
            <motion.div
              className="absolute top-0 right-0 w-4/5 h-4/5 border-2 border-black"
              style={{
                x: useTransform(scrollYProgress, [0, 0.5], [0, 30]),
                y: useTransform(scrollYProgress, [0, 0.5], [0, -20]),
              }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-4/5 h-4/5 bg-black"
              style={{
                x: useTransform(scrollYProgress, [0, 0.5], [0, -30]),
                y: useTransform(scrollYProgress, [0, 0.5], [0, 20]),
              }}
            />
            <motion.div
              className="absolute inset-0 m-auto w-3/4 h-3/4 bg-white border border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]"
              style={{ boxShadow: boxShadowTransform }}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-1/2 h-6 bg-black/10"></div>
                  <div className="w-8 h-8 rounded-full bg-black"></div>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <motion.div
                    className="w-full h-4 bg-black/5"
                    style={{ width: dotWidthTransform }}
                  />
                  <motion.div
                    className="w-3/4 h-4 bg-black/5"
                    style={{ width: dot2WidthTransform }}
                  />
                  <motion.div
                    className="w-5/6 h-4 bg-black/5"
                    style={{ width: dot3WidthTransform }}
                  />
                  <motion.div
                    className="w-2/3 h-4 bg-black/5"
                    style={{ width: dot4WidthTransform }}
                  />
                  <motion.div
                    className="w-full h-4 bg-black/5"
                    style={{ width: dot5WidthTransform }}
                  />
                  <motion.div
                    className="w-4/5 h-4 bg-black/5"
                    style={{ width: dot6WidthTransform }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ opacity: arrowOpacityTransform, y: arrowYTransform }}
      >
        <ArrowDown className="h-6 w-6" />
      </motion.div>

      <motion.div
        className="fixed bottom-0 left-0 h-1 bg-black z-50"
        style={{
          width: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]),
          opacity: inView ? 1 : 0,
        }}
      />
    </section>
  );
}