import Phaser from 'phaser'

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' })
    
    this.battleData = null
    this.playerHashmon = null
    this.aiOpponent = null
    this.battleUI = null
    this.animations = {}
    this.particles = {}
    this.isPaused = false
  }

  preload() {
    // Create placeholder graphics for HashMons
    this.load.image('placeholder', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    
    // Create battle background
    this.load.image('battle-bg', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    
    // Create particle textures
    this.load.image('particle', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
  }

  create() {
    const { width, height } = this.cameras.main

    // Create battle background
    this.createBattleBackground(width, height)
    
    // Create battle arena
    this.createBattleArena(width, height)
    
    // Create particle systems
    this.createParticleSystems()
    
    // Initialize battle UI
    this.createBattleUI()
    
    // Start battle animation
    this.startBattleIntro()
  }

  setBattleData(battleData) {
    this.battleData = battleData
    this.playerHashmon = battleData.playerHashmon
    this.aiOpponent = battleData.aiOpponent
    
    // Create HashMon sprites
    this.createHashmonSprites()
    
    // Update UI with battle data
    this.updateBattleUI()
  }

  createBattleBackground(width, height) {
    // Create gradient background
    const graphics = this.add.graphics()
    
    // Draw gradient background
    graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1)
    graphics.fillRect(0, 0, width, height)
    
    // Add stars
    for (let i = 0; i < 100; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 0.8)
      )
      
      // Twinkling animation
      this.tweens.add({
        targets: star,
        alpha: { from: 0.3, to: 1 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1
      })
    }
  }

  createBattleArena(width, height) {
    // Create battle platform
    const platform = this.add.graphics()
    platform.fillStyle(0x2c3e50, 0.8)
    platform.fillRoundedRect(width * 0.1, height * 0.6, width * 0.8, height * 0.3, 20)
    
    // Add platform glow
    platform.lineStyle(4, 0x3498db, 0.5)
    platform.strokeRoundedRect(width * 0.1, height * 0.6, width * 0.8, height * 0.3, 20)
    
    // Create energy orbs
    this.createEnergyOrbs(width, height)
  }

  createEnergyOrbs(width, height) {
    // Create floating energy orbs around the arena
    const orbPositions = [
      { x: width * 0.15, y: height * 0.3 },
      { x: width * 0.85, y: height * 0.3 },
      { x: width * 0.3, y: height * 0.2 },
      { x: width * 0.7, y: height * 0.2 },
      { x: width * 0.5, y: height * 0.1 }
    ]
    
    orbPositions.forEach((pos, index) => {
      const orb = this.add.circle(pos.x, pos.y, 15, 0x3498db, 0.6)
      orb.setBlendMode(Phaser.BlendModes.ADD)
      
      // Floating animation
      this.tweens.add({
        targets: orb,
        y: pos.y - 20,
        duration: 2000 + (index * 200),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
      
      // Pulsing animation
      this.tweens.add({
        targets: orb,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 1500 + (index * 100),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    })
  }

  createHashmonSprites() {
    if (!this.playerHashmon || !this.aiOpponent) return
    
    const { width, height } = this.cameras.main
    
    // Player HashMon (left side)
    this.playerSprite = this.add.circle(
      width * 0.25, height * 0.7,
      60,
      this.getTypeColor(this.playerHashmon.type1),
      0.8
    )
    
    // Add HashMon emoji/icon
    this.playerIcon = this.add.text(
      width * 0.25, height * 0.7,
      this.getTypeEmoji(this.playerHashmon.type1),
      { fontSize: '48px', fontFamily: 'Arial' }
    ).setOrigin(0.5)
    
    // AI Opponent (right side)
    this.aiSprite = this.add.circle(
      width * 0.75, height * 0.7,
      60,
      this.getTypeColor(this.aiOpponent.type1),
      0.8
    )
    
    this.aiIcon = this.add.text(
      width * 0.75, height * 0.7,
      this.getTypeEmoji(this.aiOpponent.type1),
      { fontSize: '48px', fontFamily: 'Arial' }
    ).setOrigin(0.5)
    
    // Add entrance animations
    this.playerSprite.setScale(0)
    this.aiSprite.setScale(0)
    
    this.tweens.add({
      targets: [this.playerSprite, this.playerIcon],
      scaleX: 1,
      scaleY: 1,
      duration: 1000,
      ease: 'Back.easeOut',
      delay: 500
    })
    
    this.tweens.add({
      targets: [this.aiSprite, this.aiIcon],
      scaleX: 1,
      scaleY: 1,
      duration: 1000,
      ease: 'Back.easeOut',
      delay: 1000
    })
  }

  createParticleSystems() {
    // Create particle manager
    this.particles = {
      explosion: this.add.particles(0, 0, 'particle', {
        speed: { min: 50, max: 150 },
        scale: { start: 0.5, end: 0 },
        lifespan: 1000,
        quantity: 20,
        tint: [0xff6b6b, 0xffa726, 0x66bb6a, 0x42a5f5]
      }),
      
      heal: this.add.particles(0, 0, 'particle', {
        speed: { min: 20, max: 80 },
        scale: { start: 0.3, end: 0 },
        lifespan: 2000,
        quantity: 10,
        tint: [0x4caf50, 0x8bc34a, 0xcddc39],
        gravityY: -100
      }),
      
      damage: this.add.particles(0, 0, 'particle', {
        speed: { min: 100, max: 200 },
        scale: { start: 0.4, end: 0 },
        lifespan: 800,
        quantity: 15,
        tint: [0xf44336, 0xff5722, 0xff9800]
      })
    }
    
    // Initially stop all particles
    Object.values(this.particles).forEach(emitter => emitter.stop())
  }

  createBattleUI() {
    const { width, height } = this.cameras.main
    
    // Battle UI container
    this.battleUI = this.add.container(0, 0)
    
    // Health bars background
    const playerHPBg = this.add.rectangle(width * 0.1, height * 0.15, width * 0.35, 20, 0x000000, 0.5)
    const aiHPBg = this.add.rectangle(width * 0.9, height * 0.15, width * 0.35, 20, 0x000000, 0.5)
    
    // Health bars
    this.playerHPBar = this.add.rectangle(width * 0.1, height * 0.15, width * 0.35, 20, 0x4caf50, 0.8)
    this.aiHPBar = this.add.rectangle(width * 0.9, height * 0.15, width * 0.35, 20, 0x4caf50, 0.8)
    
    // Name labels
    this.playerName = this.add.text(width * 0.1, height * 0.08, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0, 0.5)
    
    this.aiName = this.add.text(width * 0.9, height * 0.08, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(1, 0.5)
    
    // Level labels
    this.playerLevel = this.add.text(width * 0.1, height * 0.12, '', {
      fontSize: '12px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0, 0.5)
    
    this.aiLevel = this.add.text(width * 0.9, height * 0.12, '', {
      fontSize: '12px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(1, 0.5)
    
    // Add all UI elements to container
    this.battleUI.add([
      playerHPBg, aiHPBg,
      this.playerHPBar, this.aiHPBar,
      this.playerName, this.aiName,
      this.playerLevel, this.aiLevel
    ])
  }

  updateBattleUI() {
    if (!this.playerHashmon || !this.aiOpponent) return
    
    // Update names
    this.playerName.setText(this.playerHashmon.name)
    this.aiName.setText(this.aiOpponent.name)
    
    // Update levels
    this.playerLevel.setText(`Lv. ${this.playerHashmon.level}`)
    this.aiLevel.setText(`Lv. ${this.aiOpponent.level}`)
    
    // Update health bars
    this.updateHealthBar(this.playerHPBar, this.playerHashmon.hp, this.playerHashmon.maxHp)
    this.updateHealthBar(this.aiHPBar, this.aiOpponent.hp, this.aiOpponent.maxHp)
  }

  updateHealthBar(bar, currentHP, maxHP) {
    const percentage = Math.max(0, currentHP / maxHP)
    const { width } = this.cameras.main
    
    // Animate health bar change
    this.tweens.add({
      targets: bar,
      width: width * 0.35 * percentage,
      duration: 500,
      ease: 'Power2'
    })
    
    // Change color based on health percentage
    let color = 0x4caf50 // Green
    if (percentage < 0.6) color = 0xff9800 // Orange
    if (percentage < 0.3) color = 0xf44336 // Red
    
    bar.setFillStyle(color, 0.8)
  }

  executeMove(playerMove, aiMove, result) {
    // Show move animations
    this.showMoveAnimation(playerMove, this.playerSprite, this.aiSprite)
    
    // Delay AI move
    this.time.delayedCall(1000, () => {
      this.showMoveAnimation(aiMove, this.aiSprite, this.playerSprite)
    })
    
    // Update UI after animations
    this.time.delayedCall(2000, () => {
      this.updateBattleUI()
      this.showDamageNumbers(result)
    })
  }

  showMoveAnimation(move, attacker, target) {
    const { x: attackerX, y: attackerY } = attacker
    const { x: targetX, y: targetY } = target
    
    // Move attacker forward
    this.tweens.add({
      targets: attacker,
      x: attackerX + (targetX > attackerX ? 50 : -50),
      duration: 300,
      yoyo: true,
      ease: 'Power2'
    })
    
    // Show move effect
    if (move.power > 0) {
      // Damage effect
      this.createDamageEffect(targetX, targetY, move.type)
    } else if (move.name === 'Restore') {
      // Heal effect
      this.createHealEffect(attackerX, attackerY)
    } else if (move.name === 'Defend') {
      // Defense effect
      this.createDefenseEffect(attackerX, attackerY)
    }
    
    // Screen shake for damage moves
    if (move.power > 0) {
      this.cameras.main.shake(200, 0.01)
    }
  }

  createDamageEffect(x, y, type) {
    // Create explosion particles
    this.particles.explosion.setPosition(x, y)
    this.particles.explosion.start()
    
    // Flash effect
    const flash = this.add.rectangle(x, y, 120, 120, 0xffffff, 0.8)
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 200,
      onComplete: () => flash.destroy()
    })
  }

  createHealEffect(x, y) {
    // Create heal particles
    this.particles.heal.setPosition(x, y)
    this.particles.heal.start()
    
    // Heal aura
    const aura = this.add.circle(x, y, 80, 0x4caf50, 0.3)
    this.tweens.add({
      targets: aura,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 1000,
      onComplete: () => aura.destroy()
    })
  }

  createDefenseEffect(x, y) {
    // Create shield effect
    const shield = this.add.circle(x, y, 80, 0x2196f3, 0.4)
    this.tweens.add({
      targets: shield,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0,
      duration: 800,
      onComplete: () => shield.destroy()
    })
  }

  showDamageNumbers(result) {
    const { width, height } = this.cameras.main
    
    // Show player damage
    if (result.playerDamage > 0) {
      const damageText = this.add.text(
        width * 0.75, height * 0.6,
        `-${result.playerDamage}`,
        { fontSize: '24px', color: '#f44336', fontFamily: 'Arial', fontStyle: 'bold' }
      ).setOrigin(0.5)
      
      this.tweens.add({
        targets: damageText,
        y: damageText.y - 50,
        alpha: 0,
        duration: 1000,
        onComplete: () => damageText.destroy()
      })
    }
    
    // Show AI damage
    if (result.aiDamage > 0) {
      const damageText = this.add.text(
        width * 0.25, height * 0.6,
        `-${result.aiDamage}`,
        { fontSize: '24px', color: '#f44336', fontFamily: 'Arial', fontStyle: 'bold' }
      ).setOrigin(0.5)
      
      this.tweens.add({
        targets: damageText,
        y: damageText.y - 50,
        alpha: 0,
        duration: 1000,
        onComplete: () => damageText.destroy()
      })
    }
  }

  showBattleResult(result) {
    const { width, height } = this.cameras.main
    
    // Create result overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
    
    // Result text
    const resultText = this.add.text(
      width / 2, height / 2,
      `${result.result.toUpperCase()}!`,
      { fontSize: '48px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold' }
    ).setOrigin(0.5)
    
    // XP gained text
    const xpText = this.add.text(
      width / 2, height / 2 + 60,
      `+${result.xpGained} XP`,
      { fontSize: '24px', color: '#ffd700', fontFamily: 'Arial' }
    ).setOrigin(0.5)
    
    // Level up text
    if (result.levelUp) {
      const levelUpText = this.add.text(
        width / 2, height / 2 + 100,
        `LEVEL UP! Now Level ${result.newLevel}`,
        { fontSize: '20px', color: '#4caf50', fontFamily: 'Arial', fontStyle: 'bold' }
      ).setOrigin(0.5)
      
      // Level up animation
      this.tweens.add({
        targets: levelUpText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 500,
        yoyo: true,
        repeat: 3,
        ease: 'Power2'
      })
    }
    
    // Celebration particles
    if (result.result === 'victory') {
      this.createCelebrationEffect(width / 2, height / 2)
    }
  }

  createCelebrationEffect(x, y) {
    // Create confetti particles
    for (let i = 0; i < 50; i++) {
      const confetti = this.add.rectangle(
        x + Phaser.Math.Between(-100, 100),
        y + Phaser.Math.Between(-100, 100),
        4, 8,
        Phaser.Math.RND.pick([0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3])
      )
      
      this.tweens.add({
        targets: confetti,
        y: confetti.y + 200,
        rotation: Math.PI * 4,
        alpha: 0,
        duration: 3000,
        ease: 'Power2',
        onComplete: () => confetti.destroy()
      })
    }
  }

  startBattleIntro() {
    const { width, height } = this.cameras.main
    
    // Battle start text
    const startText = this.add.text(
      width / 2, height / 2,
      'BATTLE START!',
      { fontSize: '36px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold' }
    ).setOrigin(0.5)
    
    // Intro animation
    startText.setScale(0)
    this.tweens.add({
      targets: startText,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: startText,
          alpha: 0,
          duration: 500,
          delay: 1000,
          onComplete: () => startText.destroy()
        })
      }
    })
  }

  togglePause() {
    this.isPaused = !this.isPaused
    
    if (this.isPaused) {
      this.scene.pause()
    } else {
      this.scene.resume()
    }
  }

  getTypeColor(type) {
    const colors = {
      'Fire': 0xff6b6b,
      'Water': 0x4ecdc4,
      'Grass': 0x96ceb4,
      'Electric': 0xffd93d,
      'Psychic': 0xc44569,
      'Fighting': 0xfeca57,
      'Dark': 0x2c2c54,
      'Steel': 0x74b9ff,
      'Normal': 0xddd6fe
    }
    return colors[type] || 0x74b9ff
  }

  getTypeEmoji(type) {
    const emojis = {
      'Fire': '🔥',
      'Water': '💧',
      'Grass': '🌿',
      'Electric': '⚡',
      'Psychic': '🔮',
      'Fighting': '👊',
      'Dark': '🌑',
      'Steel': '⚔️',
      'Normal': '⭐'
    }
    return emojis[type] || '⭐'
  }
}

