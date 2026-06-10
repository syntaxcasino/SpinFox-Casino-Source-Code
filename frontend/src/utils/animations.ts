// Centralized animation variants for consistent animations across the application
// Professional entrance animations combined with playful interactive elements

import { Variants } from "framer-motion";

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -100,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

export const scaleUp: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

export const bounce: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
      mass: 0.5
    }
  }
};

export const float: Variants = {
  hidden: {
    y: 0,
    rotate: 0
  },
  visible: {
    y: [0, -15, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror"
    }
  }
};

export const shake: Variants = {
  hidden: { x: 0 },
  visible: {
    y: [0, -15, 0], // Rapid left-right movement
    transition: {
      y: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 0.4, // Fast shaking
        ease: "easeInOut",
      },
    },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

export const staggerText: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Button specific animations
export const buttonHover: Variants = {
  rest: {
    scale: 1,
    transition: { duration: 0.3 }
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10
    }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

export const buttonShine: Variants = {
  rest: {
    backgroundPosition: "200% center"
  },
  hover: {
    backgroundPosition: "-200% center",
    transition: {
      duration: 1.5,
      ease: "linear"
    }
  }
};