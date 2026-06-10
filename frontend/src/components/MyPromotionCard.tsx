import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export type PromotionProps = {
  title?: string;
  subtitle?: string;
  bonus?: string; // e.g. "100% up to $500"
  spins?: string; // e.g. "50 Free Spins"
  ctaLabel?: string;
  href?: string; // link to promotion or sign-up
  imageSrc?: string; // background or hero image
  accentColor?: string; // tailwind color or hex fallback
};

/**
 * PromotionCard
 * A responsive, accessible promotional card for a slot/betting site.
 * Built for Next.js + TypeScript + Tailwind + Framer Motion.
 *
 * Usage example:
 * <PromotionCard
 *   title="SpinFox Welcome Offer"
 *   subtitle="Big bonus + free spins to kickstart your play"
 *   bonus="100% match up to $500"
 *   spins="50 Free Spins"
 *   ctaLabel="Claim Offer"
 *   href="/signup"
 *   imageSrc="/images/promo-slots.jpg"
 * />
 */

const MyPromotionCard: React.FC<PromotionProps> = ({
  title = "Welcome Bonus",
  subtitle = "Get started with an exclusive bonus",
  bonus = "100% up to $500",
  spins = "50 Free Spins",
  ctaLabel = "Claim Offer",
  href = "/signup",
  imageSrc = "/images/slot-hero.jpg",
  accentColor = "#f59e0b", // amber-500 like
}) => {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <section
      aria-labelledby="promo-heading"
      className="relative max-w-4xl mx-auto p-8 sm:p-10 bg-light-bg-secondary dark:bg-gradient-to-br dark:from-[#1a0f3a] dark:via-[#1f1236] dark:to-[#0f0632] rounded-2xl shadow-2xl overflow-hidden border border-light-border dark:border-white/10 transition-colors duration-300"
    >
      {/* Decorative background image with enhanced overlay */}
      <div className="absolute inset-0 -z-10 opacity-25 pointer-events-none">
        {imageSrc && (
          <Image
            src={imageSrc}
            alt="promotion background"
            fill
            style={{ objectFit: "cover", objectPosition: "right center" }}
            sizes="(max-width: 640px) 100vw, 50vw"
            priority={false}
            className="transition-transform duration-700 hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-primary/30 to-black/50" />
      </div>

      {/* Enhanced decorative gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary-hover/15 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10"
      >
        {/* Left: Offer summary */}
        <div className="md:col-span-2 text-light-text dark:text-white">
          <motion.h2 
            id="promo-heading" 
            className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {title}
          </motion.h2>
          <motion.p 
            className="mt-3 text-base sm:text-lg text-light-text-secondary dark:text-white/90 max-w-xl font-medium"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {subtitle}
          </motion.p>

          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <motion.div 
              className="flex items-center gap-3 bg-light-bg-tertiary dark:bg-white/10 backdrop-blur-md rounded-xl px-5 py-4 border border-light-border dark:border-white/20 shadow-lg"
              whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(137, 108, 239, 0.3)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col">
                <span className="text-xs font-medium text-light-text-secondary dark:text-white/70">Bonus</span>
                <span className="font-bold text-xl text-light-text dark:text-white mt-1">{bonus}</span>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center gap-3 bg-light-bg-tertiary dark:bg-white/10 backdrop-blur-md rounded-xl px-5 py-4 border border-light-border dark:border-white/20 shadow-lg"
              whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(137, 108, 239, 0.3)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col">
                <span className="text-xs font-medium text-light-text-secondary dark:text-white/70">Free Spins</span>
                <span className="font-bold text-xl text-light-text dark:text-white mt-1">{spins}</span>
              </div>
            </motion.div>

            <motion.button
              onClick={() => setShowTerms(true)}
              className="ml-2 text-xs font-medium underline text-light-text-secondary dark:text-white/80 hover:text-light-text dark:hover:text-white transition-colors"
              aria-expanded={showTerms}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Terms &amp; conditions
            </motion.button>
          </div>

          <div className="mt-8 flex items-center gap-5">
            <motion.a
              href={href}
              className="inline-flex items-center gap-3 rounded-xl px-7 py-4 bg-gradient-to-r from-[#896CEF] to-[#a874d7] text-white font-bold shadow-xl hover:shadow-[0_0_30px_rgba(137,108,239,0.5)] transition-all"
              aria-label={ctaLabel}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5"
                aria-hidden
              >
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-base">{ctaLabel}</span>
            </motion.a>

            <motion.a
              href="/learn-more"
              className="text-sm font-medium text-light-text-secondary dark:text-white/80 underline hover:text-light-text dark:hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Learn more
            </motion.a>
          </div>
        </div>

        {/* Right: Visual promo box */}
        <motion.div 
          className="md:col-span-1 bg-light-bg-tertiary dark:bg-white/10 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center text-center border border-light-border dark:border-white/20 shadow-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            className="w-32 h-32 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${accentColor}, rgba(137, 108, 239, 0.8))` }}
            whileHover={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 0.5 }}
          >
            {/* Stylized chip / coin */}
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm border-4 border-white/30 shadow-inner">
              {spins}
            </div>
          </motion.div>

          <div className="mt-5 text-light-text dark:text-white">
            <div className="text-xs font-semibold text-light-text-secondary dark:text-white/70">New players</div>
            <div className="mt-2 font-bold text-lg">{bonus}</div>
            <div className="mt-2 text-sm font-medium text-light-text-secondary dark:text-white/70">+ {spins}</div>
          </div>

          <motion.a
            href={href}
            className="mt-6 inline-block w-full text-center rounded-xl px-5 py-3 bg-gradient-to-r from-primary to-primary-hover text-white font-bold hover:shadow-lg transition-all"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(137, 108, 239, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            Get it now
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Terms modal (enhanced) */}
      {showTerms && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-heading"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
        >
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setShowTerms(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10 max-w-2xl w-full bg-light-bg-secondary dark:bg-gradient-to-br dark:from-[#1a0f3a] dark:to-[#0f0632] backdrop-blur-xl rounded-2xl p-8 text-light-text dark:text-white border border-light-border dark:border-white/20 shadow-2xl"
          >
            <h3 id="terms-heading" className="text-2xl font-extrabold drop-shadow-md">
              Terms &amp; Conditions
            </h3>
            <div className="mt-5 text-sm text-light-text-secondary dark:text-white/85 max-h-64 overflow-auto custom-scrollbar">
              <p className="leading-relaxed">
                Offers are available to new players only. Minimum deposit required. Wagering
                requirements apply. Please read the full terms and conditions on the promotions
                page before claiming.
              </p>
              <ul className="mt-4 ml-5 list-disc space-y-2 text-light-text-secondary dark:text-white/75">
                <li>Bonus valid for 30 days from issuance.</li>
                <li>Free spins valid on selected slot titles only.</li>
                <li>General site terms apply.</li>
              </ul>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <motion.button
                onClick={() => setShowTerms(false)}
                className="rounded-xl px-6 py-3 bg-light-bg-tertiary dark:bg-white/10 hover:bg-light-border dark:hover:bg-white/15 transition-all font-semibold border border-light-border dark:border-white/20"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Close
              </motion.button>
              <motion.a
                href="/promotions/terms"
                className="rounded-xl px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-white font-bold hover:shadow-[0_0_20px_rgba(137,108,239,0.4)] transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Read full terms
              </motion.a>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default MyPromotionCard;
