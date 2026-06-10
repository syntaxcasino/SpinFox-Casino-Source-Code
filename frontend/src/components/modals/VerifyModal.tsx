'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../contexts/TranslationContext';
import { useUser } from '@/contexts/UserContext';
import { fadeInUp, scaleUp } from '@/utils/animations';
import { fetchEmailFromUsername } from '@/lib/api';
import { X } from 'lucide-react';

interface VerifyModalProps {
  usernameOrEmail: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function VerifyModal({ usernameOrEmail, isOpen, onClose }: VerifyModalProps) {
  const { t: tAuth } = useTranslation("auth");
  const { verifyEmail, resendVerificationCode } = useUser();

  const [code, setCode] = useState('');
  const [email, setEmail] = useState(usernameOrEmail);
  const [isLoading, setIsLoading] = useState(false);

  // Determine email from usernameOrEmail
  useEffect(() => {
    if (!usernameOrEmail) return;

    if (/\S+@\S+\.\S+/.test(usernameOrEmail)) {
      setEmail(usernameOrEmail);
    } else {
      fetchEmailFromUsername(usernameOrEmail)
        .then(fetchedEmail => setEmail(fetchedEmail))
        .catch(err => console.error('Failed to fetch email:', err));
    }
  }, [usernameOrEmail]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await verifyEmail(email, code);
      onClose();
    } catch (err: any) {
      console.error('Verification failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await resendVerificationCode(email);
    } catch (err: any) {
      console.error('Resend code failed:', err);
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
                <motion.button
                  className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>

                <motion.div className="text-center" variants={fadeInUp}>
                  <h2 className="font-poppins font-bold text-white text-[24px] mb-2">
                    {tAuth('verifyEmail')}
                  </h2>
                  <p className="font-poppins font-normal text-white/60 text-[16px] mb-6">
                    {tAuth('verifySubTitle')} <span className="font-medium text-primary">{email}</span>
                  </p>

                  <form onSubmit={handleVerify} className="space-y-4">
                    <div className="text-left">
                      <label className="block font-poppins text-white/80 text-xs font-medium mb-2">
                        {tAuth('verificationCode')}
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={tAuth('enterVerificationCode')}
                        className="w-full bg-white/10 text-white px-4 py-3 rounded-lg border border-white/20 placeholder-white/40 focus:outline-none focus:border-primary focus:bg-white/20 transition-all"
                        required
                      />
                    </div>

                    <motion.button
                      type="submit"
                      className="w-full py-3 px-4 bg-gradient-to-r from-primary to-purple-600 rounded-lg text-white font-bold text-[14px] hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}
                    >
                      {isLoading ? tAuth('verifying') : tAuth('verify')}
                    </motion.button>

                    <div className="flex justify-between mt-2">
                      <button
                        type="button"
                        className="text-sm text-white/80 underline hover:text-white"
                        onClick={onClose}
                      >
                        {tAuth('backButton')}
                      </button>
                      <button
                        type="button"
                        className="text-sm text-white/80 underline hover:text-white"
                        onClick={handleResend}
                        disabled={isLoading}
                      >
                        {tAuth('resendCode')}
                      </button>
                    </div>
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
