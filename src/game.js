class PlayerMovement {
    constructor() {
        this.acceleration = 0.8;
        this.maxSpeed = 8;
        this.friction = 0.85;
        this.maxVelocity = 15;
    }

    applyMovementInput(player, keys, delta) {
        let directionInput = 0;
        if (keys.left) directionInput -= 1;
        if (keys.right) directionInput += 1;

        if (directionInput !== 0) {
            player.vx += directionInput * this.acceleration;
            player.vx = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, player.vx));
        } else {
            player.vx *= this.friction;
            if (Math.abs(player.vx) < 0.1) player.vx = 0;
        }

        player.x += player.vx;
    }

    applyGravity(player, gravity, delta) {
        player.vy += gravity;
        player.vy = Math.min(player.vy, this.maxVelocity);
        player.y += player.vy;
    }

    applyJump(player, keys, jumpState, jumpForce) {
        if (keys.jump && !jumpState.jumpPressed) {
            jumpState.jumpPressed = true;
            jumpState.jumpBufferTime = 100;
        }

        if (!keys.jump) {
            jumpState.jumpPressed = false;
            jumpState.maxJumpForce = jumpForce;
        }

        if (jumpState.jumpBufferTime > 0 && (player.onGround || jumpState.coyoteTime > 0)) {
            player.vy = jumpState.maxJumpForce;
            player.onGround = false;
            jumpState.jumpBufferTime = 0;
            jumpState.coyoteTime = 0;
        }

        if (keys.jump && player.vy < 0) {
            jumpState.maxJumpForce = Math.min(jumpState.maxJumpForce, player.vy);
        }
    }

    updateTimers(jumpState, delta) {
        jumpState.coyoteTime = Math.max(0, jumpState.coyoteTime - delta);
        jumpState.jumpBufferTime = Math.max(0, jumpState.jumpBufferTime - delta);
    }
}

class Physics {
    applyCollision(player, groundY) {
        if (player.y + player.height >= groundY) {
            player.y = groundY - player.height;
            player.vy = 0;
            player.onGround = true;
        } else {
            player.onGround = false;
        }
    }

    updateCoyoteTime(jumpState, player, delta) {
        if (player.onGround) {
            jumpState.coyoteTime = 100;
        }
    }
}

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
            onGround: false
        };

        this.jumpState = {
            jumpPressed: false,
            jumpBufferTime: 0,
            coyoteTime: 0,
            maxJumpForce: -12
        };

        this.constants = {
            gravity: 0.6,
            groundY: 350,
            jumpForce: -12
        };

        this.movement = new PlayerMovement();
        this.physics = new Physics();

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
        this.movement.applyMovementInput(this.player, this.keys, delta);
        this.movement.applyJump(this.player, this.keys, this.jumpState, this.constants.jumpForce);
        this.movement.updateTimers(this.jumpState, delta);
        this.movement.applyGravity(this.player, this.constants.gravity, delta);
        this.physics.applyCollision(this.player, this.constants.groundY);
        this.physics.updateCoyoteTime(this.jumpState, this.player, delta);
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