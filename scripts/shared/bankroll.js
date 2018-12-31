'use strict';

function Bankroll(rect){
    this.rect = rect;
    this.queue = [];
}

Bankroll.prototype.update = function(ctx, amount){
    KenoLogic.bankroll += amount;
    this.animate(ctx, amount);
}

Bankroll.prototype.animate = function(ctx, amount) {
    var rect = this.rect;

    ctx.fillStyle = Config.style.bankroll.background;
    ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = Config.style.bankroll.won_background;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = Config.style.bankroll.text;
    ctx.fillText('Bankroll: ' + numberWithCommas(KenoLogic.bankroll), rect.x + (rect.w / 4), rect.y + (rect.h / 2));
    
    if(amount > 0){
        ctx.fillStyle = Config.style.bankroll.won_text;
        ctx.fillText('+ ' + amount, rect.x + (rect.w / 1.5), rect.y + (rect.h / 2));
        var that = this;
        setTimeout(function(){ that.draw(ctx); }, 3000)
    } else {
        this.draw(ctx);
    }
}

Bankroll.prototype.draw = function(ctx){
    var rect = this.rect;

    ctx.fillStyle = Config.style.bankroll.background;
    ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = Config.style.bankroll.text;
    ctx.fillText('Bankroll: ' + numberWithCommas(KenoLogic.bankroll), rect.x + (rect.w / 4), rect.y + (rect.h / 2));
}