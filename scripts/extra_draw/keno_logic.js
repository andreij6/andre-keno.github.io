'use strict'

//https://wizardofodds.com/games/keno/appendix/6/

var KenoLogic = {
    MaxDraw: 20,
    MaxSelections: 10,
    Wagers: [5, 10, 25],
    
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
        10 : [[10,2500], [9,500],[8, 100], [7,20], [6,10], [5,5],[4,3],[3,0],[2,0],[1,0]],
        9 : [[9, 2000], [8, 300], [7, 44],[6, 14], [5,5], [4,3], [3,1], [2,0], [1,0]],
        8 : [[8, 800], [7, 130], [6, 20], [5, 10], [4, 5], [3,1],[2,0],[1,0]],
        7 : [[7, 400], [6, 43], [5, 15], [4, 7], [3,2],[2,0],[1,0]],
        6 : [[6, 200], [5, 38], [4,7], [3, 4], [2,0],[1,0]],
        5 : [[5, 125], [4, 15], [3, 4], [2, 1], [1,0]],
        4 : [[4, 47],[3, 12],[2,1], [1,0]],
        3 : [[3, 33], [2, 3],[1,0]],
        2 : [[2, 0],[1,0]],
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