'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../contexts/TranslationContext';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';
import { fadeInUp, scaleUp } from '@/utils/animations';
import ForgotPasswordModal from './ForgotPasswordModal';
import VerifyModal from './VerifyModal';
import { X, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
}

export default function LoginModal({ isOpen, onClose, onRegister }: LoginModalProps) {
  const { t: tAuth } = useTranslation('auth');
  const { login } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotOpen, setForgotOpen] = useState(false);
  const [isVerifyOpen, setVerifyOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await login(usernameOrEmail, password);

      if (res?.access_token) {
        onClose();
      } else if (res?.error === 'EMAIL_NOT_VERIFIED') {
        setVerifyOpen(true);
      } else if (res?.message) {
        // toast.error(res.message); // optional: handle backend error
      }
    } catch (error: any) {
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
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
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
                {/* Close Button */}
                <motion.button
                  className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>

                <motion.div className="text-center" variants={fadeInUp} initial="hidden" animate="visible">
                  <h2 className="font-poppins font-bold text-white text-[24px] mb-2">{tAuth('login')}</h2>
                  <p className="font-poppins font-normal text-white/60 text-[16px] mb-6">{tAuth('loginSubTitle')}</p>

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-left">
                      <label className="block font-poppins text-white/80 text-xs font-medium mb-2">
                        {tAuth('usernameOrEmail')}
                      </label>
                      <input
                        type="text"
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        placeholder={tAuth('usernameOrEmailPlaceholder')}
                        className="w-full bg-white/10 text-white px-4 py-3 rounded-lg border border-white/20 placeholder-white/40 focus:outline-none focus:border-primary focus:bg-white/20 transition-all"
                        required
                      />
                    </div>

                    <div className="text-left">
                      <label className="block font-poppins text-white/80 text-xs font-medium mb-2">{tAuth('password')}</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={tAuth('passwordPlaceholder')}
                          className="w-full bg-white/10 text-white px-4 py-3 pr-12 rounded-lg border border-white/20 placeholder-white/40 focus:outline-none focus:border-primary focus:bg-white/20 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5 text-white/60 hover:text-white" />
                          ) : (
                            <Eye className="w-5 h-5 text-white/60 hover:text-white" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <a
                        href="#"
                        className="font-poppins text-white/80 underline text-[14px] hover:text-white"
                        onClick={(e) => {
                          e.preventDefault();
                          setForgotOpen(true);
                        }}
                      >
                        {tAuth('forgotPassword')}
                      </a>
                    </div>

                    <motion.button
                      type="submit"
                      className="w-full py-3 px-4 bg-gradient-to-r from-primary to-purple-600 rounded-lg text-white font-bold text-[14px] hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}
                    >
                      {isLoading ? tAuth('logging in...') : tAuth('login')}
                    </motion.button>
                  </form>

                  <div className="mt-8 text-center">
                    <p className="font-poppins text-white/60 text-[12px] mb-2">{tAuth('noAccount')}</p>
                    <a
                      href="#"
                      className="font-poppins font-bold text-[14px] text-white underline hover:text-white/80"
                      onClick={onRegister}
                    >
                      {tAuth('signUp')}
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setForgotOpen(false)} />
          {isVerifyOpen && (
            <VerifyModal
              usernameOrEmail={usernameOrEmail}
              isOpen={isVerifyOpen}
              onClose={() => setVerifyOpen(false)}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
