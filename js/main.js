$(document).ready(function () {
  generateMap();
  spawnPlayer();
  spawnEnemies();
  spawnHealthPotions();
  spawnDamageBooster();
  addKeyPressListener();
  setInterval(moveEnemies, 1000);
});
let map = [];
let playerPosition = { row: 0, col: 0 };
let enemies = [];
let healthPotions = [];
let damageBoosters = [];
let playerHealth = 6;
let playerDamage = 1;

/////////////////////////////////Создаем карту в двумерном массиве map//////////////////////////////////////////////////////
function generateMap() {
  let mapContainer = $(".field");

  // Инициализация массива
  for (let i = 0; i < 24; i++) {
    map[i] = [];
    for (let j = 0; j < 40; j++) {
      map[i][j] = "tileW"; // Изначально все клетки - стены
    }
  }

  let countOfHallsX = getRandomInt(6, 9);
  let countOfHallsY = getRandomInt(6, 9);
  //СТРОЧКИ
  for (let i = 0; i < countOfHallsX; i++) {
    let hallPositionX = getRandomInt(1, 23);
    for (let j = 0; j < 40; j++) {
      map[hallPositionX][j] = "tile";
    }

    let roomSizeX = getRandomInt(3, 8);
    let roomSizeY = getRandomInt(3, 8);

    //высота комнаты
    for (let ry = 0; ry < roomSizeY; ry++) {
      //ширина комнаты
      for (let rx = 0; rx < roomSizeX; rx++) {
        if (hallPositionX > 8) {
          map[hallPositionX - ry][rx] = "tile";
        } else {
          map[hallPositionX + ry][rx] = "tile";
        }
      }
    }
  }
  //СТОЛБИКИ
  for (let i = 0; i < countOfHallsY; i++) {
    let hallPositionY = getRandomInt(1, 23);
    for (let j = 0; j < 24; j++) {
      map[j][hallPositionY] = "tile";
    }
    let roomPositionY = getRandomInt(1, 15); //чтобы не выходить за края карты

    let roomSizeX = getRandomInt(3, 8);
    let roomSizeY = getRandomInt(3, 8);

    //высота комнаты
    for (let ry = 0; ry < roomSizeY; ry++) {
      //ширина комнаты
      for (let rx = 0; rx < roomSizeX; rx++) {
        map[roomPositionY + ry][rx + hallPositionY] = "tile";
      }
    }
  }

  // Заполнение сетки землей и стенами
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 40; j++) {
      let tile = $("<div>").addClass(map[i][j]);
      mapContainer.append(tile);
    }
  }
}
/////////////////////////////////Создаем игрока//////////////////////////////////////////////////////
function spawnPlayer() {
  let playerRow, playerCol;

  do {
    playerRow = getRandomInt(0, 23);
    playerCol = getRandomInt(0, 39);
  } while (map[playerRow][playerCol] !== "tile");

  // Устанавливаем класс и позицию игрока через массив map
  map[playerRow][playerCol] = "tileP";
  playerPosition = { row: playerRow, col: playerCol };

  // Обновляем DOM
  updateMap();
}
/////////////////////////////////Создаем зелья здоровья//////////////////////////////////////////////////////
function spawnHealthPotions() {
  for (let i = 0; i < 4; i++) {
    let potionRow, potionCol;

    do {
      potionRow = getRandomInt(0, 23);
      potionCol = getRandomInt(0, 39);
    } while (map[potionRow][potionCol] !== "tile");

    // Добавим информацию о зелье регенерации в массив healthPotions
    healthPotions.push({ row: potionRow, col: potionCol });

    map[potionRow][potionCol] = "tileHP";
  }

  // Обновляем DOM
  updateMap();
}
/////////////////////////////////Создаем мечи-бустеры урона//////////////////////////////////////////////////////
function spawnDamageBooster() {
  for (let i = 0; i < 2; i++) {
    let potionRow, potionCol;

    do {
      potionRow = getRandomInt(0, 23);
      potionCol = getRandomInt(0, 39);
    } while (map[potionRow][potionCol] !== "tile");

    // Добавим информацию о зелье регенерации в массив healthPotions
    damageBoosters.push({ row: potionRow, col: potionCol });

    map[potionRow][potionCol] = "tileSW";
  }

  // Обновляем DOM
  updateMap();
}
/////////////////////////////////Создаем противников//////////////////////////////////////////////////////
function spawnEnemies() {
  for (let i = 0; i < 10; i++) {
    let enemyRow, enemyCol;

    do {
      enemyRow = getRandomInt(0, 23);
      enemyCol = getRandomInt(0, 39);
    } while (map[enemyRow][enemyCol] !== "tile");

    let health = 3;
    map[enemyRow][enemyCol] = "tileE";
    enemies.push({
      row: enemyRow,
      col: enemyCol,
      health: health,
      direction: getRandomDirection(),
    });
  }

  // Обновляем DOM
  updateMap();
}
/////////////////////////////////Случайное передвижение противников//////////////////////////////////////////////////////
function moveEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];

    // Пытаемся выбрать новое направление для противника
    let newDirection = getRandomDirection();
    let attempts = 0;

    while (attempts < 4 && !canMove(enemy, newDirection)) {
      newDirection = getRandomDirection();
      attempts++;
    }

    // Если все направления заблокированы, противник останавливается
    if (attempts === 4) {
      continue;
    }

    // Вычисляем новые координаты в соответствии с направлением
    let newEnemyRow = enemy.row;
    let newEnemyCol = enemy.col;

    switch (newDirection) {
      case "up":
        newEnemyRow = Math.max(0, enemy.row - 1);
        break;
      case "down":
        newEnemyRow = Math.min(23, enemy.row + 1);
        break;
      case "left":
        newEnemyCol = Math.max(0, enemy.col - 1);
        break;
      case "right":
        newEnemyCol = Math.min(39, enemy.col + 1);
        break;
    }

    // Обновляем позицию противника в массиве map
    map[enemy.row][enemy.col] = "tile";
    map[newEnemyRow][newEnemyCol] = "tileE" + enemy.health;

    if (isPlayerNearEnemy(enemy, playerPosition)) {
      attackPlayer();
    }
    enemies[i] = {
      row: newEnemyRow,
      col: newEnemyCol,
      health: enemy.health,
      direction: newDirection,
    };
  }

  // Обновляем DOM
  updateMap();
}
///////////////////////Механика ходьбы по земле, зельям, мечам///////////////////////////////////////////
function addKeyPressListener() {
  // Обработчик событий для клавиш WASD
  $(document).keydown(function (event) {
    // Обрабатываем нажатия клавиш и вычисляем новые координаты игрока
    let newPlayerRow = playerPosition.row;
    let newPlayerCol = playerPosition.col;

    switch (event.keyCode) {
      case 87: // W
        newPlayerRow = Math.max(0, playerPosition.row - 1);
        break;
      case 83: // S
        newPlayerRow = Math.min(23, playerPosition.row + 1);
        break;
      case 65: // A
        newPlayerCol = Math.max(0, playerPosition.col - 1);
        break;
      case 68: // D
        newPlayerCol = Math.min(39, playerPosition.col + 1);
        break;
      case 32: // Пробел (атака)
        attackEnemy();
        break;
      default:
        return;
    }

    // Проверяем, является ли новая клетка "tile"
    let placeToStep = map[newPlayerRow][newPlayerCol];
    if (
      placeToStep === "tile" ||
      placeToStep === "tileHP" ||
      placeToStep === "tileSW"
    ) {
      if (map[newPlayerRow][newPlayerCol] === "tileHP") {
        playerHealth++;
      }
      if (map[newPlayerRow][newPlayerCol] === "tileSW") {
        playerDamage++;
        let inventory = $(".inventory");
        let itemSword = $("<div>").addClass("tileSW");
        inventory.append(itemSword);
      }
      // Обновляем позицию игрока в массиве
      map[playerPosition.row][playerPosition.col] = "tile";
      map[newPlayerRow][newPlayerCol] = "tileP";

      // Обновляем текущую позицию игрока
      playerPosition = { row: newPlayerRow, col: newPlayerCol };

      // Обновляем DOM
      updateMap();
    }
  });
}
///////////////////////Атака на врага///////////////////////////////////////////
function attackEnemy() {
  // Проверяем, есть ли противник в соседней клетке
  for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];

    if (isPlayerNearEnemy(enemy, playerPosition)) {
      // Уменьшаем здоровье противника
      enemy.health -= playerDamage;

      if (enemy.health <= 0) {
        // Если здоровье противника достигло 0, убираем его
        map[enemy.row][enemy.col] = "tile";
        enemies.splice(i, 1); // Удаляем противника из массива
      } else {
        // Обновляем отображение здоровья противника в массиве map
        map[enemy.row][enemy.col] = "tileE" + enemy.health;
      }

      updateMap();
      break;
    }
  }
  if (enemies.length === 0) {
    alert("С Победой");
    location.reload();
  }
}
///////////////////////Атака на героя///////////////////////////////////////////
function attackPlayer() {
  // Уменьшаем здоровье героя на 1
  if (playerHealth > 1) {
    playerHealth--;

    // Обновляем отображение здоровья героя
    updateMap();
  } else {
    alert("GAME OVER");
    location.reload();
  }
}

///////////////////////////////////Обновление карты после её изменения/////////////////////////////////////////////////////////////////////
function updateMap() {
  let mapContainer = $(".field");
  mapContainer.empty();

  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 40; j++) {
      let tile = $("<div>").addClass(map[i][j]);
      mapContainer.append(tile);

      if (map[i][j].startsWith("tileE")) {
        // Если это противник, добавляем полоску здоровья
        let enemyHealth = parseInt(map[i][j].substring(5), 10);
        let enemyTile = $("<div>").addClass("enemy-tile");
        tile.append(enemyTile);

        let healthBarContainer = $("<div>").addClass("health-bar-container");
        let healthBar = $("<div>")
          .addClass("health-bar")
          .css("width", enemyHealth * 33.33 + "%"); // Ширина полоски зависит от здоровья

        healthBarContainer.append(healthBar);
        enemyTile.append(healthBarContainer);
      }
      if (map[i][j].startsWith("tileP")) {
        // Если это герой, добавляем полоску здоровья
        let healthBarContainer = $("<div>").addClass("health-bar-container");
        let healthBar = $("<div>")
          .addClass("health-bar")
          .css("width", (playerHealth / 6) * 100 + "%"); // Ширина полоски зависит от здоровья

        healthBarContainer.append(healthBar);
        tile.append(healthBarContainer);
      }
    }
  }
}
///////////////////////////////////true если направление == земля///////////////////////////////////////////
function canMove(entity, direction) {
  let newRow = entity.row;
  let newCol = entity.col;

  switch (direction) {
    case "up":
      newRow = Math.max(0, entity.row - 1);
      break;
    case "down":
      newRow = Math.min(23, entity.row + 1);
      break;
    case "left":
      newCol = Math.max(0, entity.col - 1);
      break;
    case "right":
      newCol = Math.min(39, entity.col + 1);
      break;
  }

  return map[newRow][newCol] === "tile";
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDirection() {
  let directions = ["up", "down", "left", "right"];
  return directions[getRandomInt(0, 3)];
}

function isPlayerNearEnemy(enemy, playerPosition) {
  let distance =
    Math.abs(playerPosition.row - enemy.row) +
    Math.abs(playerPosition.col - enemy.col);
  return distance === 1;
}
