/**
 * Naamruimte
 */
var Game      = Game      || {};
var Keyboard  = Keyboard  || {}; 
var Component = Component || {};

/**
 * Toetsen indelen
 */
Keyboard.Keymap = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
};

/**
 * Toetsenbord Events
 */
Keyboard.ControllerEvents = function() {
  
  // Instellingen
  var self      = this;
  this.pressKey = null;
  this.keymap   = Keyboard.Keymap;
  
  // Keydown Event
  document.onkeydown = function(event) {
    self.pressKey = event.which;
  };
  
  // Get Key
  this.getKey = function() {
    return this.keymap[this.pressKey];
  };
};

/**
 * Game Componenten Stages
 */
Component.Stage = function(canvas, conf) {  
  
  // Sets
  this.keyEvent  = new Keyboard.ControllerEvents();
  this.width     = canvas.width;
  this.height    = canvas.height;
  this.length    = [];
  this.food      = {};
  this.score     = 0;
  this.direction = 'right';
  this.conf      = {
    cw   : 10,
    size : 5,
    fps  : 1000
  };
  
  // De configuratie combineren
  if (typeof conf == 'object') {
    for (var key in conf) {
      if (conf.hasOwnProperty(key)) {
        this.conf[key] = conf[key];
      }
    }
  }
  
};

/**
 * Game Componenten Snake
 */
Component.Snake = function(canvas, conf) {
  
  // Game Stage
  this.stage = new Component.Stage(canvas, conf);
  
  // Initialisatie van Snake
  this.initSnake = function() {
    
    // Herhaling in Snake's Configuratie Grootte
    for (var i = 0; i < this.stage.conf.size; i++) {
      
      // Toevoeging van Snake Cellen
      this.stage.length.push({x: i, y:0});
    }
  };
  
  // Oproep van de initialisatie van Snake
  this.initSnake();
  
  // Initialisatie van het eten  
  this.initFood = function() {
    
    // Het toevoegen van eten op het canvas
    this.stage.food = {
      x: Math.round(Math.random() * (this.stage.width - this.stage.conf.cw) / this.stage.conf.cw), 
      y: Math.round(Math.random() * (this.stage.height - this.stage.conf.cw) / this.stage.conf.cw), 
    };
  };
  
  // Initialisatie van het eten
  this.initFood();
  
  // Restart Stage
  this.restart = function() {
    this.stage.length            = [];
    this.stage.food              = {};
    this.stage.score             = 0;
    this.stage.direction         = 'right';
    this.stage.keyEvent.pressKey = null;
    this.initSnake();
    this.initFood();
  };
};

/**
 * Game tekenen
 */
Game.Draw = function(context, snake) {
  
  // Stage tekenen
  this.drawStage = function() {
    
    // Het checken van de toets indruk en Stage richting instellen
    var keyPress = snake.stage.keyEvent.getKey(); 
    if (typeof(keyPress) != 'undefined') {
      snake.stage.direction = keyPress;
    }
    
    // Witte Stage tekenen
    context.fillStyle = "blue";
    context.fillRect(0, 0, snake.stage.width, snake.stage.height);
    
    // Snake Positie
    var nx = snake.stage.length[0].x;
    var ny = snake.stage.length[0].y;
    
    // Positie toevoegen door Stage richting
    switch (snake.stage.direction) {
      case 'right':
        nx++;
        break;
      case 'left':
        nx--;
        break;
      case 'up':
        ny--;
        break;
      case 'down':
        ny++;
        break;
    }
    
    // Het checken van botsingen
    if (this.collision(nx, ny) == true) {
      snake.restart();
      return;
    }
    
    // De logica achter Snake's eten
    if (nx == snake.stage.food.x && ny == snake.stage.food.y) {
      var tail = {x: nx, y: ny};
      snake.stage.score++;
      snake.initFood();
    } else {
      var tail = snake.stage.length.pop();
      tail.x   = nx;
      tail.y   = ny;  
    }
    snake.stage.length.unshift(tail);
    
    // Snake tekenen
    for (var i = 0; i < snake.stage.length.length; i++) {
      var cell = snake.stage.length[i];
      this.drawCell(cell.x, cell.y);
    }
    
    // Eten tekenen
    this.drawCell(snake.stage.food.x, snake.stage.food.y);
    
    // Score tekenen
    context.fillText('Score: ' + snake.stage.score, 5, (snake.stage.height - 5));
  };
  
  // Cellen tekenen
  this.drawCell = function(x, y) {
    context.fillStyle = 'rgb(170, 170, 170)';
    context.beginPath();
    context.arc((x * snake.stage.conf.cw + 6), (y * snake.stage.conf.cw + 6), 4, 0, 2*Math.PI, false);    
    context.fill();
  };
  
  // Botsingen checken met de muren
  this.collision = function(nx, ny) {  
    if (nx == -1 || nx == (snake.stage.width / snake.stage.conf.cw) || ny == -1 || ny == (snake.stage.height / snake.stage.conf.cw)) {
      return true;
    }
    return false;    
  }
};


/**
 * Game Snake
 */
Game.Snake = function(elementId, conf) {
  
  // Sets
  var canvas   = document.getElementById(elementId);
  var context  = canvas.getContext("2d");
  var snake    = new Component.Snake(canvas, conf);
  var gameDraw = new Game.Draw(context, snake);
  
  // Game Interval
  setInterval(function() {gameDraw.drawStage();}, snake.stage.conf.fps);
};


/**
 * Venster Laden
 */
window.onload = function() {
  var snake = new Game.Snake('stage', {fps: 100, size: 4});
};