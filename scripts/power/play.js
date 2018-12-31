'use strict';

function Play(rect){
    this.rect = rect;
    this.states = { waiting: 'wait', play: 'play', stop: 'stop' }
    this.current_state = this.states.play;
    this.rounds_left = 0;
    this.terminate = false;
    this.waitConfig = { background: Config.style.wait.background, text: Config.style.wait.text, data: 'Final Round'}
    this.stopConfig = { background: Config.style.stop.background, text: Config.style.stop.text, data: 'Stop '}
    this.playConfig = { background: Config.style.play.background, text: Config.style.play.text, data: 'Play '}
}

Play.prototype.inRound = function(){
    return this.current_state == this.states.waiting || this.current_state == this.states.stop;
}

Play.prototype.normalRound = function(ctx, numbers, delay){
    var total_hit = 0;
    numbers = shuffle(numbers);
    var animatingIdx = 0;
    var last_hit = false;
    var animateNumber = function(){
        setTimeout(function(){
            var number = numbers[animatingIdx];
            for(var idx in Game.numbers){
                if(Game.numbers[idx].number == number){
                    var before = total_hit;
                    total_hit += Game.numbers[idx].selected(ctx);
                    if(total_hit > before && animatingIdx + 1 == KenoLogic.MaxDraw) last_hit = true;
                    if(last_hit) Game.numbers[idx].multiplier(ctx)
                }
            }
            animatingIdx++;
            if(animatingIdx == KenoLogic.MaxDraw){
                var winner = Game.payout.result(ctx, total_hit, last_hit);
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
        }, delay);
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

        if(Game.playButton.rounds_left == 1){
            Game.playButton.update(ctx, Game.playButton.states.waiting);
        }

        for(var i in Game.numbers){
            Game.numbers[i].reset(ctx);
        } 
        var numbers = KenoLogic.makeSelections();

        Game.bankroll.update(ctx, -Game.wagers.current_wager);
        if(Game.tempo.isNormal == false){
            Game.playButton.normalRound(ctx, numbers, 25);
        } else {
            Game.playButton.normalRound(ctx, numbers, 200);
        }
    } else {
        Game.playButton.terminate = false;
        Game.playButton.update(ctx, Game.playButton.states.play);
    }
}

Play.prototype.update = function(ctx, state){
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
    this.stopConfig.extra = 'Round ' + (Game.rounds.current_round - (this.rounds_left - 1)) + ' of ' + numberWithCommas(Game.rounds.current_round);

    var configs = {
        [this.states.waiting]: this.waitConfig,
        [this.states.play]: this.playConfig,
        [this.states.stop]: this.stopConfig,
    }[this.current_state]

    ctx.fillStyle = configs.background;
    ctx.fillRect(rect.x, rect.y, rect.w,rect.h);
    ctx.fillStyle = configs.text;
    if('extra' in configs)ctx.fillText(configs.extra, rect.x + (rect.w / 2), rect.y + (rect.h / 2.75));
    ctx.fillText(configs.data, rect.x + (rect.w / 2), rect.y + (rect.h / 2));

    if(Game.rounds) Game.rounds.draw(ctx);
    if(Game.wagers) Game.wagers.draw(ctx);
}

