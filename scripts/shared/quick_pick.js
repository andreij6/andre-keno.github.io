function QuickPick(rect){
    this.rect = rect;
}

QuickPick.prototype.onClick = function(ctx){
    if(Game.playButton.inRound()) return;
    var selected = Object.keys(Keno.selected).length == KenoLogic.MaxDraw ? [] : Object.keys(Keno.selected);
    Game.clearAll.onClick(ctx);

    var picks = KenoLogic.quickSelections(selected);
    for(var idx in Game.numbers){
        for(var p in picks){
            if(picks[p] == Game.numbers[idx].number){
                Game.numbers[idx].update(ctx, Keno.position.selected);
            }
        }
    }
    for(var i in picks) Keno.selected[picks[i]] = i;        
    Game.payout.update(ctx);
    Audio.QuickPick();
}

QuickPick.prototype.draw = function(ctx){
    var rect = this.rect;

    ctx.fillStyle = Config.style.quickPick.background;
    ctx.fillRect(rect.x, rect.y,rect.w, rect.h);
    ctx.fillStyle = Config.style.quickPick.text;
    ctx.fillText('Quick Picks', rect.x + (rect.w / 2), rect.y + (rect.h / 2));
}