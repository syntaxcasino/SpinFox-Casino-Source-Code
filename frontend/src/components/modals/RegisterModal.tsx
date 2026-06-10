'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../contexts/TranslationContext';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';
import { fadeInUp, scaleUp } from '@/utils/animations';
import VerifyModal from './VerifyModal';
import { X, Eye, EyeOff } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export default function RegisterModal({ isOpen, onClose, onLogin }: RegisterModalProps) {
  const { t: tAuth } = useTranslation("auth");
  const { register } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyOpen, setVerifyOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert(tAuth('passwordMismatch'));
      return;
    }

    setIsLoading(true);
    try {
      await register(username, email, password);
      onClose();
      setVerifyOpen(true);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !isVerifyOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
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
                  <motion.button
                    className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-4 h-4 text-white" />
                  </motion.button>

                  <motion.div className="text-center" variants={fadeInUp} initial="hidden" animate="visible">
                    <h2 className="font-poppins font-bold text-white text-[24px] mb-2">
                      {tAuth('signUp')}
                    </h2>
                    <p className="font-poppins font-normal text-white/60 text-[16px] mb-6">
                      {tAuth('signUpSubTitle')}
                    </p>

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="text-left">
                        <label className="block font-poppins text-white/80 text-xs font-medium mb-2">
                          {tAuth('username')}
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder={tAuth('usernamePlaceholder')}
                          className="w-full bg-white/10 text-white px-4 py-3 rounded-lg border border-white/20 placeholder-white/40 focus:outline-none focus:border-primary focus:bg-white/20 transition-all"
                          required
                        />
                      </div>

                      <div className="text-left">
                        <label className="block font-poppins text-white/80 text-xs font-medium mb-2">
                          {tAuth('email')}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={tAuth('emailPlaceholder')}
                          className="w-full bg-white/10 text-white px-4 py-3 rounded-lg border border-white/20 placeholder-white/40 focus:outline-none focus:border-primary focus:bg-white/20 transition-all"
                          required
                        />
                      </div>

                      <div className="text-left">
                        <label className="block font-poppins text-white/80 text-xs font-medium mb-2">
                          {tAuth('password')}
                        </label>
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

                      <div className="text-left">
                        <label className="block font-poppins text-white/80 text-xs font-medium mb-2">
                          {tAuth('confirmPassword')}
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={tAuth('confirmPassword')}
                            className="w-full bg-white/10 text-white px-4 py-3 pr-12 rounded-lg border border-white/20 placeholder-white/40 focus:outline-none focus:border-primary focus:bg-white/20 transition-all"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5 text-white/60 hover:text-white" />
                            ) : (
                              <Eye className="w-5 h-5 text-white/60 hover:text-white" />
                            )}
                          </button>
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-primary to-purple-600 rounded-lg text-white font-bold text-[14px] hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                      >
                        {isLoading ? tAuth('loading') : tAuth('registerButton')}
                      </motion.button>
                    </form>

                    <div className="mt-8 text-center">
                      <p className="font-poppins text-white/60 text-[12px] mb-2">
                        {tAuth('haveAccount')}
                      </p>
                      <a
                        href="#"
                        className="font-poppins font-bold text-[14px] text-white underline hover:text-white/80"
                        onClick={onLogin}
                      >
                        {tAuth('loginInstead')}
                      </a>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verify Modal */}
      {isVerifyOpen && (
        <VerifyModal
          usernameOrEmail={email}
          isOpen={isVerifyOpen}
          onClose={() => {
            setVerifyOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
