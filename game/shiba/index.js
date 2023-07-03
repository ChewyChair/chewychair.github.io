const canvas = document.
    querySelector('canvas');

const c = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width = innerWidth;
const CANVAS_HEIGHT = canvas.height = innerHeight;

class Shiba {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.z = 0;
        this.width = size;
        this.height = size;
        let img = new Image();
        this.img = img;
        img.src = "media/ShibaCombinedSpriteSheet.png";
        this.maxFrame = 5;
        this.currFrame = 0;
        this.row = 0;
        this.ticks = 0;
        let shadow = new Image();
        this.shadow = shadow;
        this.shadowCol = 0;
        shadow.src = "media/ShibaShadow.png";
        this.mode = "idle";
        this.resetMode();
        this.ball;
        let jump = new Audio("sfx/jump.wav");
        this.jump = jump;
        let bork = new Audio("sfx/bork.wav");
        this.bork = bork;
    }

    draw() {
        switch(this.mode) {
            case "chase":
                // fallthrough
            case "chaseBall":
                // fallthrough
            case "explore":
                this.drawMotion();
                break;
            case "idle":
                // fallthrough
            case "lie":
                // fallthrough
            case "exploreidle":
                this.drawStandard(15);
                break;
            case "sleep":
                this.drawStandard(25);
                break;
            default:
        }
    }

    drawMotion() {
        this.ticks++;
        if (this.ticks % 12 == 0) {
            this.currFrame++;
            if (this.currFrame > this.maxFrame) {
                this.currFrame = 0;
                this.jump.play();
            }
            if (this.currFrame < this.maxFrame / 2) this.z = 10 * (this.currFrame + 1);
            if (this.currFrame > this.maxFrame / 2) this.z = 10 * (5 - this.currFrame);
        }
        let col = this.currFrame % 6;

        c.drawImage(this.shadow, this.shadowCol * this.width, 0, this.width, this.height, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        c.drawImage(this.img, col * this.width, this.row * this.height, this.width, this.height, this.x - this.width / 2, this.y - this.z - this.height / 2, this.width, this.height);
    }

    drawStandard(staggerFrame) {
        this.ticks++;
        if (this.ticks % staggerFrame == 0) {
            this.currFrame++;
            if (this.currFrame > this.maxFrame) {
                this.currFrame = 0;
            }
        }
        let col = this.currFrame % 6;

        c.drawImage(this.shadow, this.shadowCol * this.width, 0, this.width, this.height, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        c.drawImage(this.img, col * this.width, this.row * this.height, this.width, this.height, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }

    update() {
        if (mousedown) {
            if ((getDistanceFromCursor(this) < 128)  && !this.clicked) {
                this.bork.play();
                this.clicked = true;
                hearts.push(new Heart(this.x - 64 + Math.random() * 128, this.y - 32 + Math.random() * 64, 64, {x: ((Math.random() - 1) * 2), y: -3 - Math.random() * 3}));
                this.clickCounter++;
            }
        } else {
            this.clicked = false;
        }
        if (this.mode != "lie" && this.clickCounter == 10) {
            this.resetMode();
            this.mode = "lie";
        }
        switch(this.mode) {
            case "chase":
                this.chase(4 + Math.random() * 4, 2 + Math.random() * 2);
                break;
            case "idle":
                this.idle();
                break;
            case "lie":
                this.lie();
                break;
            case "sleep":
                this.sleep();
                break;
            case "chaseBall":
                this.chaseBall(4 + Math.random() * 4, 2 + Math.random() * 2);
                break;
            case "explore":
                this.explore(this.destX, this.destY, 4 + Math.random() * 4, 2 + Math.random() * 2);
                break;
            case "exploreidle":
                this.exploreidle();
                break;
            default:
        }
    }

    resetMode() {
        this.z = 0;
        this.currFrame = 0;
        this.chaseTicks = 0;
        this.chaseTimer = 300 + Math.random() * 100;
        this.idleTicks = 0;
        this.idleTimer = 100 + Math.random() * 200;
        this.idleProximityTicks = 0;
        this.idleProximityTimer = 300 + Math.random() * 100;
        this.lieTicks = 0;
        this.lieTimer = 200 + Math.random() * 200;
        this.clicked = false;
        this.row = 0;
        this.clickCounter = 0;
        this.proximityCounter = 0;
        this.sleepProximityTicks = 0;
        this.sleepProximityTimer = 600 + Math.random() * 400;
        this.isAsleep = false;
        this.destX = 0;
        this.destY = 0;
    }

    chase(dx, dy) {
        this.chaseTicks++;
        if (this.chaseTicks > this.chaseTimer) {
            this.resetMode();
            this.mode = "idle";
        } else {
            if (getDistanceFromCursor(this) < 128) {
                this.proximityCounter++;
                if (this.proximityCounter > 40) {
                    if (this.ball) {
                        this.ball = null;
                    }
                    this.resetMode();
                    this.mode = "idle";
                }
            } else {
                if (this.proximityCounter > 0) 
                this.proximityCounter--;
            }
            if (Math.abs(mousex -  this.x) < 16) {
            } else {
                if (this.x < mousex) {
                    this.row = 3;
                    this.shadowCol = 1;
                    this.x += dx;
                    if (this.ball) {
                        ball.x = this.x + 88;
                    }
                } else {
                    this.row = 2;
                    this.shadowCol = 0;
                    this.x -= dx;
                    if (this.ball) {
                        ball.x = this.x - 88;
                    }
                }
            }

            if (Math.abs(mousey -  this.y) < 16) {
            } else {
                if (this.y < mousey) {
                    this.y += dy;
                } else {
                    this.y -= dy;
                }
            }
            if (this.ball) {
                ball.y = this.y + 64;
                // get ball in front of mouth without breaking rendering order
                ball.z = this.z + 16;
                // stop ball from trying to fall out of mouth and causing bounce audio to play
                ball.dz = 0;
            }
        }
    }

    chaseBall(dx, dy) {
        let xReached = false;
        let yReached = false;
        if (Math.abs(ball.x - this.x) < 8) {
            xReached = true;
        } else {
            if (this.x < ball.x) {
                this.row = 3;
                this.shadowCol = 1;
                this.x += dx;
            } else {
                this.row = 2;
                this.shadowCol = 0;
                this.x -= dx;
            }
        }

        if (Math.abs(ball.y - this.y) < 8) {
            yReached = true;
        } else {
            if (this.y < ball.y) {
                this.y += dy;
            } else {
                this.y -= dy;
            }
        }

        if (xReached && yReached) {
            if (ball.z < 5) {
                this.resetMode();
                this.mode = "chase";
                this.ball = ball;
            } else {
                if (this.x < ball.x) {
                    this.row = 1;
                    this.shadowCol = 1;
                } else {
                    this.row = 0;
                    this.shadowCol = 0;
                }
            }
        }
    }

    explore(x, y, dx, dy) {
        let xReached = false;
        let yReached = false;
        if (this.clicked) {
            this.resetMode();
            this.mode = "chase";
        } else {
            if (this.proximityCounter > 0) 
            this.proximityCounter--;
        }
        
        if (Math.abs(x -  this.x) < 16) {
            xReached = true;
        } else {
            if (this.x < x) {
                this.row = 3;
                this.shadowCol = 1;
                this.x += dx;
            } else {
                this.row = 2;
                this.shadowCol = 0;
                this.x -= dx;
            }
        }

        if (Math.abs(y -  this.y) < 16) {
            yReached = true;
        } else {
            if (this.y < y) {
                this.y += dy;
            } else {
                this.y -= dy;
            }
        }

        if (xReached && yReached) {
            this.resetMode();
            this.mode = "exploreidle";
        }
    }

    idle() {
        if ((getDistanceFromCursor(this) < 128)) {
            this.idleProximityTicks++;
            if (this.idleProximityTicks > this.idleProximityTimer) {
                this.resetMode();
                this.mode = "lie";
            }
        } else {
            this.idleTicks++;
            if (this.idleTicks > this.idleTimer) {
                this.resetMode();
                this.mode = "chase";
            }
        }
        if (this.x < mousex) {
            this.row = 1;
            this.shadowCol = 1;
        } else {
            this.row = 0;
            this.shadowCol = 0;
        }
    }

    exploreidle() {
        if (this.clicked) {
            this.resetMode();
            this.mode = "chase";
        } else {
            this.idleTicks++;
            if (this.idleTicks > this.idleTimer) {
                this.resetMode();
                this.destX = Math.random() * CANVAS_WIDTH;
                if (this.destX < 128) this.destX = 128;
                if (this.destX > CANVAS_WIDTH - 128) this.destX = CANVAS_WIDTH - 128; 
                this.destY = Math.random() * CANVAS_HEIGHT;
                if (this.destY < 128) this.destY = 128;
                if (this.destY > CANVAS_HEIGHT - 128) this.destY = CANVAS_HEIGHT - 128; 
                this.mode = "explore";
            }
        }
        if (this.x < this.destX) {
            this.row = 1;
            this.shadowCol = 1;
        } else {
            this.row = 0;
            this.shadowCol = 0;
        }
    }

    lie() {
        if (this.clicked) {
            this.lieTicks = 0;
        }
        this.lieTicks++;
        this.sleepProximityTicks++;
        if (this.lieTicks > this.lieTimer) {
            this.resetMode();
            this.destX = Math.random() * CANVAS_WIDTH;
            if (this.destX < 128) this.destX = 128;
            if (this.destX > CANVAS_WIDTH - 128) this.destX = CANVAS_WIDTH - 128; 
            this.destY = Math.random() * CANVAS_HEIGHT;
            if (this.destY < 128) this.destY = 128;
            if (this.destY > CANVAS_HEIGHT - 128) this.destY = CANVAS_HEIGHT - 128; 
            this.mode = "explore";
        }
        if (this.sleepProximityTicks > this.sleepProximityTimer) {
            this.resetMode();
            this.mode = "sleep";
        }
        if (this.x < mousex) {
            this.row = 5;
            this.shadowCol = 3;
        } else {
            this.row = 4;
            this.shadowCol = 2;
        }
    }

    sleep() {
        if (!this.isAsleep) {
            if (this.x < mousex) {
                this.row = 7;
                this.shadowCol = 3;
            } else {
                this.row = 6;
                this.shadowCol = 2;
            }
            this.isAsleep = true;
        }
        if (this.clicked) {
            this.resetMode();
            this.mode = "lie";
        }
    }
}

// ik this is not the correct plural
let grasses = []
class Grass {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        let img = new Image();
        this.img = img;
        img.src = "media/Grass.png";
        this.maxFrame = 5;
        this.currFrame = 0;
        this.ticks = 0;
        this.staggerFrame = 10 + Math.round(Math.random() * 5);
    }

    draw() {
        this.ticks++;
        if (this.ticks % this.staggerFrame == 0) {
            this.currFrame++;
            if (this.currFrame > this.maxFrame) {
                this.currFrame = 0;
            }
        }
        let col = this.currFrame % 6;
        let row = Math.floor(this.currFrame / 6);

        c.drawImage(this.img, col * this.width, row * this.height, this.width, this.height, this.x - this.width, this.y - this.height, this.width, this.height);
    }
}

const friction = 0.98;
let hearts = []
class Heart {
    constructor(x, y, size, velocity) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        let img = new Image();
        this.img = img;
        img.src = "media/Heart.png";
        this.velocity = velocity;
    }

    draw() {
        c.drawImage(this.img, this.x - this.width, this.y - this.height);
    }

    update() {
        this.velocity.x *= friction
        this.velocity.y += 0.1
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.draw();
    }
}

// >:(
let dirts = []
class Dirt {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        let img = new Image();
        this.img = img;
        img.src = "media/Dirt.png";
        this.frame = Math.floor(Math.random() * 2.99);
    }

    draw() {
        c.drawImage(this.img, this.frame * this.width, 0, this.width, this.height, this.x - this.width, this.y - this.height, this.width, this.height);
    }
}

class Ball {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.z = 0;
        this.width = size;
        this.height = size;
        let img = new Image();
        this.img = img;
        img.src = "media/Ball.png";
        let shadow = new Image();
        this.shadow = shadow;
        shadow.src = "media/BallShadow.png";
        this.isGrabbed = false;
        this.dx = 0;
        this.dy = 0;
        this.dz = 0;
        this.isInMotion = false;
        let audio = new Audio("sfx/bounce.wav");
        this.audio = audio;
    }

    update() {
        // throw ball
        if (this.isGrabbed && !mousedown) {
            this.dx = mousex - this.x;
            this.dy = mousey - this.y;
            this.dz = 8 + 0.2*(this.dx**2 + this.dy**2)**0.5;
            this.isGrabbed = false;
            this.isInMotion = true;
            // movement threshold to trigger chaseball
            if (!Math.abs((this.dy**2 + this.dx**2)**0.5) < 1) {
                if (shiba.mode != "sleep") {
                    shiba.mode = "chaseBall";
                }
            }
        }
        // grab ball
        if ((getDistanceFromCursor(this) < 128) && mousedown) {
            this.x = mousex;
            this.y = mousey;
            this.isGrabbed = true;
            this.isInMotion = false;
        } else {
            // standard update
            // set isInMotion flag
            if (Math.abs((this.dy**2 + this.dx**2)**0.5) < 1) {
                this.isInMotion = false;
            }
            // bounce off borders
            if (this.x < 0) {
                this.x = 0;
                this.dx = -this.dx;
            }
            if (this.y < 0) {
                this.y = 0;
                this.dy = -this.dy;
            } 
            if (this.x > CANVAS_WIDTH) {
                this.x = CANVAS_WIDTH;
                this.dx = -this.dx;
            }
            if (this.y > CANVAS_HEIGHT) {
                this.y = CANVAS_HEIGHT;
                this.dy = -this.dy;
            }
            this.z += this.dz;
            if (this.z < 0) {
                if (this.z > - 2) {
                    this.z = 0;
                } else {
                    this.z = -this.z;
                    this.audio.play();
                }
                this.dz = -0.7*this.dz;
            }
            
            this.x += this.dx;
            this.y += this.dy;
            // friction
            this.dx *= 0.95;
            this.dy *= 0.95;
            this.dz *= 0.95;
            // gravity
            this.dz -= 1;
        }
    }

    draw() {
        c.drawImage(this.shadow, 0, 0, this.width, this.height, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        c.drawImage(this.img, 0, 0, this.width, this.height, this.x - this.width / 2, this.y - this.height / 2 - this.z, this.width, this.height);
    }
}

function getDistanceFromCursor(object) {
    return ((mousex - object.x) ** 2 + (mousey - object.y) ** 2) ** 0.5; 
}

const x = canvas.width / 2
const y = canvas.height / 2

function spawnGrassAndDirt() {
    for (let i = 0; i < 20 + Math.random() * 10; i++) {
        grass = new Grass(Math.random() * CANVAS_WIDTH + 32, Math.random() * CANVAS_HEIGHT, 64);
        grasses.push(grass);
    }
    for (let i = 0; i < 3 + Math.random() * 2; i++) {
        dirt = new Dirt(CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH / 2 + 128, CANVAS_HEIGHT / 4 + Math.random() * CANVAS_HEIGHT / 2, 256);
        dirts.push(dirt);
    }
}

function drawDirt() {
    dirts.forEach((dirt) => {
        dirt.draw();
    })
}

function drawBackground() {
    // forgot to take note of rendering order so this is a stopgap solution
    // 8 is custom offset if not ball will appear incorrectly
    if (ball.y + ball.height / 2 <= shiba.y + shiba.height / 2 - 8) {
        grasses.forEach((grass) => {
            if ((grass.y + grass.height / 2 <= shiba.y + shiba.height / 2) && (grass.y + grass.height / 2 <= ball.y + ball.height *0.75)) {
                grass.draw();
            }
        })
        ball.draw();
        grasses.forEach((grass) => {
            if ((grass.y + grass.height / 2 <= shiba.y + shiba.height / 2) && (grass.y + grass.height / 2 >= ball.y + ball.height *0.75)) {
                grass.draw();
            }
        })
    } else {
        grasses.forEach((grass) => {
            if (grass.y + grass.height / 2 <= shiba.y + shiba.height / 2) {
                grass.draw();
            }
        })
    }
}

function drawForeground() {
    // forgot to take note of rendering order so this is a stopgap solution
    if (ball.y + ball.height / 2 >= shiba.y + shiba.height / 2 - 8) {
        grasses.forEach((grass) => {
            if ((grass.y + grass.height / 2 >= shiba.y + shiba.height / 2) && (grass.y + grass.height / 2 <= ball.y + ball.height *0.75)) {
                grass.draw();
            }
        })
        ball.draw();
        grasses.forEach((grass) => {
            if ((grass.y + grass.height / 2 >= shiba.y + shiba.height / 2) && (grass.y + grass.height / 2 >= ball.y + ball.height *0.75)) {
                grass.draw();
            }
        })
    } else {
        grasses.forEach((grass) => {
            if (grass.y + grass.height / 2 >= shiba.y + shiba.height / 2) {
                grass.draw();
            }
        })
    }
}

function drawHearts() {
    hearts.forEach((heart, heartIndex) => {
        if (heart.velocity.y > 0) {
            hearts.splice(heartIndex, 1)
        } else {
            heart.update()
        }
    })
}

function init() {
    shiba = new Shiba(x - 128, y - 128, 256);
    ball = new Ball(x - 64, y - 64, 128);
    spawnGrassAndDirt();
    animate();
}

function animate() {
    c.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    c.fillStyle = "green";
    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    shiba.update();
    ball.update();
    drawDirt();
    drawBackground();
    shiba.draw();
    drawForeground();
    drawHearts();
    requestAnimationFrame(animate);
}

let mousedown = false;
let mousex = 0;
let mousey = 0;

addEventListener('pointerdown', (event) => {
    mousex = event.clientX;
    mousey = event.clientY;
    mousedown = true;
})

addEventListener('pointerup', () => {
    mousedown = false;
})

addEventListener('pointerout', () => {
    mousedown = false;
})

addEventListener('pointermove', (event) => {
    mousex = event.clientX;
    mousey = event.clientY;
})

window.oncontextmenu = function(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
};

init();