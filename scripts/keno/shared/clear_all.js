'use strict';

function ClearAll(rect){
    this.rect = rect;
}

ClearAll.prototype.onClick = function(ctx){
    if(Game.playButton.inRound()) return;
    Keno.selected = {};
    for(var i in Game.numbers){
        Game.numbers[i].update(ctx, Keno.position.available);
    }
    Game.payout.update(ctx);
    Audio.ClearAll();
}

ClearAll.prototype.draw = function(ctx){
    var rect = this.rect;
    
    ctx.fillStyle = Config.style.clearAll.background
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = Config.style.clearAll.text;
    ctx.fillText('Clear All', rect.x + (rect.w / 2), rect.y + (rect.h / 2));
}