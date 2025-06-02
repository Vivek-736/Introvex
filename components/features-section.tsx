"use client";
import { FileText, Upload, BookOpen } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI-Powered Generation",
    description:
      "Describe your work and let our AI generate structured LaTeX documents tailored to your research needs and academic standards.",
  },
  {
    icon: Upload,
    title: "Easy Document Upload",
    description:
      "Upload sample documents and references to help the AI understand your specific requirements and formatting preferences.",
  },
  {
    icon: BookOpen,
    title: "Seamless Editing",
    description:
      "Review and modify generated content with an intuitive interface designed specifically for researchers and academics.",
  },
];

// Predefined dot positions to avoid random mismatches
const dotPositions = Array(10)
  .fill(0)
  .map((_, i) => ({
    width: `${2 + (i % 2) * 2}px`,
    height: `${2 + (i % 2) * 2}px`,
    top: `${10 + (i * 80) / 9}%`, // Deterministic distribution
    left: `${10 + (i * 80) / 9}%`,
    opacity: 0.3 + (i % 3) * 0.1,
    animation: `float ${10 + (i % 3) * 5}s infinite ease-in-out`,
  }));

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-20 md:py-32 bg-black text-white relative overflow-hidden"
      aria-labelledby="features-heading"
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />
        <div
          className="w-full h-full absolute top-0 left-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(255,255,255,0.05) 25%, transparent 25%)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        {dotPositions.map((style, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={style}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-20">
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight"
          >
            Powerful Features
          </h2>
          <div className="h-1 w-16 bg-white mx-auto mb-6" />
          <p className="text-base sm:text-lg text-white/70 leading-relaxed">
            Our platform combines cutting-edge AI with intuitive design to
            streamline your documentation process.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 border border-white/20 rounded-lg -m-2 group-hover:m-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="mb-6 overflow-hidden relative">
                <div className="aspect-square bg-white/5 flex items-center justify-center rounded-lg group-hover:bg-white/10 transition-all duration-500 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <feature.icon
                    className="h-12 w-12 sm:h-16 sm:w-16 relative z-10 group-hover:scale-110 transition-transform duration-300"
                    aria-hidden="true"
                  />
                </div>
                <div className="h-1 w-0 bg-white group-hover:w-full transition-all duration-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 tracking-tight group-hover:translate-x-1 transition-transform duration-300">
                {feature.title}
              </h3>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  className="rounded-full border border-white text-white hover:bg-white hover:text-black transition-all duration-300 px-4 py-2 text-sm sm:text-base"
                  aria-label={`Learn more about ${feature.title}`}
                >
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 md:mt-24 text-center">
          <div className="inline-block relative">
            <div className="absolute -left-4 -right-4 h-[1px] bg-white/30 top-1/2" />
            <span className="relative bg-black px-4 text-sm sm:text-base">
              Trusted by researchers worldwide
            </span>
          </div>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {["STANFORD", "MIT", "OXFORD", "BERKELEY"].map((institution) => (
              <div
                key={institution}
                className="flex items-center justify-center h-12 opacity-70 hover:opacity-100 transition-opacity duration-300"
              >
                <div className="font-bold text-lg sm:text-xl tracking-widest">
                  {institution}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}