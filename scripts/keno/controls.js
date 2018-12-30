'use strict';

Controls.Payout = function(rect, matrix){
    this.rect = rect;
    this.payoutMatrix = matrix;

    this.setRect = function(rect){
        this.rect = rect;
    }
    
    this.result = function(ctx, total){
        for(var i = 0; i < this.payoutMatrix.length; i++){
            if(this.payoutMatrix[i][0] == total){
                this.draw(ctx, i);
                GameCanvas.bankroll.update(ctx, this.payoutMatrix[i][1]);
                Audio.Won();
                return;
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