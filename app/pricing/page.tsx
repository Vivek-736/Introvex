"use client";

import type React from "react";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Check, X, CreditCard, Calendar, Lock } from "lucide-react";
import { motion } from "framer-motion";

// Define pricing tiers
const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out Difras for your research needs.",
    features: [
      "5 documents per month",
      "Basic AI assistance",
      "Standard templates",
      "Export to PDF",
      "Email support",
    ],
    limitations: [
      "No collaboration",
      "Limited AI features",
      "No priority support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "Ideal for individual researchers and academics.",
    features: [
      "Unlimited documents",
      "Advanced AI assistance",
      "All templates",
      "Export to PDF, LaTeX & Word",
      "Priority email support",
      "Collaboration with 3 users",
      "Citation management",
    ],
    limitations: ["No API access", "No custom branding"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "per month",
    description: "Best for research teams and departments.",
    features: [
      "Everything in Pro",
      "Unlimited collaborators",
      "Team management",
      "Advanced permissions",
      "API access",
      "Custom templates",
      "Dedicated support",
      "SSO Authentication",
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const handleSelectTier = (tierName: string) => {
    setSelectedTier(tierName);
    if (tierName === "Team") {
      // For Team tier, we'd typically redirect to a contact form
      window.open(
        "mailto:sales@Difras.ai?subject=Team Plan Inquiry",
        "_blank"
      );
    } else {
      setShowPayment(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStatus("processing");

    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus("success");
      // In a real app, you would handle the response from your payment processor here
    }, 2000);
  };

  const handleBackToPlans = () => {
    setShowPayment(false);
    setPaymentStatus("idle");
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

      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-14">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg md:text-xl text-black/70 max-w-2xl mx-auto">
                Choose the plan that best fits your research needs. All plans
                include a 14-day free trial.
              </p>
            </div>

            {!showPayment ? (
              <motion.div
                className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {pricingTiers.map((tier) => (
                  <motion.div
                    key={tier.name}
                    className={`relative rounded-xl overflow-hidden border ${
                      tier.popular ? "border-black" : "border-black/20"
                    } transition-all duration-300 hover:shadow-xl hover:border-black`}
                    variants={itemVariants}
                  >
                    {tier.popular && (
                      <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-4 py-1">
                        MOST POPULAR
                      </div>
                    )}
                    <div className="p-8">
                      <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                      <div className="flex items-end mb-6">
                        <span className="text-4xl font-bold">{tier.price}</span>
                        <span className="text-black/60 ml-2">
                          {tier.period}
                        </span>
                      </div>
                      <p className="text-black/70 mb-6">{tier.description}</p>
                      <Button
                        className={`w-full rounded-full ${
                          tier.popular
                            ? "bg-black text-white hover:bg-black/90"
                            : "bg-white border border-black text-black hover:bg-black hover:text-white"
                        } transition-all duration-300 py-6`}
                        onClick={() => handleSelectTier(tier.name)}
                      >
                        {tier.cta}
                      </Button>
                    </div>
                    <div className="p-8 bg-black/5 border-t border-black/10">
                      <p className="font-medium mb-4">What's included:</p>
                      <ul className="space-y-3">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <Check className="h-5 w-5 text-black mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {tier.limitations.map((limitation) => (
                          <li
                            key={limitation}
                            className="flex items-start text-black/50"
                          >
                            <X className="h-5 w-5 text-black/50 mr-2 flex-shrink-0" />
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {paymentStatus === "success" ? (
                  <div className="text-center p-10 border border-black/20 rounded-xl">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">
                      Payment Successful!
                    </h2>
                    <p className="text-black/70 mb-8">
                      Thank you for subscribing to Difras {selectedTier}.
                      You'll receive a confirmation email shortly.
                    </p>
                    <Button
                      className="rounded-full bg-black text-white hover:bg-black/90 transition-all px-8 py-6"
                      onClick={() => (window.location.href = "/workspace")}
                    >
                      Go to Workspace
                    </Button>
                  </div>
                ) : (
                  <div className="border border-black/20 rounded-xl overflow-hidden">
                    <div className="p-8 border-b border-black/10 bg-black/5">
                      <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Checkout</h2>
                        <button
                          className="text-black/60 hover:text-black transition-colors"
                          onClick={handleBackToPlans}
                        >
                          Back to plans
                        </button>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between items-center py-2">
                          <span>Difras {selectedTier}</span>
                          <span className="font-bold">
                            {
                              pricingTiers.find(
                                (tier) => tier.name === selectedTier
                              )?.price
                            }
                            /month
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-black/10">
                          <span className="font-bold">Total</span>
                          <span className="font-bold">
                            {
                              pricingTiers.find(
                                (tier) => tier.name === selectedTier
                              )?.price
                            }
                            /month
                          </span>
                        </div>
                      </div>
                    </div>
                    <form onSubmit={handleSubmit} className="p-8">
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="col-span-2">
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium mb-2"
                            >
                              Full Name
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              required
                              className="w-full px-4 py-3 border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/50"
                              placeholder="John Doe"
                              value={formData.name}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="col-span-2">
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium mb-2"
                            >
                              Email Address
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              required
                              className="w-full px-4 py-3 border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/50"
                              placeholder="john@example.com"
                              value={formData.email}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2">
                              Card Information
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                id="cardNumber"
                                name="cardNumber"
                                required
                                className="w-full px-4 py-3 border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/50 pl-12"
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                value={formData.cardNumber}
                                onChange={(e) => {
                                  // Format card number with spaces
                                  const value = e.target.value.replace(
                                    /\s/g,
                                    ""
                                  );
                                  const formattedValue = value
                                    .replace(/(\d{4})/g, "$1 ")
                                    .trim();
                                  setFormData({
                                    ...formData,
                                    cardNumber: formattedValue,
                                  });
                                }}
                              />
                              <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black/60" />
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor="expiry"
                              className="block text-sm font-medium mb-2"
                            >
                              Expiry Date
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                id="expiry"
                                name="expiry"
                                required
                                className="w-full px-4 py-3 border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/50 pl-12"
                                placeholder="MM/YY"
                                maxLength={5}
                                value={formData.expiry}
                                onChange={(e) => {
                                  // Format expiry date with slash
                                  const value = e.target.value.replace(
                                    /\//g,
                                    ""
                                  );
                                  if (value.length <= 2) {
                                    setFormData({
                                      ...formData,
                                      expiry: value,
                                    });
                                  } else {
                                    const formattedValue = `${value.slice(
                                      0,
                                      2
                                    )}/${value.slice(2, 4)}`;
                                    setFormData({
                                      ...formData,
                                      expiry: formattedValue,
                                    });
                                  }
                                }}
                              />
                              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black/60" />
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor="cvc"
                              className="block text-sm font-medium mb-2"
                            >
                              CVC
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                id="cvc"
                                name="cvc"
                                required
                                className="w-full px-4 py-3 border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/50 pl-12"
                                placeholder="123"
                                maxLength={3}
                                value={formData.cvc}
                                onChange={(e) => {
                                  // Only allow numbers
                                  const value = e.target.value.replace(
                                    /\D/g,
                                    ""
                                  );
                                  setFormData({
                                    ...formData,
                                    cvc: value,
                                  });
                                }}
                              />
                              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black/60" />
                            </div>
                          </div>
                        </div>
                        <div className="pt-4">
                          <Button
                            type="submit"
                            className="w-full rounded-full bg-black text-white hover:bg-black/90 transition-all py-6"
                            disabled={paymentStatus === "processing"}
                          >
                            {paymentStatus === "processing" ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                Processing...
                              </div>
                            ) : (
                              `Subscribe to ${selectedTier}`
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-center text-black/60 mt-4">
                          By subscribing, you agree to our Terms of Service and
                          Privacy Policy. Your card will be charged{" "}
                          {
                            pricingTiers.find(
                              (tier) => tier.name === selectedTier
                            )?.price
                          }{" "}
                          monthly after your 14-day free trial.
                        </p>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-black/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
                Frequently Asked Questions
              </h2>
              <div className="space-y-8">
                {[
                  {
                    question: "Can I cancel my subscription at any time?",
                    answer:
                      "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.",
                  },
                  {
                    question: "Is there a free trial?",
                    answer:
                      "Yes, all paid plans come with a 14-day free trial. You won't be charged until the trial period ends.",
                  },
                  {
                    question: "Can I change plans later?",
                    answer:
                      "You can upgrade or downgrade your plan at any time. Changes will be applied to your next billing cycle.",
                  },
                  {
                    question: "What payment methods do you accept?",
                    answer:
                      "We accept all major credit cards including Visa, Mastercard, American Express, and Discover.",
                  },
                  {
                    question: "Do you offer educational discounts?",
                    answer:
                      "Yes, we offer special pricing for educational institutions. Please contact our sales team for more information.",
                  },
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    className="bg-white p-8 rounded-lg border border-black/10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-bold mb-4">{faq.question}</h3>
                    <p className="text-black/70">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to transform your research documentation?
              </h2>
              <p className="text-lg text-black/70 mb-8 max-w-2xl mx-auto">
                Join thousands of researchers who are saving time and producing
                better documentation with Difras.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  className="rounded-full bg-black text-white hover:bg-black/90 transition-all px-8 py-6"
                  onClick={() => setSelectedTier("Pro")}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-black text-black hover:bg-black hover:text-white transition-all px-8 py-6"
                  onClick={() => (window.location.href = "#")}
                >
                  Schedule a Demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
