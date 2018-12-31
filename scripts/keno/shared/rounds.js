'use strict';

function Round(rect, round){
    this.rect = rect;
    this.current_round = round
    this.clickables = {};
    this.increments = [1, 10, 25, 50, 'Max']
    this.available = { text: Config.style.round.available_text, background: Config.style.round.available_background}
    this.selected = {text: Config.style.round.selected_text, background: Config.style.round.selected_background }
    this.disabled = {text: Config.style.round.disabled_text, background: Config.style.round.disabled_background }
 }

 function roundActor(round){
    this.round = round;

    this.onClick = function(ctx){
        if(Game.playButton.inRound() || Config.game == 'Extra Draw Keno') return;
        Audio.Settings();
        Game.rounds.update(ctx, this.round)
    }
}

Round.prototype.update = function(ctx, round){
    if(round == this.current_round) return;
    this.current_round = round;
    this.draw(ctx);
}

Round.prototype.isMax = function(){
    return isNaN(this.current_round) || (this.current_round != 1 && this.current_round != 10 && this.current_round != 25 && this.current_round != 50)
}

Round.prototype.draw = function(ctx){
    var rect = this.rect;

    if(Config.game == 'Extra Draw Keno') {
        for(var key in this.increments){
            this.clickables[this.increments[key]] = { rect: new Rect(0, 0, 0, 0), actor: new roundActor(this.increments[key])}
        }
        return;
    };
    for(var key in this.increments){
        var y = rect.y + (rect.h * key) + (Game.dimenisons.boxMargin * key);
        var suffix = key == 0 ? ' Round' : ' Rounds';

        var colors = this.current_round === this.increments[key] ? this.selected : this.available;
        
        if(key == 4 && this.isMax()) colors = this.selected;
        
        if(Game.playButton && colors == this.available){
            if(Game.playButton.inRound()) {
                colors = this.disabled;
            }
        }

        ctx.clearRect(rect.x, y, rect.w, rect.h);
        ctx.fillStyle = colors.background;
        ctx.fillRect(rect.x, y, rect.w, rect.h);
        ctx.fillStyle = colors.text;
        ctx.fillText(this.increments[key] + suffix, rect.x + (rect.w / 2), y + (rect.h / 2));
        this.clickables[this.increments[key]] = { rect: new Rect(rect.x, y, rect.w, rect.h), actor: new roundActor(this.increments[key])}
    }
}

Round.prototype.getClickables = function(){
    return [this.clickables[this.increments[0]], this.clickables[this.increments[1]], this.clickables[this.increments[2]], this.clickables[this.increments[3]], this.clickables[this.increments[4]]]
}

