'use strict';

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

var GameCanvas = {
    dimenisons: {
        width: 1280,
        height: 720,
        canvas_width: 1280,
        canvas_height: 720, 
        ratio: 16/9,
        boxSize: 50,
        boxMargin: 6,
        origin: {
            x: 25,
            y: 25
        }
    },
    numbers: [],
    style: {
        font: '16px Exo'
    }
};

GameCanvas.resize = function(){
    canvas.width = GameCanvas.dimenisons.width;
    canvas.height = GameCanvas.dimenisons.height;

    GameCanvas.dimenisons.canvas_height = window.innerHeight;
    GameCanvas.dimenisons.canvas_width = window.innerWidth;

    canvas.style.height = window.innerHeight + 'px';
    canvas.style.width = window.innerWidth + 'px';

    if(window.innerHeight < window.innerWidth / GameCanvas.dimenisons.ratio){
        canvas.style.width = window.innerHeight * GameCanvas.dimenisons.ratio + 'px';
        GameCanvas.dimenisons.canvas_width = window.innerHeight * GameCanvas.dimenisons.ratio;
    } else {
        canvas.style.height = window.innerWidth / GameCanvas.dimenisons.ratio + 'px';
        GameCanvas.dimenisons.canvas_height = window.innerWidth / GameCanvas.dimenisons.ratio;
    } 
    
    GameCanvas.draw();
}

GameCanvas.draw = function(){

    var setup = function(){
        ctx.font = GameCanvas.style.font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillRect(0,0, canvas.width, canvas.height);
    }

    var grid = function(){
        if(GameCanvas.numbers.length == 0){
            var count = 1;
            for(var i = 0; i < 10; i++){
                for(var j = 0; j < 8; j++){
                    var x = (GameCanvas.dimenisons.origin.x + (j * GameCanvas.dimenisons.boxMargin)) + GameCanvas.dimenisons.boxSize * j;
                    var y = (GameCanvas.dimenisons.origin.y + (i * GameCanvas.dimenisons.boxMargin)) + GameCanvas.dimenisons.boxSize * i;
                    var w = GameCanvas.dimenisons.boxSize;
                    var h = GameCanvas.dimenisons.boxSize;
                    var position = new Keno.Position(new Keno.Rect(x, y, w, h), count, Keno.position.available);
                    GameCanvas.numbers.push(position);
                    count++;
                }
            }
        } 
        
        for(var i in GameCanvas.numbers) GameCanvas.numbers[i].draw(ctx);        
    }

    var controls = function(){
        var horizontalControlWidth = (GameCanvas.dimenisons.boxSize * 4) + (3 * GameCanvas.dimenisons.boxMargin);

        var x = GameCanvas.dimenisons.origin.x;
        var y = GameCanvas.dimenisons.origin.y + (GameCanvas.dimenisons.boxSize * 10) + (GameCanvas.dimenisons.boxMargin * 10);
        var w = horizontalControlWidth;
        var h = GameCanvas.dimenisons.boxSize;

        GameCanvas.clearAll = new Controls.ClearAll(new Keno.Rect(x,y,w,h));
        GameCanvas.clearAll.draw(ctx);

        var bankrollY  = y + h + GameCanvas.dimenisons.boxMargin;
        var width = w * 2 + GameCanvas.dimenisons.boxMargin;

        GameCanvas.bankroll = new Controls.Bankroll(new Keno.Rect(x, bankrollY, width, h))
        GameCanvas.bankroll.draw(ctx);

        x = GameCanvas.dimenisons.origin.x + horizontalControlWidth + GameCanvas.dimenisons.boxMargin;
        GameCanvas.quickPick = new Controls.QuickPick(new Keno.Rect(x,y,w,h));
        GameCanvas.quickPick.draw(ctx);

        x = GameCanvas.dimenisons.origin.x + (8 * GameCanvas.dimenisons.boxSize) + (8 * GameCanvas.dimenisons.boxMargin); 
        y = GameCanvas.dimenisons.origin.y
        w = GameCanvas.dimenisons.boxSize * 2;
        h = ((GameCanvas.dimenisons.boxSize * 9) + (GameCanvas.dimenisons.boxMargin * 6)) / 3;
        if(!('wagers' in GameCanvas)) GameCanvas.wagers = new Controls.Wager(new Keno.Rect(x,y,w,h), 1);
        GameCanvas.wagers.draw(ctx);

        x = x + w + GameCanvas.dimenisons.boxMargin;
        w = GameCanvas.dimenisons.boxSize * 2;
        h = ((GameCanvas.dimenisons.boxSize * 9) + (GameCanvas.dimenisons.boxMargin * 4)) / 5;
        if(!('rounds' in GameCanvas)) GameCanvas.rounds = new Controls.Round(new Keno.Rect(x,y,w,h), 1);
        GameCanvas.rounds.draw(ctx);

        x = GameCanvas.dimenisons.origin.x + (8 * GameCanvas.dimenisons.boxSize) + (8 * GameCanvas.dimenisons.boxMargin);
        y = GameCanvas.dimenisons.origin.y + (GameCanvas.dimenisons.boxSize * 9) + (GameCanvas.dimenisons.boxMargin * 9);
        w = w + w + GameCanvas.dimenisons.boxMargin;
        h = GameCanvas.dimenisons.boxSize * 3 + GameCanvas.dimenisons.boxMargin * 2;
        GameCanvas.playButton = new Controls.Play(new Keno.Rect(x, y, w, h));
        GameCanvas.playButton.draw(ctx);

        x = x + w + GameCanvas.dimenisons.boxMargin;
        y = GameCanvas.dimenisons.origin.y;
        w = w / 2;
        if(!('payout' in GameCanvas)) GameCanvas.payout = new Controls.Payout(new Keno.Rect(x,y,w,h), [['Hits','Payout']]);
        GameCanvas.payout.draw(ctx);

        x = x + (w * 2) + (GameCanvas.dimenisons.boxMargin * 2);
        h = GameCanvas.dimenisons.boxSize * 2;
        if(!('sound' in GameCanvas)) GameCanvas.sound = new Controls.Sound(new Keno.Rect(x,y,w,h), true);
        GameCanvas.sound.draw(ctx);

        y = y + (GameCanvas.dimenisons.boxSize * 5) + (GameCanvas.dimenisons.boxMargin * 3);

        h = GameCanvas.dimenisons.boxSize * 2;
        if(!('tempo' in GameCanvas)) GameCanvas.tempo = new Controls.Tempo(new Keno.Rect(x,y,w,h), true);
        GameCanvas.tempo.draw(ctx);
    }

    setup();
    grid();
    controls();
}

GameCanvas.onClick = function(mouse){

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

    var clickables = [].concat(GameCanvas.numbers)
                       .concat([GameCanvas.clearAll, GameCanvas.quickPick, GameCanvas.playButton])
                       .concat(GameCanvas.sound.getClickables())
                       .concat(GameCanvas.tempo.getClickables())
                       .concat(GameCanvas.rounds.getClickables())
                       .concat(GameCanvas.wagers.getClickables())
                       

    var mouseX = mouse.x - canvas.getBoundingClientRect().left;
    var mouseY = mouse.y - canvas.getBoundingClientRect().top;
    mouseX *= GameCanvas.dimenisons.width / GameCanvas.dimenisons.canvas_width;
    mouseY *= GameCanvas.dimenisons.height / GameCanvas.dimenisons.canvas_height;

    var actor = collision(clickables, mouseX, mouseY);

    if(actor !== undefined && actor) actor.onClick(canvas.getContext('2d'));
}

WebFont.load({
    google: {
      families: ['Exo', 'Open Sans:bold']
    },
    active: function() {
      GameCanvas.resize();
    }
});

GameCanvas.resize();

canvas.addEventListener('click', GameCanvas.onClick);

window.addEventListener('resize', GameCanvas.resize, false);
