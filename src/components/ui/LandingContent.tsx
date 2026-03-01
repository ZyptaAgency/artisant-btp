"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LandingLogo } from "./LandingLogo";
import { ArrowRight, Sparkles } from "lucide-react";

export function LandingContent() {
  return (
    <div className="relative z-10 flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div className="absolute inset-0 blur-[80px] opacity-40 bg-gradient-to-r from-[#c84bff] via-[#ff2d8f] to-[#ff6b35] rounded-full scale-150" />
        <LandingLogo />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-6 text-lg md:text-xl text-[rgba(240,238,255,0.6)] tracking-wide"
      >
        Le cockpit des artisans
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-10 flex flex-col sm:flex-row gap-4"
      >
        <Link
          href="/login"
          className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c84bff] to-[#ff2d8f] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(200,75,255,0.35)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(200,75,255,0.5)] hover:scale-105"
        >
          <Sparkles className="h-4 w-4" />
          Se connecter
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] px-8 py-3.5 text-sm font-semibold text-[rgba(240,238,255,0.85)] backdrop-blur-sm transition-all duration-300 hover:border-[rgba(200,75,255,0.4)] hover:bg-[rgba(200,75,255,0.08)] hover:text-white hover:scale-105"
        >
          S&apos;inscrire
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="mt-16 flex items-center gap-6 text-xs text-[rgba(240,238,255,0.3)]"
      >
        <span>Devis</span>
        <span className="h-1 w-1 rounded-full bg-[rgba(200,75,255,0.4)]" />
        <span>Factures</span>
        <span className="h-1 w-1 rounded-full bg-[rgba(200,75,255,0.4)]" />
        <span>Pipeline</span>
        <span className="h-1 w-1 rounded-full bg-[rgba(200,75,255,0.4)]" />
        <span>Clients</span>
      </motion.div>
    </div>
  );
}
