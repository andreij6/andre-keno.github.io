'use strict'

//https://wizardofodds.com/games/keno/appendix/6/

var KenoLogic = {
    MaxDraw: 20,
    MaxSelections: 10
 };

KenoLogic.makeSelections = function(){
    var selections = [];
    return KenoLogic.getUniqueSelections(selections, 20);
}

KenoLogic.quickSelections = function(selected){
    if(selected.length == 10) selected = [];
    return KenoLogic.getUniqueSelections(selected, 10);
}

KenoLogic.getUniqueSelections = function(array, max){
    while(array.length < max){
        var pick = Math.floor(Math.random() * 80) + 1;
        var add = true;
        for(var i = 0; i < array.length; i++){
            if(array[i] == pick) add = false;
        }
        if(add)array.push(pick);
    }
    return array;
}

KenoLogic.matrix = function(count, wager){
    var payoutStructure = {
        10 : [[10,1000], [9,500],[8, 120], [7,25], [6,9], [5,4],[4,1]],
        9 : [[9, 1000], [8, 200], [7, 60],[6, 16], [5,5], [4,2]],
        8 : [[8, 500], [7, 100], [6, 26], [5, 6], [4, 2], [3,1]],
        7 : [[7, 200], [6, 75], [5, 14], [4, 4], [3,1]],
        6 : [[6, 160], [5, 35], [4,7], [3, 2]],
        5 : [[5, 100], [4, 11], [3, 2], [2, 1]],
        4 : [[4, 55],[3, 6],[2,1]],
        3 : [[3, 28], [2, 2]],
        2 : [[2, 6],[1,1]],
        1 : [],
        0 : []
    }[count]
    for(var i = 0; i < payoutStructure.length; i++){
        for(var j = 0; j < 2; j++){
            if(j == 1){
                payoutStructure[i][j] = payoutStructure[i][j] * wager
            }
        }
    }
    return payoutStructure;
}

KenoLogic.bankroll = 2000;