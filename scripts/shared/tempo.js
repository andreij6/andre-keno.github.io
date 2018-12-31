'use strict';

function Tempo(rect, isNormal){ 
    this.rect = rect;
    this.isNormal = isNormal
    this.clickables = {};
    this.normalId = 1;
    this.turboId = 2;
    this.selected = {
        background: Config.style.tempo.selected_background,
        text: Config.style.tempo.selected_text
    }
    this.open = {
        background: Config.style.tempo.available_background,
        text: Config.style.tempo.available_text
    }
}

function tempoActor(normal){
    this.normal = normal;
    this.onClick = function(ctx){
        Audio.Settings();
        Game.tempo.update(ctx, this.normal);
    }
}

Tempo.prototype.draw = function(ctx){
    var rect = this.rect;

    ctx.fillStyle = Config.style.heading.background;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h / 2);
    ctx.fillStyle = Config.style.heading.text;
    ctx.fillText("Speed", rect.x + (rect.w / 2), rect.y + (rect.h / 4))

    var y = rect.y +  Game.dimenisons.boxSize + Game.dimenisons.boxMargin;

    var style = this.isNormal ? this.selected : this.open;

    ctx.fillStyle = style.background;
    ctx.fillRect(rect.x, y, rect.w, rect.h);
    ctx.fillStyle = style.text;
    ctx.fillText("Normal", rect.x + (rect.w / 2), y + (rect.h / 2))
    this.clickables[this.normalId] = {rect: new Rect(rect.x, y, rect.w, rect.h), actor: new tempoActor(true) };

    y = y + rect.h + Game.dimenisons.boxMargin;

    var style = this.isNormal ? this.open : this.selected;

    ctx.fillStyle = style.background;
    ctx.fillRect(rect.x, y, rect.w, rect.h);
    ctx.fillStyle = style.text;
    ctx.fillText("Turbo", rect.x + (rect.w / 2), y + (rect.h / 2))
    this.clickables[this.turboId] = {rect: new Rect(rect.x, y, rect.w, rect.h), actor: new tempoActor(false) };

    y = y + rect.h + Game.dimenisons.boxMargin;
    var h = rect.h + 30;

    ctx.fillStyle = Config.style.empty.background;
    ctx.fillRect(rect.x, y, rect.w, h);
}

Tempo.prototype.getClickables = function(){
    return [this.clickables[this.turboId], this.clickables[this.normalId]]
}

Tempo.prototype.update = function(ctx, normal){
    if(normal == this.isNormal) return;
    this.isNormal = normal;
    this.draw(ctx);
}