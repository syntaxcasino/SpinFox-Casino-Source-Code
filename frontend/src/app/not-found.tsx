'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/contexts/TranslationContext';
import { fadeInUp, bounce, buttonHover } from '@/utils/animations';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  const { t: tCommon } = useTranslation("common");
  return (
    <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
      <motion.div
        className="w-full max-w-5xl px-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.2
            }
          }
        }}
      >
        {/* Desktop Layout: Two columns */}
        <div className="hidden lg:grid lg:grid-cols-2">
          {/* First Column: 404 Image */}
          <motion.div
            className="flex justify-center lg:justify-end"
            variants={bounce}
          >
            <Image
              src="/404.jpg"
              alt="404 Error"
              width={488}
              height={345}
              className="max-w-[488px] max-h-[345px] w-auto h-auto rounded-[10px]"
              priority
            />
          </motion.div>

          {/* Second Column: Two rows */}
          <div className="flex flex-col gap-6 lg:pl-4">
            {/* First Row: Title and Subtitle */}
            <motion.div
              className="bg-[#221d35] rounded-[10px] p-8 text-center flex-1 flex flex-col justify-center"
              variants={fadeInUp}
            >
              <h1 className="text-white text-[24px] font-bold mb-2">
                {tCommon('404.title')}
              </h1>
              <p className="text-white text-[16px] font-regular">
                {tCommon('404.subtitle')}
              </p>
            </motion.div>

            {/* Second Row: Two buttons */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                variants={buttonHover}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  href="/casino"
                  className="group bg-[#221d35] rounded-[10px] p-6 text-center transition-all duration-200 hover:bg-[#2c2546] relative block"
                >
                  <span className="text-white text-[16px] font-regular relative">
                    {tCommon('404.casino')}
                    <div className="absolute -bottom-1 left-0 right-0 h-[4px] bg-[#896cef] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"></div>
                  </span>
                </Link>
              </motion.div>
              <motion.div
                variants={buttonHover}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  href="/origin"
                  className="group bg-[#221d35] rounded-[10px] p-6 text-center transition-all duration-200 hover:bg-[#2c2546] relative block"
                >
                  <span className="text-white text-[16px] font-regular relative">
                    {tCommon('404.origin')}
                    <div className="absolute -bottom-1 left-0 right-0 h-[4px] bg-[#896cef] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"></div>
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile Layout: Stacked elements */}
        <div className="lg:hidden space-y-4">
          {/* 404 Image */}
          <motion.div
            className="flex justify-center"
            variants={bounce}
          >
            <Image
              src="/404.jpg"
              alt="404 Error"
              width={488}
              height={345}
              className="max-w-[488px] max-h-[345px] w-full h-auto rounded-[10px]"
              priority
            />
          </motion.div>

          {/* Title and Subtitle */}
          <motion.div
            className="bg-[#221d35] rounded-[10px] p-8 text-center"
            variants={fadeInUp}
          >
            <h1 className="text-white text-[24px] font-bold mb-2">
              {tCommon('404.title')}
            </h1>
            <p className="text-white text-[16px] font-regular">
              {tCommon('404.subtitle')}
            </p>
          </motion.div>

          {/* Two buttons in a single row */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              variants={buttonHover}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                href="/casino"
                className="group bg-[#221d35] rounded-[10px] p-6 text-center transition-all duration-200 hover:bg-[#2c2546] relative block"
              >
                <span className="text-white text-[16px] font-regular relative">
                  {tCommon('404.casino')}
                  <div className="absolute -bottom-1 left-0 right-0 h-[4px] bg-[#896cef] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"></div>
                </span>
              </Link>
            </motion.div>
            <motion.div
              variants={buttonHover}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                href="/origin"
                className="group bg-[#221d35] rounded-[10px] p-6 text-center transition-all duration-200 hover:bg-[#2c2546] relative block"
              >
                <span className="text-white text-[16px] font-regular relative">
                  {tCommon('404.origin')}
                  <div className="absolute -bottom-1 left-0 right-0 h-[4px] bg-[#896cef] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"></div>
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}