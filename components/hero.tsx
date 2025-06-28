"use client";

import { ArrowRight, Bot, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="min-h-screen bg-[url('/pattern.png')] bg-cover bg-center flex items-center justify-center  pt-16 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-500/20 to-slate-500/20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-slate-800/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-left">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block font-['Instrument_Serif'] font-medium">
                Effortless
              </span>
              <span className="block bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent font-['Instrument_Serif'] font-medium italic my-2">
                Research
              </span>
              <span className="block font-medium font-['Instrument_Serif']">
                with Introvex
              </span>
            </h1>

            {/* Subtitle */}
            <div className="mb-8">
              <p className="text-xl md:text-2xl text-purple-300 mb-4 font-semibold">
                Data to Draft
              </p>
              <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                Transform your research into structured LaTeX documents with our
                AI-powered platform designed specifically for academics.
                Streamline your workflow from data collection to
                publication-ready manuscripts.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href={"/workspace"}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-4 text-lg font-semibold group shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  Start Your Research
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - AI Illustration */}
          <div className="relative">
            <div className="relative mx-auto max-w-lg">
              {/* Main AI Bot Container */}
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700/50 shadow-2xl backdrop-blur-sm">
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-violet-500 rounded-full animate-bounce delay-300"></div>

                {/* AI Bot Icon */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl mb-4 shadow-lg">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    AI Research Assistant
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Analyzing your research data...
                  </p>
                </div>

                {/* Chat Bubbles */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 max-w-xs">
                      <p className="text-slate-300 text-sm">
                        I've analyzed your dataset and identified 3 key
                        patterns. Would you like me to generate the methodology
                        section?
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 justify-end">
                    <div className="bg-gradient-to-r from-purple-600/20 to-violet-600/20 border border-purple-500/30 rounded-lg p-3 max-w-xs">
                      <p className="text-slate-300 text-sm">
                        Yes, please include statistical significance tests.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 max-w-xs">
                      <p className="text-slate-300 text-sm">
                        Perfect! I'm generating your LaTeX document with proper
                        citations and formatting...
                      </p>
                      <div className="flex items-center mt-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-100"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm font-medium">
                      Document Generation
                    </span>
                    <span className="text-purple-400 text-sm">78%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-600 to-violet-600 h-2 rounded-full w-3/4 transition-all duration-1000"></div>
                  </div>
                </div>
              </div>

              {/* Floating Code Snippets */}
              <div className="absolute -top-8 -left-8 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 shadow-lg animate-float">
                <code className="text-purple-400 text-xs font-mono">
                  {`\\documentclass{article}`}
                </code>
              </div>

              <div className="absolute -bottom-8 -right-8 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 shadow-lg animate-float delay-1000">
                <code className="text-violet-400 text-xs font-mono">
                  {`\\cite{research2024}`}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
