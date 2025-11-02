import React, { useState, useEffect } from 'react'
import Pokeball from './Pokeball'
import HashMonPixel from './HashMonPixel'
import { HASHMON_TYPES } from '../services/hashmonService'

const CatchAnimation = ({ wildHashmon, onCatchComplete, isVisible }) => {
  const [animationPhase, setAnimationPhase] = useState('idle') // idle, throwing, shaking, result
  const [catchResult, setCatchResult] = useState(null)
  const [message, setMessage] = useState('')
  const [showSparkles, setShowSparkles] = useState(false)
  const [pokeballThrown, setPokeballThrown] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setMessage('Drag the Pokeball to throw it!')
      setAnimationPhase('idle')
      setPokeballThrown(false)
    }
  }, [isVisible])


  const calculateCatchSuccess = () => {
    if (!wildHashmon) return false
    
    let catchRate = 0.7 // Base 70% catch rate
    
    // Adjust based on level (higher level = harder to catch)
    catchRate -= (wildHashmon.level - 1) * 0.05
    
    // Adjust based on rarity
    switch (wildHashmon.rarity) {
      case 'legendary':
        catchRate -= 0.4
        break
      case 'rare':
        catchRate -= 0.2
        break
      case 'uncommon':
        catchRate -= 0.1
        break
    }
    
    // Adjust based on current HP (lower HP = easier to catch)
    const hpPercentage = wildHashmon.stats.hp / wildHashmon.maxStats.hp
    catchRate += (1 - hpPercentage) * 0.3
    
    catchRate = Math.max(0.1, Math.min(0.9, catchRate)) // Between 10% and 90%
    
    return Math.random() < catchRate
  }

  const resetAnimation = () => {
    setAnimationPhase('idle')
    setCatchResult(null)
    setMessage('')
    setShowSparkles(false)
    setPokeballThrown(false)
  }

  const getMessageStyle = () => {
    const baseStyle = {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      margin: '20px 0',
      padding: '10px 20px',
      borderRadius: '10px',
      transition: 'all 0.3s ease'
    }

    if (catchResult === true) {
      return {
        ...baseStyle,
        color: '#00ff00',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        border: '2px solid #00ff00',
        animation: 'successPulse 0.5s ease-in-out infinite alternate'
      }
    } else if (catchResult === false) {
      return {
        ...baseStyle,
        color: '#ff4444',
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        border: '2px solid #ff4444'
      }
    } else {
      return {
        ...baseStyle,
        color: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '2px solid #ffffff'
      }
    }
  }

  if (!isVisible) return null

  return (
    <div className="catch-animation-container">
      <style jsx>{`
        @keyframes successPulse {
          0% { transform: scale(1); box-shadow: 0 0 10px #00ff00; }
          100% { transform: scale(1.05); box-shadow: 0 0 20px #00ff00; }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        
        .catch-animation-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .wild-hashmon-display {
          margin-bottom: 40px;
          text-align: center;
        }
        
        .wild-hashmon-display h3 {
          font-size: 2rem;
          margin-bottom: 10px;
          color: #ffffff;
        }
        
        .wild-hashmon-display .level {
          font-size: 1.2rem;
          color: #cccccc;
        }
        
        .sparkles {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        
        .sparkle {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #ffd700;
          border-radius: 50%;
          animation: sparkle 1s ease-in-out infinite;
        }
        
        .sparkle:nth-child(1) { top: -50px; left: -50px; animation-delay: 0s; }
        .sparkle:nth-child(2) { top: -50px; right: -50px; animation-delay: 0.2s; }
        .sparkle:nth-child(3) { bottom: -50px; left: -50px; animation-delay: 0.4s; }
        .sparkle:nth-child(4) { bottom: -50px; right: -50px; animation-delay: 0.6s; }
        .sparkle:nth-child(5) { top: 0; left: -80px; animation-delay: 0.8s; }
        .sparkle:nth-child(6) { top: 0; right: -80px; animation-delay: 1s; }
      `}</style>

      {/* Wild HashMon Display */}
      <div className="wild-hashmon-display">
        <h3>{wildHashmon?.name}</h3>
        <div className="level">Level {wildHashmon?.level}</div>
        <div 
          className="mx-auto mt-4 p-4 rounded-xl"
          style={{ 
            background: `linear-gradient(135deg, ${wildHashmon?.type ? HASHMON_TYPES[wildHashmon.type].color : '#666'}20, ${wildHashmon?.type ? HASHMON_TYPES[wildHashmon.type].color : '#666'}40)`,
            boxShadow: `0 0 40px ${wildHashmon?.type ? HASHMON_TYPES[wildHashmon.type].color : '#666'}40`,
            border: '2px solid rgba(255,255,255,0.1)'
          }}
        >
          <HashMonPixel 
            type={wildHashmon?.type || 'normal'} 
            isShiny={wildHashmon?.isShiny}
            size="large"
          />
        </div>
      </div>

             {/* Animation Pokeball */}
             {pokeballThrown && (
               <Pokeball 
                 isThrowing={animationPhase === 'throwing'}
                 isCatching={false}
                 catchResult={catchResult}
                 onThrow={() => {}}
                 onAnimationComplete={() => {}}
               />
             )}

      {/* Catch Message */}
      <div style={getMessageStyle()}>
        {message}
      </div>

      {/* Sparkles for successful catch */}
      {showSparkles && (
        <div className="sparkles">
          <div className="sparkle"></div>
          <div className="sparkle"></div>
          <div className="sparkle"></div>
          <div className="sparkle"></div>
          <div className="sparkle"></div>
          <div className="sparkle"></div>
        </div>
      )}

      {/* Catch Rate Info */}
      {wildHashmon && animationPhase === 'throwing' && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          textAlign: 'center',
          color: '#cccccc',
          fontSize: '0.9rem'
        }}>
          <p>Catch Rate: {Math.round(calculateCatchSuccess() * 100)}%</p>
          <p>Level {wildHashmon.level} • {wildHashmon.rarity} • {wildHashmon.type}</p>
        </div>
      )}
    </div>
  )
}

export default CatchAnimation
