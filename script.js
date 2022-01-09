let canvas;
let context;
let HEIGHT;
let WIDTH;
let frames = 0;
let currentState;
let record;
const states = {
  start: 0,
  playing: 1,
  finished: 2,
};
const floor = {
  y: 550,
  height: 50,
  color: '#e8da78',
  
  draw: function() {
    context.fillStyle = this.color;
    context.fillRect(0, this.y, WIDTH, this.height);
  }
};
const block = {
  x: 50,
  y: 0,
  height: 50,
  width: 50,
  color: '#ff9239',
  gravity: 1.6,
  velocity: 0,
  forceJump: 23.6,
  jumpsQuantity: 0,
  score: 0,

  update: function() {
    this.velocity += this.gravity;
    this.y += this.velocity;

    if (
      this.y > (floor.y - this.height) &&
      currentState !== states.finished
    ) {
      this.y = floor.y - this.height;
      this.jumpsQuantity = 0;
      this.velocity = 0;
    }
  },
  reset: function() {
    this.velocity = 0;
    this.y = 0;

    if (this.score > record) {
      localStorage.setItem('game-record', this.score);
      record = this.score;
    }

    this.score = 0;
  },
  jump: function() {
    if (this.jumpsQuantity < 3) {
      this.velocity = -this.forceJump;
      this.jumpsQuantity++;
    }
  },
  draw: function() {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);
  }
};
const obstacles = {
  _blocks: [],
  colors: ['#ffbc1c', '#ff1c1c', '#ff85e1', '#52a7ff', '#78ff5d'],
  insertionTime: 0,

  insert: function() {
    this._blocks.push({
      x: WIDTH,
      width: 50,
      height: Math.floor(121 * Math.random()) + 30,
      color: this.colors[Math.floor(5 * Math.random())]
    });

    this.insertionTime = 40 + Math.floor(21 * Math.random());
  },
  update: function() {
    this.insertionTime === 0 ? this.insert() : this.insertionTime--;

    let length = this._blocks.length;
    for (let i = 0; i < length; i++) {
      const obstacle = this._blocks[i];
      const velocity = 6;

      obstacle.x -= velocity;

      if (
        block.x < obstacle.x + obstacle.width &&
        block.x + block.width >= obstacle.x &&
        block.y + block.height >= floor.y - obstacle.height
      ) {
        currentState = states.finished;
      } else if (obstacle.x === 0) {
        block.score++;
      } else if (obstacle.x <= -obstacle.width) {
        this._blocks.splice(i, 1);
        length--;
        i--;
      }
    }
  },
  clear: function() {
    this._blocks = [];
  },
  draw: function() {
    const length = this._blocks.length;
    for (let i = 0; i < length; i++) {
      const obstacle = this._blocks[i];

      context.fillStyle = obstacle.color;
      context.fillRect(obstacle.x, floor.y - obstacle.height, obstacle.width, obstacle.height);
    }
  },
};

function handleClickOnScreen(event) {
  if (currentState === states.playing) {
    block.jump();
  } else if (currentState === states.start) {
    currentState = states.playing;
  } else if (currentState === states.finished && block.y >= 2 * HEIGHT) {
    currentState = states.start;
    obstacles.clear();
    block.reset();
  }
}

function updateScreen() {
  frames++;

  block.update();

  if (currentState === states.playing) {
    obstacles.update();
  }
}

function draw() {
  context.fillStyle = "#80daff";
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.fillStyle = "#fff";
  context.font = "50px Arial";
  context.fillText(block.score, 30, 68);

  if (currentState === states.start) {
    context.fillStyle = 'green';
    context.fillRect((WIDTH / 2) - 50, (HEIGHT / 2) - 50, 100, 100);
  } else if (currentState === states.finished) {
    context.fillStyle = 'red';
    context.fillRect((WIDTH / 2) - 50, (HEIGHT / 2) - 50, 100, 100);

    context.save();
    context.translate(WIDTH / 2, HEIGHT / 2);
    context.fillStyle = '#fff';

    if (block.score > record) {
      context.fillText('Novo Record!', -150, -65);
    } else if (record < 10) {
      context.fillText(`Record ${record}`, -99, -65);
    } else if (record >= 10 && record < 100) {
      context.fillText(`Record ${record}`, -112, -65);
    } else {
      context.fillText(`Record ${record}`, -125, -65);
    }

    if (block.score < 10)
      context.fillText(block.score, -13, 19);
    else if (block.score >= 10 && block.score < 100)
      context.fillText(block.score, -26, 19);
    else
      context.fillText(block.score, -39, 19);
    
    context.restore();
  } else if (currentState === states.playing) {
    obstacles.draw();
  }
  
  floor.draw();
  block.draw();
}

function startGame() {
  updateScreen();
  draw();

  window.requestAnimationFrame(startGame);
}

function main() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  if (window.innerWidth >= 500) {
    HEIGHT = 600;
    WIDTH = 600;
  }

  canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.style.border = "1px solid #000";

  context = canvas.getContext("2d");
  document.body.appendChild(canvas);

  document.addEventListener("mousedown", handleClickOnScreen);
  
  currentState = states.start;
  record = localStorage.getItem("game-record");

  if (!record) record = 0;

  startGame();
}

main();