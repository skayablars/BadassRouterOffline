import './vendor/gaEngine';
import * as config from './config';

// Asssets
import ImgRouter from './assets/images/router-x2.png';
import ImgFacebook from './assets/images/facebook-x2.png';
import SoundShoot from './assets/sounds/shoot.mp3';
import ImgRayBeam from './assets/images/rayBeam.png';

const engine = ga(config.CANVAS_WIDTH, config.CANVAS_HEIGHT, setup, [
  ImgRouter,
  ImgFacebook,
  ImgRayBeam,
  SoundShoot
]);
engine.start();


let router, shootSound, message, statusBar, gameScene, gameOverScene;
let statusBarIndicators = [];
let invincibleModeTimer = config.ROUTER_INVINCIBLE_MODE_FRAMES;
let enemiesFrecuency = 100;
let enemiesTimer = 0;
let enemies = [];
let rayBeams = [];

function setup() {
  engine.canvas.background = config.BLACK;

  // scene: game scene
  gameScene = engine.group();

  // status bar
  statusBar = engine.rectangle(engine.canvas.width, config.STATUS_BAR_HEIGHT, config.STATUS_BAR_COLOR);
  

  config.DATA_OBJECTS.forEach(function(dataObject, index) {  
    const statusBarIndicator = engine.circle(config.STATUS_BAR_DIAMETER, config.WHITE)
    statusBarIndicator.x = config.STATUS_BAR_SPACE  * (index + 1);
    statusBarIndicator.y = (statusBar.height / 2) - statusBarIndicator.halfHeight;
    statusBarIndicator.type = dataObject.type;
    statusBarIndicators.push(statusBarIndicator);
  });

  // sprite: router
  router = engine.sprite(ImgRouter);
  router.x = 20;
  router.y = (engine.canvas.height / 2) - router.halfHeight;
  router.lives = config.ROUTER_LIVES;
  router.wasBeaten = false;
  router.invincibleMode = false;
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
  engine.move(router);
  engine.contain(router, engine.stage.localBounds);

  engine.move(rayBeams);

  enemiesTimer += 1;

  if (enemiesTimer === enemiesFrecuency) {
    const enemyFacebook = engine.sprite(ImgFacebook);
    enemyFacebook.x = engine.canvas.width + enemyFacebook.width;
    enemyFacebook.y = engine.randomInt(config.STATUS_BAR_HEIGHT, engine.canvas.height - enemyFacebook.height);
    enemyFacebook.vx = config.DIRECTION_LEFT;
    enemyFacebook.scaleX = 0.8;
    enemyFacebook.scaleY = 0.8;
    enemiesTimer = 0;
    enemies.push(enemyFacebook);
    gameScene.addChild(enemyFacebook);
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
      enemy.vx = 0;
      gameScene.removeChild(enemy);
      return false;
    }

    if (engine.hitTestRectangle(router, enemy)) {
      router.wasBeaten = true;
    } 

    return true;
  });

  if (router.wasBeaten && !router.invincibleMode) {
    router.lives -= config.ROUTER_LIVES_COLLISION;
    console.log(`router tiene: ${router.lives} vidas`);
    router.invincibleMode = true;
    router.wasBeaten = false;
  }

  if (router.invincibleMode) {
    if (invincibleModeTimer === 0) {
      invincibleModeTimer = config.ROUTER_INVINCIBLE_MODE_FRAMES;
      router.invincibleMode = false;
      router.alpha = 1;
    } else {
      invincibleModeTimer -=  config.ROUTER_INVINCIBLE_MODE_FRAMES_SUBSTRACT;
      router.alpha = 0.5;
    }
  } 

  if (router.lives <= 0) {
    engine.state = end;
    message.content = 'You Lost';
  } 

  engine.move(enemies);
}


function end() {
  gameScene.visible = false;
  gameOverScene.visible = true;
}
