exports.harvester = [
    [WORK, CARRY, MOVE, MOVE], //Cost 250
    [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], //Cost 500
    [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], //Cost 700
    [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE] //Cost 950
];
exports.upgrader = [
    [WORK, CARRY, MOVE, MOVE], //Cost 250
    [WORK, WORK, WORK, CARRY, MOVE, MOVE], //Cost 450
    [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] //Cost 800
];
exports.builder = [
    [WORK, CARRY, MOVE, MOVE], //Cost 250
    [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], //Cost 500
    [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] //Cost 700
];
exports.maintenance = [
    [WORK, CARRY, MOVE, MOVE], //Cost 250
    [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], //Cost 500
    [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] //Cost 700
];
exports.defender = [
    [TOUGH, TOUGH, ATTACK, MOVE, MOVE, MOVE], //Cost 250
    [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE], //Cost 490
    [TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE] //Cost 630
];
exports.healer = [
    [ HEAL, MOVE], //Cost 300
    [ RANGED_ATTACK, HEAL, MOVE, MOVE], //Cost 500
    [ TOUGH, TOUGH, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE] //Cost 720
]; 
exports.viking = [ 
    [ ],
    [ ],
    [ TOUGH, TOUGH, RANGED_ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] //Cost 710
];
exports.gofer = [
    [ WORK, CARRY, MOVE, MOVE], //Cost 250
    [ CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], //Cost 400
    [ CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] //Cost 600
];

//Explorer Bodytypes
exports.longhauler = [
    [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] //Cost 800
];
exports.claimer = [
    [CLAIM, MOVE, MOVE, MOVE, MOVE], //Cost 800
    [CLAIM, CLAIM, MOVE, MOVE], //Cost 1300
];
exports.sentry = [ MOVE ]; //Cost 50
