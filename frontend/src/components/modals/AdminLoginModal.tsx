'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../contexts/TranslationContext';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';
import { fadeInUp, scaleUp } from '@/utils/animations';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const { t } = useTranslation();
  const { login } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // await login(email, password);
      onClose();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overlay with 70% opacity and blur */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            className="relative z-10 w-full max-w-md"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Glassmorphic Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-2xl shadow-2xl">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
              
              <div className="relative p-6">
                {/* Close Button - Top Right */}
                <motion.button
                  className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src="/close.png"
                    alt="Close"
                    width={16}
                    height={16}
                    className="w-4 h-4 invert"
                  />
                </motion.button>

                {/* Modal Content */}
                <motion.div
                  className="text-center"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Title - 24px white bold font, centered */}
                  <h2 className="font-poppins font-bold text-white text-[24px] mb-2">
                    {t('common.admin.logintitle')}
                  </h2>

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Admin Name Field */}
                    <div className="text-left">
                      <label className="block font-poppins text-white/80 text-xs font-medium mb-2">
                        {t('common.admin.admin.label')}
                      </label>
                      <input
                        type="text"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder={t('common.admin.admin.placeholder')}
                        className="w-full bg-white/10 text-white px-4 py-3 rounded-lg border border-white/20 placeholder-white/40 focus:outline-none focus:border-primary focus:bg-white/20 transition-all"
                        required
                      />
                    </div>

                    {/* Password Field */}
                    <div className="text-left">
                      <label className="block font-poppins text-white/80 text-xs font-medium mb-2">
                        {t('common.admin.password.label')}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder={t('common.admin.password.placeholder')}
                          className="w-full bg-white/10 text-white px-4 py-3 pr-12 rounded-lg border border-white/20 placeholder-white/40 focus:outline-none focus:border-primary focus:bg-white/20 transition-all"
                          required
                        />
                        {/* Eye Icon - 24x24, right aligned */}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          <Image
                            src="/eye.png"
                            alt={showPassword ? 'Hide password' : 'Show password'}
                            width={24}
                            height={24}
                            className="w-6 h-6 invert opacity-60 hover:opacity-100"
                          />
                        </button>
                      </div>
                    </div>

                    {/* Login Button */}
                    <motion.button
                      type="submit"
                      className="w-full py-3 px-4 bg-gradient-to-r from-primary to-purple-600 rounded-lg text-white font-bold text-[14px] hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Logging in...' : t('common.login.loginButton')}
                    </motion.button>
                  </form>

                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}