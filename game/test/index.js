const canvas = document.
    querySelector('canvas')

const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl')
const bigScoreEl = document.querySelector('#bigScoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const startGameModal = document.querySelector('#startGameModal')
const upgradeModal = document.querySelector('#upgradeModal')
const upgradeBtn1 = document.querySelector('#upgradeBtn1')
const upgradeBtn2 = document.querySelector('#upgradeBtn2')
const upgradeBtn3 = document.querySelector('#upgradeBtn3')

class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor(x, y, radius, length, color, velocity, angle, pierce) {
        this.x = x
        this.y = y
        this.radius = radius
        this.length = length
        this.color = color
        this.velocity = velocity
        this.angle = angle
        this.pierce = pierce
    }

    draw() {
        c.beginPath()
        c.save()
        c.translate(this.x, this.y)
        c.rotate(this.angle)
        c.fillStyle = this.color
        c.fillRect(0, 0, this.length, this.radius)
        c.restore()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.save()
        c.font = `${this.radius * 1.5}px arial`
        c.fillStyle = "white"
        c.fillText(Math.round(this.radius - 9), this.x - 0.8 * this.radius, this.y + 0.5 * this.radius)
        c.textAlign = "center"
        c.restore()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.98
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

class DamagePopup {
    constructor(x, y, damage, color, velocity, crit) {
        this.x = x
        this.y = y
        this.damage = damage
        this.color = color
        this.velocity = velocity
        this.alpha = 1
        this.crit = crit
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.font = `${Math.round(10 + this.damage * 0.5)}px arial`
        c.fillStyle = this.color
        if (this.crit == 1)  {
            c.fillText(this.damage + "!", this.x, this.y)
        } else {
            c.fillText(this.damage, this.x, this.y)
        }
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y += 0.00002
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        if (this.crit == 1) {
            this.alpha -= 0.0025
        } else {
            this.alpha -= 0.005
        }
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 15, 'white')
let projectiles = []
let particles = []
let enemies = []
let damagePopups = []

function init() {
    player = new Player(x, y, 15, 'white')
    projectiles = []
    particles = []
    enemies = []
    damagePopups = []
    difficulty = 1
    score = 0
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score
}

let difficulty = 1
let delay = 1000
function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * 15 * difficulty + 20

        let x
        let y

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() < canvas.width
            y = Math.random() * 0.5 ? 0 - radius : canvas.height + radius
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`

        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        delay -= 0.2
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, delay)
}

let animationId
let score = 0
let upgradeScore = 1000
let rawDamage = 7
let crit = 0.05
let critMult = 1.5
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    projectiles.forEach((projectile, index) => {
        projectile.update()

        if (projectile.x - projectile.radius > canvas.width || projectile.x - projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height || projectile.y - projectile.radius < 0) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }

    })
    enemies.forEach((enemy, index) => {
        enemy.update()

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
            startGameModal.style.display = 'flex'
            bigScoreEl.innerHTML = score
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            if (dist - enemy.radius - projectile.radius < 1) {

                let damage = Math.round(Math.random()*0.4*rawDamage + rawDamage)
                let isCrit = 0
                if (projectile.color == "red") {
                    isCrit = 1
                    damage *= critMult
                    damage = Math.round(damage)
                }
                damagePopups.push(new DamagePopup(enemy.x, enemy.y, damage, "red", {x: ((Math.random() - 0.5) * 0.5), y: 0.1}, isCrit))
                for (let i = 0; i < Math.min(20, enemy.radius); i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 0.2 *damage, enemy.color, {x: (Math.random() * 0.2) * -projectile.velocity.x, y: (Math.random() * 0.3 - 0.15) * -projectile.velocity.y}))
                }
                if (enemy.radius > 10 + damage) {
                    score += damage
                    scoreEl.innerHTML = score
                    gsap.to(enemy, {
                        radius: enemy.radius - damage
                    })
                } else {
                    score += Math.round(enemy.radius - 9)
                    scoreEl.innerHTML = score

                    for (let i = 0; i < Math.min(20, enemy.radius); i++) {
                        particles.push(new Particle(projectile.x, projectile.y, Math.random() * 0.2 *damage, enemy.color, {x: (Math.random() * 0.2) * projectile.velocity.x, y: (Math.random() * 0.3 - 0.15) * projectile.velocity.y}))
                    }

                    for (let i = 0; i < Math.min(20, enemy.radius); i++) {
                        particles.push(new Particle(projectile.x, projectile.y, Math.random() * 0.5 * enemy.radius, enemy.color, {x: (Math.random() - 0.5), y: (Math.random() - 0.5)}))
                    }

                    setTimeout(() => {
                        enemies.splice(index, 1)
                    }, 0)
                }
                if (projectile.pierce == 0) {
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                } else {
                    projectile.pierce -= 1
                }
            }
            if (score >= upgradeScore) {
                cancelAnimationFrame(animationId)
                upgradeModal.style.display = 'flex'
                upgradeScore *= 1.25
                upgradeScore += 300
            }
        })
        particles.forEach((particle, particleIndex) => {
            if (particle.alpha <= 0) {
                particles.splice(particleIndex, 1)
            } else {
                particle.update()
            }
        })
        damagePopups.forEach((damagePopup, damagePopupIndex) => {
            if (damagePopup.alpha <= 0) {
                damagePopups.splice(damagePopupIndex, 1)
            } else {
                damagePopup.update()
            }
        })
    })
}

let mousedown = false
let mousex = 0
let mousey = 0
addEventListener('pointerdown', (event) => {
    mousex = event.clientX
    mousey = event.clientY
    mousedown = true
})

addEventListener('pointerup', () => {
    mousedown = false
})

addEventListener('pointerout', () => {
    mousedown = false
})

// addEventListener('mousemove', (event) => {
//     mousex = event.clientX
//     mousey = event.clientY
// })

addEventListener('pointermove', (event) => {
    mousex = event.clientX
    mousey = event.clientY
})

let fireCurrCd = 0
let fireCooldown = 50
let fireRate = 1
let recoil = 40
let recoilRecovery = 20 / 30
let recoilCurr = 0
let recoilMax = 400
let recoilCooldown = 0
let recoilCooldownRate = 1
let projVel = 20
let projWidth = 3
let pierce = 0
let isGameRunning = 0
function runGame() {
    setInterval(() => {
        difficulty += 0.00005
        fireCurrCd -= fireRate
        recoilCooldown -= recoilCooldownRate
        if (recoilCurr < recoilRecovery) {
            recoilCurr = 0
        } else {
            recoilCurr -= recoilRecovery
        }
        if (recoilCooldown <= 0) {
            recoilCurr = 0
        }
        if (mousedown && fireCurrCd <= 0) {
            const angle = Math.atan2(mousey - canvas.height / 2, mousex - canvas.width / 2) + 
                (Math.random() - 0.5) * 0.0025 * recoilCurr +
                (Math.random() - 0.5) * 0.01
            const velocity = {
                x: Math.cos(angle) * projVel,
                y: Math.sin(angle) * projVel
            }
            let audio = new Audio('sfx/gunshot.mp3')
            if (Math.random() <= crit) {
                projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, projWidth, projVel * 2, "red", velocity, angle, pierce))
            } else {
                projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, projWidth, projVel * 2, "white", velocity, angle, pierce))
            }
            audio.play()
            fireCurrCd = fireCooldown
            if (recoilCurr < recoilMax - recoil) {
                recoilCurr += recoil
            } else {
                recoilCurr = recoilMax
            }
            recoilCooldown = 3 * fireCooldown / fireRate
        }
    }, 1)
}

startGameBtn.addEventListener('click', () => {
    difficulty = 1
    rawDamage = 6
    fireCurrCd = 0
    fireCooldown = 50
    fireRate = 1
    recoil = 40
    recoilRecovery = 20 / 30
    recoilCurr = 0
    recoilMax = 400
    recoilCooldown = 0
    recoilCooldownRate = 1
    crit = 0.05
    critMult = 1.5
    projVel = 20
    projWidth = 5
    pierce = 0
    upgradeScore = 300
    delay = 1000
    init()
    animate()
    if (isGameRunning == 0) {
        runGame()
        spawnEnemies()
        isGameRunning = 1
    }
    startGameModal.style.display = 'none'
})

upgradeBtn1.addEventListener('click', () => {
    rawDamage += 1
    projWidth += 0.25
    upgradeModal.style.display = 'none'
    animate()
})

// upgradeBtn1.addEventListener('click', () => {
//     rawDamage *= 2
//     projWidth += 1
//     projVel += 10
//     fireRate *= 0.5
//     crit += 0.25
//     critMult += 1
//     pierce += 1
//     upgradeModal.style.display = 'none'
//     animate()
// })

upgradeBtn2.addEventListener('click', () => {
    fireRate += 0.1
    crit += 0.01
    critMult += 0.05
    upgradeModal.style.display = 'none'
    animate()
})

upgradeBtn3.addEventListener('click', () => {
    recoil *= 0.95
    recoilMax *= 0.95
    recoilCooldownRate += 0.1
    upgradeModal.style.display = 'none'
    animate()
})

upgradeModal.style.display = 'none'

window.oncontextmenu = function(event) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    return false
};
