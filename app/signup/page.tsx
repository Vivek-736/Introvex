"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Github, Mail, Check, X } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    agreeTerms: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      agreeTerms: checked,
    });
    if (errors.agreeTerms) {
      setErrors({
        ...errors,
        agreeTerms: "",
      });
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to workspace on successful signup
      router.push("/workspace");
    }, 1500);
  };

  // Password strength indicators
  const passwordCriteria = [
    {
      label: "At least 8 characters",
      met: formData.password.length >= 8,
    },
    {
      label: "Contains a number",
      met: /\d/.test(formData.password),
    },
    {
      label: "Contains a special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    },
    {
      label: "Contains uppercase & lowercase",
      met: /[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password),
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="home" />

      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <motion.div
            className="max-w-md mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="text-center mb-10" variants={itemVariants}>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Create your account
              </h1>
              <p className="text-black/70">
                Join thousands of researchers using Difras
              </p>
            </motion.div>

            <motion.div
              className="bg-white border border-black/10 rounded-xl p-8 shadow-sm"
              variants={itemVariants}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-6 border ${
                      errors.name ? "border-red-500" : "border-black/20"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-black/50`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-6 border ${
                      errors.email ? "border-red-500" : "border-black/20"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-black/50`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-6 border ${
                        errors.password ? "border-red-500" : "border-black/20"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-black/50`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/50 hover:text-black"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.password}
                    </p>
                  )}

                  {/* Password strength indicators */}
                  <div className="mt-4 space-y-2">
                    {passwordCriteria.map((criteria, index) => (
                      <div key={index} className="flex items-center text-sm">
                        {criteria.met ? (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-black/30 mr-2" />
                        )}
                        <span
                          className={
                            criteria.met ? "text-black/70" : "text-black/50"
                          }
                        >
                          {criteria.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5 mt-1">
                      <Checkbox
                        id="agree-terms"
                        checked={formData.agreeTerms}
                        onCheckedChange={handleCheckboxChange}
                        className="h-4 w-4 border-black/20 rounded focus:ring-black"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="agree-terms" className="text-black/70">
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="text-black font-medium hover:underline"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-black font-medium hover:underline"
                        >
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  </div>
                  {errors.agreeTerms && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.agreeTerms}
                    </p>
                  )}
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-full bg-black text-white hover:bg-black/90 transition-all py-6"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Create account
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-black/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-black/50">
                      Or sign up with
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="w-full rounded-lg border border-black/20 bg-white text-black hover:bg-black/5 transition-all py-6"
                  >
                    <Github className="mr-2 h-5 w-5" />
                    GitHub
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-lg border border-black/20 bg-white text-black hover:bg-black/5 transition-all py-6"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Google
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.p
              className="mt-8 text-center text-sm text-black/70"
              variants={itemVariants}
            >
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-black hover:underline"
              >
                Sign in
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
