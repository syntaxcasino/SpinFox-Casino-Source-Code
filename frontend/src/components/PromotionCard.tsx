import React from 'react';
import { motion } from 'framer-motion';
import { buttonHover } from '@/utils/animations';
import Image from 'next/image';
import Link from 'next/link';

interface PromotionCardProps {
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  imageSrc: string;
  overlayImageSrc: string;
  href: string;
  isDesktop?: boolean;
}

export default function PromotionCard({
  badge,
  title,
  subtitle,
  buttonText,
  imageSrc,
  overlayImageSrc,
  href,
  isDesktop = false
}: PromotionCardProps) {
  if (isDesktop) {
    // Desktop layout: side-by-side
    return (
      <motion.div
        className="relative bg-gradient-to-br from-[#1a0f3a] via-[#1f1236] to-[#0f0632] rounded-2xl min-h-[420px] flex flex-row h-full shadow-2xl overflow-hidden border border-white/10"
        variants={buttonHover}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
      >
        {/* Enhanced decorative gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-primary-hover/15 via-transparent to-transparent pointer-events-none" />
        
        {/* Main Content - Left side */}
        <div className="flex-1 p-10 flex flex-col justify-between relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Welcome Badge */}
            <motion.div 
              className="bg-gradient-to-r from-[#896CEF] to-[#a874d7] rounded-full h-[26px] inline-flex items-center justify-center px-6 mb-6 shadow-lg backdrop-blur-sm border border-white/20"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(137, 108, 239, 0.3)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-white text-[11px] font-semibold tracking-wide uppercase">
                {badge}
              </span>
            </motion.div>
            
            {/* Title */}
            <motion.h2 
              className="text-white text-[42px] font-extrabold mb-5 leading-tight drop-shadow-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {title}
            </motion.h2>
            
            {/* Subtitle */}
            <motion.p 
              className="text-white/90 text-[18px] font-medium mb-6 leading-relaxed max-w-md"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {subtitle}
            </motion.p>
          </motion.div>
          
          {/* Play Button */}
          <motion.div 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link
              href={href}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#896CEF] to-[#a874d7] rounded-xl px-8 py-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(137,108,239,0.6)] shadow-xl"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-white"
              >
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-white text-[16px] font-bold tracking-wide">
                {buttonText}
              </span>
            </Link>
          </motion.div>
        </div>
        
        {/* Image Section - Right side */}
        <div className="w-1/2 relative overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover rounded-r-2xl object-right-top transition-transform duration-700 hover:scale-105"
            priority
          />
          {/* Enhanced gradient overlay on image */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#0f0632]/20 to-[#0f0632]/40" />
          
          {/* Overlay Image - Bottom left */}
          <motion.div 
            className="absolute bottom-8 left-8 w-[50%] h-auto drop-shadow-2xl"
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Image
              src={overlayImageSrc}
              alt="Promotion Overlay"
              width={100}
              height={100}
              className="w-full h-auto object-contain filter drop-shadow-[0_10px_50px_rgba(137,108,239,0.4)]"
              priority
            />
          </motion.div>
        </div>
      </motion.div>
    );
  }
  
  // Mobile/Tablet layout: image on top, content below
  return (
    <motion.div
      className="relative bg-gradient-to-br from-[#1a0f3a] via-[#1f1236] to-[#0f0632] rounded-2xl min-h-[420px] flex flex-col h-full shadow-2xl overflow-hidden border border-white/10"
      variants={buttonHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      {/* Image Section - Top */}
      <div className="h-[240px] w-full relative overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover rounded-t-2xl object-top transition-transform duration-700 hover:scale-105"
          priority
        />
        {/* Enhanced gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f0632]/30 to-[#0f0632]/60" />
        
        {/* Overlay Image - Bottom left */}
        <motion.div 
          className="absolute bottom-5 left-5 h-[70%] w-auto drop-shadow-2xl"
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 300 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Image
            src={overlayImageSrc}
            alt="Promotion Overlay"
            width={100}
            height={100}
            className="h-full w-auto object-contain filter drop-shadow-[0_10px_50px_rgba(137,108,239,0.4)]"
            priority
          />
        </motion.div>
      </div>
      
      {/* Enhanced decorative gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary-hover/15 via-transparent to-transparent pointer-events-none" />
      
      {/* Main Content - Bottom */}
      <div className="flex-1 p-8 flex flex-col justify-between relative z-10">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Welcome Badge - Centered */}
          <motion.div 
            className="bg-gradient-to-r from-[#896CEF] to-[#a874d7] rounded-full h-[26px] inline-flex items-center justify-center px-6 mb-5 mx-auto shadow-lg backdrop-blur-sm border border-white/20"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(137, 108, 239, 0.3)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-white text-[11px] font-semibold tracking-wide uppercase">
              {badge}
            </span>
          </motion.div>
          
          {/* Title - Centered */}
          <h2 className="text-white text-[26px] font-extrabold mb-4 text-center leading-tight drop-shadow-xl">
            {title}
          </h2>
          
          {/* Subtitle - Centered */}
          <p className="text-white/90 text-[16px] font-medium mb-6 text-center leading-relaxed">
            {subtitle}
          </p>
        </motion.div>
        
        {/* Play Button - Centered */}
        <div className="flex justify-center">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={href}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#896CEF] to-[#a874d7] rounded-xl px-8 py-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(137,108,239,0.6)] shadow-xl"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-white"
              >
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-white text-[16px] font-bold tracking-wide">
                {buttonText}
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}