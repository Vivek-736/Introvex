"use client";

import {
  Brain,
  FileText,
  Zap,
  Shield,
  Users,
  BarChart3,
  Lightbulb,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function Features() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description:
        "Advanced algorithms to analyze your research data and generate insights.",
      color: "text-purple-400",
    },
    {
      icon: FileText,
      title: "LaTeX Generation",
      description:
        "Convert your research into formatted LaTeX documents ready for publication.",
      color: "text-violet-400",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Process large datasets and generate comprehensive reports in minutes.",
      color: "text-purple-400",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your research data is encrypted and stored securely.",
      color: "text-violet-400",
    },
    {
      icon: Users,
      title: "Research Tools",
      description:
        "Work seamlessly with your research tools and make most of your time.",
      color: "text-purple-400",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Visualize your data with interactive charts and statistical analysis tools.",
      color: "text-violet-400",
    },
  ];

  const benefits = [
    "Reduce research time by up to 70%",
    "Eliminate formatting errors",
    "Ensure citation accuracy",
    "Streamline peer review process",
    "Voice agent support for analysis",
  ];

  return (
    <section
      id="features"
      className="py-20 relative overflow-hidden bg-[url('/pattern.png')] bg-cover bg-center"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-violet-900/10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-900/50 to-violet-900/50 border border-purple-500/30 text-purple-300 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
            <Lightbulb className="w-4 h-4 mr-2" />
            Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything you need for
            <span className="block bg-gradient-to-r mt-3 from-purple-400 to-violet-400 bg-clip-text text-transparent">
              research excellence
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Our comprehensive suite of tools is designed to accelerate your
            research workflow and help you focus on what matters most – your
            discoveries.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm hover:border-purple-500/30">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center mb-4`}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section with Globe */}
        <motion.div
          className="mb-16 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Why Choose Our Platform?
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-8 max-w-5xl mx-auto">
            {/* 3D Globe */}
            <div className="w-full md:w-1/3 rounded-3xl sm:h-[326px] h-fit flex justify-center items-center">
              <Globe
                height={326}
                width={326}
                backgroundColor="rgba(0, 0, 0, 0)"
                showAtmosphere
                showGraticules
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                labelsData={[
                  {
                    lat: 20.5937,
                    lng: 78.9629,
                    text: "India",
                    color: "white",
                    size: 15,
                  },
                ]}
              />
            </div>
            {/* Benefits Cards */}
            <div className="w-full md:w-2/3 grid grid-cols-1 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-purple-900/20 to-violet-900/20 border border-purple-500/30 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4 flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-purple-400 flex-shrink-0" />
                      <p className="text-slate-200 font-medium text-sm md:text-base">
                        {benefit}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}