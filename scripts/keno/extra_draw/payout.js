'use strict';

function Payout(rect, matrix){
    this.rect = rect;
    this.payoutMatrix = matrix;
    this.defaultStyle  = {background: Config.style.payout.background, text: Config.style.payout.text}
    this.wonStyle  = {background: Config.style.payout.won, text: Config.style.payout.text}
    this.heading = { background: Config.style.heading.background, text: Config.style.heading.text }
    this.extraConfig = { background: Config.style.extra.background, text: Config.style.extra.text }
}

Payout.prototype.setRect = function(rect){
    this.rect = rect;
}

Payout.prototype.result = function(ctx, total, fromOption){
    for(var i = 0; i < this.payoutMatrix.length; i++){
        
        if(this.payoutMatrix[i][0] == total && this.extraOpportunity(i) && fromOption == undefined && KenoLogic.bankroll > Game.wagers.current_wager){
            Game.wagers.enableExtra(ctx);
            Game.playButton.update(ctx, Game.playButton.states.extra);

            if(this.payoutMatrix[i][1] > 0){
                this.draw(ctx, i);
                Game.bankroll.update(ctx, this.payoutMatrix[i][1]);
                Audio.Won();
                return;
            }
            return;
        } else if(this.payoutMatrix[i][0] == total && this.payoutMatrix[i][1] > 0) {
            this.draw(ctx, i);
            Game.bankroll.update(ctx, this.payoutMatrix[i][1]);
            if(fromOption == undefined){
                Audio.Won();
            } else {
                Audio.BigWin();
            }
            return;
        } else if (fromOption){
            Game.playButton.update(ctx, Game.playButton.states.play);
        }
    }
}

Payout.prototype.update = function(ctx){
    var matrix = KenoLogic.matrix(Object.keys(Keno.selected).length, Game.wagers.current_wager);
    matrix.unshift(['Hits', 'Payout']);
    this.payoutMatrix = matrix;
    this.draw(ctx);
}

Payout.prototype.draw = function(ctx, wonI){ 
    var rect = this.rect;
    
    for(var i = 0; i < 11; i++){
        for(var j = 0; j < 2; j++){
            var x = (rect.x + (j * Game.dimenisons.boxMargin)) + rect.w * j;
            var y = (rect.y + (i * Game.dimenisons.boxMargin)) + Game.dimenisons.boxSize * i;
            var h = Game.dimenisons.boxSize;
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
    var x = (rect.x + (0 * Game.dimenisons.boxMargin)) + rect.w * 0;
    var y = (rect.y + (11 * Game.dimenisons.boxMargin)) + Game.dimenisons.boxSize * 11;
    var h = Game.dimenisons.boxSize;
    var w = rect.w * 2 + Game.dimenisons.boxMargin;
    ctx.fillStyle = Config.style.empty.background;
    ctx.fillRect(x, y, w, h);
}

Payout.prototype.extraOpportunity = function(i){
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