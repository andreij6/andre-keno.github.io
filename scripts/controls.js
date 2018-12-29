'use strict';

var Controls = {
    style: {
        bankroll: {
            background: 'grey',
            text: 'white',
            won_text: 'white',
            won_background: 'green'
        },
        empty: {
            background: 'grey'
        },
        clearAll: {
            background: '#125089',
            text: 'white'
        },
        quickPick: {
            background: '#125089',
            text: 'white'
        },
        wager: {
            selected_background: '#125089',
            selected_text: 'white',
            outline_color: '#125089',
            available_text: 'black',
            available_background: 'white',
            disabled_background: 'grey',
            disabled_text: 'white'
        },
        round: {
            selected_background: '#125089',
            selected_text: 'white',
            outline_color: '#125089',
            available_text: 'black',
            available_background: 'white',
            disabled_background: 'grey',
            disabled_text: 'white'
        },
        play: {
            background: 'green',
            text: 'white'
        },
        stop: {
            background: 'red',
            text: 'white'
        },
        wait: {
            background: 'grey',
            text: 'white'
        },
        payout: {
            text: 'black',
            won: 'yellow',
            background: 'white'
        },
        heading: {
            background: 'grey',
            text: 'white'
        },
        sound: {
            selected_background: '#125089',
            selected_text: 'white',
            available_background: 'white',
            available_text: 'black'
        },
        tempo: {
            selected_background: '#125089',
            selected_text: 'white',
            available_background: 'white',
            available_text: 'black'
        }
    }
};

Controls.ClearAll = function(rect){
    this.rect = rect;

    this.onClick = function(ctx){
        if(GameCanvas.playButton.inRound()) return;
        Keno.selected = {};
        for(var i in GameCanvas.numbers){
            GameCanvas.numbers[i].update(ctx, Keno.position.available);
        }
        GameCanvas.payout.update(ctx);
        Audio.ClearAll();
    }

    this.draw = function(ctx){
        ctx.fillStyle = Controls.style.clearAll.background
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = Controls.style.clearAll.text;
        ctx.fillText('Clear All', rect.x + (rect.w / 2), rect.y + (rect.h / 2));
    }
}

Controls.QuickPick = function(rect){
    this.rect = rect;

    this.onClick = function(ctx){
        if(GameCanvas.playButton.inRound()) return;
        var selected = Object.keys(Keno.selected).length == 15 ? [] : Object.keys(Keno.selected);
        GameCanvas.clearAll.onClick(ctx);

        var picks = KenoLogic.quickSelections(selected);
        for(var idx in GameCanvas.numbers){
            for(var p in picks){
                if(picks[p] == GameCanvas.numbers[idx].number){
                    GameCanvas.numbers[idx].update(ctx, Keno.position.selected);
                }
            }
        }
        for(var i in picks) Keno.selected[picks[i]] = i;        
        GameCanvas.payout.update(ctx);
        Audio.QuickPick();
    }

    this.draw = function(ctx){
        ctx.fillStyle = Controls.style.quickPick.background;
        ctx.fillRect(rect.x, rect.y,rect.w, rect.h);
        ctx.fillStyle = Controls.style.quickPick.text;
        ctx.fillText('Quick Picks', rect.x + (rect.w / 2), rect.y + (rect.h / 2));
    }
}

Controls.Play = function(rect){
    this.rect = rect;
    this.states = { waiting: 'wait', play: 'play', stop: 'stop' }
    this.current_state = this.states.play;
    this.rounds_left = 0;
    this.terminate = false;

    this.inRound = function(){
        return this.current_state == this.states.waiting || this.current_state == this.states.stop;
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
        GameCanvas.payout.result(ctx, total_hit);
        GameCanvas.playButton.rounds_left--;
        
        if(GameCanvas.playButton.rounds_left > 0 && !GameCanvas.playButton.terminate){
            setTimeout(GameCanvas.playButton.round, 1000)
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
                        total_hit += GameCanvas.numbers[idx].selected(ctx);
                    }
                }
                animatingIdx++;
                if(animatingIdx == 15){
                    GameCanvas.payout.result(ctx, total_hit);
                    GameCanvas.playButton.rounds_left--;
                    if(GameCanvas.playButton.rounds_left > 0 && !GameCanvas.playButton.terminate){
                        setTimeout(GameCanvas.playButton.round, 1000);
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

        if(GameCanvas.playButton.rounds_left == 1){
            GameCanvas.playButton.update(ctx, GameCanvas.playButton.states.waiting);
        }

        if(!GameCanvas.playButton.terminate){

            for(var i in GameCanvas.numbers){
                GameCanvas.numbers[i].reset(ctx);
            } 
            var numbers = KenoLogic.makeSelections();

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
            this.current_state = state;
            this.round(ctx);
        } else if(checkTransition(this.states.play, this.states.waiting, state)){
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
            if(isNaN(GameCanvas.rounds.current_round)){
                GameCanvas.rounds.current_round = Math.floor(KenoLogic.bankroll / GameCanvas.wagers.current_wager);
            } 

            this.rounds_left = GameCanvas.rounds.current_round;
            this.update(ctx, this.rounds_left == 1 ? this.states.waiting : this.states.stop);
        }

        Audio.Play();
    }

    var waitConfig = { background: Controls.style.wait.background, text: Controls.style.wait.text, data: 'Final Round'}
    var stopConfig = { background: Controls.style.stop.background, text: Controls.style.stop.text, data: 'Stop'}
    var playConfig = { background: Controls.style.play.background, text: Controls.style.play.text, data: 'Play'}

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
    
    this.result = function(ctx, total){
        for(var i = 0; i < this.payoutMatrix.length; i++){
            if(this.payoutMatrix[i][0] == total){
                this.draw(ctx, i);
                GameCanvas.bankroll.update(ctx, this.payoutMatrix[i][1]);
                Audio.Won();
                return;
            }
        }
        GameCanvas.bankroll.update(ctx, -GameCanvas.wagers.current_wager);
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
    
    this.draw = function(ctx, wonI){ 
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
        ctx.fillStyle = Controls.style.empty.background;
        ctx.fillRect(x, y, w, h);
    }
}

Controls.Sound = function(rect, on){
    this.rect = rect;
    this.on = on
    this.clickables = {};
    this.onId = 1;
    this.offId = 2;

    function soundActor(on){
        this.on = on;

        this.onClick = function(ctx){
            GameCanvas.sound.update(ctx, this.on)
            Audio.Settings();
        }
    }

    this.update = function(ctx, on){
        if(on == this.on) return;
        this.on = on;
        this.draw(ctx);
    }

    var selected = {
        background: Controls.style.sound.selected_background,
        text: Controls.style.sound.selected_text
    }

    var open = {
        background: Controls.style.sound.available_background,
        text: Controls.style.sound.available_text
    }

    this.draw = function(ctx){
        ctx.fillStyle = Controls.style.heading.background;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h / 2);
        ctx.fillStyle = Controls.style.heading.text;
        ctx.fillText("Sound", rect.x + (rect.w / 2), rect.y + (rect.h / 4))

        var y = rect.y +  GameCanvas.dimenisons.boxSize + GameCanvas.dimenisons.boxMargin;

        var style = this.on ? selected : open;

        ctx.fillStyle = style.background;
        ctx.fillRect(rect.x, y, rect.w, rect.h);
        ctx.fillStyle = style.text;
        ctx.fillText("ON", rect.x + (rect.w / 2), y + (rect.h / 2))
        this.clickables[this.onId] = {rect: new Keno.Rect(rect.x, y, rect.w, rect.h), actor: new soundActor(true) };

        y = y + rect.h + GameCanvas.dimenisons.boxMargin;

        var style = this.on ? open : selected;

        ctx.fillStyle = style.background;
        ctx.fillRect(rect.x, y, rect.w, rect.h);
        ctx.fillStyle = style.text;
        ctx.fillText("OFF", rect.x + (rect.w / 2), y + (rect.h / 2))
        this.clickables[this.offId] = { rect: new Keno.Rect(rect.x, y, rect.w, rect.h), actor: new soundActor(false) };
    }

    this.getClickables = function(){
        return [this.clickables[this.onId], this.clickables[this.offId]]
    }
}

Controls.Tempo = function(rect, isNormal){ 
    this.rect = rect;
    this.isNormal = isNormal
    this.clickables = {};
    this.normalId = 1;
    this.turboId = 2;

    function tempoActor(normal){
        this.normal = normal;
        this.onClick = function(ctx){
            Audio.Settings();
            GameCanvas.tempo.update(ctx, this.normal);
        }
    }

    this.update = function(ctx, normal){
        if(normal == this.isNormal) return;
        this.isNormal = normal;
        this.draw(ctx);
    }

    var selected = {
        background: Controls.style.tempo.selected_background,
        text: Controls.style.tempo.selected_text
    }

    var open = {
        background: Controls.style.tempo.available_background,
        text: Controls.style.tempo.available_text
    }

    this.draw = function(ctx){
        ctx.fillStyle = Controls.style.heading.background;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h / 2);
        ctx.fillStyle = Controls.style.heading.text;
        ctx.fillText("Speed", rect.x + (rect.w / 2), rect.y + (rect.h / 4))

        var y = rect.y +  GameCanvas.dimenisons.boxSize + GameCanvas.dimenisons.boxMargin;

        var style = this.isNormal ? selected : open;

        ctx.fillStyle = style.background;
        ctx.fillRect(rect.x, y, rect.w, rect.h);
        ctx.fillStyle = style.text;
        ctx.fillText("Normal", rect.x + (rect.w / 2), y + (rect.h / 2))
        this.clickables[this.normalId] = {rect: new Keno.Rect(rect.x, y, rect.w, rect.h), actor: new tempoActor(true) };

        y = y + rect.h + GameCanvas.dimenisons.boxMargin;

        var style = this.isNormal ? open : selected;

        ctx.fillStyle = style.background;
        ctx.fillRect(rect.x, y, rect.w, rect.h);
        ctx.fillStyle = style.text;
        ctx.fillText("Turbo", rect.x + (rect.w / 2), y + (rect.h / 2))
        this.clickables[this.turboId] = {rect: new Keno.Rect(rect.x, y, rect.w, rect.h), actor: new tempoActor(false) };

        y = y + rect.h + GameCanvas.dimenisons.boxMargin;
        var h = rect.h + 30;

        ctx.fillStyle = Controls.style.empty.background;
        ctx.fillRect(rect.x, y, rect.w, h);
    }

    this.getClickables = function(){
        return [this.clickables[this.turboId], this.clickables[this.normalId]]
    }
}

Controls.Round = function(rect, round){
    this.rect = rect;
    this.current_round = round
    this.clickables = {};
    this.increments = [1, 5, 25, 50, 'Max']

    function roundActor(round){
        this.round = round;

        this.onClick = function(ctx){
            if(GameCanvas.playButton.inRound()) return;
            Audio.Settings();
            GameCanvas.rounds.update(ctx, this.round)
        }
    }

    this.update = function(ctx, round){
        if(round == this.current_round) return;
        this.current_round = round;
        this.draw(ctx);
    }

    var available = { text: Controls.style.round.available_text, background: Controls.style.round.available_background}
    var selected = {text: Controls.style.round.selected_text, background: Controls.style.round.selected_background }
    var disabled = {text: Controls.style.round.disabled_text, background: Controls.style.round.disabled_background }

    this.draw = function(ctx){
        for(var key in this.increments){
            var y = rect.y + (rect.h * key) + (GameCanvas.dimenisons.boxMargin * key);
            var suffix = key == 0 ? ' Round' : ' Rounds';

            var colors = this.current_round === this.increments[key] ? selected : available;
            
            if(key == 4 && this.current_round > 50) colors = selected;
            
            if(GameCanvas.playButton && colors == available){
                if(GameCanvas.playButton.inRound()) {
                    colors = disabled;
                }
            }

            ctx.clearRect(rect.x, y, rect.w, rect.h);
            ctx.fillStyle = colors.background;
            ctx.fillRect(rect.x, y, rect.w, rect.h);
            ctx.fillStyle = colors.text;
            ctx.fillText(this.increments[key] + suffix, rect.x + (rect.w / 2), y + (rect.h / 2));
            this.clickables[this.increments[key]] = { rect: new Keno.Rect(rect.x, y, rect.w, rect.h), actor: new roundActor(this.increments[key])}
        }
    }

    this.getClickables = function(){
        return [this.clickables[1], this.clickables[5], this.clickables[25], this.clickables[50], this.clickables['Max']]
    }
 }

Controls.Wager = function(rect, wager){ 
    this.rect = rect;
    this.current_wager = wager
    this.clickables = {};
    this.increments = [1, 5, 10]

    function wagerActor(wager){
        this.wager = wager;

        this.onClick = function(ctx){
            if(GameCanvas.playButton.inRound()) return;
            Audio.Settings();
            GameCanvas.wagers.update(ctx, this.wager)
            GameCanvas.payout.update(ctx);
        }
    }

    this.update = function(ctx, amount){
        if(amount == this.current_wager) return;
        this.current_wager = amount;
        this.draw(ctx);
    }

    var available = { text: Controls.style.wager.available_text, background: Controls.style.wager.available_background}
    var selected = {text: Controls.style.wager.selected_text, background: Controls.style.wager.selected_background }
    var disabled = {text: Controls.style.wager.disabled_text, background: Controls.style.wager.disabled_background }

    this.draw = function(ctx){
        for(var key in this.increments){
            var y = rect.y + (rect.h * key) + (GameCanvas.dimenisons.boxMargin * key);

            var colors = this.current_wager === this.increments[key] ? selected : available;

            if(GameCanvas.playButton && this.current_wager != this.increments[key]){
                if(GameCanvas.playButton.inRound()) {
                    colors = disabled;
                }
            }

            ctx.fillStyle = colors.background;
            ctx.fillRect(rect.x, y, rect.w, rect.h);
            ctx.fillStyle = colors.text;
            ctx.fillText(this.increments[key] + ' FUN', rect.x + (rect.w / 2), y + (rect.h / 2));
            this.clickables[this.increments[key]] = { rect: new Keno.Rect(rect.x, y, rect.w, rect.h), actor: new wagerActor(this.increments[key])}
        }
    }

    this.getClickables = function(){
        return [this.clickables[1], this.clickables[5], this.clickables[10]]
    }
}

Controls.Bankroll = function(rect){
    this.rect = rect;

    this.update = function(ctx, amount){
        KenoLogic.bankroll += amount;
        this.animate(ctx, amount);
    }

    this.animate = function(ctx, amount) {
        ctx.fillStyle = Controls.style.bankroll.background;
        ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = Controls.style.bankroll.won_background;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = Controls.style.bankroll.text;
        ctx.fillText('Bankroll: ' + numberWithCommas(KenoLogic.bankroll), rect.x + (rect.w / 4), rect.y + (rect.h / 2));
        
        if(amount > 0){
            ctx.fillStyle = Controls.style.bankroll.won_text;
            ctx.fillText('+ ' + amount, rect.x + (rect.w / 1.5), rect.y + (rect.h / 2));
            var that = this;
            setTimeout(function(){ that.draw(ctx); }, 2000)
        } else {
            this.draw(ctx);
        }
    }

    this.draw = function(ctx){
        ctx.fillStyle = Controls.style.bankroll.background;
        ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = Controls.style.bankroll.text;
        ctx.fillText('Bankroll: ' + numberWithCommas(KenoLogic.bankroll), rect.x + (rect.w / 4), rect.y + (rect.h / 2));
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