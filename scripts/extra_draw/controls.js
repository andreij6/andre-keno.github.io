'use strict';

Controls.Play = function(rect){
    this.rect = rect;
    this.states = { waiting: 'wait', play: 'play', stop: 'stop', extra: 'extra' }
    this.current_state = this.states.play;
    this.rounds_left = 0;
    this.terminate = false;

    this.inRound = function(){
        return this.current_state == this.states.waiting || this.current_state == this.states.stop || this.current_state == this.states.extra;
    }

    this.turboRound = function(ctx, numbers){
        var total_hit = 0;

        for(var idx in GameCanvas.numbers){
            for(var nIdx in numbers){
                if(numbers[nIdx] == GameCanvas.numbers[idx].number){
                    total_hit += GameCanvas.numbers[idx].selected(ctx)
                }
            }
        }

        var winner = GameCanvas.payout.result(ctx, total_hit);
        GameCanvas.playButton.rounds_left--;
        
        if(GameCanvas.playButton.rounds_left > 0 && !GameCanvas.playButton.terminate){
            var wonDelay = winner ? 2500 : 1000;
            setTimeout(GameCanvas.playButton.round, wonDelay)
        } else {
            GameCanvas.playButton.update(ctx, GameCanvas.playButton.states.play)
        }
    }

    this.normalRound = function(ctx, numbers){
        var total_hit = 0;
        numbers = shuffle(numbers);
        var animatingIdx = 0;
        
        var animateNumber = function(){
            setTimeout(function(){
                var number = numbers[animatingIdx];
                for(var idx in GameCanvas.numbers){
                    if(GameCanvas.numbers[idx].number == number){
                        GameCanvas.numbers[idx].selected(ctx);
                    }
                }
                animatingIdx++;
                if(animatingIdx == KenoLogic.MaxDraw){
                    for(var idx in GameCanvas.numbers){
                        if(GameCanvas.numbers[idx].wasHit()) total_hit++;
                    }

                    var winner = GameCanvas.payout.result(ctx, total_hit);
                    GameCanvas.playButton.rounds_left--;
                    if(GameCanvas.playButton.rounds_left > 0 && !GameCanvas.playButton.terminate){
                        var wonDelay = winner ? 2500 : 1000;
                        setTimeout(GameCanvas.playButton.round, wonDelay);
                    } else {
                        GameCanvas.playButton.update(ctx, GameCanvas.playButton.states.play);
                    }
                } else {
                    animateNumber();
                }
            }, 400);
        }
        animateNumber();
    }

    this.round = function(ctx){
        var canvas = document.querySelector('canvas');
        var ctx = canvas.getContext('2d');
        GameCanvas.payout.draw(ctx);
        GameCanvas.playButton.draw(ctx);

        if(GameCanvas.wagers.current_wager > KenoLogic.bankroll){ 
            GameCanvas.playButton.terminate =  true;
        }

        if(!GameCanvas.playButton.terminate){

            GameCanvas.playButton.update(ctx, GameCanvas.playButton.states.waiting);
            
            for(var i in GameCanvas.numbers){
                GameCanvas.numbers[i].reset(ctx);
            } 
            var numbers = KenoLogic.makeSelections();

            GameCanvas.bankroll.update(ctx, -GameCanvas.wagers.current_wager);

            if(GameCanvas.tempo.isNormal == false){
                if(GameCanvas.playButton.rounds_left == GameCanvas.rounds.current_round){
                    setTimeout(function(){ GameCanvas.playButton.turboRound(ctx, numbers)}, 750);
                } else {
                    GameCanvas.playButton.turboRound(ctx, numbers);
                }
            } else {
                GameCanvas.playButton.normalRound(ctx, numbers);
            }
        } else {
            GameCanvas.playButton.terminate = false;
            GameCanvas.playButton.update(ctx, GameCanvas.playButton.states.play);
        }
    }

    this.optionTurbo = function(ctx, numbers){
        var before_total_hit = 0;
        for(var idx in GameCanvas.numbers){
            if(GameCanvas.numbers[idx].wasHit()) before_total_hit++;
        }

        for(var idx in GameCanvas.numbers){
            for(var nIdx in numbers){
                if(numbers[nIdx] == GameCanvas.numbers[idx].number){
                    GameCanvas.numbers[idx].selectedExtra(ctx)
                }
            }
        }

        var total_hit = 0;
        for(var idx in GameCanvas.numbers){
            if(GameCanvas.numbers[idx].wasHit()) total_hit++;
        }

        if(before_total_hit == total_hit) total_hit = 0;

        var winner = GameCanvas.payout.result(ctx, total_hit,true);
        GameCanvas.playButton.rounds_left--;
        
        if(GameCanvas.playButton.rounds_left > 0 && !GameCanvas.playButton.terminate){
            var wonDelay = winner ? 2500 : 1000;
            setTimeout(GameCanvas.playButton.round, wonDelay)
        } else {
            GameCanvas.playButton.update(ctx, GameCanvas.playButton.states.play)
        }
    }

    this.optionNormal = function(ctx, numbers){
        var before_total_hit = 0;

        for(var idx in GameCanvas.numbers){
            if(GameCanvas.numbers[idx].wasHit()) before_total_hit++;
        }

        var total_hit = 0;
        numbers = shuffle(numbers);
        var animatingIdx = 0;
        
        var animateNumber = function(){
            setTimeout(function(){
                var number = numbers[animatingIdx];
                for(var idx in GameCanvas.numbers){
                    if(GameCanvas.numbers[idx].number == number){
                        GameCanvas.numbers[idx].selectedExtra(ctx);
                    }
                }
                animatingIdx++;
                if(animatingIdx == KenoLogic.ExtraCount){
                    for(var idx in GameCanvas.numbers){
                        if(GameCanvas.numbers[idx].wasHit()) total_hit++;
                    }

                    if(before_total_hit == total_hit) total_hit = 0;
                    var winner = GameCanvas.payout.result(ctx, total_hit, true);
                    GameCanvas.playButton.rounds_left--;
                    if(GameCanvas.playButton.rounds_left > 0 && !GameCanvas.playButton.terminate){
                        var wonDelay = winner ? 2500 : 1000;
                        setTimeout(GameCanvas.playButton.round, wonDelay)
                    } else {
                        GameCanvas.playButton.update(ctx, GameCanvas.playButton.states.play);
                    }
                } else {
                    animateNumber();
                }
            }, 400);
        }
        animateNumber();
    }

    this.playOption = function(ctx){
        var canvas = document.querySelector('canvas');
        var ctx = canvas.getContext('2d');
        GameCanvas.playButton.update(ctx, GameCanvas.playButton.states.waiting);
        var drawn = [];

        for(var i in GameCanvas.numbers){
            if(GameCanvas.numbers[i].wasDrawn()){
                drawn.push(GameCanvas.numbers[i].number);
            }
        }
        var numbers = KenoLogic.extraDraws(drawn);

        if(GameCanvas.tempo.isNormal == false){
            GameCanvas.playButton.optionTurbo(ctx, numbers);
        } else {
            GameCanvas.playButton.optionNormal(ctx, numbers);
        }
    }

    this.update = function(ctx, state, fromClick){
        if(this.current_state == state) return;
        var that = this;

        var checkTransition = function(from, to, proposed){
            return that.current_state === from && proposed === to;
        }

        if(checkTransition(this.states.stop, this.states.waiting, state)){
            this.current_state = state;

        } else if(checkTransition(this.states.waiting, this.states.play, state)){
            this.current_state = state;

        } else if(checkTransition(this.states.stop, this.states.play, state)){
            this.current_state = state;

        } else if(checkTransition(this.states.play, this.states.stop, state)){
            GameCanvas.playButton.terminate = false;
            this.current_state = state;
            this.round(ctx);
        } else if(checkTransition(this.states.play, this.states.waiting, state)){
            GameCanvas.playButton.terminate = false;
            this.current_state = state;
            this.round(ctx);
        } else if(checkTransition(this.states.play, this.states.extra, state)){
            this.current_state = state;

        } else if(checkTransition(this.states.waiting, this.states.extra, state)){
            this.current_state = state;

        } else if(checkTransition(this.states.stop, this.states.extra, state)){
            this.current_state = state;

        } else if(checkTransition(this.states.extra, this.states.waiting, state)){
            this.current_state = state;
            GameCanvas.wagers.disabledExtra(ctx);
        } else if(checkTransition(this.states.extra, this.states.play, state) && fromClick){
            this.current_state = state;
            GameCanvas.wagers.extra_on = false;
            GameCanvas.wagers.draw(ctx);
        }

        this.draw(ctx);
    }

    this.onClick = function(ctx){
        if(GameCanvas.wagers.current_wager > KenoLogic.bankroll) return;
        if(this.current_state == this.states.waiting) return;
        if(Object.keys(Keno.selected).length == 0) return;

        GameCanvas.payout.draw(ctx);

        if(this.current_state == this.states.stop){
            this.terminate = true;
            this.update(ctx, this.states.waiting);
        } else if(this.current_state == this.states.extra){
            this.update(ctx, this.states.play, true);
        } else {
            if(GameCanvas.rounds.isMax()){
                GameCanvas.rounds.current_round = Math.floor(KenoLogic.bankroll / GameCanvas.wagers.current_wager);
            } 

            this.rounds_left = GameCanvas.rounds.current_round;
            this.update(ctx, this.rounds_left == 1 ? this.states.waiting : this.states.stop);
        }

        Audio.Play();
    }

    var waitConfig = { background: Controls.style.wait.background, text: Controls.style.wait.text, data: 'Wait'}
    var stopConfig = { background: Controls.style.stop.background, text: Controls.style.stop.text, data: 'Stop'}
    var playConfig = { background: Controls.style.play.background, text: Controls.style.play.text, data: 'Play'}
    var extraConfig = { background: Controls.style.play_extra.background, text: Controls.style.play_extra.text, data: 'No Thanks'}

    this.draw = function(ctx){
        var configs = {
            [this.states.waiting]: waitConfig,
            [this.states.play]: playConfig,
            [this.states.stop]: stopConfig,
            [this.states.extra]: extraConfig,
        }[this.current_state]

        ctx.fillStyle = configs.background;
        ctx.fillRect(rect.x, rect.y, rect.w,rect.h);
        ctx.fillStyle = configs.text;
        ctx.fillText(configs.data, rect.x + (rect.w / 2), rect.y + (rect.h / 2));

        if(GameCanvas.rounds) GameCanvas.rounds.draw(ctx);
        if(GameCanvas.wagers) GameCanvas.wagers.draw(ctx);
    }
}

Controls.Payout = function(rect, matrix){
    this.rect = rect;
    this.payoutMatrix = matrix;

    this.setRect = function(rect){
        this.rect = rect;
    }
    
    this.result = function(ctx, total, fromOption){
        for(var i = 0; i < this.payoutMatrix.length; i++){
            
            if(this.payoutMatrix[i][0] == total && this.extraOpportunity(i) && fromOption == undefined && KenoLogic.bankroll > GameCanvas.wagers.current_wager){
                GameCanvas.wagers.enableExtra(ctx);
                GameCanvas.playButton.update(ctx, GameCanvas.playButton.states.extra);

                if(this.payoutMatrix[i][1] > 0){
                    this.draw(ctx, i);
                    GameCanvas.bankroll.update(ctx, this.payoutMatrix[i][1]);
                    Audio.Won();
                    return;
                }
                return;
            } else if(this.payoutMatrix[i][0] == total && this.payoutMatrix[i][1] > 0) {
                this.draw(ctx, i);
                GameCanvas.bankroll.update(ctx, this.payoutMatrix[i][1]);
                if(fromOption == undefined){
                    Audio.Won();
                } else {
                    Audio.BigWin();
                }
                return;
            } else if (fromOption){
                GameCanvas.playButton.update(ctx, GameCanvas.playButton.states.play);
            }
        }
    }

    this.update = function(ctx){
        var matrix = KenoLogic.matrix(Object.keys(Keno.selected).length, GameCanvas.wagers.current_wager);
        matrix.unshift(['Hits', 'Payout']);
        this.payoutMatrix = matrix;
        this.draw(ctx);
    }

    this.defaultStyle  = {background: Controls.style.payout.background, text: Controls.style.payout.text}
    this.wonStyle  = {background: Controls.style.payout.won, text: Controls.style.payout.text}
    this.heading = { background: Controls.style.heading.background, text: Controls.style.heading.text }
    this.extraConfig = { background: Controls.style.extra.background, text: Controls.style.extra.text }
    
    this.draw = function(ctx, wonI){ 
        for(var i = 0; i < 11; i++){
            for(var j = 0; j < 2; j++){
                var x = (rect.x + (j * GameCanvas.dimenisons.boxMargin)) + rect.w * j;
                var y = (rect.y + (i * GameCanvas.dimenisons.boxMargin)) + GameCanvas.dimenisons.boxSize * i;
                var h = GameCanvas.dimenisons.boxSize;
                var text = '--'; 
                var style = this.defaultStyle;

                if(this.extraOpportunity(i, this.payoutMatrix)) style = this.extraConfig;

                if(this.payoutMatrix.length > i){
                    text = this.payoutMatrix[i][j];
                    if(wonI == i) style = this.wonStyle;
                }

                if(text === 'Hits' || text === 'Payout') style = this.heading;
                
                ctx.clearRect(x, y, rect.w, h);
                ctx.fillStyle = style.background;
                ctx.fillRect(x, y, rect.w, h);
                ctx.fillStyle = style.text;
                ctx.fillText(numberWithCommas(text), x + (rect.w / 2), y + (h / 2));
            }
        }
        var x = (rect.x + (0 * GameCanvas.dimenisons.boxMargin)) + rect.w * 0;
        var y = (rect.y + (11 * GameCanvas.dimenisons.boxMargin)) + GameCanvas.dimenisons.boxSize * 11;
        var h = GameCanvas.dimenisons.boxSize;
        var w = rect.w * 2 + GameCanvas.dimenisons.boxMargin;
        ctx.fillStyle = Controls.style.empty.background;
        ctx.fillRect(x, y, w, h);
    }

    this.extraOpportunity = function(i){
        if(this.payoutMatrix.length <= i) return false;
        var hit = this.payoutMatrix[i][0];
        if(isNaN(hit)) return false;
        if(i == 1) return false;
        if(this.payoutMatrix[i - 1] !== undefined){
            if(this.payoutMatrix[i - 1][1] == 0) return false;
        } else {
            return false;
        }
        return true;
    }
}

Controls.Wager = function(rect){ 
    this.rect = rect;
    this.current_wager = KenoLogic.Wagers[0];
    this.clickables = {};
    this.increments = KenoLogic.Wagers;
    this.extra_on = false;

    function wagerActor(wager){
        this.wager = wager;

        this.onClick = function(ctx){
            if(GameCanvas.playButton.inRound()) return;
            Audio.Settings();
            GameCanvas.wagers.update(ctx, this.wager)
            GameCanvas.payout.update(ctx);
        }
    }

    function extraOptionActor(){
        this.onClick = function(ctx){
            if(!GameCanvas.wagers.extra_on) return;
            Audio.Settings();
            GameCanvas.wagers.extra_on = false;
            GameCanvas.bankroll.update(ctx, -GameCanvas.wagers.current_wager);
            GameCanvas.wagers.draw(ctx);
            GameCanvas.playButton.playOption(ctx);
        }
    }

    this.update = function(ctx, amount){
        if(amount == this.current_wager) return;
        this.current_wager = amount;
        this.draw(ctx);
    }

    this.enableExtra = function(ctx){
        this.extra_on = true;
        this.draw(ctx);
    }

    this.disabledExtra = function(ctx){
        this.extra_on = false;
        //this.draw(ctx); dont need to redraw.
    }
    
    this.draw = function(ctx){
        var available = { text: Controls.style.wager.available_text, background: Controls.style.wager.available_background}
        var selected = {text: Controls.style.wager.selected_text, background: Controls.style.wager.selected_background }
        var disabled = {text: Controls.style.wager.disabled_text, background: Controls.style.wager.disabled_background }
        var extraConfig = {text: Controls.style.wager.extra_on_text, background: Controls.style.wager.extra_on_background }

        var w = rect.w;
        var h = rect.h;
        var y = rect.y;

        w = (rect.w * 2) + GameCanvas.dimenisons.boxMargin;
        h = (rect.h / 1.35)

        for(var key in this.increments){
            y = rect.y + (h * key) + (GameCanvas.dimenisons.boxMargin * key);

            var colors = this.current_wager === this.increments[key] ? selected : available;

            if(GameCanvas.playButton && this.current_wager != this.increments[key]){
                if(GameCanvas.playButton.inRound() || this.extra_on) {
                    colors = disabled;
                }
            }

            ctx.fillStyle = colors.background;
            ctx.fillRect(rect.x, y, w, h);
            ctx.fillStyle = colors.text;
            ctx.fillText(this.increments[key] + ' FUN', rect.x + (w / 2), y + (h / 2));
            this.clickables[this.increments[key]] = { rect: new Keno.Rect(rect.x, y, w, h), actor: new wagerActor(this.increments[key])}
        }

        var colors = this.extra_on ? extraConfig : disabled;

        y = rect.y + (h * this.increments.length) + (GameCanvas.dimenisons.boxMargin * this.increments.length);
        ctx.fillStyle = colors.background;
        ctx.fillRect(rect.x, y, w, h);
        ctx.fillStyle = colors.text;
        this.clickables['option'] = { rect: new Keno.Rect(rect.x, y, w, h), actor: new extraOptionActor()}
        ctx.fillText('Buy 3 More Draws', rect.x + (w / 2), y + (h / 2));
    }

    this.getClickables = function(){
        return [this.clickables[this.increments[0]], this.clickables[this.increments[1]], this.clickables[this.increments[2]], this.clickables['option']]
    }
}

function numberWithCommas(x) {
    if(isNaN(x)) return x;
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}