'use strict';

function Rules(rect){
    this.rect = rect;

    this.onClick = function(ctx){
        console.log(Config.description);
    }
}