"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";

// Define testimonial data
const testimonials = [
  {
    id: 1,
    quote:
      "Difras has completely transformed how I document my research. What used to take days now takes hours, and the quality is consistently excellent.",
    name: "Dr. Sarah Chen",
    role: "Neuroscience Researcher",
    institution: "Stanford University",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    quote:
      "The AI-powered assistance is remarkable. It understands complex scientific concepts and helps me articulate my findings with precision and clarity.",
    name: "Prof. Michael Rodriguez",
    role: "Quantum Physics Department",
    institution: "MIT",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    quote:
      "As someone who struggles with academic writing, Difras has been a game-changer. It helps me structure my thoughts and present my research in a professional manner.",
    name: "Dr. Emily Nakamura",
    role: "Climate Science Researcher",
    institution: "Oxford University",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 4,
    quote:
      "The collaborative features allow my entire research team to work seamlessly on documentation. Version control and commenting have eliminated confusion and saved us countless hours.",
    name: "Dr. James Wilson",
    role: "Biomedical Engineering",
    institution: "Berkeley",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 5,
    quote:
      "I was skeptical about AI assistance for academic writing, but Difras understands the nuances of scientific documentation. It's like having a skilled editor available 24/7.",
    name: "Prof. Aisha Patel",
    role: "Molecular Biology Department",
    institution: "Harvard University",
    image: "/placeholder.svg?height=80&width=80",
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [isMounted, setIsMounted] = useState(false); // Track client-side mounting

  // Generate random dot properties only on the client
  const [dotProperties, setDotProperties] = useState<
    {
      width: string;
      height: string;
      top: string;
      left: string;
      background: string;
      filter: string;
      boxShadow: string;
    }[]
  >([]);

  useEffect(() => {
    // Set isMounted to true after component mounts on the client
    setIsMounted(true);

    // Generate dot properties
    setDotProperties(
      Array.from({ length: 30 }).map((_, i) => ({
        width: `${3 + Math.random() * 8}px`,
        height: `${3 + Math.random() * 8}px`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        background: i % 5 === 0 ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.1)",
        filter: i % 7 === 0 ? "blur(1px)" : "none",
        boxShadow: i % 7 === 0 ? "0 0 8px rgba(0,0,0,0.2)" : "none",
      }))
    );
  }, []);

  // Handle autoplay
  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [autoplay]);

  const handlePrevious = () => {
    setAutoplay(false);
    setDirection(-1);
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length
    );
  };

  const handleNext = () => {
    setAutoplay(false);
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  // Pause autoplay on hover
  const handleMouseEnter = () => {
    setAutoplay(false);
  };

  // Resume autoplay on mouse leave
  const handleMouseLeave = () => {
    setAutoplay(true);
  };

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.85,
      filter: "blur(8px)",
      rotateY: direction > 0 ? 45 : -45,
      rotateX: 10,
      z: -200,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      rotateY: 0,
      rotateX: 0,
      z: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      scale: 0.85,
      filter: "blur(8px)",
      rotateY: direction > 0 ? -45 : 45,
      rotateX: -10,
      z: -200,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  const backgroundPatternVariants = {
    animate: {
      backgroundPosition: ["0% 0%", "100% 100%", "0% 100%", "100% 0%", "0% 0%"],
      transition: {
        duration: 60,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop" as const,
      },
    },
  };

  const floatingDotsVariants = {
    animate: (i: number) => ({
      y: [0, -15 - (i % 10), 5, -10, 0],
      x: [
        0,
        i % 2 === 0 ? 10 + (i % 5) : -10 - (i % 5),
        i % 2 === 0 ? -5 : 5,
        i % 2 === 0 ? 8 : -8,
        0,
      ],
      opacity: [0.5, 0.8, 0.7, 0.6, 0.5],
      transition: {
        duration: 5 + (i % 7),
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
      },
    }),
  };

  // Animation for quote text
  const quoteVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
        delay: 0.3,
      },
    },
  };

  // Animation for author info
  const authorVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
        delay: 0.5,
      },
    },
  };

  return (
    <section className="relative overflow-hidden">
      {/* Enhanced Background elements */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white via-black/5 to-white"
        variants={backgroundPatternVariants}
        animate="animate"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(0, 0, 0, 0.05) 0%, transparent 12%),
            radial-gradient(circle at 80% 70%, rgba(0, 0, 0, 0.05) 0%, transparent 12%),
            radial-gradient(circle at 40% 60%, rgba(0, 0, 0, 0.03) 0%, transparent 8%),
            radial-gradient(circle at 60% 20%, rgba(0, 0, 0, 0.03) 0%, transparent 8%)
          `,
          backgroundSize: "120px 120px",
        }}
      />

      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "linear-gradient(45deg, transparent 65%, rgba(0,0,0,0.05) 100%)",
            "linear-gradient(45deg, rgba(0,0,0,0.05) 0%, transparent 35%)",
            "linear-gradient(45deg, transparent 65%, rgba(0,0,0,0.05) 100%)",
          ],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />

      {/* Animated grid pattern */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "40px 40px"],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Animated circles with subtle pulse effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`circle-${i}`}
            className="absolute rounded-full border border-black/10"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              top: `${50 + i * 5}%`,
              left: `${50 + i * 3}%`,
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.15, 0.1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Enhanced Floating dots with glow effect */}
      {isMounted &&
        dotProperties.map((props, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: props.width,
              height: props.height,
              top: props.top,
              left: props.left,
              background: props.background,
              filter: props.filter,
              boxShadow: props.boxShadow,
            }}
            variants={floatingDotsVariants}
            custom={i}
            animate="animate"
          />
        ))}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              What Researchers Say
            </motion.h2>
            <motion.div
              className="h-1 w-24 bg-black mx-auto"
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            />
          </div>

          <div className="relative">
            {/* Large quote icon with 3D rotation animation */}
            <motion.div
              className="absolute -top-10 -left-10 text-black/5"
              style={{ transformStyle: "preserve-3d" }}
              initial={{
                opacity: 0,
                scale: 0,
                rotate: -45,
                rotateX: 45,
                rotateY: -45,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
                rotate: 0,
                rotateX: 0,
                rotateY: 0,
              }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{
                rotateX: 10,
                rotateY: 10,
                scale: 1.05,
                transition: { duration: 0.3 },
              }}
            >
              <Quote size={120} strokeWidth={1} />
            </motion.div>

            {/* Testimonial carousel with hover events */}
            <div
              className="relative h-[400px] md:h-[350px]"
              style={{ perspective: "1000px" }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0"
                >
                  <motion.div
                    className="bg-white p-10 border border-black relative h-full flex flex-col justify-between"
                    style={{
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "hidden",
                    }}
                    whileHover={{
                      rotateX: -2,
                      rotateY: 3,
                      z: 20,
                      transition: { duration: 0.2, ease: "easeOut" },
                    }}
                    onHoverStart={() => {}}
                    onHoverEnd={() => {}}
                  >
                    {/* Decorative elements with 3D hover effect */}
                    <motion.div
                      className="absolute -top-5 -left-5 w-10 h-10 bg-black"
                      style={{ transformStyle: "preserve-3d" }}
                      whileHover={{
                        scale: 1.2,
                        rotate: 45,
                        z: 10,
                        rotateX: 15,
                      }}
                      transition={{ duration: 0.1 }}
                    />
                    <motion.div
                      className="absolute -bottom-5 -right-5 w-10 h-10 border-2 border-black bg-white"
                      style={{ transformStyle: "preserve-3d" }}
                      whileHover={{
                        scale: 1.2,
                        rotate: -45,
                        z: 10,
                        rotateX: -15,
                      }}
                      transition={{ duration: 0.1 }}
                    />

                    {/* Quote with animation */}
                    <motion.div
                      className="mb-8"
                      variants={quoteVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <p className="text-xl md:text-2xl leading-relaxed italic">
                        "{testimonials[currentIndex].quote}"
                      </p>
                    </motion.div>

                    {/* Author info with animation */}
                    <motion.div
                      className="flex items-center"
                      variants={authorVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-black mr-4 relative">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Image
                            src={
                              testimonials[currentIndex].image ||
                              "/placeholder.svg"
                            }
                            alt={testimonials[currentIndex].name}
                            fill
                            className="object-cover"
                          />
                        </motion.div>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">
                          {testimonials[currentIndex].name}
                        </h4>
                        <p className="text-sm text-black/70">
                          {testimonials[currentIndex].role}
                          <br />
                          {testimonials[currentIndex].institution}
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation controls */}
            <div className="flex justify-between mt-8">
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setAutoplay(false);
                      setDirection(index > currentIndex ? 1 : -1);
                      setCurrentIndex(index);
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-black scale-125"
                        : "bg-black/30 hover:bg-black/50"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePrevious}
                  className="w-10 h-10 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={20} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
