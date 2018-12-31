'use strict';

 function SoundCtrl(rect, on){
    this.rect = rect;
    this.on = on
    this.clickables = {};
    this.onId = 1;
    this.offId = 2;
    this.selected = {
        background: Config.style.sound.selected_background,
        text: Config.style.sound.selected_text
    }
    this.open = {
        background: Config.style.sound.available_background,
        text: Config.style.sound.available_text
    }
}

function soundActor(on){
    this.on = on;

    this.onClick = function(ctx){
        Game.sound.update(ctx, this.on)
        Audio.Settings();
    }
}

SoundCtrl.prototype.update = function(ctx, on){
    if(on == this.on) return;
    this.on = on;
    this.draw(ctx);
}

SoundCtrl.prototype.draw = function(ctx){
    var rect = this.rect;

    ctx.fillStyle = Config.style.heading.background;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h / 3);
    ctx.fillStyle = Config.style.heading.text;
    ctx.fillText("Sound FX", rect.x + (rect.w / 2), rect.y + (rect.h / 6))

    var y = rect.y +  rect.h / 3 + Game.dimenisons.boxMargin;

    var style = this.on ? this.selected : this.open;

    ctx.fillStyle = style.background;
    ctx.fillRect(rect.x, y, rect.w, rect.h);
    ctx.fillStyle = style.text;
    ctx.fillText("ON", rect.x + (rect.w / 2), y + (rect.h / 2))
    this.clickables[this.onId] = {rect: new Rect(rect.x, y, rect.w, rect.h), actor: new soundActor(true) };

    y = y + rect.h + Game.dimenisons.boxMargin;

    var style = this.on ? this.open : this.selected;

    ctx.fillStyle = style.background;
    ctx.fillRect(rect.x, y, rect.w, rect.h);
    ctx.fillStyle = style.text;
    ctx.fillText("OFF", rect.x + (rect.w / 2), y + (rect.h / 2))
    this.clickables[this.offId] = { rect: new Rect(rect.x, y, rect.w, rect.h), actor: new soundActor(false) };
}

SoundCtrl.prototype.getClickables = function(){
    return [this.clickables[this.onId], this.clickables[this.offId]]
}