import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  children: React.ReactNode;
  onClose?: () => void;
}

const Modal = ({ children, onClose }: ModalProps) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLElement>) => {
    // Only close if clicking on the backdrop (not the children)
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <motion.section
      className="fixed z-[5000] inset-0 flex items-center justify-center bg-black/80"
      onClick={handleBackdropClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="flex items-center justify-center w-[90%] lg:w-full"
        onClick={handleBackdropClick}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: 'easeOut',
          type: 'spring',
          stiffness: 300,
          damping: 25
        }}
      >
        {children}
      </motion.div>
    </motion.section>
  );
};

export default Modal;
