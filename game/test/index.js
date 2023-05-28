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
    constructor(x, y, radius, color, velocity, angle) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.angle = angle
    }

    draw() {
        c.beginPath()
        c.save()
        c.translate(this.x, this.y)
        c.rotate(this.angle)
        c.fillStyle = this.color
        c.fillRect(0, 0, this.radius*10, this.radius)
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
    constructor(x, y, damage, color, velocity) {
        this.x = x
        this.y = y
        this.damage = damage
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.font = `${Math.round(this.damage * 2)}px arial`
        c.fillStyle = this.color
        c.fillText(this.damage, this.x, this.y)
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

        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}

let animationId
let score = 0
let upgradeScore = 1000
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
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
                score += 10
                scoreEl.innerHTML = score

                let damage = Math.round(Math.random()*2 + 5)
                damagePopups.push(new DamagePopup(enemy.x, enemy.y, damage, "red", {x: 0, y: 0}))
                for (let i = 0; i < Math.min(20, enemy.radius); i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3}))
                }
                if (enemy.radius > 10 + damage) {
                    gsap.to(enemy, {
                        radius: enemy.radius - damage
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                } else {
                    score += 25
                    scoreEl.innerHTML = score

                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
            }
            if (score >= upgradeScore) {
                cancelAnimationFrame(animationId)
                upgradeModal.style.display = 'flex'
                upgradeScore += 1000
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
addEventListener('mousedown', (event) => {
    console.log("mousedown")
    mousedown = true
    // const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
    // const velocity = {
    //     x: Math.cos(angle) * 40,
    //     y: Math.sin(angle) * 40
    // }
    // projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity, angle))
})

addEventListener('mouseup', () => {
    console.log("mouseup")
    mousedown = false
})

addEventListener('mousemove', (event) => {
    mousex = event.clientX
    mousey = event.clientY
})

let fireCooldown = 100
let recoil = 40
let recoilRecovery = 20 / 30
let recoilCurr = 0
let recoilMax = 400
let recoilCooldown = 0
function runGame() {
    setInterval(() => {
        difficulty += 0.00005
        fireCooldown -= 1
        recoilCooldown -= 1
        if (recoilCurr < recoilRecovery) {
            recoilCurr = 0
        } else {
            recoilCurr -= recoilRecovery
        }
        if (recoilCooldown <= 0) {
            recoilCurr = 0
        }
        if (mousedown && fireCooldown <= 0) {
            console.log("fire")
            const angle = Math.atan2(mousey - canvas.height / 2, mousex - canvas.width / 2) + 
                (Math.random() - 0.5) * 0.0025 * recoilCurr +
                (Math.random() - 0.5) * 0.01
            const velocity = {
                x: Math.cos(angle) * 40,
                y: Math.sin(angle) * 40
            }
            projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity, angle))
            fireCooldown = 30
            if (recoilCurr < recoilMax - recoil) {
                recoilCurr += recoil
            } else {
                recoilCurr = recoilMax
            }
            recoilCooldown = 3 * fireCooldown
        }
    }, 1)
}

startGameBtn.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    runGame()
    startGameModal.style.display = 'none'
})

upgradeModal.style.display = 'none'
