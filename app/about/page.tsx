"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Users,
  Lightbulb,
  Code,
  BookOpen,
  Award,
  Mail,
} from "lucide-react";
import Image from "next/image";

// Team members data
const teamMembers = [
  {
    name: "Dr. Alexandra Chen",
    role: "Founder & CEO",
    bio: "Former AI researcher at Stanford with a passion for making academic writing accessible to all researchers.",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Michael Rodriguez",
    role: "CTO",
    bio: "Ex-Google engineer with expertise in natural language processing and machine learning systems.",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Dr. Sarah Johnson",
    role: "Chief Research Officer",
    bio: "Published researcher with 15+ years experience in computational linguistics and document analysis.",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "David Kim",
    role: "Head of Product",
    bio: "Former product lead at Notion with a background in UX design and academic publishing tools.",
    image: "/placeholder.svg?height=300&width=300",
  },
];

// Company values
const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We constantly push the boundaries of what's possible with AI and document generation.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description:
      "We believe in the power of collaborative research and build tools that bring teams together.",
  },
  {
    icon: BookOpen,
    title: "Accessibility",
    description:
      "We're committed to making advanced research tools accessible to academics worldwide.",
  },
  {
    icon: Code,
    title: "Technical Excellence",
    description:
      "We maintain the highest standards in our code, models, and technical implementations.",
  },
  {
    icon: Award,
    title: "Academic Integrity",
    description:
      "We uphold the principles of academic integrity in everything we build and support.",
  },
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="home" />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1
                className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Transforming Academic Documentation
              </motion.h1>
              <motion.div
                className="h-1 w-24 bg-black mx-auto mb-8"
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
              <motion.p
                className="text-lg md:text-xl text-black/70 mb-12 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                We're on a mission to revolutionize how researchers document
                their work, making the process faster, more efficient, and more
                accessible through the power of artificial intelligence.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 bg-black/5">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
                  Our Story
                </h2>
                <div className="h-1 w-16 bg-black mb-8" />
                <div className="space-y-6 text-black/70">
                  <p>
                    Difras began in 2021 when our founder, Dr. Alexandra Chen,
                    experienced firsthand the challenges of academic
                    documentation while completing her PhD in Computational
                    Neuroscience at Stanford University.
                  </p>
                  <p>
                    After spending countless hours formatting papers and
                    struggling with LaTeX, she envisioned a tool that could
                    automate the technical aspects of documentation while
                    preserving the researcher's unique voice and insights.
                  </p>
                  <p>
                    Partnering with Michael Rodriguez, a natural language
                    processing expert, they built the first prototype of
                    Difras. What started as a simple tool quickly gained
                    traction among fellow researchers, evolving into the
                    comprehensive platform we offer today.
                  </p>
                  <p>
                    Now, with a team of engineers, researchers, and designers,
                    Difras serves thousands of academics across the globe,
                    helping them focus on what matters most: their research.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="aspect-square relative">
                  <div className="absolute top-0 right-0 w-4/5 h-4/5 border-2 border-black"></div>
                  <div className="absolute bottom-0 left-0 w-4/5 h-4/5 bg-black"></div>
                  <div className="absolute inset-0 m-auto w-3/4 h-3/4 bg-white border border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
                    <div className="p-6 h-full flex flex-col justify-center items-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold mb-4">Est. 2021</p>
                        <p className="text-black/70">Stanford, California</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-6 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                Our Values
              </motion.h2>
              <motion.div
                className="h-1 w-16 bg-black mx-auto mb-8"
                initial={{ width: 0 }}
                whileInView={{ width: 64 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              />
              <motion.p
                className="text-lg text-black/70"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                These core principles guide everything we do, from product
                development to customer support.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  className="p-8 border border-black/10 hover:border-black transition-all duration-300"
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mb-6">
                    <value.icon className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                  <p className="text-black/70">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-black text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-6 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                Meet Our Team
              </motion.h2>
              <motion.div
                className="h-1 w-16 bg-white mx-auto mb-8"
                initial={{ width: 0 }}
                whileInView={{ width: 64 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              />
              <motion.p
                className="text-lg text-white/70"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                A diverse group of researchers, engineers, and designers
                passionate about transforming academic documentation.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  className="group"
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                >
                  <div className="relative overflow-hidden mb-6 aspect-square">
                    <motion.div
                      className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                      whileHover={{ opacity: 1 }}
                    >
                      <div className="flex gap-4">
                        <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
                          <Mail className="h-5 w-5" />
                        </button>
                      </div>
                    </motion.div>
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-white/70 mb-3">{member.role}</p>
                  <p className="text-white/50 text-sm">{member.bio}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="text-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-white/70 mb-8">
                We're always looking for talented individuals to join our team.
                Check out our open positions.
              </p>
              <Button className="rounded-full bg-white text-black hover:bg-white/90 transition-all px-8 py-6">
                View Careers <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                className="order-2 md:order-1"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
                  Our Technology
                </h2>
                <div className="h-1 w-16 bg-black mb-8" />
                <div className="space-y-6 text-black/70">
                  <p>
                    At the heart of Difras is our proprietary natural language
                    processing engine, designed specifically for academic and
                    technical writing.
                  </p>
                  <p>
                    Unlike general-purpose AI writing tools, our models are
                    trained on millions of academic papers across diverse
                    fields, enabling them to understand the nuances of
                    scientific communication and field-specific terminology.
                  </p>
                  <p>
                    We combine this deep language understanding with structured
                    document generation capabilities, allowing researchers to
                    transform rough notes and data into properly formatted
                    papers, reports, and presentations.
                  </p>
                  <p>
                    Our technology continuously improves through feedback from
                    our academic users, ensuring that Difras remains at the
                    cutting edge of AI-assisted documentation.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="order-1 md:order-2 grid grid-cols-2 gap-4"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                {[
                  "Natural Language Processing",
                  "Machine Learning",
                  "Document Analysis",
                  "LaTeX Generation",
                  "Citation Management",
                  "Collaborative Editing",
                  "Version Control",
                  "Data Visualization",
                ].map((tech, index) => (
                  <motion.div
                    key={tech}
                    className="p-4 border border-black/20 hover:border-black transition-all duration-300 flex items-center justify-center text-center"
                    whileHover={{ y: -5, backgroundColor: "rgba(0,0,0,0.05)" }}
                    custom={index}
                    variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    <p className="font-medium">{tech}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="py-20 bg-black/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-6 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                Get in Touch
              </motion.h2>
              <motion.div
                className="h-1 w-16 bg-black mx-auto mb-8"
                initial={{ width: 0 }}
                whileInView={{ width: 64 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              />
              <motion.p
                className="text-lg text-black/70 mb-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Have questions about Difras  or want to explore how we can help
                your research team? We'd love to hear from you.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <Button className="rounded-full bg-black text-white hover:bg-black/90 transition-all px-8 py-6">
                  Contact Us
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-black text-black hover:bg-black hover:text-white transition-all px-8 py-6"
                >
                  Schedule a Demo
                </Button>
              </motion.div>

              <motion.div
                className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="p-6 border border-black/20 hover:border-black transition-all duration-300">
                  <h3 className="font-bold mb-2">Email</h3>
                  <p className="text-black/70">info@Difras.ai</p>
                </div>
                <div className="p-6 border border-black/20 hover:border-black transition-all duration-300">
                  <h3 className="font-bold mb-2">Phone</h3>
                  <p className="text-black/70">+1 (650) 123-4567</p>
                </div>
                <div className="p-6 border border-black/20 hover:border-black transition-all duration-300">
                  <h3 className="font-bold mb-2">Office</h3>
                  <p className="text-black/70">
                    123 University Ave, Palo Alto, CA 94301
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
