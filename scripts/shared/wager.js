'use strict';

function Wager(rect){ 
    this.rect = rect;
    this.current_wager = KenoLogic.Wagers[0];
    this.clickables = {};
    this.increments = KenoLogic.Wagers;

    this.available = { text: Config.style.wager.available_text, background: Config.style.wager.available_background}
    this.selected = {text: Config.style.wager.selected_text, background: Config.style.wager.selected_background }
    this.disabled = {text: Config.style.wager.disabled_text, background: Config.style.wager.disabled_background }
}

function wagerActor(wager){
    this.wager = wager;

    this.onClick = function(ctx){
        if(Game.playButton.inRound()) return;
        Audio.Settings();
        Game.wagers.update(ctx, this.wager)
        Game.payout.update(ctx);
    }
}

Wager.prototype.update = function(ctx, amount){
    if(amount == this.current_wager) return;
    this.current_wager = amount;
    this.draw(ctx);
}

Wager.prototype.draw = function(ctx){
    var rect = this.rect;

    var w = rect.w;
    var h = rect.h;
    var y = rect.y;

    for(var key in this.increments){
        y = rect.y + (h * key) + (Game.dimenisons.boxMargin * key);

        var colors = this.current_wager === this.increments[key] ? this.selected : this.available;

        if(Game.playButton && this.current_wager != this.increments[key]){
            if(Game.playButton.inRound()) {
                colors = this.disabled;
            }
        }

        ctx.fillStyle = colors.background;
        ctx.fillRect(rect.x, y, w, h);
        ctx.fillStyle = colors.text;
        ctx.fillText(this.increments[key] + ' FUN', rect.x + (w / 2), y + (h / 2));
        this.clickables[this.increments[key]] = { rect: new Rect(rect.x, y, w, h), actor: new wagerActor(this.increments[key])}
    }
}

Wager.prototype.getClickables = function(){
    return [this.clickables[this.increments[0]], this.clickables[this.increments[1]], this.clickables[this.increments[2]]]
}