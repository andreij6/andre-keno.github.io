'use strict'

var KenoLogic = { };

KenoLogic.makeSelections = function(){
    var selections = [];
    return KenoLogic.getUniqueSelections(selections);
}

KenoLogic.quickSelections = function(selected){
    if(selected.length == 15) selected = [];
    return KenoLogic.getUniqueSelections(selected);
}

KenoLogic.getUniqueSelections = function(array){
    while(array.length < 15){
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
        15 : [[15, 100000], [14, 100000], [13, 50000], [12, 25000], [11, 2800], [10, 600], [9, 140], [8, 30], [7, 12], [0, 2]],
        14 : [[14, 100000], [13, 50000], [12, 25000], [11, 10000], [10, 1500], [9, 375], [8, 50], [7, 10], [6,2],[0,2]],
        13 : [[13,100000], [12, 50000], [11,15000], [10,4500], [9, 800], [8, 90], [7, 23], [6, 2], [0,2]],
        12 : [[12, 100000], [11, 25000], [10,5000],[9, 1200], [8, 270], [7, 45], [6,6]],
        11 : [[11, 100000], [10, 25000], [9,2500], [8, 500], [7, 100], [6, 13]],
        10 : [[10,100000], [9,10000],[8, 1200], [7,180], [6,26], [5,2]],
        9 : [[9, 50000], [8, 4000], [7, 310],[6, 62], [5,6]],
        8 : [[8, 30000], [7, 1700], [6, 135], [5, 10]],
        7 : [[7, 8000], [6, 450], [5, 32], [4, 2]],
        6 : [[6, 2000], [5, 111], [4, 6], [3, 1]],
        5 : [[5, 850], [4, 15], [3, 2]],
        4 : [[4, 155],[3, 5],[2,1]],
        3 : [[3, 45], [2, 2]],
        2 : [[2, 15]],
        1 : [[1,3]],
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