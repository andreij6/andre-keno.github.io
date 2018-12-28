'use strict';

var canvas = document.querySelector('canvas');

var KenoUi = {
    context: canvas.getContext('2d'),
    sounds: {
        on: true,
        numberSelect: new Audio.sound('assets/sound/select_number_1.wav'),
        numberDeSelect: new Audio.sound('assets/sound/deselect_number.wav'),
        won: new Audio.sound('assets/sound/win.wav'),
        play: new Audio.sound('assets/sound/play.wav'),
        clear: new Audio.sound('assets/sound/clear.wav'),
        control: new Audio.sound('assets/sound/control_check.wav')
    },
    speed: 'speed_turbo',
    ids: {
        clear: 'clearAll',
        quick: 'quickPick',
        play: 'play',
        sound_on: 'sound_on',
        sound_off: 'sound_off',
        speed_turbo: 'speed_turbo',
        speed_normal: 'normal_speed'
    },
    style: {
        font: '16px Exo',
        fontSize: 16,
        hitBackground: '#DA2C38',
        hitText: 'white',
        missBackground: '#7389AE',
        missText: 'white',
        controlsBackground: '#125089',
        controlsText: 'white',
        selectedText: 'white',
        defaultFillStyle: '#2D3047',
        controlFillStyle: '#A2A3A9',
        playBackground: '#2191FB',
        playText: 'white',
        roundWagerBackground: '#125089',
        payoutWonBackground: 'yellow',
        disabledButton: 'gray'
    },
    dimenisons: {
        rows: 8,
        columns: 10,
        boxSize: 50,
        boxMargin: 6,
        origin: {
            x: 50,
            y: 50
        },
        width: 1280,
        height: 720,
        canvas_width: 1280,
        canvas_height: 720,
        ratio: 16/9
    },
    constants: {
        round: ' Round',
        rounds: ' Rounds',
        wager: ' FUN',
        Hit: 'Hit',
        Reward: 'Payout',
        Blank: '--',
        Play: 'Play',
        Stop: 'Stop',
        Wait: 'Wait',
        instructions: 'Select up to 15 Numbers'
    },
    clickables: {
        numbers: {},
        controls: {},
        rounds: {},
        wager: {},
        settings: {}
    },
    payouts: {},
    bankroll: {},
    payoutMatrix: [['Hit', 'Payout']],
    stopRound: false,
    midRound: false,
    stopDelay: false
 };

 KenoUi.resizeCanvas = function(){
    canvas.width = KenoUi.dimenisons.width;
    canvas.height = KenoUi.dimenisons.height;

    KenoUi.dimenisons.canvas_height = window.innerHeight;
    KenoUi.dimenisons.canvas_width = window.innerWidth;

    canvas.style.height = window.innerHeight + 'px';
    canvas.style.width = window.innerWidth + 'px';

    if(window.innerHeight < window.innerWidth / KenoUi.dimenisons.ratio){
        canvas.style.width = window.innerHeight * KenoUi.dimenisons.ratio + 'px';
        KenoUi.dimenisons.canvas_width = window.innerHeight * KenoUi.dimenisons.ratio;
    } else {
        canvas.style.height = window.innerWidth / KenoUi.dimenisons.ratio + 'px';
        KenoUi.dimenisons.canvas_height = window.innerWidth / KenoUi.dimenisons.ratio;
    } 
    
    KenoUi.draw();
};

KenoUi.draw = function(){
    var ctx = KenoUi.context;

    ctx.font = KenoUi.style.font;
    ctx.fillStyle = KenoUi.style.defaultFillStyle;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillRect(0,0, canvas.width, canvas.height);

    var numberGrid = function(){
        var count = 1;

        for(var i = 0; i < KenoUi.dimenisons.columns; i++){
            for(var j = 0; j < KenoUi.dimenisons.rows; j++){
                var x = (KenoUi.dimenisons.origin.x + (j * KenoUi.dimenisons.boxMargin)) + KenoUi.dimenisons.boxSize * j;
                var y = (KenoUi.dimenisons.origin.y + (i * KenoUi.dimenisons.boxMargin)) + KenoUi.dimenisons.boxSize * i;
                var wh = KenoUi.dimenisons.boxSize;

                if(count in KenoUi.clickables.numbers){
                    var rect = KenoUi.clickables.numbers[count];
                    rect.x = x;
                    rect.y = y;
                    rect.h = wh;
                    rect.w = wh;

                    if(rect.hit){
                        KenoUi.hitNumber(rect);
                    } else if(rect.miss){
                        KenoUi.missNumber(rect);
                    } else if(rect.selected){
                        KenoUi.selectedNumber(rect)
                    } else {
                        KenoUi.availableNumber(rect)
                    }
                } else {
                    ctx.clearRect(x, y, wh, wh);
                    ctx.fillText(count, x + (wh / 2), y + (wh / 2));
                    KenoUi.clickables.numbers[count] = { x: x, y: y, w: wh, h: wh, id: count };
                }

                count++;
            }
        }
     }

    var controls = function(){
        var horizontalControlWidth = (KenoUi.dimenisons.boxSize * 4) + (3 * KenoUi.dimenisons.boxMargin);

        var x = KenoUi.dimenisons.origin.x;
        var y = KenoUi.dimenisons.origin.y + (KenoUi.dimenisons.boxSize * 10) + (KenoUi.dimenisons.boxMargin * 10);
        var w = horizontalControlWidth;
        var h = KenoUi.dimenisons.boxSize;
        var clearY = y;
        ctx.fillStyle = KenoUi.style.controlsBackground
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = KenoUi.style.controlsText;
        ctx.fillText('Clear All', x + (w / 2), y + (h / 2));
        KenoUi.clickables.controls[KenoUi.ids.clear] = { x: x, y: y, w: w, h: h, id: KenoUi.ids.clear }

        var bankrollY  = y + h + KenoUi.dimenisons.boxMargin;
        var width = w * 2 + KenoUi.dimenisons.boxMargin;

        KenoUi.bankroll = {x: x, y: bankrollY, w: width, h: h};
        KenoUi.drawBankroll();

        ctx.fillStyle = KenoUi.style.controlsBackground
        x = KenoUi.dimenisons.origin.x + horizontalControlWidth + KenoUi.dimenisons.boxMargin;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = KenoUi.style.controlsText;
        ctx.fillText('Quick Picks', x + (w / 2), y + (h / 2));
        KenoUi.clickables.controls[KenoUi.ids.quick] = { x: x, y: y, w: w, h: h, id: KenoUi.ids.quick }

        ctx.fillStyle = KenoUi.style.defaultFillStyle;
        x = KenoUi.dimenisons.origin.x + (8 * KenoUi.dimenisons.boxSize) + (8 * KenoUi.dimenisons.boxMargin);
        var funY = KenoUi.dimenisons.origin.y
        w = KenoUi.dimenisons.boxSize * 2;
        h = ((KenoUi.dimenisons.boxSize * 9) + (KenoUi.dimenisons.boxMargin * 6)) / 3;
        var funIncrements = { 0: 1, 1: 5, 2: 10 }

        for(var i = 0; i < 3; i++){
            y = funY + (h * i) + (KenoUi.dimenisons.boxMargin * i);
            if(funIncrements[i] in KenoUi.clickables.wager){
                if(KenoUi.clickables.wager[funIncrements[i]].selected){
                    KenoUi.selectedWager(KenoUi.clickables.wager[funIncrements[i]])
                } else {
                    KenoUi.availableWager(KenoUi.clickables.wager[funIncrements[i]])
                }
            } else {
                if(i == 0){
                    KenoUi.clickables.wager[funIncrements[i]] = { x: x, y: y, w: w, h: h, id: funIncrements[i], selected: true }
                    KenoUi.selectedWager(KenoUi.clickables.wager[funIncrements[i]])
                } else {
                    KenoUi.clickables.wager[funIncrements[i]] = { x: x, y: y, w: w, h: h, id: funIncrements[i] }
                    KenoUi.availableWager(KenoUi.clickables.wager[funIncrements[i]])
                }
            }
        }

        x = x + w + KenoUi.dimenisons.boxMargin;
        var roundY = funY;
        w = KenoUi.dimenisons.boxSize * 2;
        h = ((KenoUi.dimenisons.boxSize * 9) + (KenoUi.dimenisons.boxMargin * 4)) / 5;
        var roundIncrements = { 0: 1, 1: 5, 2: 10, 3: 25, 4: 50};

        for(var i = 0; i < 5; i++){
            if(roundIncrements[i] in KenoUi.clickables.rounds){
                if(KenoUi.clickables.rounds[roundIncrements[i]].selected){
                    KenoUi.selectedRound(KenoUi.clickables.rounds[roundIncrements[i]])
                } else {
                    KenoUi.availableRound(KenoUi.clickables.rounds[roundIncrements[i]]);
                }
            } else {
                y = roundY + (h * i) + (KenoUi.dimenisons.boxMargin * i);
                KenoUi.clickables.rounds[roundIncrements[i]] = { x: x, y: y, w: w, h: h, id: roundIncrements[i] }

                if(i == 0){
                    KenoUi.clickables.rounds[roundIncrements[i]].selected = true
                    KenoUi.selectedRound(KenoUi.clickables.rounds[roundIncrements[i]])
                } else {
                    KenoUi.availableRound(KenoUi.clickables.rounds[roundIncrements[i]]);
                }
            }
        }

        x = KenoUi.dimenisons.origin.x + (8 * KenoUi.dimenisons.boxSize) + (8 * KenoUi.dimenisons.boxMargin);
        y = clearY - (KenoUi.dimenisons.boxSize + KenoUi.dimenisons.boxMargin);
        w = w + w + KenoUi.dimenisons.boxMargin;
        h = KenoUi.dimenisons.boxSize * 2 + KenoUi.dimenisons.boxMargin;
        ctx.fillStyle = KenoUi.style.playBackground;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = KenoUi.style.playText;
        ctx.fillText(KenoUi.constants.Play, x + (w / 2), y + (h / 2));
        KenoUi.clickables.controls[KenoUi.ids.play] = { x: x, y: y, w: w, h: h, id: KenoUi.ids.play, stop: false }
        ctx.fillStyle = KenoUi.style.defaultFillStyle;

        var rewardX = x + w + KenoUi.dimenisons.boxMargin;
        var rewardY = KenoUi.dimenisons.origin.y;
        var rewardWidth = w / 2;
        
        for(var i = 0; i < 11; i++){
            for(var j = 0; j < 2; j++){
                x = (rewardX + (j * KenoUi.dimenisons.boxMargin)) + rewardWidth * j;
                y = (rewardY + (i * KenoUi.dimenisons.boxMargin)) + KenoUi.dimenisons.boxSize * i;
                w = rewardWidth;
                h = KenoUi.dimenisons.boxSize;
                var text = KenoUi.constants.Blank;
                if(KenoUi.payoutMatrix.length > i) text = KenoUi.payoutMatrix[i][j]
                if(i + '' + j in KenoUi.clickables.controls){
                    KenoUi.payouts[i + '' + j].x = x;
                    KenoUi.payouts[i + '' + j].y = y;
                    KenoUi.payouts[i + '' + j].w = w;
                    KenoUi.payouts[i + '' + j].h = h;

                    KenoUi.drawPayoutMatrix(i + '' + j);
                } else {
                    KenoUi.payouts[i + '' + j] = { x: x, y: y, w: w, h: h, data: text }
                    KenoUi.drawPayoutMatrix(i + '' + j);
                }
            }
        }

        x = rewardX;
        y = KenoUi.dimenisons.origin.y - (KenoUi.dimenisons.boxSize) - (KenoUi.dimenisons.boxMargin);
        w = horizontalControlWidth - KenoUi.dimenisons.boxMargin;
        h = KenoUi.dimenisons.boxSize;
        ctx.fillStyle = KenoUi.style.controlsText;
        ctx.fillText(KenoUi.constants.instructions, x + (w / 2), y + (KenoUi.dimenisons.boxSize / 2));
        ctx.fillStyle = KenoUi.defaultFillStyle;
        ctx.strokeStyle = KenoUi.defaultFillStyle

        //Sound & Speed Controls
        x = rewardX + (rewardWidth * 2) + (KenoUi.dimenisons.boxMargin * 2);
        y = rewardY;
        w = rewardWidth;
        h = KenoUi.dimenisons.boxSize * 2;
        ctx.fillStyle = KenoUi.style.controlsBackground;
        ctx.fillRect(x, y, w, KenoUi.dimenisons.boxSize);
        ctx.fillStyle = KenoUi.style.missText;
        ctx.fillText("Sound", x + (w / 2), y + (KenoUi.dimenisons.boxSize / 2))

        y = y +  KenoUi.dimenisons.boxSize + KenoUi.dimenisons.boxMargin;
        KenoUi.clickables.settings[KenoUi.ids.sound_on] = { x: x, y: y, w: w, h: h, id: KenoUi.ids.sound_on};
        KenoUi.enableSoundUi();
        
        y = y + h + KenoUi.dimenisons.boxMargin;
        KenoUi.clickables.settings[KenoUi.ids.sound_off] = { x: x, y: y, w: w, h: h, id: KenoUi.ids.sound_off};
        KenoUi.disableSoundUi();

        y = y + h + KenoUi.dimenisons.boxMargin;

        ctx.fillStyle = KenoUi.style.controlsBackground;
        ctx.fillRect(x, y, w, KenoUi.dimenisons.boxSize);
        ctx.fillStyle = KenoUi.style.missText;
        ctx.fillText("SPEED", x + (w / 2), y + (KenoUi.dimenisons.boxSize / 2))

        y = y + KenoUi.dimenisons.boxSize + KenoUi.dimenisons.boxMargin;
        KenoUi.clickables.settings[KenoUi.ids.speed_turbo] = { x: x, y: y, w: w, h: h, id: KenoUi.ids.speed_turbo};
        KenoUi.turboUi();

        y = y + h + KenoUi.dimenisons.boxMargin;
        KenoUi.clickables.settings[KenoUi.ids.speed_normal] = { x: x, y: y, w: w, h: h, id: KenoUi.ids.speed_normal};
        KenoUi.normalSpeedUi();

    }
    numberGrid();
    controls();
};

KenoUi.drawBankroll = function(){
    var ctx = KenoUi.context;
    var rect = KenoUi.bankroll;

    ctx.fillStyle = 'green'
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = KenoUi.style.controlsText;
    ctx.fillText('Bankroll: ' + numberWithCommas(KenoLogic.bankroll), rect.x + (rect.w / 4), rect.y + (rect.h / 2));
}

KenoUi.turboUi = function(){
    var ctx = KenoUi.context;
    var rect = KenoUi.clickables.settings[KenoUi.ids.speed_turbo];

    if(KenoUi.speed == KenoUi.ids.speed_turbo){
        ctx.fillStyle = KenoUi.style.missBackground;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = KenoUi.style.missText;
        ctx.fillText("TURBO", rect.x + (rect.w / 2), rect.y + (rect.h / 2))
    } else {
        ctx.fillStyle = KenoUi.style.missText;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = KenoUi.style.defaultFillStyle;
        ctx.fillText("TURBO", rect.x + (rect.w / 2), rect.y + (rect.h / 2))
    }
}

KenoUi.normalSpeedUi = function(){
    var ctx = KenoUi.context;
    var rect = KenoUi.clickables.settings[KenoUi.ids.speed_normal];

    if(KenoUi.speed == KenoUi.ids.speed_turbo){
        ctx.fillStyle = KenoUi.style.missText;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = KenoUi.style.defaultFillStyle;
        ctx.fillText("NORMAL", rect.x + (rect.w / 2), rect.y + (rect.h / 2))
    } else {
        ctx.fillStyle = KenoUi.style.missBackground;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = KenoUi.style.missText;
        ctx.fillText("NORMAL", rect.x + (rect.w / 2), rect.y + (rect.h / 2))
    }
}

KenoUi.disableSoundUi = function(){
    var ctx = KenoUi.context;
    var rect = KenoUi.clickables.settings[KenoUi.ids.sound_off];

    if(KenoUi.sounds.on){
        ctx.fillStyle = KenoUi.style.missText;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = KenoUi.style.defaultFillStyle;
        ctx.fillText("OFF", rect.x + (rect.w / 2), rect.y + (rect.h / 2))
    } else {
        ctx.fillStyle = KenoUi.style.missBackground;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = KenoUi.style.missText;
        ctx.fillText("OFF", rect.x + (rect.w / 2), rect.y + (rect.h / 2))
    }
}

KenoUi.enableSoundUi = function(){
    var ctx = KenoUi.context;
    var rect = KenoUi.clickables.settings[KenoUi.ids.sound_on];

    if(KenoUi.sounds.on){
        ctx.fillStyle = KenoUi.style.missBackground;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = KenoUi.style.missText;
        ctx.fillText("ON", rect.x + (rect.w / 2), rect.y + (rect.h / 2))
    } else {
        ctx.fillStyle = KenoUi.style.missText;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = KenoUi.style.defaultFillStyle;
        ctx.fillText("ON", rect.x + (rect.w / 2), rect.y + (rect.h / 2))
    }
}

KenoUi.availableNumber = function(rect){
    var ctx = KenoUi.context;
    ctx.clearRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
    ctx.fillStyle = KenoUi.style.defaultFillStyle;
    ctx.fillText(rect.id, rect.x + (rect.w / 2), rect.y + (rect.h / 2));
}

KenoUi.selectedNumber = function(rect){
    var ctx = KenoUi.context;
    ctx.clearRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
    ctx.fillStyle = KenoUi.style.playBackground
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = KenoUi.style.selectedText;
    ctx.fillText(rect.id, rect.x + (rect.w / 2), rect.y + (rect.h / 2));
    ctx.fillStyle = KenoUi.style.defaultFillStyle;
}

KenoUi.hitNumber = function(rect){
    var ctx = KenoUi.context;
    ctx.clearRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
    ctx.fillStyle = KenoUi.style.hitBackground
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = KenoUi.style.hitText;
    ctx.fillText(rect.id, rect.x + (rect.w / 2), rect.y + (rect.h / 2));
    ctx.fillStyle = KenoUi.style.defaultFillStyle;
}

KenoUi.missNumber = function(rect){
    var ctx = KenoUi.context;
    ctx.clearRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
    ctx.fillStyle = KenoUi.style.missBackground
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = KenoUi.style.missText;
    ctx.fillText(rect.id, rect.x + (rect.w / 2), rect.y + (rect.h / 2));
    ctx.fillStyle = KenoUi.style.defaultFillStyle;
}

KenoUi.availableWager = function(rect){
    var ctx = KenoUi.context;
    ctx.clearRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
    ctx.strokeStyle = KenoUi.style.roundWagerBackground;
    ctx.fillStyle = KenoUi.style.defaultFillStyle;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = KenoUi.style.defaultFillStyle;
    ctx.fillText(rect.id + KenoUi.constants.wager, rect.x + (rect.w / 2), rect.y + (rect.h / 2));
}

KenoUi.selectedWager = function(rect){
    var ctx = KenoUi.context;
    ctx.fillStyle = KenoUi.style.roundWagerBackground;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = KenoUi.style.selectedText;
    ctx.fillText(rect.id + KenoUi.constants.wager, rect.x + (rect.w / 2), rect.y + (rect.h / 2));
    ctx.fillStyle = KenoUi.style.defaultFillStyle;
}

KenoUi.selectedRound = function(rect){
    var ctx = KenoUi.context;
    ctx.clearRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
    ctx.fillStyle = KenoUi.style.roundWagerBackground;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    var suffix = KenoUi.constants.rounds
    if(rect.id == 1) suffix = KenoUi.constants.round
    ctx.fillStyle = KenoUi.style.selectedText;
    ctx.fillText(rect.id + suffix, rect.x + (rect.w / 2), rect.y + (rect.h / 2));
    ctx.fillStyle = KenoUi.style.defaultFillStyle;
}

KenoUi.availableRound = function(rect){
    var ctx = KenoUi.context;
    ctx.clearRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
    ctx.strokeStyle = KenoUi.style.roundWagerBackground;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = KenoUi.style.defaultFillStyle;
    var suffix = KenoUi.constants.rounds
    if(rect.id == 1) suffix = KenoUi.constants.round
    ctx.fillStyle = KenoUi.style.defaultFillStyle;
    ctx.strokeStyle = KenoUi.style.defaultFillStyle;
    ctx.fillText(rect.id+ suffix, rect.x + (rect.w / 2), rect.y + (rect.h / 2));
}

KenoUi.onClick = function(mouse){
    var ctx = KenoUi.context;

    var collision = function(rects, x, y){
        var isCollision = false;
        for (var key in rects) {
            var left = rects[key].x, right = rects[key].x+rects[key].w;
            var top = rects[key].y, bottom = rects[key].y+rects[key].h;
            if (right >= x
                && left <= x
                && bottom >= y
                && top <= y) {
                isCollision = rects[key];
            }
        }
        return isCollision;
    }

    var numberClick = function(rect){
        if(KenoUi.midRound) return;
        var count = 0;
        for(var key in KenoUi.clickables.numbers){
            if('selected' in KenoUi.clickables.numbers[key]) count++
        }

        if(rect.selected){
            delete rect.selected
            KenoUi.availableNumber(rect)
            count--;

            if(KenoUi.sounds.on){
                KenoUi.sounds.numberDeSelect.play();
            }
        } else {
            
            if(count < 15){
                ctx.clearRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
                rect.selected = true;
                KenoUi.selectedNumber(rect);
                count++;

                if(KenoUi.sounds.on){
                    KenoUi.sounds.numberSelect.play();
                }
            }
        }
        KenoUi.drawPayoutMatrix(undefined);
    }

    var clearAll = function(rect){
        if(KenoUi.midRound) return;
        for(var key in KenoUi.clickables.numbers){
            delete KenoUi.clickables.numbers[key].selected;
            delete KenoUi.clickables.numbers[key].hit;
            delete KenoUi.clickables.numbers[key].miss;
            KenoUi.availableNumber(KenoUi.clickables.numbers[key]);
        }
        KenoUi.drawPayoutMatrix(undefined);

        if(KenoUi.sounds.on){
            KenoUi.sounds.clear.play();
        }
    }

    var clearDrawn = function(){
        for(var key in KenoUi.clickables.numbers){
            if(KenoUi.clickables.numbers[key].selected){
                KenoUi.selectedNumber(KenoUi.clickables.numbers[key]);
                delete KenoUi.clickables.numbers[key].hit;
            } else {
                KenoUi.availableNumber(KenoUi.clickables.numbers[key]);
                delete KenoUi.clickables.numbers[key].miss
            }
        }
    }

    var quickPick = function(rect){
        var selected = [];
        for(var key in KenoUi.clickables.numbers){
            if(KenoUi.clickables.numbers[key].selected){
                selected.push(KenoUi.clickables.numbers[key].id);
            }
        }
        clearAll();
        var quickPicks = KenoLogic.quickSelections(selected);
        for(var idx in quickPicks){  
            KenoUi.selectedNumber(KenoUi.clickables.numbers[quickPicks[idx]]);
            KenoUi.clickables.numbers[quickPicks[idx]].selected = true;
        }
        KenoUi.drawPayoutMatrix(undefined);

    }

    var play = function(playBtn){
        if(KenoUi.stopDelay) return;

        var wager = 1;

        for(var id in KenoUi.clickables.wager){
            if(KenoUi.clickables.wager[id].selected) wager = parseInt(id);
        }

        if(wager > KenoLogic.bankroll) return;

        var roundResults = function(total){
            for(var i = 0; i < KenoUi.payoutMatrix.length; i++){
                if(KenoUi.payoutMatrix[i][0] == total){
                    if(KenoUi.sounds.on) KenoUi.sounds.won.play();
                    KenoUi.drawPayoutWon(i);
                    KenoLogic.bankroll += KenoUi.payoutMatrix[i][1];
                    KenoUi.drawBankroll();
                    return;
                }
            }

            KenoLogic.bankroll -= wager;
            KenoUi.drawBankroll();
        }

        var resetUi = function(){
            ctx.fillStyle = KenoUi.style.playBackground;
            ctx.fillRect(playBtn.x, playBtn.y, playBtn.w, playBtn.h);
            //ctx.fillText(KenoUi.constants.Stop, playBtn.x + (playBtn.w / 2), playBtn.y + (playBtn.h / 2));
            ctx.fillStyle = KenoUi.style.playText;
            ctx.fillText(KenoUi.constants.Play, playBtn.x + (playBtn.w / 2), playBtn.y + (playBtn.h / 2));
            playBtn.stop = false;
            KenoUi.stopRound = true;
            KenoUi.midRound = false;
        }

        if(playBtn.stop){
            ctx.fillStyle = KenoUi.style.disabledButton;
            ctx.fillRect(playBtn.x, playBtn.y, playBtn.w, playBtn.h);
            ctx.fillStyle = KenoUi.style.playBackground;
            ctx.fillText(KenoUi.constants.Stop, playBtn.x + (playBtn.w / 2), playBtn.y + (playBtn.h / 2));
            ctx.fillStyle = KenoUi.style.playText;
            ctx.fillText(KenoUi.constants.Wait, playBtn.x + (playBtn.w / 2), playBtn.y + (playBtn.h / 2));
            playBtn.stop = false;
            KenoUi.stopRound = true;
            KenoUi.stopDelay = true;

            setTimeout(function(){
                KenoUi.stopDelay = false
                KenoUi.midRound = false;

                resetUi();
            }, 1500)
            return;
        } else {
            KenoUi.stopRound  = false;

            KenoUi.drawPayoutMatrix(undefined)
        }

        var ready = false;
        for(var key in KenoUi.clickables.numbers){
            if(KenoUi.clickables.numbers[key].selected){
                ready = true
            }
        }
        if(!ready) return;
        var rounds = 1;
        for(var key in KenoUi.clickables.rounds){
            if(KenoUi.clickables.rounds[key].selected){
                rounds = KenoUi.clickables.rounds[key].id;
            }
        }

        var playRound = function(){
            if(KenoUi.stopRound || wager > KenoLogic.bankroll){
                KenoUi.stopRound = false;
                KenoUi.midRound = false;
                return;
            } else {
                KenoUi.midRound = true;
                KenoUi.drawPayoutMatrix(undefined)
            }
            clearDrawn();
            if(rounds > 1){
                ctx.fillStyle = KenoUi.style.playBackground;
                ctx.fillText(KenoUi.constants.Play, playBtn.x + (playBtn.w / 2), playBtn.y + (playBtn.h / 2));
                ctx.fillStyle = KenoUi.style.playText;
                ctx.fillText(KenoUi.constants.Stop, playBtn.x + (playBtn.w / 2), playBtn.y + (playBtn.h / 2));
                playBtn.stop = true;
            }
            var numbers = KenoLogic.makeSelections();
            var hitTotal = 0;
            
            for(var idx in numbers){
                var rect = KenoUi.clickables.numbers[numbers[idx]];
                if(rect.selected){
                    rect.hit = true
                    KenoUi.hitNumber(rect);
                    hitTotal++;
                } else {
                    rect.miss = true;
                    KenoUi.missNumber(rect);
                }
            }

            roundResults(hitTotal);

            rounds--;
            if(rounds > 0 && KenoUi.midRound){
                setTimeout(playRound, 1000);
            } else {
                resetUi();
            }
        }

        if(KenoUi.sounds.on){
            KenoUi.sounds.play.play()
        }

        playRound();
    }

    var round = function(rect){
        if(KenoUi.midRound) return;
        for(var id in KenoUi.clickables.rounds){
            if(id == rect.id){
                KenoUi.clickables.rounds[id].selected = true
                KenoUi.selectedRound(rect)
                if(KenoUi.sounds.on){
                    KenoUi.sounds.control.play();
                }
            } else {
                delete KenoUi.clickables.rounds[id].selected;
                KenoUi.availableRound(KenoUi.clickables.rounds[id])
            }
        }
    }

    var wager = function(rect){
        if(KenoUi.midRound) return;
        for(var id in KenoUi.clickables.wager){
            if(id == rect.id){
                KenoUi.clickables.wager[id].selected = true
                KenoUi.selectedWager(rect)
                if(KenoUi.sounds.on){
                    KenoUi.sounds.control.play();
                }
            } else {
                delete KenoUi.clickables.wager[id].selected;
                KenoUi.availableWager(KenoUi.clickables.wager[id])
            }
        }

        KenoUi.drawPayoutMatrix(undefined);
    }

    var normalSpeed = function(){
        KenoUi.speed = KenoUi.ids.speed_normal;
        KenoUi.normalSpeedUi();
        KenoUi.turboUi();
    }

    var turboSpeed = function(){
        KenoUi.speed = KenoUi.ids.speed_turbo;
        KenoUi.normalSpeedUi();
        KenoUi.turboUi();
    }

    var enableSound = function(){
        KenoUi.sounds.on = true;
        KenoUi.enableSoundUi();
        KenoUi.disableSoundUi();
    }

    var disableSound = function(){
        KenoUi.sounds.on = false;
        KenoUi.disableSoundUi();
        KenoUi.enableSoundUi();
    }

    var mouseX = mouse.x - canvas.getBoundingClientRect().left;
    var mouseY = mouse.y - canvas.getBoundingClientRect().top;
    mouseX *= KenoUi.dimenisons.width / KenoUi.dimenisons.canvas_width;
    mouseY *= KenoUi.dimenisons.height / KenoUi.dimenisons.canvas_height;
    var number = collision(KenoUi.clickables.numbers, mouseX, mouseY);

    if(number){
        numberClick(number);
    } else {
        var control = collision(KenoUi.clickables.controls, mouseX, mouseY);

        if(control){
            var o = {
                [KenoUi.ids.clear]: clearAll,  
                [KenoUi.ids.quick]: quickPick, 
                [KenoUi.ids.play]: play,
            }[control.id](control);
            return;
        }

        control = collision(KenoUi.clickables.rounds, mouseX, mouseY);
        if(control) round(control);
        
        control = collision(KenoUi.clickables.wager, mouseX, mouseY);
        if(control) wager(control);

        control = collision(KenoUi.clickables.settings, mouseX, mouseY);
        
        if(control) {
            var o = {
                [KenoUi.ids.sound_on]: enableSound,
                [KenoUi.ids.sound_off]: disableSound,
                [KenoUi.ids.speed_normal]: normalSpeed,
                [KenoUi.ids.speed_turbo]: turboSpeed
            }[control.id]();
            return;
        }
    } 
};

KenoUi.drawPayoutMatrix = function(key){
    var ctx = KenoUi.context;

    if(key !== undefined){
        var rect = KenoUi.payouts[key];
        ctx.clearRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
        ctx.fillStyle = KenoUi.style.defaultFillStyle;
        ctx.fillText(numberWithCommas(rect.data), rect.x + (rect.w / 2), rect.y + (rect.h / 2));
    } else {
        var wager = 1;

        var count = 0;

        for(var key in KenoUi.clickables.numbers){
            if('selected' in KenoUi.clickables.numbers[key]) count++
        }

        for(var key in KenoUi.clickables.wager){
            if(KenoUi.clickables.wager[key].selected){
                wager = KenoUi.clickables.wager[key].id;
            }
        }

        var matrix = KenoLogic.matrix(count, wager);

        matrix.unshift([KenoUi.constants.Hit, KenoUi.constants.Reward]);

        KenoUi.payoutMatrix = matrix;

        for(var key in KenoUi.payouts){
            if(KenoUi.payouts[key].data !== KenoUi.constants.Hit || KenoUi.payouts[key].data !== KenoUi.constants.Reward){
                KenoUi.payouts[key].data = KenoUi.constants.Blank
            }
        }

        for(var i = 0; i < KenoUi.payoutMatrix.length; i++){
            for(var j = 0; j < 2; j++){
                KenoUi.payouts[i + '' + j].data = KenoUi.payoutMatrix[i][j]
            }
        }

        for(var key in KenoUi.payouts){
            var rect = KenoUi.payouts[key];
            ctx.clearRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
            ctx.fillStyle = KenoUi.style.defaultFillStyle;
            ctx.fillText(numberWithCommas(rect.data), rect.x + (rect.w / 2), rect.y + (rect.h / 2));
        }
    }

}

KenoUi.drawPayoutWon = function(keyI){
    var ctx = KenoUi.context;

    for(var j = 0; j < 2; j++){
        var rect = KenoUi.payouts[keyI + '' + j];

        ctx.clearRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
        ctx.fillStyle = KenoUi.style.payoutWonBackground;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = KenoUi.style.defaultFillStyle;
        ctx.fillText(numberWithCommas(rect.data), rect.x + (rect.w / 2), rect.y + (rect.h / 2));
    }
}

WebFont.load({
    google: {
      families: ['Exo', 'Open Sans:bold']
    },
    active: function() {
      KenoUi.resizeCanvas();
    }
});

function numberWithCommas(x) {
    if(isNaN(x)) return x;
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

KenoUi.resizeCanvas();

canvas.addEventListener('click', KenoUi.onClick);

window.addEventListener('resize', KenoUi.resizeCanvas, false);