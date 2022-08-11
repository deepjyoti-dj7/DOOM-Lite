// Importing Sound Effects
const introMusic = new Audio("./music/introSong.mp3");
const shootingSound = new Audio("./music/shoooting.mp3");
const killEnemySound = new Audio("./music/killEnemy.mp3");
const gameOverSound = new Audio("./music/gameOver.mp3");
const heavyWeaponSound = new Audio("./music/heavyWeapon.mp3");
const hugeWeaponSound = new Audio("./music/hugeWeapon.mp3");

// Basic Environment
const canvas = document.createElement("canvas");
document.querySelector(".myGame").appendChild(canvas);
canvas.width = innerWidth;
canvas.height = innerHeight;
const context = canvas.getContext("2d");

const lightWeaponDamage = 10;
const kamehameha = 30;
const laserbeam = 50;

const form = document.querySelector("form");
const scoreBoard = document.querySelector(".scoreBoard");
const rules = document.querySelector(".rules");

let difficulty;
let playerScore = 0;

introMusic.play();
let flag = 0;
document.querySelector("button").addEventListener("click", (e) => {
  e.preventDefault();
  if (flag === 0) {
    introMusic.pause();
    flag = 1;
  } else if (flag === 1) {
    introMusic.play();
    flag = 0;
  }
});

let interval = 1500; // initial condition
//Event Listenter for Difficulty form
document.querySelector("input").addEventListener("click", (e) => {
  e.preventDefault();
  //making form invisible
  form.style.display = "none";
  //making scoreBoard visiible
  scoreBoard.style.display = "block";
  rules.style.display = "block";

  const userValue = document.getElementById("difficulty").value;

  if (userValue === "Beginner") {
    setInterval(spawnEnemy, 1600);
    return (difficulty = 2);
  }
  if (userValue === "Intermediate") {
    setInterval(spawnEnemy, 1200);
    return (difficulty = 4);
  }
  if (userValue === "GodMode") {
    setInterval(spawnEnemy, 800);
    return (difficulty = 6);
  }
  if (userValue === "Adaptive") {
    setTimeout(spawnEnemyAdaptively, interval);
    return (difficulty = 1);
  }
});

//---------------------------- End Screen ---------------------------
const gameOverLoader = () => {
  // Creating endscreen div and play again button and high score element
  const gameOverBanner = document.createElement("div");
  const gameOverBtn = document.createElement("button");
  const highScore = document.createElement("div");

  highScore.innerHTML = `High Score : ${
    localStorage.getItem("highScore")
      ? localStorage.getItem("highScore")
      : playerScore
  }`;

  const oldHighScore =
    localStorage.getItem("highScore") && localStorage.getItem("highScore");

  if (oldHighScore < playerScore) {
    localStorage.setItem("highScore", playerScore);

    // updating high score html
    highScore.innerHTML = `High Score: ${playerScore}`;
  }

  // adding text to playagain button
  gameOverBtn.innerText = "Play Again";

  gameOverBanner.appendChild(highScore);

  gameOverBanner.appendChild(gameOverBtn);

  // Making reload on clicking playAgain button
  gameOverBtn.onclick = () => {
    window.location.reload();
  };

  gameOverBanner.classList.add("gameover");

  document.querySelector("body").appendChild(gameOverBanner);
};

// ------------------------------ Creating classes ------------------------

// setting player position to center

playerPosition = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};

// -------------------- Player class --------------------------

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    context.beginPath();
    context.arc(
      this.x,
      this.y,
      this.radius,
      (Math.PI / 180) * 0,
      (Math.PI / 180) * 360,
      false
    );
    context.fillStyle = this.color;
    context.fill();
  }
}

// -------------------- Weapon class ---------------------------
class Weapon {
  constructor(x, y, radius, color, velocity, damage) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.damage = damage;
  }
  draw() {
    context.beginPath();
    context.arc(
      this.x,
      this.y,
      this.radius,
      (Math.PI / 180) * 0,
      (Math.PI / 180) * 360,
      false
    );
    context.fillStyle = this.color;
    context.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class HugeWeapon {
  constructor(x, y, damage) {
    this.x = x;
    this.y = y;
    this.damage = damage;
    this.color = "red";
  }
  draw() {
    context.beginPath();
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, 25, canvas.height);
  }

  update() {
    this.draw();
    this.x += 20;
  }
}

//----------------------- Enemy Class -------------------------
class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    context.beginPath();
    context.arc(
      this.x,
      this.y,
      this.radius,
      (Math.PI / 180) * 0,
      (Math.PI / 180) * 360,
      false
    );
    context.fillStyle = this.color;
    context.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

//-------------------- Particle Class -------------------------
const friction = 0.99;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    context.save();
    context.globalAlpha = this.alpha;

    context.beginPath();
    context.arc(
      this.x,
      this.y,
      this.radius,
      (Math.PI / 180) * 0,
      (Math.PI / 180) * 360,
      false
    );
    context.fillStyle = this.color;
    context.fill();
    context.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;

    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
  }
}
//------------------------------------------ Main Logical Part -------------------------------------------------------
//Object creation and array creation form weapons and enemies
const dj = new Player(playerPosition.x, playerPosition.y, 10, "white");

const weapons = [];
const hugeWeapons = [];
const enemies = [];
const particles = [];

//--------------------- Function to Spawn Enemy from random location -------------------
const spawnEnemy = () => {
  //generating random size
  const enemySize = Math.random() * (30 - 8) + 8;

  //generating random color
  const enemyColor = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;

  //random is Enemy Spawn Position
  let random;

  // 0.5 times from left and right
  if (Math.random() < 0.5) {
    random = {
      x: Math.random() < 0.5 ? canvas.width + enemySize : 0 - enemySize,
      y: Math.random() * canvas.height,
    };
  }

  //0.5 times from top and bottom
  else {
    random = {
      x: Math.random() * canvas.width,
      y: Math.random() < 0.5 ? canvas.height + enemySize : 0 - enemySize,
    };
  }

  //Angle between center and enemy position
  const myAngle = Math.atan2(
    canvas.height / 2 - random.y,
    canvas.width / 2 - random.x
  );

  //velocity of enemy according to difficulty
  const velocity = {
    x: Math.cos(myAngle) * difficulty,
    y: Math.sin(myAngle) * difficulty,
  };
  //Adding enemies to array
  enemies.push(new Enemy(random.x, random.y, enemySize, enemyColor, velocity));
};

const spawnEnemyAdaptively = () => {
  //generating random size
  const enemySize = Math.random() * (30 - 8) + 8;

  //generating random color
  const enemyColor = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;

  //random is Enemy Spawn Position
  let random;

  // 0.5 times from left and right
  if (Math.random() < 0.5) {
    random = {
      x: Math.random() < 0.5 ? canvas.width + enemySize : 0 - enemySize,
      y: Math.random() * canvas.height,
    };
  }

  //0.5 times from top and bottom
  else {
    random = {
      x: Math.random() * canvas.width,
      y: Math.random() < 0.5 ? canvas.height + enemySize : 0 - enemySize,
    };
  }

  //Angle between center and enemy position
  const myAngle = Math.atan2(
    canvas.height / 2 - random.y,
    canvas.width / 2 - random.x
  );

  //velocity of enemy according to difficulty
  const velocity = {
    x: Math.cos(myAngle) * difficulty,
    y: Math.sin(myAngle) * difficulty,
  };

  difficulty += 0.1;
  //Adding enemies to array
  enemies.push(new Enemy(random.x, random.y, enemySize, enemyColor, velocity));

  if (interval > 500) interval -= 10;
  setTimeout(spawnEnemyAdaptively, interval);
};

//---------------------- Creating Animation Function ---------------------
let animationId;
function animation() {
  //Recursion of animation

  animationId = requestAnimationFrame(animation);

  scoreBoard.innerHTML = `Score : ${playerScore}`;

  // Clearing canvas on each frame
  context.fillStyle = "rgba(49, 49, 49, 0.2)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  //Drawing Player
  dj.draw();

  //Generating Partilces
  particles.forEach((particle, particleIndex) => {
    if (particle.alpha <= 0.1) {
      particles.splice(particleIndex, 1);
    }
    particle.update();
  });

  //Generating HugeWeapons
  hugeWeapons.forEach((hugeWeapon, hugeWeaponIndex) => {
    if (hugeWeapon.x > canvas.width) {
      hugeWeapons.splice(hugeWeaponIndex, 1);
    } else {
      hugeWeapon.update();
    }
  });

  //Generating weapons
  weapons.forEach((weapon, weaponIndex) => {
    weapon.update();

    //Removing weapons off screen
    if (
      weapon.x + weapon.radius < 1 ||
      weapon.y + weapon.radius < 1 ||
      weapon.x - weapon.radius > canvas.width ||
      weapon.y - weapon.radius > canvas.height
    ) {
      weapons.splice(weaponIndex, 1);
    }
  });

  //Generating enemies
  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();

    const distanceBetweenPlayerAndEnemy = Math.hypot(
      dj.x - enemy.x,
      dj.y - enemy.y
    );

    //Stopping Game if enemy hit player
    if (distanceBetweenPlayerAndEnemy - dj.radius - enemy.radius < 1) {
      cancelAnimationFrame(animationId);
      gameOverSound.play();
      hugeWeaponSound.pause();
      shootingSound.pause();
      heavyWeaponSound.pause();
      killEnemySound.pause();
      return gameOverLoader();
    }

    hugeWeapons.forEach((hugeWeapon) => {
      const distanceBetweenHugeWeaponAndEnemy = hugeWeapon.x - enemy.x;

      if (
        distanceBetweenHugeWeaponAndEnemy <= 100 &&
        distanceBetweenHugeWeaponAndEnemy >= -100
      ) {
        playerScore += 10;
        for (let i = 0; i < enemy.radius * 2; i++)
          particles.push(
            new Particle(enemy.x, enemy.y, Math.random() * 2, enemy.color, {
              x: (Math.random() - 0.5) * (Math.random() * 3),
              y: (Math.random() - 0.5) * (Math.random() * 3),
            })
          );
        setTimeout(() => {
          enemies.splice(enemyIndex, 1);
        }, 0);
      }
    });

    weapons.forEach((weapon, weaponIndex) => {
      const distanceBetweenWeaponAndEnemy = Math.hypot(
        weapon.x - enemy.x,
        weapon.y - enemy.y
      );
      if (distanceBetweenWeaponAndEnemy - weapon.radius - enemy.radius < 1) {
        killEnemySound.play();

        if (enemy.radius > weapon.damage + 8) {
          gsap.to(enemy, {
            radius: enemy.radius - weapon.damage,
          });
          setTimeout(() => {
            weapons.splice(weaponIndex, 1);
          }, 0);
        } else {
          for (let i = 0; i < enemy.radius * 2; i++)
            particles.push(
              new Particle(weapon.x, weapon.y, Math.random() * 2, enemy.color, {
                x: (Math.random() - 0.5) * (Math.random() * 3),
                y: (Math.random() - 0.5) * (Math.random() * 3),
              })
            );
          playerScore += 10;
          scoreBoard.innerHTML = `Score : ${playerScore}`;

          setTimeout(() => {
            enemies.splice(enemyIndex, 1);
            weapons.splice(weaponIndex, 1);
          }, 0);
        }
      }
    });
  });
}

//------------------ Adding event Listeners ---------------
//For left click weapon
canvas.addEventListener("click", (e) => {
  e.preventDefault();
  shootingSound.play();

  //Angle from left click to center
  const myAngle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );
  // veloctiy of light weapon
  const velocity = {
    x: Math.cos(myAngle) * 7,
    y: Math.sin(myAngle) * 7,
  };
  //Adding light weapon in weapons array
  weapons.push(
    new Weapon(
      canvas.width / 2,
      canvas.height / 2,
      5,
      "gold",
      velocity,
      lightWeaponDamage
    )
  );
});

//For right click weapon
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  if (playerScore < 40) return;
  heavyWeaponSound.play();
  playerScore -= 40;
  scoreBoard.innerHTML = `Score : ${playerScore}`;
  //Angle from left click to center
  const myAngle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );
  // veloctiy of kamehameha
  const velocity = {
    x: Math.cos(myAngle) * 3,
    y: Math.sin(myAngle) * 3,
  };
  //Adding kamehameha in weapons array
  weapons.push(
    new Weapon(
      canvas.width / 2,
      canvas.height / 2,
      30,
      "aqua",
      velocity,
      kamehameha
    )
  );
});

addEventListener("keypress", (e) => {
  if (e.key === " ") {
    if (playerScore < 100) return;
    playerScore -= 100;
    scoreBoard.innerHTML = `Score : ${playerScore}`;
    hugeWeaponSound.play();
    hugeWeapons.push(new HugeWeapon(0, 0, laserbeam));
  }
});

addEventListener("dblclick", (e) => {
  e.preventDefault();
});

addEventListener("onselect", (e) => {
  e.preventDefault();
});

addEventListener("resize", () => {
  window.location.reload();
});

animation();
