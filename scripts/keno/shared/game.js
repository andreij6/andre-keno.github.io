'use strict';

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

var Game = {
    dimenisons: {
        width: 1680,
        height: 1050,
        canvas_width: 1680,
        canvas_height: 1050, 
        ratio: 16/9,
        boxSize: 65,
        boxMargin: 6,
        origin: {
            x: 1680 / 7,
            y: 1050 / 8
        }
    },
    numbers: [],
    style: {
        font: '16px Exo',
        title_font: '36px Exo'
    }
};

Game.resize = function(){
    canvas.width = Game.dimenisons.width;
    canvas.height = Game.dimenisons.height;

    Game.dimenisons.canvas_height = window.innerHeight;
    Game.dimenisons.canvas_width = window.innerWidth;

    canvas.style.height = window.innerHeight + 'px';
    canvas.style.width = window.innerWidth + 'px';

    if(window.innerHeight < window.innerWidth / Game.dimenisons.ratio){
        canvas.style.width = window.innerHeight * Game.dimenisons.ratio + 'px';
        Game.dimenisons.canvas_width = window.innerHeight * Game.dimenisons.ratio;
    } else {
        canvas.style.height = window.innerWidth / Game.dimenisons.ratio + 'px';
        Game.dimenisons.canvas_height = window.innerWidth / Game.dimenisons.ratio;
    } 

    Game.draw();
}

Game.draw = function(){

    var setup = function(){
        ctx.fillStyle = 'black'
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillRect(0,0, canvas.width, canvas.height);

        ctx.font = Game.style.title_font;
        ctx.fillStyle = 'white'
        ctx.strokeStyle = 'white'
        ctx.fillText(Config.game, Game.dimenisons.origin.x + (977 / 2), Game.dimenisons.origin.y - 44);

        ctx.font = Game.style.font;

        ctx.textAlign = 'left';
        Game.rules = new Rules(new Rect(Game.dimenisons.origin.x, Game.dimenisons.origin.y - 60, 75, 20));
        ctx.fillText('Rules', Game.dimenisons.origin.x, Game.dimenisons.origin.y - 44);
        ctx.textAlign = 'center';
    }

    var grid = function(){
        var originalX = Game.dimenisons.origin.x + Game.dimenisons.boxSize * 4 + Game.dimenisons.boxMargin * 2;

        if(Game.numbers.length == 0){
            var count = 1;
            for(var i = 0; i < 10; i++){
                for(var j = 0; j < 8; j++){
                    var x = (originalX + (j * Game.dimenisons.boxMargin)) + Game.dimenisons.boxSize * j;
                    var y = (Game.dimenisons.origin.y + (i * Game.dimenisons.boxMargin)) + Game.dimenisons.boxSize * i;
                    var w = Game.dimenisons.boxSize;
                    var h = Game.dimenisons.boxSize;
                    var position = new Position(new Rect(x, y, w, h), count, Keno.position.available);
                    Game.numbers.push(position);
                    count++;
                }
            }
        } 
        
        for(var i in Game.numbers) Game.numbers[i].draw(ctx);        
    }

    var controls = function(){
        var horizontalControlWidth = (Game.dimenisons.boxSize * 4) + (3 * Game.dimenisons.boxMargin);

        var x = Game.dimenisons.origin.x + Game.dimenisons.boxSize * 4 + Game.dimenisons.boxMargin * 2;
        var y = Game.dimenisons.origin.y + (Game.dimenisons.boxSize * 10) + (Game.dimenisons.boxMargin * 10);
        var w = horizontalControlWidth;
        var h = Game.dimenisons.boxSize;

        Game.clearAll = new ClearAll(new Rect(x,y,w,h));
        Game.clearAll.draw(ctx);

        var bankrollY  = y + h + Game.dimenisons.boxMargin;
        w = w * 2 + Game.dimenisons.boxMargin

        Game.bankroll = new Bankroll(new Rect(x, bankrollY, w, h))
        Game.bankroll.draw(ctx);

        x = Game.dimenisons.origin.x + Game.dimenisons.boxSize * 4 + Game.dimenisons.boxMargin * 2;
        w = horizontalControlWidth;
        x = x + horizontalControlWidth + Game.dimenisons.boxMargin;
        Game.quickPick = new QuickPick(new Rect(x,y,w,h));
        Game.quickPick.draw(ctx);

        x = Game.dimenisons.origin.x;
        y = Game.dimenisons.origin.y;
        w = Game.dimenisons.boxSize * 2;
        if(!('payout' in Game)) Game.payout = new Payout(new Rect(x,y,w,h), [['Hits','Payout']]);
        Game.payout.draw(ctx);

        x = Game.dimenisons.origin.x + (12 * Game.dimenisons.boxSize) + (10 * Game.dimenisons.boxMargin); 
        y = Game.dimenisons.origin.y
        w = Game.dimenisons.boxSize * 2;
        h = ((Game.dimenisons.boxSize * 9) + (Game.dimenisons.boxMargin * 6)) / 3;
        if(!('wagers' in Game)) Game.wagers = new Wager(new Rect(x,y,w,h));
        Game.wagers.draw(ctx);

        x = x + w + Game.dimenisons.boxMargin;
        w = Game.dimenisons.boxSize * 2;
        h = ((Game.dimenisons.boxSize * 9) + (Game.dimenisons.boxMargin * 4)) / 5;
        if(!('rounds' in Game)) Game.rounds = new Round(new Rect(x,y,w,h), 1);
        Game.rounds.draw(ctx);
        
        x = Game.dimenisons.origin.x + (12 * Game.dimenisons.boxSize) + (10 * Game.dimenisons.boxMargin);
        y = Game.dimenisons.origin.y + (Game.dimenisons.boxSize * 9) + (Game.dimenisons.boxMargin * 9);
        w = w + w + Game.dimenisons.boxMargin;
        h = Game.dimenisons.boxSize * 3 + Game.dimenisons.boxMargin * 2;
        var playW = w + (Game.dimenisons.boxSize * 2) + Game.dimenisons.boxMargin;
        if(!('playButton' in Game)) Game.playButton = new Play(new Rect(x, y, playW, h));
        Game.playButton.draw(ctx);

        x = x + w + Game.dimenisons.boxMargin;
        h = Game.dimenisons.boxSize;
        y = Game.dimenisons.origin.y;
        w = Game.dimenisons.boxSize * 2;
        if(!('sound' in Game)) Game.sound = new SoundCtrl(new Rect(x,y,w,h), true);
        Game.sound.draw(ctx);

        h = Game.dimenisons.boxSize * 2;
        y = y + (Game.dimenisons.boxSize * 5) - (Game.dimenisons.boxMargin * 1);
        if(!('tempo' in Game)) Game.tempo = new Tempo(new Rect(x,y,w,h), true);
        Game.tempo.draw(ctx);
    }

    setup();
    grid();
    controls();
    
}

Game.onClick = function(mouse){
    var collision = function(controls, x, y){
        var isCollision = false;
        for (var key in controls) {
            var rect = controls[key].rect;
            var left = rect.x, right = rect.x+rect.w;
            var top = rect.y, bottom = rect.y+rect.h;
            if (right >= x
                && left <= x
                && bottom >= y
                && top <= y) {
                if('actor' in controls[key]){
                    return controls[key].actor;
                }
                isCollision = controls[key];
            }
        }
        return isCollision;
    }

    var clickables = [].concat(Game.numbers)
                       .concat([Game.clearAll, Game.quickPick, Game.playButton, Game.rules])
                       .concat(Game.sound.getClickables())
                       .concat(Game.tempo.getClickables())
                       .concat(Game.rounds.getClickables())
                       .concat(Game.wagers.getClickables())
                       

    var mouseX = mouse.x - canvas.getBoundingClientRect().left;
    var mouseY = mouse.y - canvas.getBoundingClientRect().top;
    mouseX *= Game.dimenisons.width / Game.dimenisons.canvas_width;
    mouseY *= Game.dimenisons.height / Game.dimenisons.canvas_height;

    var actor = collision(clickables, mouseX, mouseY);

    if(actor !== undefined && actor) actor.onClick(canvas.getContext('2d'));
}

WebFont.load({
    google: {
      families: ['Exo']
    },
    active: function() {
      Game.resize();
    }
});

Game.resize();

canvas.addEventListener('click', Game.onClick);

window.addEventListener('resize', Game.resize, false);

document.body.onkeyup = function(e){
    var space = 32;
    var c = 67;
    var q = 81;

    if(e.keyCode == space){
        if(Game.playButton) Game.playButton.onClick(ctx);
    }

    if(e.keyCode == c){
        if(Game.clearAll) Game.clearAll.onClick(ctx);
    }

    if(e.keyCode == q){
        if(Game.quickPick) Game.quickPick.onClick(ctx);
    }
}

document.title = Config.game;
