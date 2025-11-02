import React from 'react'

const HashMonPixel = ({ type, isShiny = false, size = 'normal' }) => {
  const getPixelArt = (type) => {
    const pixelStyles = {
      width: size === 'large' ? '80px' : size === 'small' ? '40px' : '60px',
      height: size === 'large' ? '80px' : size === 'small' ? '40px' : '60px',
      imageRendering: 'pixelated',
      border: '2px solid rgba(255,255,255,0.3)',
      borderRadius: '8px'
    }

    switch (type) {
      case 'fire':
        return (
          <div style={{
            ...pixelStyles,
            background: 'linear-gradient(45deg, #ff4500, #ff6347)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Simple fire pixel art */}
            <div style={{
              width: '20px',
              height: '30px',
              background: isShiny ? 'linear-gradient(45deg, #ffd700, #ffed4e)' : 'linear-gradient(45deg, #ff0000, #ff4500)',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '5px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '8px',
                height: '15px',
                background: isShiny ? '#ffff00' : '#ff4500',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
              }}></div>
            </div>
          </div>
        )
      
      case 'water':
        return (
          <div style={{
            ...pixelStyles,
            background: 'linear-gradient(45deg, #4169e1, #1e90ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Simple water pixel art */}
            <div style={{
              width: '24px',
              height: '24px',
              background: isShiny ? 'linear-gradient(45deg, #87ceeb, #b0e0e6)' : 'linear-gradient(45deg, #0000ff, #4169e1)',
              borderRadius: '50%',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '6px',
                width: '12px',
                height: '8px',
                background: isShiny ? '#ffffff' : '#87ceeb',
                borderRadius: '50%'
              }}></div>
            </div>
          </div>
        )
      
      case 'grass':
        return (
          <div style={{
            ...pixelStyles,
            background: 'linear-gradient(45deg, #228b22, #32cd32)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Simple grass pixel art */}
            <div style={{
              width: '20px',
              height: '28px',
              background: isShiny ? 'linear-gradient(45deg, #90ee90, #98fb98)' : 'linear-gradient(45deg, #228b22, #32cd32)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '4px',
                left: '8px',
                width: '4px',
                height: '20px',
                background: isShiny ? '#ffff00' : '#228b22'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '4px',
                width: '4px',
                height: '16px',
                background: isShiny ? '#ffff00' : '#228b22',
                transform: 'rotate(-15deg)'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '12px',
                width: '4px',
                height: '16px',
                background: isShiny ? '#ffff00' : '#228b22',
                transform: 'rotate(15deg)'
              }}></div>
            </div>
          </div>
        )
      
      case 'electric':
        return (
          <div style={{
            ...pixelStyles,
            background: 'linear-gradient(45deg, #ffd700, #ffff00)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Simple electric pixel art */}
            <div style={{
              width: '16px',
              height: '24px',
              background: isShiny ? '#ffffff' : '#ffd700',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '2px',
                left: '6px',
                width: '4px',
                height: '6px',
                background: isShiny ? '#ffd700' : '#ffff00',
                transform: 'rotate(45deg)'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                width: '4px',
                height: '8px',
                background: isShiny ? '#ffd700' : '#ffff00'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '6px',
                width: '4px',
                height: '6px',
                background: isShiny ? '#ffd700' : '#ffff00',
                transform: 'rotate(-45deg)'
              }}></div>
            </div>
          </div>
        )
      
      case 'dark':
        return (
          <div style={{
            ...pixelStyles,
            background: 'linear-gradient(45deg, #2f2f2f, #000000)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Simple dark pixel art */}
            <div style={{
              width: '20px',
              height: '20px',
              background: isShiny ? 'linear-gradient(45deg, #4a4a4a, #2f2f2f)' : 'linear-gradient(45deg, #000000, #2f2f2f)',
              borderRadius: '50%',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                width: '8px',
                height: '8px',
                background: isShiny ? '#ffd700' : '#ffffff',
                borderRadius: '50%'
              }}></div>
            </div>
          </div>
        )
      
      default:
        return (
          <div style={{
            ...pixelStyles,
            background: 'linear-gradient(45deg, #808080, #a9a9a9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            ?
          </div>
        )
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {getPixelArt(type)}
      {isShiny && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          fontSize: '12px',
          animation: 'spin 2s linear infinite'
        }}>
          ✨
        </div>
      )}
    </div>
  )
}

export default HashMonPixel
