import React from 'react';
import { motion } from 'framer-motion';

const PharosLogo = ({ size = 'md', animated = true, className = '', usePNG = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32'
  };

  const logoVariants = animated ? {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5 }
    },
    hover: { 
      scale: 1.1,
      rotate: [0, -5, 5, -5, 0],
      transition: { duration: 0.5 }
    }
  } : {
    initial: { opacity: 1, scale: 1 },
    animate: { opacity: 1, scale: 1 }
  };

  const ribbonVariants = animated ? {
    animate: {
      y: [0, -3, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  } : {};

  // If PNG is requested, show text-based logo (can be replaced with actual PNG file)
  if (usePNG) {
    return (
      <motion.div
        variants={logoVariants}
        initial="initial"
        animate="animate"
        whileHover={animated ? "hover" : undefined}
        className={`${sizeClasses[size]} ${className} flex items-center justify-center`}
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d',
          fontWeight: 'bold',
          color: 'white',
          fontSize: size === 'sm' ? '0.75rem' : size === 'md' ? '1rem' : size === 'lg' ? '1.5rem' : '2rem',
          letterSpacing: '0.1em'
        }}
      >
        PHAROS
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={logoVariants}
      initial="initial"
      animate="animate"
      whileHover={animated ? "hover" : undefined}
      className={`${sizeClasses[size]} ${className}`}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.5))' }}
      >
        {/* Pharos 3D Ribbon Logo - Based on official branding */}
        <motion.g variants={ribbonVariants} animate={animated ? "animate" : undefined}>
          {/* Bottom segment - widest */}
          <path
            d="M 15 75 Q 20 65 25 70 L 30 75 L 35 70 Q 40 65 45 70 L 50 75 L 55 70 Q 60 65 65 70 L 70 75 L 75 70 Q 80 65 85 70"
            fill="white"
            stroke="none"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
            }}
          />
          <path
            d="M 25 70 L 30 75 L 35 70 L 45 70 L 50 75 L 55 70 L 65 70 L 70 75 L 75 70"
            fill="rgba(255, 255, 255, 0.85)"
            stroke="none"
          />
          
          {/* Middle segment - medium width */}
          <path
            d="M 30 55 Q 35 45 40 50 L 45 55 L 50 50 Q 55 45 60 50 L 65 55 L 70 50 Q 75 45 80 50"
            fill="white"
            stroke="none"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
            }}
          />
          <path
            d="M 40 50 L 45 55 L 50 50 L 60 50 L 65 55 L 70 50"
            fill="rgba(255, 255, 255, 0.75)"
            stroke="none"
          />
          
          {/* Top segment - narrowest */}
          <path
            d="M 45 35 Q 50 25 55 30 L 60 35 L 65 30 Q 70 25 75 30"
            fill="white"
            stroke="none"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
            }}
          />
          <path
            d="M 55 30 L 60 35 L 65 30"
            fill="rgba(255, 255, 255, 0.65)"
            stroke="none"
          />
          
          {/* Add subtle blue glow for Pharos brand color */}
          <circle cx="60" cy="50" r="45" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="0.5" />
        </motion.g>
      </svg>
    </motion.div>
  );
};

export default PharosLogo;
