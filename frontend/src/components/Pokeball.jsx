import React, { useState, useEffect, useRef } from 'react'

const Pokeball = ({ isThrowing = false, isCatching = false, catchResult = null, onAnimationComplete, onThrow }) => {
  const [animationPhase, setAnimationPhase] = useState('idle') // idle, aiming, throwing, shaking, success, failure
  const [shakeCount, setShakeCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [throwVelocity, setThrowVelocity] = useState({ x: 0, y: 0 })
  const pokeballRef = useRef(null)
  const shakeIntervalRef = useRef(null)

  useEffect(() => {
    if (isThrowing && !isDragging) {
      setAnimationPhase('throwing')
      setTimeout(() => {
        setAnimationPhase('shaking')
        startShaking()
      }, 800)
    }
  }, [isThrowing, isDragging])

  useEffect(() => {
    if (catchResult === true) {
      setAnimationPhase('success')
      if (shakeIntervalRef.current) {
        clearInterval(shakeIntervalRef.current)
      }
      setTimeout(() => {
        setAnimationPhase('idle')
        onAnimationComplete && onAnimationComplete(true)
      }, 2000)
    } else if (catchResult === false) {
      setAnimationPhase('failure')
      if (shakeIntervalRef.current) {
        clearInterval(shakeIntervalRef.current)
      }
      setTimeout(() => {
        setAnimationPhase('idle')
        onAnimationComplete && onAnimationComplete(false)
      }, 2000)
    }
  }, [catchResult])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (shakeIntervalRef.current) {
        clearInterval(shakeIntervalRef.current)
      }
    }
  }, [])

  const startShaking = () => {
    let shakes = 0
    const maxShakes = Math.floor(Math.random() * 2) + 3 // 3 or 4 shakes for tension
    
    if (shakeIntervalRef.current) {
      clearInterval(shakeIntervalRef.current)
    }
    
    shakeIntervalRef.current = setInterval(() => {
      setShakeCount(shakes)
      shakes++
      
      if (shakes >= maxShakes) {
        clearInterval(shakeIntervalRef.current)
        shakeIntervalRef.current = null
        // Wait a moment after last shake before determining result
        setTimeout(() => {
          // The catchResult prop will handle the success/failure
          if (catchResult === null || catchResult === undefined) {
            // Simulate catch result if not provided
            const success = Math.random() < 0.7 // 70% success rate
            setAnimationPhase(success ? 'success' : 'failure')
            onAnimationComplete && onAnimationComplete(success)
          }
        }, 800) // Longer pause for more tension
      }
    }, 650) // Slightly longer shake duration for more tension
  }

  // Mouse/Touch event handlers for drag and throw
  const handleStart = (clientX, clientY) => {
    if (animationPhase !== 'idle' && animationPhase !== 'aiming') return
    
    setIsDragging(true)
    setStartPosition({ x: clientX, y: clientY })
    setDragPosition({ x: 0, y: 0 })
    setAnimationPhase('aiming')
  }

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return
    
    const deltaX = clientX - startPosition.x
    const deltaY = clientY - startPosition.y
    setDragPosition({ x: deltaX, y: deltaY })
    
    // Calculate throw velocity based on drag distance
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const angle = Math.atan2(deltaY, deltaX)
    setThrowVelocity({
      x: Math.cos(angle) * distance * 0.1,
      y: Math.sin(angle) * distance * 0.1
    })
  }

  const handleEnd = (clientX, clientY) => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    const deltaX = clientX - startPosition.x
    const deltaY = clientY - startPosition.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    // Only throw if dragged far enough (minimum throw distance)
    if (distance > 50) {
      setAnimationPhase('throwing')
      onThrow && onThrow()
      
      // Reset drag position for throw animation
      setDragPosition({ x: 0, y: 0 })
      
      setTimeout(() => {
        setAnimationPhase('shaking')
        startShaking()
      }, 800)
    } else {
      // Snap back to original position if not thrown
      setAnimationPhase('idle')
      setDragPosition({ x: 0, y: 0 })
      setThrowVelocity({ x: 0, y: 0 })
    }
  }

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e) => {
    handleMove(e.clientX, e.clientY)
  }

  const handleMouseUp = (e) => {
    handleEnd(e.clientX, e.clientY)
  }

  // Touch events
  const handleTouchStart = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = (e) => {
    e.preventDefault()
    const touch = e.changedTouches[0]
    handleEnd(touch.clientX, touch.clientY)
  }

  // Add global event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, startPosition])

  const getPokeballStyle = () => {
    const baseStyle = {
      width: '70px',
      height: '70px',
      borderRadius: '50%',
      position: 'relative',
      transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: isDragging ? 'grabbing' : 'grab',
      userSelect: 'none',
      zIndex: isDragging ? 1000 : 1,
      transformStyle: 'preserve-3d',
      perspective: '1000px'
    }

    // Calculate drag transform with 3D rotation
    const dragDistance = Math.sqrt(dragPosition.x * dragPosition.x + dragPosition.y * dragPosition.y)
    const dragAngle = Math.atan2(dragPosition.y, dragPosition.x)
    const dragTransform = `translate(${dragPosition.x}px, ${dragPosition.y}px) rotateZ(${dragAngle}rad)`
    
    switch (animationPhase) {
      case 'aiming':
        const dragPower = Math.min(dragDistance / 100, 1.5)
        const tiltX = dragPosition.y * 0.15
        const tiltY = -dragPosition.x * 0.15
        return {
          ...baseStyle,
          transform: `${dragTransform} scale(${1.0 + dragPower * 0.2}) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(${dragPower * 20}px)`,
          transition: 'none',
          boxShadow: `0 ${Math.max(0, -dragPosition.y * 0.5)}px ${Math.abs(dragPosition.y) * 0.5}px rgba(255, 0, 0, 0.6), 
                      0 0 ${dragPower * 30}px rgba(255, 100, 100, 0.8),
                      inset 0 0 ${dragPower * 15}px rgba(255, 255, 255, 0.3)`,
          filter: `brightness(${1 + dragPower * 0.2}) drop-shadow(0 ${dragPower * 10}px ${dragPower * 20}px rgba(255, 0, 0, 0.4))`
        }
      case 'throwing':
        return {
          ...baseStyle,
          transform: `translateY(-120px) translateX(${throwVelocity.x * 30}px) translateZ(-50px) rotateX(1080deg) rotateY(720deg) rotateZ(1440deg) scale(0.8)`,
          transition: 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          cursor: 'default',
          opacity: 0.95,
          filter: 'blur(2px) drop-shadow(0 0 15px rgba(255, 0, 0, 0.8))',
          boxShadow: '0 0 40px rgba(255, 0, 0, 0.9), 0 0 80px rgba(255, 100, 100, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)',
          transformStyle: 'preserve-3d'
        }
      case 'shaking':
        const shakeIntensity = Math.min(shakeCount * 2, 10)
        const shakeRotation = (shakeCount % 2 === 0 ? 1 : -1) * shakeIntensity
        const bounceHeight = Math.sin(shakeCount * Math.PI) * 8
        return {
          ...baseStyle,
          transform: `translateY(${-120 + bounceHeight}px) translateX(${shakeRotation * 2}px) translateZ(${Math.abs(shakeRotation) * 2}px) rotateX(${shakeRotation * 3}deg) rotateY(${shakeRotation * 2}deg) rotateZ(${shakeRotation}deg) scale(1)`,
          animation: `pokeballShake3D ${0.6}s cubic-bezier(0.36, 0, 0.66, 1.01) infinite`,
          cursor: 'default',
          border: '3px solid #ff0000',
          boxShadow: `0 ${bounceHeight}px ${15 + shakeCount * 2}px rgba(255, 0, 0, ${0.5 + shakeCount * 0.15}), 
                      0 0 ${30 + shakeCount * 3}px rgba(255, 50, 50, ${0.4 + shakeCount * 0.15}),
                      inset 0 ${-bounceHeight * 0.5}px ${shakeCount * 3}px rgba(255, 255, 255, 0.3)`,
          filter: `brightness(${1 + shakeCount * 0.1}) drop-shadow(0 ${Math.abs(shakeRotation)}px ${Math.abs(shakeRotation) * 2}px rgba(255, 0, 0, 0.6))`,
          transformStyle: 'preserve-3d'
        }
      case 'success':
        return {
          ...baseStyle,
          transform: `translateY(-120px) translateZ(30px) scale(1.4) rotateX(360deg) rotateY(360deg) rotateZ(720deg)`,
          boxShadow: '0 0 40px #00ff00, 0 0 80px #00ff00, 0 0 120px rgba(0, 255, 0, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.5)',
          animation: 'pokeballSuccess3D 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite alternate',
          cursor: 'default',
          border: '3px solid #00ff00',
          filter: 'brightness(1.5) drop-shadow(0 0 20px #00ff00) drop-shadow(0 0 40px rgba(0, 255, 0, 0.8))',
          transformStyle: 'preserve-3d'
        }
      case 'failure':
        const failBounce = Math.sin(shakeCount * Math.PI * 2) * 15
        return {
          ...baseStyle,
          transform: `translateY(${-120 + failBounce}px) translateX(${Math.sin(shakeCount * 2) * 25}px) translateZ(-20px) rotateX(${Math.sin(shakeCount) * 45}deg) rotateY(${Math.cos(shakeCount) * 45}deg) rotateZ(${Math.sin(shakeCount) * 60}deg) scale(0.7)`,
          opacity: 0.8,
          boxShadow: '0 0 25px #ff0000, 0 0 50px rgba(255, 0, 0, 0.4), inset 0 0 15px rgba(0, 0, 0, 0.6)',
          animation: 'pokeballFailure3D 0.4s cubic-bezier(0.36, 0, 0.66, 1.01) infinite',
          cursor: 'default',
          border: '3px solid #ff0000',
          filter: 'brightness(0.6) drop-shadow(0 0 15px #ff0000)',
          transformStyle: 'preserve-3d'
        }
      default:
        return {
          ...baseStyle,
          transform: `${dragTransform} translateZ(0px)`,
          boxShadow: isDragging 
            ? `0 ${Math.max(0, -dragPosition.y)}px ${Math.abs(dragPosition.y) * 0.2}px rgba(0,0,0,0.4), 0 0 20px rgba(255, 0, 0, 0.4)` 
            : '0 8px 20px rgba(0,0,0,0.4), 0 0 15px rgba(255, 0, 0, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.2)',
          scale: isDragging ? '1.1' : '1',
          animation: 'pokeballIdle3D 4s ease-in-out infinite',
          transformStyle: 'preserve-3d'
        }
    }
  }

  return (
    <div className="pokeball-container">
      <style jsx>{`
        @keyframes pokeballIdle3D {
          0%, 100% { 
            transform: translateY(0) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);
            box-shadow: 0 8px 20px rgba(0,0,0,0.4), 0 0 15px rgba(255, 0, 0, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.2);
          }
          25% { 
            transform: translateY(-8px) translateZ(10px) rotateX(5deg) rotateY(10deg) rotateZ(8deg) scale(1.05);
            box-shadow: 0 12px 28px rgba(255, 0, 0, 0.5), 0 0 25px rgba(255, 100, 100, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.3);
          }
          50% { 
            transform: translateY(-12px) translateZ(15px) rotateX(0deg) rotateY(20deg) rotateZ(0deg) scale(1.08);
            box-shadow: 0 16px 32px rgba(255, 0, 0, 0.6), 0 0 30px rgba(255, 100, 100, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.4);
          }
          75% { 
            transform: translateY(-8px) translateZ(10px) rotateX(-5deg) rotateY(10deg) rotateZ(-8deg) scale(1.05);
            box-shadow: 0 12px 28px rgba(255, 0, 0, 0.5), 0 0 25px rgba(255, 100, 100, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.3);
          }
        }
        
        @keyframes pokeballShake3D {
          0%, 100% { 
            transform: translateY(-120px) translateX(0) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);
          }
          20% { 
            transform: translateY(-115px) translateX(-12px) translateZ(-8px) rotateX(-15deg) rotateY(-10deg) rotateZ(-15deg) scale(1.05);
          }
          40% { 
            transform: translateY(-125px) translateX(0) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);
          }
          60% { 
            transform: translateY(-115px) translateX(12px) translateZ(-8px) rotateX(15deg) rotateY(10deg) rotateZ(15deg) scale(1.05);
          }
          80% { 
            transform: translateY(-125px) translateX(0) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);
          }
        }
        
        @keyframes pokeballSuccess3D {
          0% { 
            transform: translateY(-120px) translateZ(20px) scale(1.3) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
            box-shadow: 0 0 40px #00ff00, 0 0 80px #00ff00, 0 0 120px rgba(0, 255, 0, 0.6), inset 0 0 25px rgba(255, 255, 255, 0.4);
          }
          50% { 
            transform: translateY(-130px) translateZ(40px) scale(1.5) rotateX(180deg) rotateY(180deg) rotateZ(360deg);
            box-shadow: 0 0 60px #00ff00, 0 0 120px #00ff00, 0 0 180px rgba(0, 255, 0, 0.8), inset 0 0 40px rgba(255, 255, 255, 0.6);
          }
          100% { 
            transform: translateY(-120px) translateZ(30px) scale(1.4) rotateX(360deg) rotateY(360deg) rotateZ(720deg);
            box-shadow: 0 0 50px #00ff00, 0 0 100px #00ff00, 0 0 150px rgba(0, 255, 0, 0.7), inset 0 0 35px rgba(255, 255, 255, 0.5);
          }
        }
        
        @keyframes pokeballFailure3D {
          0%, 100% { 
            transform: translateY(-120px) translateX(0) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(0.7);
          }
          20% { 
            transform: translateY(-105px) translateX(-25px) translateZ(-15px) rotateX(-30deg) rotateY(-20deg) rotateZ(-45deg) scale(0.75);
          }
          40% { 
            transform: translateY(-135px) translateX(0) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(0.65);
          }
          60% { 
            transform: translateY(-105px) translateX(25px) translateZ(-15px) rotateX(30deg) rotateY(20deg) rotateZ(45deg) scale(0.75);
          }
          80% { 
            transform: translateY(-135px) translateX(0) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(0.65);
          }
        }
        
        .pokeball-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0;
          position: relative;
          min-height: 180px;
          height: 180px;
          perspective: 1500px;
          perspective-origin: center center;
          padding-top: 20px;
          transform-style: preserve-3d;
        }
        
        .pokeball {
          background: linear-gradient(to bottom, #ff0000 50%, #ffffff 50%);
          border: 4px solid #333;
          position: relative;
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.4),
                      0 8px 16px rgba(0, 0, 0, 0.3),
                      inset 0 2px 4px rgba(255, 255, 255, 0.3),
                      inset 0 -2px 4px rgba(0, 0, 0, 0.2);
          animation: pokeballGlow 2s ease-in-out infinite alternate;
          transform-style: preserve-3d;
          backface-visibility: visible;
        }
        
        @keyframes pokeballGlow {
          0% { box-shadow: 0 0 15px rgba(255, 0, 0, 0.3); }
          100% { box-shadow: 0 0 30px rgba(255, 0, 0, 0.7); }
        }
        
        .pokeball::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) translateZ(5px);
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, #555 0%, #111 60%, #000 100%);
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8), 
                      0 0 12px rgba(255, 255, 255, 0.5),
                      0 2px 4px rgba(0, 0, 0, 0.4);
          z-index: 2;
          transform-style: preserve-3d;
        }
        
        .pokeball::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(to right, #444 0%, #000 50%, #444 100%);
          transform: translateY(-50%) translateZ(2px);
          z-index: 1;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.8),
                      inset 0 1px 2px rgba(255, 255, 255, 0.1);
        }
        
        .pokeball:hover {
          transform: scale(1.05) rotateZ(5deg) !important;
          box-shadow: 0 12px 24px rgba(255, 0, 0, 0.6) !important;
        }
        
        .drag-hint {
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          color: #ff6b35;
          font-size: 14px;
          font-weight: bold;
          text-align: center;
          opacity: 0.9;
          animation: fadeInOut 1.5s ease-in-out infinite;
          text-shadow: 0 0 6px rgba(255, 107, 53, 0.8);
          pointer-events: none;
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) translateY(0); }
          50% { opacity: 1; transform: translateX(-50%) translateY(-3px); }
        }
        
        .power-indicator {
          position: absolute;
          bottom: -45px;
          left: 50%;
          transform: translateX(-50%);
          width: 150px;
          height: 3px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .power-bar {
          height: 100%;
          background: linear-gradient(to right, #ff6b35, #ff0000);
          transition: width 0.1s ease;
          border-radius: 2px;
          box-shadow: 0 0 4px rgba(255, 107, 53, 0.6);
        }
        
        .shake-counter {
          position: absolute;
          top: -35px;
          left: 50%;
          transform: translateX(-50%);
          color: #fff;
          font-size: 18px;
          font-weight: bold;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
          animation: pulse 0.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
          50% { transform: translateX(-50%) scale(1.15); opacity: 0.85; }
        }
      `}</style>
      
      <div 
        className="pokeball" 
        ref={pokeballRef}
        style={getPokeballStyle()}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {animationPhase === 'aiming' && (
          <div className="power-indicator">
            <div 
              className="power-bar" 
              style={{ 
                width: `${Math.min(100, Math.sqrt(dragPosition.x * dragPosition.x + dragPosition.y * dragPosition.y) * 2)}%` 
              }} 
            />
          </div>
        )}
        
        {animationPhase === 'shaking' && (
          <div className="shake-counter">
            {shakeCount < 3 ? '...' : shakeCount === 3 ? '!!' : '!!!'}
          </div>
        )}
        
        {animationPhase === 'idle' && (
          <div className="drag-hint">
            👆 Drag to aim & throw!
          </div>
        )}
      </div>
    </div>
  )
}

export default Pokeball
