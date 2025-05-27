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
import { Eye, EyeOff, ArrowRight, Github, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
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
      rememberMe: checked,
    });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

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
      // Redirect to workspace on successful login
      router.push("/workspace");
    }, 1500);
  };

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
                Welcome back
              </h1>
              <p className="text-black/70">
                Sign in to your account to continue your research
              </p>
            </motion.div>

            <motion.div
              className="bg-white border border-black/10 rounded-xl p-8 shadow-sm"
              variants={itemVariants}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
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
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium"
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-black/70 hover:text-black transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
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
                </div>

                <div className="flex items-center">
                  <div className="flex items-center">
                    <Checkbox
                      id="remember-me"
                      checked={formData.rememberMe}
                      onCheckedChange={handleCheckboxChange}
                      className="h-4 w-4 border-black/20 rounded focus:ring-black"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-black/70"
                    >
                      Remember me
                    </label>
                  </div>
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
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Sign in
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
                      Or continue with
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
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-black hover:underline"
              >
                Sign up
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
