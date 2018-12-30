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
    style: {
        available_position: {
            background: 'white',
            text: 'black',
            font: '16px Exo',
        },
        selected_position: {
            background: '#7D9FBE',
            text: 'white',
            font: '16px Exo'
        },
        missed_position: {
            background: 'grey',
            text: 'white',
            font: '16px Exo',
        },
        hit_position: {
            background: 'green',
            text: 'white',
            font: '16px Exo'
        },
        multiplier: {
            background: 'yellow',
            text: 'black',
            font: '16px Exo'
        },
        hit_extra: {
            background: 'yellow',
            text: 'black',
            font: '16px Exo'
        },
        miss_extra: {
            background: 'black',
            text: 'white',
            font: '16px Exo'
        },
    },
    selected: {},
    MaxSelections: KenoLogic.MaxSelections
}

Keno.Rules = function(rect){
    this.rect = rect;

    this.onClick = function(ctx){
        console.log(Config.description);
    }
}

Keno.Position = function(rect, number, state){
    this.rect = rect;
    this.number = number;
    this.state = state;
    
    this.onClick = function(ctx){
        if(GameCanvas.playButton && GameCanvas.playButton.inRound()) return;
        if(this.state == Keno.position.available && Object.keys(Keno.selected).length === Keno.MaxSelections) return;
        this.state = this.state == Keno.position.available ? Keno.position.selected : Keno.position.available;
        if(this.state == Keno.position.selected){
            Keno.selected[this.number] = this.number;
            GameCanvas.payout.update(ctx);
            Audio.Select();
        } else if(this.state == Keno.position.available) {
            delete Keno.selected[this.number];
            GameCanvas.payout.update(ctx);
            Audio.DeSelect();
        }
        this.draw(ctx);
    }

    this.update = function(ctx, state){
        this.state = state;
        if(this.state == Keno.position.selected) GameCanvas.payout.update(ctx);
        this.draw(ctx);
    }

    this.reset = function(ctx){
        if(this.state == Keno.position.hit 
            || this.state == Keno.position.multiplier 
            || this.state == Keno.position.hit_extra   
            || this.state == Keno.position.miss_extra
            )
            {
            this.state = Keno.position.selected;
            this.draw(ctx);
        } else if(this.state == Keno.position.miss){
            this.state = Keno.position.available;
            this.draw(ctx);
        }
    }

    //rename drawn
    this.selected = function(ctx){
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

    this.selectedExtra = function(ctx){
        if(this.state == Keno.position.available){
            this.state = Keno.position.miss_extra;
        } else if(this.state == Keno.position.selected){
            this.state = Keno.position.hit_extra;
        }
        this.draw(ctx);
    }

    this.wasDrawn = function(){
        return this.state == Keno.position.miss || this.state == Keno.position.hit;
    }

    this.wasHit = function(){
        return this.state == Keno.position.hit || this.state == Keno.position.hit_extra;
    }

    this.multiplier = function(ctx) {
        if(this.state == Keno.position.available){
            this.state = Keno.position.miss;
        } else if(this.state == Keno.position.selected || this.state == Keno.position.hit){
            this.state = Keno.position.multiplier;
        }
        this.draw(ctx);
    }

    this.draw = function(ctx){
        var colors = {
            [Keno.position.available]: Keno.style.available_position,
            [Keno.position.hit]: Keno.style.hit_position,
            [Keno.position.miss]: Keno.style.missed_position,
            [Keno.position.selected]: Keno.style.selected_position,
            [Keno.position.multiplier]: Keno.style.multiplier,
            [Keno.position.hit_extra]: Keno.style.hit_extra,
            [Keno.position.miss_extra]: Keno.style.miss_extra
        }[this.state];
        
        ctx.fillStyle = colors.background;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.strokeStyle = colors.text;
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = colors.text;
        ctx.font = colors.font;
        ctx.fillText(number, rect.x + (rect.w / 2), rect.y + (rect.h / 2));
     }
}

Keno.Rect = function(x, y, w, h){
    return {x: x, y: y, w: w, h: h}
}

