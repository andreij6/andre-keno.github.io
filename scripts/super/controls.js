'use strict';

Controls.Play = function(rect){
    this.rect = rect;
    this.states = { waiting: 'wait', play: 'play', stop: 'stop' }
    this.current_state = this.states.play;
    this.rounds_left = 0;
    this.terminate = false;

    this.inRound = function(){
        return this.current_state == this.states.waiting || this.current_state == this.states.stop;
    }

    this.normalRound = function(ctx, numbers, delay){
        var total_hit = 0;
        numbers = shuffle(numbers);
        var animatingIdx = 0;
        var first_hit = false;
        var animateNumber = function(){
            setTimeout(function(){
                var number = numbers[animatingIdx];
                for(var idx in GameCanvas.numbers){
                    if(GameCanvas.numbers[idx].number == number){
                        var before = total_hit;
                        total_hit += GameCanvas.numbers[idx].selected(ctx);
                        if((total_hit > before) && animatingIdx == 0) first_hit = true;
                        if(first_hit && animatingIdx == 0) GameCanvas.numbers[idx].multiplier(ctx)
                    }
                }
                animatingIdx++;
                if(animatingIdx == KenoLogic.MaxDraw){
                    var winner = GameCanvas.payout.result(ctx, total_hit, first_hit);
                    GameCanvas.playButton.rounds_left--;
                    if(GameCanvas.playButton.rounds_left > 0 && !GameCanvas.playButton.terminate){
                        var wonDelay = winner ? Controls.constants.winner_delay : Controls.constants.normal_delay;
                        setTimeout(GameCanvas.playButton.round, wonDelay)
                    } else {
                        GameCanvas.playButton.update(ctx, GameCanvas.playButton.states.play);
                    }
                } else {
                    animateNumber();
                }
            }, delay);
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

            if(GameCanvas.playButton.rounds_left == 1){
                GameCanvas.playButton.update(ctx, GameCanvas.playButton.states.waiting);
            }

            for(var i in GameCanvas.numbers){
                GameCanvas.numbers[i].reset(ctx);
            } 
            var numbers = KenoLogic.makeSelections();

            GameCanvas.bankroll.update(ctx, -GameCanvas.wagers.current_wager);

            if(GameCanvas.tempo.isNormal == false){
                GameCanvas.playButton.normalRound(ctx, numbers, 25);
            } else {
                GameCanvas.playButton.normalRound(ctx, numbers, 200);
            }
        } else {
            GameCanvas.playButton.terminate = false;
            GameCanvas.playButton.update(ctx, GameCanvas.playButton.states.play);
        }
    }

    this.update = function(ctx, state){
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
        } else {
            if(GameCanvas.rounds.isMax()){
                GameCanvas.rounds.current_round = Math.floor(KenoLogic.bankroll / GameCanvas.wagers.current_wager);
            } 

            this.rounds_left = GameCanvas.rounds.current_round;
            this.update(ctx, this.rounds_left == 1 ? this.states.waiting : this.states.stop);
        }

        Audio.Play();
    }

    var waitConfig = { background: Controls.style.wait.background, text: Controls.style.wait.text, data: 'Final Round'}
    var stopConfig = { background: Controls.style.stop.background, text: Controls.style.stop.text, data: 'Stop '}
    var playConfig = { background: Controls.style.play.background, text: Controls.style.play.text, data: 'Play '}

    this.draw = function(ctx){
        stopConfig.extra = 'Round ' + (GameCanvas.rounds.current_round - (this.rounds_left - 1)) + ' of ' + numberWithCommas(GameCanvas.rounds.current_round);

        var configs = {
            [this.states.waiting]: waitConfig,
            [this.states.play]: playConfig,
            [this.states.stop]: stopConfig,
        }[this.current_state]

        ctx.fillStyle = configs.background;
        ctx.fillRect(rect.x, rect.y, rect.w,rect.h);
        ctx.fillStyle = configs.text;
        if('extra' in configs)ctx.fillText(configs.extra, rect.x + (rect.w / 2), rect.y + (rect.h / 2.75));
        ctx.fillText(configs.data, rect.x + (rect.w / 2), rect.y + (rect.h / 2));

        if(GameCanvas.rounds) GameCanvas.rounds.draw(ctx);
        if(GameCanvas.wagers) GameCanvas.wagers.draw(ctx);
    }
}

Controls.Payout = function(rect, matrix){
    this.rect = rect;
    this.payoutMatrix = matrix;
    
    this.result = function(ctx, total, first_drawn_hit){
        for(var i = 0; i < this.payoutMatrix.length; i++){
            if(this.payoutMatrix[i][0] == total){
                var winnings = this.payoutMatrix[i][1]
                if(first_drawn_hit) {
                    winnings = winnings * 4;
                    this.draw(ctx, i, true);
                } else {
                    this.draw(ctx, i);
                }
                GameCanvas.bankroll.update(ctx, winnings);
                if(first_drawn_hit){
                    Audio.BigWin();
                } else {
                    Audio.Won();
                }
                
                return winnings > 0;
            }
        }
        return false;
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
    
    this.draw = function(ctx, wonI, multiplier){ 
        for(var i = 0; i < 11; i++){
            for(var j = 0; j < 2; j++){
                var x = (rect.x + (j * GameCanvas.dimenisons.boxMargin)) + rect.w * j;
                var y = (rect.y + (i * GameCanvas.dimenisons.boxMargin)) + GameCanvas.dimenisons.boxSize * i;
                var h = GameCanvas.dimenisons.boxSize;
                var text = '--'; 
                var style = this.defaultStyle;

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

        if(multiplier) {
            ctx.fillStyle = Controls.style.bankroll.won_background;
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = Controls.style.bankroll.won_text;
            ctx.fillText('4x Multiplier', x + (w / 2), y + (h / 2));
        } else {
            ctx.fillStyle = Controls.style.empty.background;
            ctx.fillRect(x, y, w, h);
        }
        
        
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