export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        this.lastTime = 0;
        this.running = false;

        this.keys = {
            left: false,
            right: false,
            jump: false
        };

        this.player = {
            x: 100,
            y: 350,
            vx: 0,
            vy: 0,
            width: 50,
            height: 50,
            speed: 4,
            jumpForce: -15,
            onGround: true
        };

        this.gravity = 0.6;
        this.groundY = 350;

        this.setupInput();
    }

    setupInput() {
        window.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") this.keys.left = true;
            if (e.key === "ArrowRight") this.keys.right = true;
            if (e.key === "ArrowUp") this.keys.jump = true;
        });

        window.addEventListener("keyup", (e) => {
            if (e.key === "ArrowLeft") this.keys.left = false;
            if (e.key === "ArrowRight") this.keys.right = false;
            if (e.key === "ArrowUp") this.keys.jump = false;
        });
    }

    start() {
        this.running = true;
        requestAnimationFrame(this.loop.bind(this));
    }

    loop(timestamp) {
        const delta = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(delta);
        this.render();

        if (this.running) {
            requestAnimationFrame(this.loop.bind(this));
        }
    }

    update(delta) {

        // Horizontal movement
        if (this.keys.left) {
            this.player.vx = -this.player.speed;
        } else if (this.keys.right) {
            this.player.vx = this.player.speed;
        } else {
            this.player.vx = 0;
        }

        this.player.x += this.player.vx;

        // Jump
        if (this.keys.jump && this.player.onGround) {
            this.player.vy = this.player.jumpForce;
            this.player.onGround = false;
        }

        // Gravity
        this.player.vy += this.gravity;
        this.player.y += this.player.vy;

        // Collision with ground
        if (this.player.y + this.player.height >= this.groundY) {
            this.player.y = this.groundY - this.player.height;
            this.player.vy = 0;
            this.player.onGround = true;
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Zemin
        this.ctx.fillStyle = "green";
        this.ctx.fillRect(0, 350, this.canvas.width, 50);

        // Player
        this.ctx.fillStyle = "blue";
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    }
}