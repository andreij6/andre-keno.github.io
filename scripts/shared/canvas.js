'use strict';

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

var GameCanvas = {
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
        ctx.fillStyle = 'black'
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillRect(0,0, canvas.width, canvas.height);

        ctx.font = GameCanvas.style.title_font;
        ctx.fillStyle = 'white'
        ctx.strokeStyle = 'white'
        ctx.fillText(Config.game, GameCanvas.dimenisons.origin.x + (977 / 2), GameCanvas.dimenisons.origin.y - 44);

        ctx.font = GameCanvas.style.font;

        ctx.textAlign = 'left';
        GameCanvas.rules = new Keno.Rules(new Keno.Rect(GameCanvas.dimenisons.origin.x, GameCanvas.dimenisons.origin.y - 60, 75, 20));
        ctx.fillText('Rules', GameCanvas.dimenisons.origin.x, GameCanvas.dimenisons.origin.y - 44);
        ctx.textAlign = 'center';
    }

    var grid = function(){
        var originalX = GameCanvas.dimenisons.origin.x + GameCanvas.dimenisons.boxSize * 4 + GameCanvas.dimenisons.boxMargin * 2;

        if(GameCanvas.numbers.length == 0){
            var count = 1;
            for(var i = 0; i < 10; i++){
                for(var j = 0; j < 8; j++){
                    var x = (originalX + (j * GameCanvas.dimenisons.boxMargin)) + GameCanvas.dimenisons.boxSize * j;
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

        var x = GameCanvas.dimenisons.origin.x + GameCanvas.dimenisons.boxSize * 4 + GameCanvas.dimenisons.boxMargin * 2;
        var y = GameCanvas.dimenisons.origin.y + (GameCanvas.dimenisons.boxSize * 10) + (GameCanvas.dimenisons.boxMargin * 10);
        var w = horizontalControlWidth;
        var h = GameCanvas.dimenisons.boxSize;

        GameCanvas.clearAll = new Controls.ClearAll(new Keno.Rect(x,y,w,h));
        GameCanvas.clearAll.draw(ctx);

        var bankrollY  = y + h + GameCanvas.dimenisons.boxMargin;
        w = w * 2 + GameCanvas.dimenisons.boxMargin

        GameCanvas.bankroll = new Controls.Bankroll(new Keno.Rect(x, bankrollY, w, h))
        GameCanvas.bankroll.draw(ctx);

        x = GameCanvas.dimenisons.origin.x + GameCanvas.dimenisons.boxSize * 4 + GameCanvas.dimenisons.boxMargin * 2;
        w = horizontalControlWidth;
        x = x + horizontalControlWidth + GameCanvas.dimenisons.boxMargin;
        GameCanvas.quickPick = new Controls.QuickPick(new Keno.Rect(x,y,w,h));
        GameCanvas.quickPick.draw(ctx);

        x = GameCanvas.dimenisons.origin.x;
        y = GameCanvas.dimenisons.origin.y;
        w = GameCanvas.dimenisons.boxSize * 2;
        if(!('payout' in GameCanvas)) GameCanvas.payout = new Controls.Payout(new Keno.Rect(x,y,w,h), [['Hits','Payout']]);
        GameCanvas.payout.draw(ctx);

        x = GameCanvas.dimenisons.origin.x + (12 * GameCanvas.dimenisons.boxSize) + (10 * GameCanvas.dimenisons.boxMargin); 
        y = GameCanvas.dimenisons.origin.y
        w = GameCanvas.dimenisons.boxSize * 2;
        h = ((GameCanvas.dimenisons.boxSize * 9) + (GameCanvas.dimenisons.boxMargin * 6)) / 3;
        if(!('wagers' in GameCanvas)) GameCanvas.wagers = new Controls.Wager(new Keno.Rect(x,y,w,h));
        GameCanvas.wagers.draw(ctx);

        x = x + w + GameCanvas.dimenisons.boxMargin;
        w = GameCanvas.dimenisons.boxSize * 2;
        h = ((GameCanvas.dimenisons.boxSize * 9) + (GameCanvas.dimenisons.boxMargin * 4)) / 5;
        if(!('rounds' in GameCanvas)) GameCanvas.rounds = new Controls.Round(new Keno.Rect(x,y,w,h), 1);
        GameCanvas.rounds.draw(ctx);
        

        x = GameCanvas.dimenisons.origin.x + (12 * GameCanvas.dimenisons.boxSize) + (10 * GameCanvas.dimenisons.boxMargin);
        y = GameCanvas.dimenisons.origin.y + (GameCanvas.dimenisons.boxSize * 9) + (GameCanvas.dimenisons.boxMargin * 9);
        w = w + w + GameCanvas.dimenisons.boxMargin;
        h = GameCanvas.dimenisons.boxSize * 3 + GameCanvas.dimenisons.boxMargin * 2;
        if(!('playButton' in GameCanvas)) GameCanvas.playButton = new Controls.Play(new Keno.Rect(x, y, w, h));
        GameCanvas.playButton.draw(ctx);

        x = x + w + GameCanvas.dimenisons.boxMargin;
        h = GameCanvas.dimenisons.boxSize * 2;
        y = GameCanvas.dimenisons.origin.y;
        w = GameCanvas.dimenisons.boxSize * 2;
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
                       .concat([GameCanvas.clearAll, GameCanvas.quickPick, GameCanvas.playButton, GameCanvas.rules])
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
      families: ['Exo']
    },
    active: function() {
      GameCanvas.resize();

      Audio.Background();
    }
});

GameCanvas.resize();

canvas.addEventListener('click', GameCanvas.onClick);

window.addEventListener('resize', GameCanvas.resize, false);

document.body.onkeyup = function(e){
    var space = 32;
    var c = 67;
    var q = 81;

    if(e.keyCode == space){
        if(GameCanvas.playButton) GameCanvas.playButton.onClick(ctx);
    }

    if(e.keyCode == c){
        if(GameCanvas.clearAll) GameCanvas.clearAll.onClick(ctx);
    }

    if(e.keyCode == q){
        if(GameCanvas.quickPick) GameCanvas.quickPick.onClick(ctx);
    }
}
