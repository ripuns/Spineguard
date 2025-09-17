import React from 'react'
import { motion } from 'framer-motion'

const SpineIllustration = ({ size = 200, color = "currentColor", isGoodPosture = true, animated = false }) => {
  const spineColor = isGoodPosture ? '#10B981' : '#EF4444'
  
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      animate={animated ? {
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8]
      } : {}}
      transition={{
        duration: 2,
        repeat: animated ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      {/* Spine Base */}
      <svg
        viewBox="0 0 100 200"
        className="w-full h-full"
        style={{ color: spineColor }}
      >
        {/* Cervical Spine */}
        <motion.rect
          x="45"
          y="20"
          width="10"
          height="25"
          rx="5"
          fill={spineColor}
          opacity="0.9"
          animate={animated ? {
            scaleY: [1, 1.1, 1],
            opacity: [0.9, 1, 0.9]
          } : {}}
          transition={{
            duration: 1.5,
            repeat: animated ? Infinity : 0,
            delay: 0
          }}
        />
        
        {/* Thoracic Spine */}
        <motion.rect
          x="42"
          y="45"
          width="16"
          height="60"
          rx="8"
          fill={spineColor}
          opacity="0.8"
          animate={animated ? {
            scaleY: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          } : {}}
          transition={{
            duration: 1.5,
            repeat: animated ? Infinity : 0,
            delay: 0.2
          }}
        />
        
        {/* Lumbar Spine */}
        <motion.rect
          x="40"
          y="105"
          width="20"
          height="40"
          rx="10"
          fill={spineColor}
          opacity="0.9"
          animate={animated ? {
            scaleY: [1, 1.08, 1],
            opacity: [0.9, 1, 0.9]
          } : {}}
          transition={{
            duration: 1.5,
            repeat: animated ? Infinity : 0,
            delay: 0.4
          }}
        />
        
        {/* Sacrum */}
        <motion.rect
          x="38"
          y="145"
          width="24"
          height="25"
          rx="12"
          fill={spineColor}
          opacity="0.7"
          animate={animated ? {
            scaleY: [1, 1.05, 1],
            opacity: [0.7, 1, 0.7]
          } : {}}
          transition={{
            duration: 1.5,
            repeat: animated ? Infinity : 0,
            delay: 0.6
          }}
        />
        
        {/* Coccyx */}
        <motion.rect
          x="46"
          y="170"
          width="8"
          height="15"
          rx="4"
          fill={spineColor}
          opacity="0.6"
          animate={animated ? {
            scaleY: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6]
          } : {}}
          transition={{
            duration: 1.5,
            repeat: animated ? Infinity : 0,
            delay: 0.8
          }}
        />
        
        {/* Vertebrae Details */}
        {[...Array(7)].map((_, i) => (
          <motion.rect
            key={`cervical-${i}`}
            x="47"
            y={22 + i * 3}
            width="6"
            height="2"
            rx="1"
            fill={isGoodPosture ? '#6EE7B7' : '#FCA5A5'}
            opacity="0.6"
            animate={animated ? {
              opacity: [0.6, 1, 0.6]
            } : {}}
            transition={{
              duration: 1.5,
              repeat: animated ? Infinity : 0,
              delay: i * 0.1
            }}
          />
        ))}
        
        {/* Ribs (simplified) */}
        {[...Array(6)].map((_, i) => (
          <motion.line
            key={`rib-${i}`}
            x1="42"
            y1={50 + i * 8}
            x2="25"
            y2={50 + i * 8}
            stroke={spineColor}
            strokeWidth="1"
            opacity="0.4"
            animate={animated ? {
              opacity: [0.4, 0.8, 0.4]
            } : {}}
            transition={{
              duration: 1.5,
              repeat: animated ? Infinity : 0,
              delay: i * 0.1 + 0.5
            }}
          />
        ))}
        
        {[...Array(6)].map((_, i) => (
          <motion.line
            key={`rib-right-${i}`}
            x1="58"
            y1={50 + i * 8}
            x2="75"
            y2={50 + i * 8}
            stroke={spineColor}
            strokeWidth="1"
            opacity="0.4"
            animate={animated ? {
              opacity: [0.4, 0.8, 0.4]
            } : {}}
            transition={{
              duration: 1.5,
              repeat: animated ? Infinity : 0,
              delay: i * 0.1 + 0.5
            }}
          />
        ))}
        
        {/* Glow Effect */}
        <motion.ellipse
          cx="50"
          cy="100"
          rx="30"
          ry="80"
          fill={spineColor}
          opacity="0.1"
          animate={animated ? {
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.1, 1]
          } : {}}
          transition={{
            duration: 2,
            repeat: animated ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
      </svg>
      
      {/* Status Indicator */}
      <motion.div
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
        style={{
          backgroundColor: isGoodPosture ? '#10B981' : '#EF4444',
          color: 'white'
        }}
        animate={animated ? {
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8]
        } : {}}
        transition={{
          duration: 1,
          repeat: animated ? Infinity : 0
        }}
      >
        {isGoodPosture ? '✓' : '!'}
      </motion.div>
    </motion.div>
  )
}

export default SpineIllustration
