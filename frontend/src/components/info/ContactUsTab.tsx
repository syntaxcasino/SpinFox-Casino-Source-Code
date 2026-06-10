'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../contexts/TranslationContext';
import { fadeInUp } from '@/utils/animations';

export default function ContactUsTab() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="p-8"
    >
      {/* Contact Details Title */}
      <h2 className="font-poppins font-bold text-white text-[24px] mb-6 text-left">
        {t('info.contactUs.title')}
      </h2>

      {/* Contact Details Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <p className="font-poppins font-normal text-[#70828F] text-[10px] mb-1">
            {t('info.contactUs.phone.label')}
          </p>
          <p className="font-poppins font-bold text-[#896CEF] text-[20px] text-left">
            {t('info.contactUs.phone.value')}
          </p>
        </div>
        <div>
          <p className="font-poppins font-normal text-[#70828F] text-[10px] mb-1">
            {t('info.contactUs.email.label')}
          </p>
          <p className="font-poppins font-bold text-[#896CEF] text-[20px] text-left break-all">
            {t('info.contactUs.email.value')}
          </p>
        </div>
        <div>
          <p className="font-poppins font-normal text-[#70828F] text-[10px] mb-1">
            {t('info.contactUs.responseTime.label')}
          </p>
          <p className="font-poppins font-bold text-[#896CEF] text-[20px] text-left">
            {t('info.contactUs.responseTime.value')}
          </p>
        </div>
      </div>

      {/* Horizontal Line */}
      <div className="h-px bg-[#70828F] mb-8"></div>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block font-poppins font-normal text-[#70828F] text-[10px] mb-2">
            {t('info.contactUs.name.label')}
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder={t('info.contactUs.name.placeholder')}
            className="w-full bg-[#0b0911] text-white px-4 py-3 rounded-[5px] border-2 border-[#70828F] placeholder-[#70828F] focus:outline-none focus:border-[#896CEF] transition-colors"
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block font-poppins font-normal text-[#70828F] text-[10px] mb-2">
            {t('info.contactUs.emailField.label')}
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={t('info.contactUs.emailField.placeholder')}
            className="w-full bg-[#0b0911] text-white px-4 py-3 rounded-[5px] border-2 border-[#70828F] placeholder-[#70828F] focus:outline-none focus:border-[#896CEF] transition-colors"
            required
          />
        </div>

        {/* Subject Field */}
        <div>
          <label className="block font-poppins font-normal text-[#70828F] text-[10px] mb-2">
            {t('info.contactUs.subject.label')}
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder={t('info.contactUs.subject.placeholder')}
            className="w-full bg-white text-black px-4 py-3 rounded-[5px] border-2 border-[#70828F] placeholder-[#70828F] focus:outline-none focus:border-[#896CEF] transition-colors"
            required
          />
        </div>

        {/* Message Field */}
        <div>
          <label className="block font-poppins font-normal text-[#70828F] text-[10px] mb-2">
            {t('info.contactUs.message.label')}
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder={t('info.contactUs.message.placeholder')}
            rows={6}
            className="w-full bg-white text-black px-4 py-3 rounded-[5px] border-2 border-[#70828F] placeholder-[#70828F] focus:outline-none focus:border-[#896CEF] transition-colors resize-vertical"
            required
          />
        </div>

        {/* Send Button */}
        <div className="text-center">
          <motion.button
            type="submit"
            className="py-2 px-6 bg-[#896cef] rounded-[5px] text-white font-bold text-[14px] hover:bg-[#896cef]/80 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('info.contactUs.sendButton')}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}