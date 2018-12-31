'use strict';

function Wager(rect){ 
    this.rect = rect;
    this.current_wager = KenoLogic.Wagers[0];
    this.clickables = {};
    this.increments = KenoLogic.Wagers;
    this.extra_on = false;
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

function extraOptionActor(){
    this.onClick = function(ctx){
        if(!Game.wagers.extra_on) return;
        Audio.Settings();
        Game.wagers.extra_on = false;
        Game.bankroll.update(ctx, -Game.wagers.current_wager);
        Game.wagers.draw(ctx);
        Game.playButton.playOption(ctx);
    }
}

Wager.prototype.update = function(ctx, amount){
    if(amount == this.current_wager) return;
    this.current_wager = amount;
    this.draw(ctx);
}

Wager.prototype.enableExtra = function(ctx){
    this.extra_on = true;
    this.draw(ctx);
}

Wager.prototype.disabledExtra = function(ctx){
    this.extra_on = false;
    //this.draw(ctx); dont need to redraw.
}

Wager.prototype.draw = function(ctx){
    var rect = this.rect;
    var available = { text: Config.style.wager.available_text, background: Config.style.wager.available_background}
    var selected = {text: Config.style.wager.selected_text, background: Config.style.wager.selected_background }
    var disabled = {text: Config.style.wager.disabled_text, background: Config.style.wager.disabled_background }
    var extraConfig = {text: Config.style.wager.extra_on_text, background: Config.style.wager.extra_on_background }
    var w = rect.w;
    var h = rect.h;
    var y = rect.y;
    w = (rect.w * 2) + Game.dimenisons.boxMargin;
    h = (rect.h / 1.35)

    for(var key in this.increments){
        y = rect.y + (h * key) + (Game.dimenisons.boxMargin * key);
        var colors = this.current_wager === this.increments[key] ? selected : available;
        if(Game.playButton && this.current_wager != this.increments[key]){
            if(Game.playButton.inRound() || this.extra_on) {
                colors = disabled;
            }
        }

        ctx.fillStyle = colors.background;
        ctx.fillRect(rect.x, y, w, h);
        ctx.fillStyle = colors.text;
        ctx.fillText(this.increments[key] + ' FUN', rect.x + (w / 2), y + (h / 2));
        this.clickables[this.increments[key]] = { rect: new Rect(rect.x, y, w, h), actor: new wagerActor(this.increments[key])}
    }

    var colors = this.extra_on ? extraConfig : disabled;

    y = rect.y + (h * this.increments.length) + (Game.dimenisons.boxMargin * this.increments.length);
    ctx.fillStyle = colors.background;
    ctx.fillRect(rect.x, y, w, h);
    ctx.fillStyle = colors.text;
    this.clickables['option'] = { rect: new Rect(rect.x, y, w, h), actor: new extraOptionActor()}
    ctx.fillText('Buy 3 More Draws', rect.x + (w / 2), y + (h / 2));
}

Wager.prototype.getClickables = function(){
    return [this.clickables[this.increments[0]], this.clickables[this.increments[1]], this.clickables[this.increments[2]], this.clickables['option']]
}