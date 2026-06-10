import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedFooterButtonProps {
  textColor?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const AnimatedButton = ({
  className,
  textColor,
  onClick,
  children,
  disabled
}: AnimatedFooterButtonProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      className={`${className} relative overflow-hidden flex flex-col items-center justify-center transition-colors duration-300`}
      style={{
        color: textColor
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
    >
      <span
        className="relative h-[1.2em] w-full flex items-center justify-center"
        style={{ minWidth: 120 }}
      >
        <AnimatePresence initial={false}>
          {!hovered ? (
            <motion.span
              key="old"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0, position: 'absolute' }}
              transition={{ type: 'spring', bounce: 0.5, duration: 0.9 }}
              className="absolute left-0 right-0 text-center flex items-center justify-center gap-3 text-[18px] lg:text-[20px]"
              style={{ width: '100%' }}
            >
              {children}
            </motion.span>
          ) : (
            <motion.span
              key="new"
              initial={{ y: 30, opacity: 0, position: 'absolute' }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.5, duration: 0.9 }}
              className="absolute left-0 right-0 text-center flex items-center justify-center gap-3 text-[18px] lg:text-[20px]"
              style={{ width: '100%' }}
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
};

export default AnimatedButton;
