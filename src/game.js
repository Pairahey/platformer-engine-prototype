export class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");

    this.ctx.imageSmoothingEnabled = false;

    this.lastTime = 0;
    this.player = {
      x: 100,
      y: 250,
      width: 80,
      height: 100,
      velocityY: 0,
      onGround: true,
      speed: 4
    };

    this.gravity = 0.7;
    this.groundY = 250;

    this.keys = {
      right: false,
      left: false,
      jump: false
    };

    this.initInput();
  }

  initInput() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") this.keys.right = true;
      if (e.key === "ArrowLeft") this.keys.left = true;

      if ((e.key === "ArrowUp" || e.key === " ") && this.player.onGround) {
        this.player.velocityY = -18;
        this.player.onGround = false;
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowRight") this.keys.right = false;
      if (e.key === "ArrowLeft") this.keys.left = false;
    });
  }

  update(deltaTime) {
    const p = this.player;

    // Aynı anda iki tuş basılırsa dur
    if (this.keys.right && !this.keys.left) {
      p.x += p.speed;
    } else if (this.keys.left && !this.keys.right) {
      p.x -= p.speed;
    }

    // Gravity
    p.velocityY += this.gravity;
    p.y += p.velocityY;

    if (p.y >= this.groundY) {
      p.y = this.groundY;
      p.velocityY = 0;
      p.onGround = true;
    }

    if (p.x < 0) p.x = 0;
    if (p.x > this.canvas.width - p.width)
      p.x = this.canvas.width - p.width;
  }

  draw() {
    const ctx = this.ctx;
    const p = this.player;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Sky zaten canvas background
    // Ground
    ctx.fillStyle = "green";
    ctx.fillRect(0, 350, this.canvas.width, 50);

    // Şimdilik basit karakter (sonra sprite bağlayacağız)
    ctx.fillStyle = "blue";
    ctx.fillRect(
      Math.floor(p.x),
      Math.floor(p.y),
      p.width,
      p.height
    );
  }

  loop = (timestamp) => {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.draw();

    requestAnimationFrame(this.loop);
  };

  start() {
    requestAnimationFrame(this.loop);
  }
}
