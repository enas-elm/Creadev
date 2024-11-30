import GlobalContext from "../template/GlobalContext"
import Scene2D from "../template/Scene2D"
import { clamp, degToRad, distance2D, randomRange } from "../Utils/MathUtils"

class Bubble {
    constructor(context, x, y, radius, color) {
        this.context = context
        this.x = x
        this.y = y
        this.radius = radius

        if (color) {
            this.color = color;
        } else {
            const colors = ['red', 'yellow', 'blue'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        this.time = new GlobalContext().time

        /** speed */
        // this.vx = randomRange(-200, 200)
        // this.vy = randomRange(-200, 200)



        /** speed */
        this.baseVx = randomRange(-200, 200); // Vitesse horizontale de base
        this.baseVy = randomRange(-200, 200); // Vitesse verticale de base
        this.vx = this.baseVx;
        this.vy = this.baseVy;

        /** gravity */
        this.gx = 0
        this.gy = 0
    }

    draw() {
        this.context.beginPath()
        // this.context.fillStyle = this.color; 
        this.context.strokeStyle = this.color;
        this.context.arc(this.x, this.y, this.radius, 0, degToRad(360))
        this.context.fill()
        this.context.stroke()
        this.context.closePath()
    }

    update(width, height) {
        /** gravity bounce */
        this.gx = this.x > this.radius ? this.gx : 0
        this.gx = this.x < width - this.radius ? this.gx : 0
        // this.gy = this.y > this.radius ? this.gy : 0
        // this.gy = this.y < height - this.radius ? this.gy : 0

        this.x += (this.vx + this.gx) * this.time.delta / 1000
        this.y += (this.vy + this.gy) * this.time.delta / 1000

        /** bounce */
        // if (this.x < 0 || this.x > width) this.vx *= -1
        // if (this.y < 0 || this.y > height) this.vy *= -1

        /** bounce corrected */
        this.vx = this.x < this.radius ? Math.abs(this.vx) : this.vx
        this.vx = this.x > width - this.radius ? -Math.abs(this.vx) : this.vx
        // this.vy = this.y < this.radius ? Math.abs(this.vy) : this.vy
        // this.vy = this.y > height - this.radius ? -Math.abs(this.vy) : this.vy
    }
}

export default class SceneBouncingBubbles extends Scene2D {
    constructor(id) {
        super(id)

        /** debug */
        this.params = {
            speed: 1, // positif ou negatif
            threshold: 50,
            radius: 5,
            nBubbles: 3,
            gStrength: 300
        }
        if (!!this.debugFolder) {
            this.debugFolder.add(this.params, "threshold", 0, 200).name("Threshold")
            this.debugFolder.add(this.params, "radius", 0, 30, 0.1).name("Radius").onChange(() => {
                if (!!this.bubbles) {
                    this.bubbles.forEach(b => { b.radius = this.params.radius })
                }
            })
            this.debugFolder.add(this.params, "nBubbles", 3, 50).name('Bubble Number').onFinishChange(() => {
                this.generateBubbles()
            })
            this.debugFolder.add(this.params, "gStrength", 0, 400).name("Gravity Strength")

            this.debugFolder.add(this.params, "speed", -1, 1, 0.1).name("Speed").onChange(() => {
                if (!!this.bubbles) {
                    this.bubbles.forEach(b => {
                        const speedFactor = Math.abs(this.params.speed); // Facteur d'accélération (0 à 1)
                        const direction = Math.sign(this.params.speed); // Direction : -1, 0, ou 1

                        if (direction === 0) {
                            // Stopper les bulles
                            b.vx = 0;
                            b.vy = 0;
                        } else {
                            // Recalcule les vitesses à partir des valeurs initiales
                            b.vx = direction * b.baseVx * speedFactor;
                            b.vy = direction * b.baseVy * speedFactor;
                        }
                    });
                }
            });


            // this.debugFolder.add(this.params, "speed", -1, 1, 0.1).name("Speed").onChange(() => {
            //     if (!!this.bubbles) {
            //         this.bubbles.forEach(b => {
            //             // Ajustement des vitesses en fonction de la valeur de speed
            //             const speedFactor = Math.abs(this.params.speed); // Facteur d'accélération (0 à 1)
            //             const direction = Math.sign(this.params.speed); // Direction : -1 (reverse), 0 (stop), ou 1 (normal)

            //             // Si speed est 0, on arrête tout
            //             if (direction === 0) {
            //                 b.vx = 0;
            //                 b.vy = 0;
            //             } else {
            //                 // Ajustement de la vitesse avec direction et facteur
            //                 b.vx = direction * Math.abs(b.vx) * speedFactor;
            //                 b.vy = direction * Math.abs(b.vy) * speedFactor;
            //             }
            //         });
            //     }
            // });

            // this.debugFolder.add(this.params, "speed", -1, 1, 0.1).name("Speed").onChange(() => {
            //     if (!!this.bubbles) {
            //         this.bubbles.forEach(b => {
            //             // Ajustement des vitesses en fonction de la valeur de speed
            //             const speedFactor = Math.abs(this.params.speed); // Facteur d'accélération
            //             const direction = Math.sign(this.params.speed); // Direction : -1 (inversé), 0 (arrêt), ou 1 (normal)

            //             b.vx = direction * Math.abs(b.vx) * speedFactor;
            //             b.vy = direction * Math.abs(b.vy) * speedFactor;
            //         });
            //     }
            // });
        }

        /** device orientation */
        this.globalContext.useDeviceOrientation = true
        this.orientation = this.globalContext.orientation

        /** init */
        this.generateBubbles()
        this.draw()
    }

    generateBubbles() {
        /** generate bubbles */
        const colors = ['red', 'yellow', 'blue'];
        this.bubbles = []
        for (let i = 0; i < this.params.nBubbles; i++) {
            const x_ = this.width * Math.random()
            const y_ = this.height * Math.random()
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            const bubble_ = new Bubble(this.context, x_, y_, 5, randomColor)
            this.bubbles.push(bubble_)
        }
    }

    addBubble(x, y, color) {

        const bubble_ = new Bubble(this.context, x, y, this.params.radius, color)
        this.bubbles.push(bubble_)
        return bubble_
    }

    draw() {
        /** style */
        this.context.strokeStyle = this.color
        this.context.fillStyle = "black"
        this.context.lineWidth = 2
        this.context.lineCap = "round"

        /** draw */
        if (!!this.bubbles) {
            for (let i = 0; i < this.bubbles.length; i++) {
                const current_ = this.bubbles[i]
                for (let j = i; j < this.bubbles.length; j++) {
                    const next_ = this.bubbles[j]

                    if (distance2D(current_.x, current_.y, next_.x, next_.y) < this.params.threshold) {
                        this.context.beginPath()
                        this.context.moveTo(current_.x, current_.y)
                        this.context.lineTo(next_.x, next_.y)
                        this.context.stroke()
                        this.context.strokeStyle = 'white'
                        this.context.closePath()
                    }
                }
            }


            this.bubbles.forEach(b => {
                b.draw()
            })
        }
    }

    removeBubble(bubble) {
        // Dispose de la géométrie et du matériel (si utilisé dans Three.js)
        if (bubble.context) {
            bubble.context.clearRect(bubble.x - bubble.radius, bubble.y - bubble.radius, bubble.radius * 2, bubble.radius * 2);
        }

        // Supprime la bulle du tableau de bulles
        this.bubbles = this.bubbles.filter(b => b !== bubble);
    }

    update() {
        if (!!this.bubbles) {
            this.bubbles.forEach(b => {
                b.update(this.width, this.height)
            })
        }

        this.clear()
        this.draw()
    }

    resize() {
        super.resize()

        if (!!this.bubbles) {
            this.bubbles.forEach(b => {
                b.x = Math.max(0, Math.min(b.x, this.width))
                b.y = Math.max(0, Math.min(b.y, this.height))
            })
        }

        this.draw()
    }

    onDeviceOrientation() {
        let gx_ = this.orientation.gamma / 90
        let gy_ = this.orientation.beta / 90
        gx_ = clamp(gx_, -1, 1)
        gy_ = clamp(gy_, -1, 1)

        /** update bubbles */
        if (!!this.bubbles) {
            this.bubbles.forEach(b => {
                b.gx = gx_ * this.params.gStrength
                b.gy = gy_ * this.params.gStrength
            })
        }
    }
}