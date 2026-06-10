'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../contexts/TranslationContext';
import { fadeInUp } from '@/utils/animations';

export default function TermsTab() {
  const { t } = useTranslation();

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="p-8"
    >
      {/* Title */}
      <h1 className="font-poppins font-bold text-white text-[24px] mb-6 text-center">
        {t('info.termsConditions.title')}
      </h1>

      {/* Subtitle */}
      <h2 className="font-poppins font-bold text-white text-[16px] mb-4 text-left">
        {t('info.termsConditions.subtitle')}
      </h2>

      {/* Introduction */}
      <h3 className="font-poppins font-bold text-white text-[16px] mb-4 text-left">
        {t('info.termsConditions.introduction')}
      </h3>

      {/* Content */}
      <div className="font-poppins font-normal text-white text-[14px] leading-relaxed text-left whitespace-pre-line">
        {t('info.termsConditions.content')}
      </div>
    </motion.div>
  );
}