"use client";

import { 
  Brain, 
  FileText, 
  Zap, 
  Shield, 
  Users, 
  BarChart3,
  BookOpen,
  Lightbulb,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Features() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms analyze your research data and generate insights automatically.',
      color: 'text-purple-400'
    },
    {
      icon: FileText,
      title: 'LaTeX Generation',
      description: 'Automatically convert your research into properly formatted LaTeX documents ready for publication.',
      color: 'text-violet-400'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process large datasets and generate comprehensive reports in minutes, not hours.',
      color: 'text-purple-400'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your research data is encrypted and stored securely with enterprise-grade security measures.',
      color: 'text-violet-400'
    },
    {
      icon: Users,
      title: 'Research Tools',
      description: 'Work seamlessly with your research tools and make most of your time.',
      color: 'text-purple-400'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Visualize your data with interactive charts and statistical analysis tools built for researchers.',
      color: 'text-violet-400'
    }
  ];

  const benefits = [
    'Reduce research time by up to 70%',
    'Eliminate formatting errors',
    'Ensure citation accuracy',
    'Streamline peer review process',
    'Integrate with major academic databases',
    'Export to multiple formats (PDF, Word, HTML)'
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-violet-900/10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-900/50 to-violet-900/50 border border-purple-500/30 text-purple-300 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
            <Lightbulb className="w-4 h-4 mr-2" />
            Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything you need for
            <span className="block bg-gradient-to-r mt-3 from-purple-400 to-violet-400 bg-clip-text text-transparent">research excellence</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Our comprehensive suite of tools is designed to accelerate your research workflow 
            and help you focus on what matters most – your discoveries.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm hover:border-purple-500/30"
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center mb-4`}>
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
          ))}
        </div>
      </div>
    </section>
  );
}