import './vendor/gaEngine';
import * as config from './config';
import * as helpers from './helpers';

// Asssets
import ImgRouter from './assets/images/router-x2.png';
import ImgRayBeam from './assets/images/rayBeam.png';
import ImgFacebook from './assets/images/facebook.png';
import ImgGamepad from './assets/images/gamepad.png';
import ImgWikipedia from './assets/images/wikipedia.png';
import ImgSpotify from './assets/images/spotify.png';
import ImgBoss from './assets/images/boss.png';

import ImgSound from './assets/images/sound.png';
import ImgText from './assets/images/text.png';
import ImgVideo from './assets/images/video.png';
import ImgImage from './assets/images/image.png';

import ImgExplosion from './assets/images/explosion.png';

import SoundShoot from './assets/sounds/shoot.wav';
import SoundExplosion from './assets/sounds/explosion.wav';

const engine = ga(config.CANVAS_WIDTH, config.CANVAS_HEIGHT, setup, [
  ImgRouter,
  ImgFacebook,
  ImgGamepad,
  ImgWikipedia,
  ImgSpotify,
  ImgBoss,
  ImgRayBeam,
  SoundShoot,
  SoundExplosion,
  ImgExplosion,
  ImgSound,
  ImgText, 
  ImgVideo,
  ImgImage,
]);
engine.start();

let router, shootSound, explosionSound, message, initText,  gameInitScene, gameScene, gameOverScene;
let statusBar, healthBar;
let statusBarIndicators = [];

let enemiesFrecuencyFacebook = 80;
let enemiesTimerFacebook = 0;
let enemiesFrecuencyGamepad = 100;
let enemiesTimerGamepad = 0;
let enemiesFrecuencyWikipedia = 80;
let enemiesTimerWikipedia = 0;
let enemiesFrecuencySpotify = 200;
let enemiesTimerSpotify = 0;
let conversationRouterBegin = false;
let conversationRouterFinished = false;

let enemiesFramesFacebook = [ImgFacebook, 'images/explosion.png'];
let enemiesFramesGamepad = [ImgGamepad, 'images/explosion.png'];
let enemiesFramesWikipedia = [ImgWikipedia, 'images/explosion.png'];
let enemiesFramesSpotify = [ImgSpotify, 'images/explosion.png'];

let boss = null;

let enemies = [];
let rayBeams = [];
let items = [];
let bgItems  = [];

function setup() {
  engine.canvas.background = config.BLACK;

  // scene: game scene
  gameScene = engine.group();

  // scene: game init
  initText = engine.text('THE BADASS ROUTER OFFLINE', '40px sans-serif', '#E91E63');
  initText.x = 80;
  initText.y = (engine.canvas.height / 2) - initText.halfHeight;
  gameInitScene = engine.group(initText);
    // status bar
  statusBar = engine.rectangle(engine.canvas.width, config.STATUS_BAR_HEIGHT, config.STATUS_BAR_COLOR);
  
  config.DATA_OBJECTS.forEach(function(dataObject, index) {  
    const statusBarIndicator = engine.sprite(dataObject.path);
    statusBarIndicator.x = (config.STATUS_BAR_SPACE + 4 * index )  * (index + 1);
    statusBarIndicator.y = (statusBar.height / 2) - statusBarIndicator.halfHeight;
    statusBarIndicator.scaleX = 0.8;
    statusBarIndicator.scaleY = 0.8;
    statusBarIndicator.alpha = 0;
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

  // sounds
  shootSound = engine.sound(SoundShoot);
  explosionSound = engine.sound(SoundExplosion);

  // keys: router
  engine.fourKeyController(router, config.ROUTER_SPEED, 38, 39, 40, 37);

  // text: message
  message = engine.text('THE BADASS ROUTER OFFLINE', '40px sans-serif', '#E91E63');
  message.x = 20;
  message.y = (engine.canvas.height / 2) - initText.halfHeight;

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

  gameScene.visible = false;
  engine.wait(1500, function() {
    engine.state = present;
  });
}

let initTextOn = false;
let initTextOff = false;
function present() {
  if (!initTextOn) {
    engine.fadeOut(initText);
    engine.wait(1500, function() {
      engine.fadeIn(initText);
      initText.x = 20;
      initText.content = '20,000 years in the future...';
      engine.wait(1500, function() {
        engine.fadeIn(initText);
        initText.content = 'an evil neural network put everyone offline';
        engine.wait(1500, function() {
          engine.fadeIn(initText);
          initText.content = 'Now the only hope is...';
          engine.wait(1500, function() {
            engine.fadeIn(initText);
            initText.content = 'a baddass PINK router...';
            engine.wait(1500, function() {
              engine.fadeIn(initText);
              initText.content = 'with a thirst for revenge';
              engine.wait(1000, function(){
                engine.state = play;
              });
            });
          });
        });
      });
    });
    initTextOn = true;
  }
}

function play() {
  let routerHit = false;

  gameInitScene.visible = false;
  gameScene.visible = true;
  if(conversationRouterBegin)
  {
    if(conversationRouterFinished){
      engine.move(router);
    }
     
  }else{
   engine.move(router);}
  engine.contain(router, engine.stage.localBounds);
  if(conversationRouterBegin)
  {
    if(conversationRouterFinished){
       engine.move(rayBeams);
    }
  }else{
    engine.move(rayBeams);
  }
  
  if (router.y <= config.STATUS_BAR_HEIGHT) {
    router.y = config.STATUS_BAR_HEIGHT;
  }
  
  engine.move(bgItems);


  // ENEMY: FACEBOOK
  enemiesTimerFacebook += 1;
  if (enemiesTimerFacebook === enemiesFrecuencyFacebook && !(statusBarIndicators.findIndex(indicator => (indicator.type === 'Video') && indicator.on) !== -1) && !boss) {
    const enemyFacebook = engine.sprite(ImgFacebook);
    enemyFacebook.x = engine.canvas.width + enemyFacebook.width;
    enemyFacebook.y = engine.randomInt(config.STATUS_BAR_HEIGHT, engine.canvas.height - enemyFacebook.height);
    enemyFacebook.itemType = 'Image'; 
    enemyFacebook.itemPath = 'images/image.png';
    enemyFacebook.itemDrop = 20;
    enemyFacebook.type = 'facebook';
    enemyFacebook.speed = 2;
    enemyFacebook.vx = config.DIRECTION_LEFT * enemyFacebook.speed;
    enemyFacebook.lives = 2;
    enemyFacebook.health = enemyFacebook.lives;

    enemiesTimerFacebook = 0;
    enemies.push(enemyFacebook);
    gameScene.addChild(enemyFacebook);
  }

  // ENEMY: GAMEPAD  
  
  if (statusBarIndicators.findIndex(indicator => (indicator.type === 'Image') && indicator.on) !== -1) {    
    enemiesTimerGamepad += 1;
  }
  
  if (enemiesTimerGamepad === enemiesFrecuencyGamepad ) {   
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
    enemyGamepad.lives = 2;
    enemyGamepad.health = enemyGamepad.lives;

    enemiesTimerGamepad = 0;
    enemies.push(enemyGamepad);
    gameScene.addChild(enemyGamepad);
  }

  // ENEMY: WIKIPEDIA  
  
  if (statusBarIndicators.findIndex(indicator => (indicator.type === 'Video') && indicator.on) !== -1) {    
    enemiesTimerWikipedia += 1;
  }
  
  if (enemiesTimerWikipedia === enemiesFrecuencyWikipedia  && !boss) {    
    const enemyWikipedia = engine.sprite(ImgWikipedia);
    enemyWikipedia.x = engine.canvas.width + enemyWikipedia.width;
    enemyWikipedia.y = engine.randomInt(config.STATUS_BAR_HEIGHT, engine.canvas.height - enemyWikipedia.height);
    enemyWikipedia.itemType = 'Text'; 
    enemyWikipedia.itemPath = 'images/text.png';
    enemyWikipedia.itemDrop = 50;
    enemyWikipedia.type = 'wikipedia';
    enemyWikipedia.speed = 1;
    enemyWikipedia.vx = config.DIRECTION_LEFT  * enemyWikipedia.speed;
    enemyWikipedia.lives = 5;
    enemyWikipedia.health = enemyWikipedia.lives;
    enemyWikipedia.bullets = [];
    enemiesTimerWikipedia = 0;

    enemies.push(enemyWikipedia);
    gameScene.addChild(enemyWikipedia);
  }


  // ENEMY: SPOTIFY  
  
  if (statusBarIndicators.findIndex(indicator => (indicator.type === 'Text') && indicator.on) !== -1) {    
    enemiesTimerSpotify += 1;
  }
  
  if (enemiesTimerSpotify === enemiesFrecuencySpotify  && !boss) {    
    const enemySpotify = engine.sprite(ImgSpotify);
    enemySpotify.x = engine.canvas.width + enemySpotify.width;
    enemySpotify.y = engine.randomInt(config.STATUS_BAR_HEIGHT, engine.canvas.height - enemySpotify.height);
    enemySpotify.itemType = 'Sound'; 
    enemySpotify.itemPath = 'images/sound.png';
    enemySpotify.itemDrop = 40;
    enemySpotify.type = 'spotify';
    enemySpotify.speed = 5;
    enemySpotify.vx = config.DIRECTION_LEFT  * enemySpotify.speed;
    enemySpotify.lives = 3;
    enemySpotify.health = enemySpotify.lives;
    enemySpotify.bullets = [];
    enemiesTimerSpotify = 0;

    enemies.push(enemySpotify);
    gameScene.addChild(enemySpotify);
  }

  // boss
  if (statusBarIndicators.findIndex(indicator => (indicator.type === 'Sound') && indicator.on) !== -1 && !boss) {    
    boss = engine.sprite(ImgBoss);
    boss.scaleX = 1.5;
    boss.scaleY = 1.5;
    
    boss.x = engine.canvas.width + boss.width;
    boss.y = (engine.canvas.height / 2) - boss.halfHeight ;
    boss.itemType = 'Sound'; 
    boss.itemPath = 'images/sound.png';
    boss.itemDrop = 0;
    boss.type = 'boss';
    boss.speed = 1;
    boss.vx = config.DIRECTION_LEFT  * boss.speed;
    boss.lives = 50;
    boss.health = boss.lives;
    boss.bullets = [];
    boss.followFrecuency = 100;
    boss.followTimer = 0;

    enemies.push(boss);
    gameScene.addChild(boss);
  }

  if (boss) {
    boss.vx = (boss.x <= engine.canvas.width - boss.width * 2) ? 0 : boss.vx;

     // conversation
     if (!conversationRouterBegin) {
      const conversation = engine.text('Badass Router: This the boss? WHAT THE FORK!....', '20px sans-serif');
      conversation.x = 10;
      conversation.y = engine.canvas.height - (conversation.height * 5);
      engine.wait(2000, function() {
        conversation.content = 'Neural Evil: ...';
        engine.wait(2000, function() {
          conversation.content = 'Neural Evil: My original plan was to wait for you at the last level, but let\'s forget it and just fight';
          engine.wait(2000, function() {
            conversation.content = 'Badass Router:ok Fine, mister evil data, let\'s do it. ';
            engine.wait(2000, function() {
              conversation.content = '';
              conversationRouterFinished = true;
            });
          });
        });
      });
      conversationRouterBegin = true;
     }

    if (conversationRouterBegin && conversationRouterFinished) {
      engine.followEase(boss, router, 0.01);
    }
  }

  enemies = enemies.filter(function(enemy) {
    const enemyHitsEdges = engine.contain(enemy, engine.stage.localBounds);
    let enemyIsDead = (enemyHitsEdges === 'left') || enemy.health <= 0;
    if (!enemyIsDead) {
      rayBeams = rayBeams.filter(function(rayBeam) {
        if (engine.hitTestRectangle(enemy, rayBeam)) {
          engine.shake(enemy);
          enemy.health -= 1;
          gameScene.removeChild(rayBeam);
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
      if (enemy.health <= 0) {    
        explosionSound.play();     
        const explosion = engine.sprite(ImgExplosion);
        explosion.x = enemy.x;
        explosion.y = enemy.y;    
        enemy.visible = false; 
        engine.wait(500, function() {              
          enemy.vx = 0;    
          engine.remove(explosion);
          gameScene.removeChild(enemy);
        })
      } else {
        enemy.vx = 0;    
        gameScene.removeChild(enemy);
      }

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

  if (healthBar.inner.width <= 0) {
    engine.state = end;
    message.content = "You lost!";
  }

  if (boss && boss.health <= 0) {
    engine.state = end;
    message.content = "You Win!";
    engine.wait(2000, function() {
      message.x = 0;
      message.content = 'The neural network has been destroyed. Now the world returns to peace'
    });
  }
}


function end() {
  engine.stage.putCenter(message);
  gameScene.visible = false;
  gameOverScene.visible = true;
}
