'use strict';

var Keno = {
    position: {
        available: 'available',
        selected: 'selected',
        hit: 'hit',
        miss: 'miss'
    },
    style: {
        available_position: {
            background: 'white',
            text: 'black'
        },
        selected_position: {
            background: '#2191FB',
            text: 'white'
        },
        missed_position: {
            background: '#7389AE',
            text: 'white'
        },
        hit_position: {
            background: '#DA2C38',
            text: 'white'
        }
    },
    selected: {},
    MaxSelections: 15
}

Keno.Position = function(rect, number, state){
    this.rect = rect;
    this.number = number;
    this.state = state;

    var hit = {
        'text': Keno.style.hit_position.text,
        'background': Keno.style.hit_position.background
    }

    var miss = {
        'text': Keno.style.missed_position.text,
        'background': Keno.style.missed_position.background
    }

    var selected = {
        'text': Keno.style.selected_position.text,
        'background': Keno.style.selected_position.background
    }

    var available  = {
        'text': Keno.style.available_position.text,
        'background': Keno.style.available_position.background
    }
    
    this.onClick = function(ctx){
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
        if(this.state == Keno.position.hit){
            this.state = Keno.position.selected;
            this.draw(ctx);
        } else if(this.state == Keno.position.miss){
            this.state = Keno.position.available;
            this.draw(ctx);
        }
    }

    
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


    this.draw = function(ctx){
        var colors = {
            [Keno.position.available]: available,
            [Keno.position.hit]: hit,
            [Keno.position.miss]: miss,
            [Keno.position.selected]: selected,
        }[this.state];
        
        ctx.clearRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
        ctx.fillStyle = colors.background;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = colors.text;
        ctx.fillText(number, rect.x + (rect.w / 2), rect.y + (rect.h / 2));
     }
}

Keno.Rect = function(x, y, w, h){
    return {x: x, y: y, w: w, h: h}
}

