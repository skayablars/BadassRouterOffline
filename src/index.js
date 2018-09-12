import './vendor/gaEngine';
import * as config from './config';

// Asssets
import ImgRouter from './assets/images/router-x2.png';
import ImgRayBeam from './assets/images/rayBeam.png';
import ImgFacebook from './assets/images/facebook.png';
import ImgGamepad from './assets/images/gamepad.png';

import ImgSound from './assets/images/sound.png';
import ImgText from './assets/images/text.png';
import ImgVideo from './assets/images/video.png';
import ImgImage from './assets/images/image.png';

import SoundShoot from './assets/sounds/shoot.wav';

const engine = ga(config.CANVAS_WIDTH, config.CANVAS_HEIGHT, setup, [
  ImgRouter,
  ImgFacebook,
  ImgGamepad,
  ImgRayBeam,
  SoundShoot,
  ImgSound,
  ImgText, 
  ImgVideo,
  ImgImage
]);
engine.start();

let router, shootSound, message,  gameScene, gameOverScene;
let statusBar, healthBar;
let statusBarIndicators = [];

let enemiesFrecuencyFacebook = 80;
let enemiesTimerFacebook = 0;
let enemiesFrecuencyGamepad = 100;
let enemiesTimerGamepad = 0;


let enemies = [];
let rayBeams = [];
let items = [];


function setup() {
  engine.canvas.background = config.BLACK;

  // scene: game scene
  gameScene = engine.group();

  // status bar
  statusBar = engine.rectangle(engine.canvas.width, config.STATUS_BAR_HEIGHT, config.STATUS_BAR_COLOR);
  
  config.DATA_OBJECTS.forEach(function(dataObject, index) {  
    const statusBarIndicator = engine.sprite(dataObject.path);
    statusBarIndicator.x = (config.STATUS_BAR_SPACE + 4 * index )  * (index + 1);
    statusBarIndicator.y = (statusBar.height / 2) - statusBarIndicator.halfHeight;
    statusBarIndicator.scaleX = 0.8;
    statusBarIndicator.scaleY = 0.8;
    statusBarIndicator.alpha = 0.4;
    statusBarIndicator.on = false;
    statusBarIndicator.type = dataObject.type;
    statusBarIndicators.push(statusBarIndicator);
  });

  // health bar
  const outerBar = engine.rectangle(config.ROUTER_LIVES, 16, config.BLACK);
  const innerBar = engine.rectangle(config.ROUTER_LIVES, 16, config.GREEN);  
  healthBar = engine.group(outerBar, innerBar);
  healthBar.inner = innerBar;
  healthBar.x = engine.canvas.width - healthBar.width - 10;
  healthBar.y = (statusBar.height / 2) - healthBar.halfHeight;

  // sprite: router
  router = engine.sprite(ImgRouter);
  router.x = 20;
  router.y = (engine.canvas.height / 2) - router.halfHeight;
  gameScene.addChild(router);

  // sound: shoot
  shootSound = engine.sound(SoundShoot);

  // keys: router
  engine.fourKeyController(router, config.ROUTER_SPEED, 38, 39, 40, 37);

  // text: message
  message = engine.text('Game Over!', '64px sans-serif', 'white', 20, 20);
  message.x = 120;
  message.y = (engine.canvas.height / 2) - 64;

  // scene: game over
  gameOverScene = engine.group(message);
  gameOverScene.visible = false;

  // keys: player shoot
  engine.key.space.press = function() {
    engine.shoot(
      router,
      config.ROUTER_SHOOT_ANGLE,
      config.ROUTER_SHOOT_OFFSET,
      config.ROUTER_SHOOT_SPEED,
      rayBeams,
      function() {
        const ray = engine.sprite(ImgRayBeam);
        gameScene.addChild(ray);
        return ray;
      }
    );
    shootSound.play();
  } 
  engine.state = play;
}

function play() {
  let routerHit = false;

  engine.move(router);
  engine.contain(router, engine.stage.localBounds);

  engine.move(rayBeams);

  // ENEMY: FACEBOOK
  enemiesTimerFacebook += 1;
  if (enemiesTimerFacebook === enemiesFrecuencyFacebook) {
    const enemyFacebook = engine.sprite(ImgFacebook);
    enemyFacebook.x = engine.canvas.width + enemyFacebook.width;
    enemyFacebook.y = engine.randomInt(config.STATUS_BAR_HEIGHT, engine.canvas.height - enemyFacebook.height);
    enemyFacebook.itemType = 'Image'; 
    enemyFacebook.itemPath = 'images/image.png';
    enemyFacebook.itemDrop = 10;
    enemyFacebook.type = 'facebook';
    enemyFacebook.speed = 2;
    enemyFacebook.vx = config.DIRECTION_LEFT * enemyFacebook.speed;

    enemiesTimerFacebook = 0;
    enemies.push(enemyFacebook);
    gameScene.addChild(enemyFacebook);
  }

  // ENEMY: GAMEPAD  
  
  if (statusBarIndicators.findIndex(indicator => (indicator.type === 'Image') && indicator.on) !== -1) {    
    enemiesTimerGamepad += 1;
  }
  
  if (enemiesTimerGamepad === enemiesFrecuencyGamepad) {    
    const enemyGamepad = engine.sprite(ImgGamepad);
    enemyGamepad.x = engine.canvas.width + enemyGamepad.width;
    enemyGamepad.y = engine.randomInt(config.STATUS_BAR_HEIGHT, engine.canvas.height - enemyGamepad.height);
    enemyGamepad.itemType = 'Video'; 
    enemyGamepad.itemPath = 'images/video.png';
    enemyGamepad.itemDrop = 10;
    enemyGamepad.type = 'gamepad';
    enemyGamepad.frames = 15;
    enemyGamepad.movementFrames = enemyGamepad.frames;
    enemyGamepad.speed = 3;
    enemyGamepad.vy = config.DIRECTION_UP * enemyGamepad.speed;
    enemyGamepad.vx = config.DIRECTION_LEFT  * enemyGamepad.speed;

    enemiesTimerGamepad = 0;
    enemies.push(enemyGamepad);
    gameScene.addChild(enemyGamepad);
  }

  enemies = enemies.filter(function(enemy) {
    const enemyHitsEdges = engine.contain(enemy, engine.stage.localBounds);
    let enemyIsDead = (enemyHitsEdges === 'left');

    if (!enemyIsDead) {
      rayBeams = rayBeams.filter(function(rayBeam) {
        if (engine.hitTestRectangle(enemy, rayBeam)) {
         gameScene.removeChild(rayBeam);
         enemyIsDead = true;
         return false; 
        } else {
          return true;
        }
      });
    }
    
    if (enemyIsDead) {
      // drop item 
      if (engine.randomInt(0, 100) <= enemy.itemDrop || 0) {
        const itemExist = items.findIndex(item => item.type === enemy.itemType) !== -1;
        const indicatorExist = statusBarIndicators.findIndex(indicator => (indicator.type === enemy.itemType) && indicator.on) !== -1;
        if (!itemExist && !indicatorExist) {
          const item = engine.sprite(enemy.itemPath);
          item.x = enemy.x;
          item.y = enemy.y;
          item.type = enemy.itemType;
          item.vx = config.DIRECTION_LEFT;
          items.push(item);
          gameScene.addChild(item);
        } 
      }

      enemy.vx = 0;
      gameScene.removeChild(enemy);
      return false;
    }

    if (engine.hitTestRectangle(router, enemy)) {
      routerHit = true;
    } 

    if (enemy.type === 'gamepad') {
      if (enemy.movementFrames > 0) {
        enemy.movementFrames -= 1;
      } else {
        enemy.vy *= -1;
        enemy.movementFrames = enemy.frames;
      }
    }

    return true;
  });


  items = items.filter(function(item) {
    const itemHitsEdges = engine.contain(item, engine.stage.localBounds);
    let itemIsGone = (itemHitsEdges === 'left');


    if (engine.hitTestRectangle(item, router)) {
      const indicator = statusBarIndicators.find(indicator => indicator.type === item.type);
      indicator.alpha = 1;
      indicator.on = true;
      itemIsGone = true;
    }
    
    if (itemIsGone) {
      item.vx = 0;
      gameScene.removeChild(item);
      return false;
    }

    return true;
  });

  engine.move(enemies);
  engine.move(items);


  if (routerHit) {
    router.alpha = 0.5;
    healthBar.inner.width -= 1;
  } else {
    router.alpha = 1;
  }

  if (healthBar.inner.width < 0) {
    engine.state = end;
    message.content = "You lost!";
  }
}


function end() {
  gameScene.visible = false;
  gameOverScene.visible = true;
}
