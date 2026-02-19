class PlayerMovement {
    constructor() {
        this.acceleration = 1.1;
        this.maxSpeed = 6.2;
        this.friction = 0.82;
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

class PlayerVisuals {
    constructor() {
        this.states = {
            idle: "idle",
            run: "run",
            jump: "jump",
            fall: "fall"
        };
        this.currentState = this.states.idle;
        this.runFrameIndex = 0;
        this.runFrameTimer = 0;
 codex/enhance-player-animations-and-state-management-6lpoum
        this.runFrameDuration = 90;

        this.runFrameDuration = 110;
 prototype-v1
        this.facing = 1;

        this.squashTimer = 0;
        this.squashDuration = 110;
 codex/enhance-player-animations-and-state-management-6lpoum
        this.squashAmount = 0.16;

        this.runCycle = 0;
        this.bobAmount = 2.5;
        this.leanAmount = 0.07;
        this.visualScale = 1.35;

        this.squashAmount = 0.18;
prototype-v1

        this.frames = {
            hero1: this.loadFrame("assets/hero1.png"),
            hero2: this.loadFrame("assets/hero2.png"),
            hero3: this.loadFrame("assets/hero3.png")
        };

        this.runFrames = [this.frames.hero1, this.frames.hero2, this.frames.hero3];
        this.idleFrame = this.frames.hero1;
        this.jumpFrame = this.frames.hero2;
        this.fallFrame = this.frames.hero3;
    }

    loadFrame(src) {
        const image = new Image();
        image.src = src;

        const frame = {
            image,
            canvas: null,
            crop: { x: 0, y: 0, width: 1, height: 1 }
        };

        image.onload = () => {
            frame.canvas = this.createCleanFrameCanvas(image);
            frame.crop = this.findNonBackgroundCrop(frame.canvas) || {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height
            };
        };

        return frame;
    }

    createCleanFrameCanvas(image) {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(image, 0, 0);

        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = pixels.data;
        const baseR = data[0];
        const baseG = data[1];
        const baseB = data[2];
        const threshold = 30;

        for (let i = 0; i < data.length; i += 4) {
            const distance =
                Math.abs(data[i] - baseR) +
                Math.abs(data[i + 1] - baseG) +
                Math.abs(data[i + 2] - baseB);

            if (distance < threshold) {
                data[i + 3] = 0;
            }
        }

        ctx.putImageData(pixels, 0, 0);
        return canvas;
    }

    findNonBackgroundCrop(canvas) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const { width, height } = canvas;
        const data = ctx.getImageData(0, 0, width, height).data;

        let minX = width;
        let minY = height;
        let maxX = -1;
        let maxY = -1;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                if (data[idx + 3] > 0) {
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        if (maxX < minX || maxY < minY) {
            return null;
        }

        return {
            x: minX,
            y: minY,
            width: maxX - minX + 1,
            height: maxY - minY + 1
        };
    }

    update(player, wasOnGround, delta) {
        this.updateFacing(player);
        this.updateState(player);
 codex/enhance-player-animations-and-state-management-6lpoum
        this.updateRunAnimation(player, delta);

        this.updateRunAnimation(delta);
 prototype-v1
        this.updateLandingSquash(player, wasOnGround, delta);
    }

    updateFacing(player) {
        if (player.vx > 0.1) this.facing = 1;
        else if (player.vx < -0.1) this.facing = -1;
    }

    updateState(player) {
        if (!player.onGround) {
            this.currentState = player.vy < 0 ? this.states.jump : this.states.fall;
            return;
        }

        if (Math.abs(player.vx) > 0.2) {
            this.currentState = this.states.run;
            return;
        }

        this.currentState = this.states.idle;
    }

 codex/enhance-player-animations-and-state-management-6lpoum
    updateRunAnimation(player, delta) {
        if (this.currentState !== this.states.run) {
            this.runFrameIndex = 0;
            this.runFrameTimer = 0;
            this.runCycle = 0;
            return;
        }

        const speedFactor = Math.min(1, Math.abs(player.vx) / 6);
        const frameDuration = this.runFrameDuration - speedFactor * 25;

        this.runFrameTimer += delta;
        if (this.runFrameTimer >= frameDuration) {
            this.runFrameTimer = 0;
            this.runFrameIndex = (this.runFrameIndex + 1) % this.runFrames.length;
        }

        this.runCycle += (delta / 1000) * (6 + speedFactor * 5);

    updateRunAnimation(delta) {
        if (this.currentState !== this.states.run) {
            this.runFrameIndex = 0;
            this.runFrameTimer = 0;
            return;
        }

        this.runFrameTimer += delta;
        if (this.runFrameTimer >= this.runFrameDuration) {
            this.runFrameTimer = 0;
            this.runFrameIndex = (this.runFrameIndex + 1) % this.runFrames.length;
        }
prototype-v1
    }

    updateLandingSquash(player, wasOnGround, delta) {
        const justLanded = !wasOnGround && player.onGround;
        if (justLanded) {
            this.squashTimer = this.squashDuration;
        }

        if (this.squashTimer > 0) {
            this.squashTimer = Math.max(0, this.squashTimer - delta);
        }
    }

    getCurrentFrame() {
        if (this.currentState === this.states.run) return this.runFrames[this.runFrameIndex];
        if (this.currentState === this.states.jump) return this.jumpFrame;
        if (this.currentState === this.states.fall) return this.fallFrame;
        return this.idleFrame;
    }

    draw(ctx, player) {
        const frame = this.getCurrentFrame();
        const progress = this.squashDuration === 0 ? 0 : this.squashTimer / this.squashDuration;
        const squashStrength = progress * this.squashAmount;
codex/enhance-player-animations-and-state-management-6lpoum

        const runWave = this.currentState === this.states.run ? Math.sin(this.runCycle) : 0;
        const bobOffset = this.currentState === this.states.run ? Math.abs(runWave) * this.bobAmount : 0;
        const lean = this.currentState === this.states.run ? runWave * this.leanAmount : 0;

        const scaleX = (1 + squashStrength) * this.visualScale;
        const scaleY = (1 - squashStrength) * this.visualScale;

        const scaleX = 1 + squashStrength;
        const scaleY = 1 - squashStrength;
 prototype-v1

        const drawX = player.x + player.width / 2;
        const drawY = player.y + player.height;

        ctx.save();
 codex/enhance-player-animations-and-state-management-6lpoum
        ctx.translate(drawX, drawY + bobOffset);
        ctx.rotate(lean * this.facing);

        ctx.translate(drawX, drawY);
prototype-v1
        ctx.scale(this.facing * scaleX, scaleY);

        const source = frame.canvas || frame.image;
        if (source && frame.image.complete && frame.image.naturalWidth > 0) {
            const { x, y, width, height } = frame.crop;
            ctx.drawImage(
                source,
                x,
                y,
                width,
                height,
                -player.width / 2,
                -player.height,
                player.width,
                player.height
            );
        } else {
            ctx.fillStyle = "blue";
            ctx.fillRect(-player.width / 2, -player.height, player.width, player.height);
        }

        ctx.restore();
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
            gravity: 0.35,
            groundY: 350,
            jumpForce: -13
        };

        this.movement = new PlayerMovement();
        this.physics = new Physics();
        this.playerVisuals = new PlayerVisuals();

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
        const wasOnGround = this.player.onGround;

        this.movement.applyMovementInput(this.player, this.keys, delta);
        this.movement.applyJump(this.player, this.keys, this.jumpState, this.constants.jumpForce);
        this.movement.updateTimers(this.jumpState, delta);
        this.movement.applyGravity(this.player, this.constants.gravity, delta);
        this.physics.applyCollision(this.player, this.constants.groundY);
        this.physics.updateCoyoteTime(this.jumpState, this.player, delta);

        this.playerVisuals.update(this.player, wasOnGround, delta);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Zemin
        this.ctx.fillStyle = "green";
        this.ctx.fillRect(0, 350, this.canvas.width, 50);

        // Player
        this.playerVisuals.draw(this.ctx, this.player);
    }
}
