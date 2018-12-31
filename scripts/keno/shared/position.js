'use strict';

var Keno = {
    position: {
        available: 'available',
        selected: 'selected',
        hit: 'hit',
        miss: 'miss',
        multiplier: '2x',
        miss_extra: 'extra_draw_miss',
        hit_extra: 'extra_draw_hit'
    },
    selected: {},
}

function Position(rect, number, state){
    this.rect = rect;
    this.number = number;
    this.state = state;
}

Position.prototype.onClick = function(ctx){
    if(Game.playButton && Game.playButton.inRound()) return;
    if(this.state == Keno.position.available && Object.keys(Keno.selected).length === KenoLogic.MaxSelections) return;
    this.state = this.state == Keno.position.available ? Keno.position.selected : Keno.position.available;
    if(this.state == Keno.position.selected){
        Keno.selected[this.number] = this.number;
        Game.payout.update(ctx);
        Audio.Select();
    } else if(this.state == Keno.position.available) {
        delete Keno.selected[this.number];
        Game.payout.update(ctx);
        Audio.DeSelect();
    }
    this.draw(ctx);
}

Position.prototype.update = function(ctx, state){
    this.state = state;
    if(this.state == Keno.position.selected) Game.payout.update(ctx);
    this.draw(ctx);
}

Position.prototype.reset = function(ctx){
    if(this.state == Keno.position.hit 
        || this.state == Keno.position.multiplier 
        || this.state == Keno.position.hit_extra)
        {
        this.state = Keno.position.selected;
        this.draw(ctx);
    } else if(this.state == Keno.position.miss ||this.state == Keno.position.miss_extra){
        this.state = Keno.position.available;
        this.draw(ctx);
    }
}

//rename drawn
Position.prototype.selected = function(ctx){
    var hit = 0;
    if(this.state == Keno.position.available){
        this.state = Keno.position.miss;
    } else if(this.state == Keno.position.selected){
        this.state = Keno.position.hit;
        hit++;
    }
    this.draw(ctx);
    return hit;
}

Position.prototype.selectedExtra = function(ctx){
    if(this.state == Keno.position.available){
        this.state = Keno.position.miss_extra;
    } else if(this.state == Keno.position.selected){
        this.state = Keno.position.hit_extra;
    }
    this.draw(ctx);
}

Position.prototype.wasDrawn = function(){
    return this.state == Keno.position.miss || this.state == Keno.position.hit;
}

Position.prototype.wasHit = function(){
    return this.state == Keno.position.hit || this.state == Keno.position.hit_extra;
}

Position.prototype.multiplier = function(ctx) {
    if(this.state == Keno.position.available){
        this.state = Keno.position.miss;
    } else if(this.state == Keno.position.selected || this.state == Keno.position.hit){
        this.state = Keno.position.multiplier;
    }
    this.draw(ctx);
}

Position.prototype.draw = function(ctx){
    var colors = {
        [Keno.position.available]: Config.style.available_position,
        [Keno.position.hit]: Config.style.hit_position,
        [Keno.position.miss]: Config.style.missed_position,
        [Keno.position.selected]: Config.style.selected_position,
        [Keno.position.multiplier]: Config.style.multiplier,
        [Keno.position.hit_extra]: Config.style.hit_extra,
        [Keno.position.miss_extra]: Config.style.miss_extra
    }[this.state];

    var rect = this.rect;
    var number = this.number;
    
    ctx.fillStyle = colors.background;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = colors.text;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = colors.text;
    ctx.font = colors.font;
    ctx.fillText(number, rect.x + (rect.w / 2), rect.y + (rect.h / 2));
}
