'use strict';

function Play(rect){
    this.rect = rect;
    this.states = { waiting: 'wait', play: 'play', stop: 'stop', extra: 'extra' }
    this.current_state = this.states.play;
    this.rounds_left = 0;
    this.terminate = false;
    this.waitConfig = { background: Config.style.wait.background, text: Config.style.wait.text, data: 'Wait'}
    this.stopConfig = { background: Config.style.stop.background, text: Config.style.stop.text, data: 'Stop'}
    this.playConfig = { background: Config.style.play.background, text: Config.style.play.text, data: 'Play'}
    this.extraConfig = { background: Config.style.play_extra.background, text: Config.style.play_extra.text, data: 'No Thanks'}
}

Play.prototype.inRound = function(){
    return this.current_state == this.states.waiting || this.current_state == this.states.stop || this.current_state == this.states.extra;
}

Play.prototype.turboRound = function(ctx, numbers){
    var total_hit = 0;

    for(var idx in Game.numbers){
        for(var nIdx in numbers){
            if(numbers[nIdx] == Game.numbers[idx].number){
                total_hit += Game.numbers[idx].selected(ctx)
            }
        }
    }

    var winner = Game.payout.result(ctx, total_hit);
    Game.playButton.rounds_left--;
    
    if(Game.playButton.rounds_left > 0 && !Game.playButton.terminate){
        var wonDelay = winner ? Config.constants.winner_delay : Config.constants.normal_delay;
        setTimeout(Game.playButton.round, wonDelay)
    } else {
        Game.playButton.update(ctx, Game.playButton.states.play)
    }
}

Play.prototype.normalRound = function(ctx, numbers){
    var total_hit = 0;
    numbers = shuffle(numbers);
    var animatingIdx = 0;
    
    var animateNumber = function(){
        setTimeout(function(){
            var number = numbers[animatingIdx];
            for(var idx in Game.numbers){
                if(Game.numbers[idx].number == number){
                    Game.numbers[idx].selected(ctx);
                }
            }
            animatingIdx++;
            if(animatingIdx == KenoLogic.MaxDraw){
                for(var idx in Game.numbers){
                    if(Game.numbers[idx].wasHit()) total_hit++;
                }

                var winner = Game.payout.result(ctx, total_hit);
                Game.playButton.rounds_left--;
                if(Game.playButton.rounds_left > 0 && !Game.playButton.terminate){
                    var wonDelay = winner ? Config.constants.winner_delay : Config.constants.normal_delay;
                    setTimeout(Game.playButton.round, wonDelay);
                } else {
                    Game.playButton.update(ctx, Game.playButton.states.play);
                }
            } else {
                animateNumber();
            }
        }, 200);
    }
    animateNumber();
}

Play.prototype.round = function(ctx){
    var canvas = document.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    Game.payout.draw(ctx);
    Game.playButton.draw(ctx);

    if(Game.wagers.current_wager > KenoLogic.bankroll){ 
        Game.playButton.terminate =  true;
    }

    if(!Game.playButton.terminate){

        Game.playButton.update(ctx, Game.playButton.states.waiting);
        
        for(var i in Game.numbers){
            Game.numbers[i].reset(ctx);
        } 
        var numbers = KenoLogic.makeSelections();

        Game.bankroll.update(ctx, -Game.wagers.current_wager);

        if(Game.tempo.isNormal == false){
            if(Game.playButton.rounds_left == Game.rounds.current_round){
                setTimeout(function(){ Game.playButton.turboRound(ctx, numbers)}, 750);
            } else {
                Game.playButton.turboRound(ctx, numbers);
            }
        } else {
            Game.playButton.normalRound(ctx, numbers);
        }
    } else {
        Game.playButton.terminate = false;
        Game.playButton.update(ctx, Game.playButton.states.play);
    }
}

Play.prototype.optionTurbo = function(ctx, numbers){
    var before_total_hit = 0;
    for(var idx in Game.numbers){
        if(Game.numbers[idx].wasHit()) before_total_hit++;
    }

    for(var idx in Game.numbers){
        for(var nIdx in numbers){
            if(numbers[nIdx] == Game.numbers[idx].number){
                Game.numbers[idx].selectedExtra(ctx)
            }
        }
    }

    var total_hit = 0;
    for(var idx in Game.numbers){
        if(Game.numbers[idx].wasHit()) total_hit++;
    }

    if(before_total_hit == total_hit) total_hit = 0;

    var winner = Game.payout.result(ctx, total_hit,true);
    Game.playButton.rounds_left--;
    
    if(Game.playButton.rounds_left > 0 && !Game.playButton.terminate){
        var wonDelay = winner ? Config.constants.winner_delay : Config.constants.normal_delay;
        setTimeout(Game.playButton.round, wonDelay)
    } else {
        Game.playButton.update(ctx, Game.playButton.states.play)
    }
}

Play.prototype.optionNormal = function(ctx, numbers){
    var before_total_hit = 0;

    for(var idx in Game.numbers){
        if(Game.numbers[idx].wasHit()) before_total_hit++;
    }

    var total_hit = 0;
    numbers = shuffle(numbers);
    var animatingIdx = 0;
    
    var animateNumber = function(){
        setTimeout(function(){
            var number = numbers[animatingIdx];
            for(var idx in Game.numbers){
                if(Game.numbers[idx].number == number){
                    Game.numbers[idx].selectedExtra(ctx);
                }
            }
            animatingIdx++;
            if(animatingIdx == KenoLogic.ExtraCount){
                for(var idx in Game.numbers){
                    if(Game.numbers[idx].wasHit()) total_hit++;
                }

                if(before_total_hit == total_hit) total_hit = 0;
                var winner = Game.payout.result(ctx, total_hit, true);
                Game.playButton.rounds_left--;
                if(Game.playButton.rounds_left > 0 && !Game.playButton.terminate){
                    var wonDelay = winner ? Config.constants.winner_delay : Config.constants.normal_delay;
                    setTimeout(Game.playButton.round, wonDelay)
                } else {
                    Game.playButton.update(ctx, Game.playButton.states.play);
                }
            } else {
                animateNumber();
            }
        }, 400);
    }
    animateNumber();
}

Play.prototype.playOption = function(ctx){
    var canvas = document.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    Game.playButton.update(ctx, Game.playButton.states.waiting);
    var drawn = [];

    for(var i in Game.numbers){
        if(Game.numbers[i].wasDrawn()){
            drawn.push(Game.numbers[i].number);
        }
    }
    var numbers = KenoLogic.extraDraws(drawn);

    if(Game.tempo.isNormal == false){
        Game.playButton.optionTurbo(ctx, numbers);
    } else {
        Game.playButton.optionNormal(ctx, numbers);
    }
}

Play.prototype.update = function(ctx, state, fromClick){
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
        Game.playButton.terminate = false;
        this.current_state = state;
        this.round(ctx);
    } else if(checkTransition(this.states.play, this.states.waiting, state)){
        Game.playButton.terminate = false;
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
        Game.wagers.disabledExtra(ctx);
    } else if(checkTransition(this.states.extra, this.states.play, state) && fromClick){
        this.current_state = state;
        Game.wagers.extra_on = false;
        Game.wagers.draw(ctx);
    }

    this.draw(ctx);
}

Play.prototype.onClick = function(ctx){
    if(Game.wagers.current_wager > KenoLogic.bankroll) return;
    if(this.current_state == this.states.waiting) return;
    if(Object.keys(Keno.selected).length == 0) return;

    Game.payout.draw(ctx);

    if(this.current_state == this.states.stop){
        this.terminate = true;
        this.update(ctx, this.states.waiting);
    } else if(this.current_state == this.states.extra){
        this.update(ctx, this.states.play, true);
    } else {
        if(Game.rounds.isMax()){
            Game.rounds.current_round = Math.floor(KenoLogic.bankroll / Game.wagers.current_wager);
        } 

        this.rounds_left = Game.rounds.current_round;
        this.update(ctx, this.rounds_left == 1 ? this.states.waiting : this.states.stop);
    }

    Audio.Play();
}

Play.prototype.draw = function(ctx){
    var rect = this.rect;
    var configs = {
        [this.states.waiting]: this.waitConfig,
        [this.states.play]: this.playConfig,
        [this.states.stop]: this.stopConfig,
        [this.states.extra]: this.extraConfig,
    }[this.current_state]

    ctx.fillStyle = configs.background;
    ctx.fillRect(rect.x, rect.y, rect.w,rect.h);
    ctx.fillStyle = configs.text;
    ctx.fillText(configs.data, rect.x + (rect.w / 2), rect.y + (rect.h / 2));

    if(Game.rounds) Game.rounds.draw(ctx);
    if(Game.wagers) Game.wagers.draw(ctx);
}