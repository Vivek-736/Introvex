"use client"

import { type ReactNode, useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  index?: number
  id?: string
  transitionType?: "fade" | "slide" | "scale" | "rotate" | "stagger"
  delay?: number
  duration?: number
  threshold?: number
  once?: boolean
}

export function AnimatedSection({
  children,
  className = "",
  index = 0,
  id,
  transitionType = "fade",
  delay = 0,
  duration = 0.8,
  threshold = 0.2,
  once = true,
}: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once, amount: threshold })

  // Get scroll progress within the section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // Different animation variants based on transition type
  const getAnimationProps = () => {
    switch (transitionType) {
      case "slide":
        return {
          initial: { y: 100, opacity: 0 },
          animate: isInView ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 },
          transition: { duration, delay: delay + index * 0.1, ease: [0.22, 1, 0.36, 1] },
        }
      case "scale":
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 },
          transition: { duration, delay: delay + index * 0.1, ease: [0.22, 1, 0.36, 1] },
        }
      case "rotate":
        return {
          initial: { rotate: -5, opacity: 0, scale: 0.95 },
          animate: isInView ? { rotate: 0, opacity: 1, scale: 1 } : { rotate: -5, opacity: 0, scale: 0.95 },
          transition: { duration, delay: delay + index * 0.1, ease: [0.22, 1, 0.36, 1] },
        }
      case "stagger":
        return {
          initial: { opacity: 0 },
          animate: isInView ? { opacity: 1 } : { opacity: 0 },
          transition: { duration, delay: delay + index * 0.2, ease: [0.22, 1, 0.36, 1] },
        }
      case "fade":
      default:
        return {
          initial: { opacity: 0 },
          animate: isInView ? { opacity: 1 } : { opacity: 0 },
          transition: { duration, delay: delay + index * 0.1, ease: [0.22, 1, 0.36, 1] },
        }
    }
  }

  // Parallax effect based on scroll
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0, 1, 1, 0.8])
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0.95, 1, 1, 0.98])

  return (
    <motion.section
      ref={sectionRef}
      id={id}
      className={`relative overflow-hidden ${className}`}
      style={{ opacity, scale }}
      {...getAnimationProps()}
    >
      {/* Section connector line */}
      <motion.div
        className="absolute left-1/2 -top-20 w-px h-20 bg-black/10"
        style={{
          scaleY: useTransform(scrollYProgress, [0, 0.1], [0, 1]),
          opacity: useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 0.5, 0.5, 0]),
        }}
      />

      {/* Content wrapper with parallax effect */}
      <motion.div style={{ y }} className="relative z-10">
        {children}
      </motion.div>

      {/* Section transition indicator */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent"
        style={{
          scaleX: useTransform(scrollYProgress, [0.8, 1], [0.5, 1]),
          opacity: useTransform(scrollYProgress, [0.8, 0.9, 1], [0, 0.5, 0]),
        }}
      />
    </motion.section>
  )
}
