"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export function Hero() {
  return (
    <section className="relative overflow-hidden py-32 px-6">
      {/* Gradient background effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[80px]" />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl font-bold text-text-primary mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Edit Videos in Your Browser
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        >
          A powerful, privacy-first video editor that runs entirely in your
          browser. Timeline editing, filters, text overlays, and MP4 export
          &mdash; no uploads, no accounts, no limits.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
        >
          <Link
            href="/editor"
            className="inline-block bg-accent hover:bg-accent-hover text-white rounded-lg px-8 py-4 text-lg font-medium transition-colors"
          >
            Start Editing
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
