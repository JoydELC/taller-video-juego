const gameContainer = document.querySelector('.game-container');
const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
const spanLives = document.querySelector('#lives');
const spanTime = document.querySelector('#time');
const spanRecord = document.querySelector('#record');
const pResult = document.querySelector('#result');
const h3Message = document.querySelector('#modal-title');

//btns
const btnUp = document.querySelector('#up');
const btnDown = document.querySelector('#down');
const btnLeft = document.querySelector('#left');
const btnRight = document.querySelector('#right');


let canvasSize;
let elementsSize;
let level = 0;
let lives = 3;

// Time variables
let timeStart;
let timePlayer;
let timeInterval;

const playerPosition = {
  x:undefined,
  y:undefined,
};

const giftPosition = {
  x: undefined,
  y: undefined,
};

let enemyPositions = [];

window.addEventListener('load', setCanvasSize);
window.addEventListener('resize', setCanvasSize);

function setCanvasSize() {
  if (window.innerHeight > window.innerWidth) {
    canvasSize = window.innerWidth * 0.6;
  } else {
    canvasSize = window.innerHeight * 0.6;
  }
  canvasSize = Number(canvasSize.toFixed(0));
  canvas.setAttribute('width', canvasSize);
  canvas.setAttribute('height', canvasSize);
  
  elementsSize = Math.floor(canvasSize / 10);

  playerPosition.x = undefined;
  playerPosition.y= undefined;
  startGame();
}

function startGame() {
  console.log({ canvasSize, elementsSize });

  game.font = elementsSize-4 + 'px Verdana';
  game.textAlign = 'end';

  const map = maps[level];

  if (!map) {
    gameWin();
    return;
  }
  if (!timeStart) {
    timeStart = Date.now();
    timeInterval = setInterval(showTime, 100);
    showRecord();
  }
  const mapRows = map.trim().split('\n');
  const mapRowCols = mapRows.map(row => row.trim().split(''));
  console.log({map, mapRows, mapRowCols});

  showLives();

  enemyPositions = [];
  game.clearRect(0,0,canvasSize, canvasSize);

  mapRowCols.forEach((row, rowIndex) => {
    
    row.forEach((col,colIndex) => {
      const emoji =emojis[col];
      const posX = elementsSize * (colIndex+1);
      const posY = elementsSize * (rowIndex+1);
      game.fillText(emoji, posX, posY);
      if (col == 'O') {
        if (!playerPosition.x && !playerPosition.y) {
          playerPosition.x = posX;
          playerPosition.y = posY;
          console.log({playerPosition});
        }
      } else if (col == 'I'){
        giftPosition.x = posX;
        giftPosition.y = posY;
      } else if (col == 'X') {
        enemyPositions.push({
          x:posX,
          y:posY,
        });
      }

      game.fillText(emoji, posX, posY);
    });
   });
  movePlayer();

}
function movePlayer() {
  const giftCollisionX = playerPosition.x.toFixed(2) == giftPosition.x.toFixed(2);
  const giftCollisionY = playerPosition.y.toFixed(2) == giftPosition.y.toFixed(2);
  const giftCollision = giftCollisionX && giftCollisionY;

  if (giftCollision){
    levelWin();
  }
  let coliX;
  let coliY;
  const enemyCollision = enemyPositions.find(enemy => {
    const enemyCollisionX = enemy.x.toFixed(3) == playerPosition.x.toFixed(3);
    if(enemyCollisionX) coliX=Number(playerPosition.x.toFixed(0));
    const enemyCollisionY = enemy.y.toFixed(3) == playerPosition.y.toFixed(3);
    if(enemyCollisionY) coliY=Number(playerPosition.y.toFixed(0));
    return enemyCollisionX && enemyCollisionY;
  });

  if (enemyCollision) {
        console.log({coliX,coliY})
        game.font = 2*elementsSize + "px verdana";
        playerPosition.x=undefined;
        playerPosition.y=undefined;
        game.fillText(emojis['BOMB_COLLISION'], coliX, coliY);
        setTimeout(levelFail,300)
  }

  game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y);
}
function levelWin() {
  console.log('Subiste de nivel');
  level++;
  startGame();
}

function gameWin() {
  console.log('¡Terminaste el juego!');
  gameContainer.classList.add('opacity');
	const modal = document.querySelector('#modal');
	modal.classList.remove('invisible');
	modal.style.display = 'block';
  h3Message.innerHTML = '¡¡You Win the game!!'

  clearInterval(timeInterval);
  const recordTime = localStorage.getItem('record_time');
  const playerTime = Date.now() - timeStart;

  const reiniciar = document.querySelector('#reset');
	reiniciar.addEventListener('click', restart);


  if (recordTime) {
      if (recordTime >= playerTime) {
          localStorage.setItem('record_time', playerTime);
          pResult.innerHTML = 'New Record';
      } else {
          pResult.innerHTML = 'Record is unbeatable :(';
      }
  } else {
      localStorage.setItem('record_time', playerTime);
      pResult.innerHTML = 'First time? Good, do it better next time :)';
  }

  console.log({ recordTime, playerTime });
}

function restart(){
  location.reload();
}
function showRecord() {
  spanRecord.innerHTML = (localStorage.getItem('record_time')/1000).toFixed(0);
}

function levelFail() {
  console.log('Chocaste contra un enemigo :(');
  lives--;

  console.log(lives);
  
  if (lives <= 0) {
    level = 0;
    lives = 3;
    timeStart = undefined;
    gameContainer.classList.add('opacity');
	  const modal = document.querySelector('#modal');
	  modal.classList.remove('invisible');
	  modal.style.display = 'block';
    h3Message.innerHTML = 'You lose'
    pResult.innerHTML = 'Better luck next';
    const reiniciar = document.querySelector('#reset');
	  reiniciar.addEventListener('click', restart);

  }

  playerPosition.x = undefined;
  playerPosition.y = undefined;
  startGame();
}

function showLives() {
  const heartsArray = Array(lives).fill(emojis['HEART']); // [1,2,3]
  // console.log(heartsArray);
  
  spanLives.innerHTML = "";
  heartsArray.forEach(heart => spanLives.append(heart));
}

function showTime(){
    
  spanTime.innerHTML = +((Date.now()-timeStart)/1000).toFixed(0);

}

// btn events
window.addEventListener('keydown', moveByKeys);
btnUp.addEventListener('click', moveUp);
btnDown.addEventListener('click', moveDown);
btnLeft.addEventListener('click', moveLeft);
btnRight.addEventListener('click', moveRight);

function moveByKeys(event) {
  if(event.key == 'ArrowUp'){
    moveUp();
  } else if (event.key == 'ArrowLeft'){
    moveLeft();
  } else if (event.key == 'ArrowRight'){
    moveRight();
  }else if (event.key == 'ArrowDown'){
    moveDown();
  } 
}

function moveUp() {
  console.log('Me quiero mover hacia arriba');

  if ((playerPosition.y - elementsSize) < elementsSize) {
    console.log('OUT');
  } else {
    playerPosition.y -= elementsSize;
    startGame();
  }
}
function moveLeft() {
  console.log('Me quiero mover hacia izquierda');

  if ((playerPosition.x - elementsSize) < elementsSize) {
    console.log('OUT');
  } else {
    playerPosition.x -= elementsSize;
    startGame();
  }
}
function moveRight() {
  console.log('Me quiero mover hacia derecha');

  if ((playerPosition.x + elementsSize) > canvasSize) {
    console.log('OUT',playerPosition.x);
  } else {
    playerPosition.x += elementsSize;
    startGame();
  }
}
function moveDown() {
  console.log('Me quiero mover hacia abajo');
  
  if ((playerPosition.y + elementsSize) > canvasSize) {
    console.log('OUT');
  } else {
    playerPosition.y += elementsSize;
    startGame();
  }
}