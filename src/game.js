export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        this.lastTime = 0;
        this.running = false;

        // şimdilik basit player state
        this.player = {
            x: 100,
            y: 250,
            vx: 0,
            vy: 0,
            onGround: true
        };

        this.gravity = 0.6;
        this.groundY = 250;
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
        // basit gravity
        this.player.vy += this.gravity;
        this.player.y += this.player.vy;

        if (this.player.y >= this.groundY) {
            this.player.y = this.groundY;
            this.player.vy = 0;
            this.player.onGround = true;
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // zemin
        this.ctx.fillStyle = "green";
        this.ctx.fillRect(0, 350, this.canvas.width, 50);

        // geçici mavi karakter
        this.ctx.fillStyle = "blue";
        this.ctx.fillRect(this.player.x, this.player.y, 50, 50);
    }
}