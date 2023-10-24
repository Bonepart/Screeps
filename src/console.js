var construction = require('construction');
var helper = require('helper');

var consoleCommands = {
    displayTickLimit: function() {
        console.log(`tickLimit = ${Game.cpu.tickLimit}`);
    },

    countCreeps: function() {
        let roleList = [];
        for (let i in Game.creeps){
            if(!roleList[Game.creeps[i].memory.role]){ roleList[Game.creeps[i].memory.role] = {role: Game.creeps[i].memory.role, count: 1}}
            else { roleList[Game.creeps[i].memory.role].count++}
        }
        for (let role in roleList){
            console.log(`Role: ${roleList[role].role}`);
            console.log(`-- ${roleList[role].count}`);
        }
    },

    listCreeps: function() {
        for (let i in Game.creeps){
            console.log(`${Game.creeps[i].name}\tT${Game.creeps[i].memory.tier + 1}\t Body Size: ${Game.creeps[i].body.length}`);
        }
        return 'Complete';
    },

    toggleRP: function() {
        if (Memory.repairPersistance) { Memory.repairPersistance = false }
        else { Memory.repairPersistance = true }
    },

    healthCheck: function() {
        for (let creep in Game.creeps){
            console.log(`${creep}:\t\t${Game.creeps[creep].hits}/${Game.creeps[creep].hitsMax}`);
        }
    },

    changeMax: function(role, newMax) {
        switch(role){
            case 'harvester':
                Memory.maxHarvesters = newMax;
                return `maxHarvesters = ${Memory.maxHarvesters}`;
            case ROLE_BUILDER:
                Memory.role.limit[ROLE_BUILDER] = newMax;
                return `role.limit[ROLE_BUILDER] = ${Memory.role.limit[ROLE_BUILDER]}`;
            case ROLE_UPGRADER:
                Memory.role.limit[ROLE_UPGRADER] = newMax;
                return `role.limit[ROLE_UPGRADER] = ${Memory.role.limit[ROLE_UPGRADER]}`;
            case ROLE_MAINTENANCE:
            case 'maint':
                Memory.role.limit[ROLE_MAINTENANCE] = newMax;
                return `role.limit[ROLE_MAINTENANCE] = ${Memory.role.limit[ROLE_MAINTENANCE]}`;
            case 'defender':
                Memory.maxDefenders = newMax;
                return `maxDefenders = ${Memory.maxDefenders}`;
            case 'ranged':
                Memory.maxRanged = newMax;
                return `maxRanged = ${Memory.maxRanged}`;
            case ARMY_HEALER:
                Memory.role.limit[ARMY_HEALER] = newMax;
                return `role.limit[ARMY_HEALER] = ${Memory.role.limit[ARMY_HEALER]}`;
            case 'longhauler':
                Memory.maxLonghaulers = newMax;
                return `maxLonghaulers = ${Memory.maxLonghaulers}`;
            default:
                return `${role} is unsupported`;
        }
    },

    buildRoad: function(flagStart, flagEnd, deleteFlags=false){
        let returnValue = construction.buildRoad(Game.flags[flagStart].pos, Game.flags[flagEnd].pos);
        if (deleteFlags){
            Game.flags[flagStart].remove();
            Game.flags[flagEnd].remove();
        }
        return returnValue;
    },

    buildTowerRoad: function(roomName){
        let thisRoom = Game.rooms[roomName];
        let startSpawn = Game.spawns[thisRoom.memory.spawns[0].name];
        let roomTowers = thisRoom.find(FIND_MY_STRUCTURES, {filter: (struct) => { return struct.structureType == STRUCTURE_TOWER}});
        let returnString = [];
        for (let tower in roomTowers){
            returnString.push(construction.buildRoad(startSpawn.pos, { pos: roomTowers[tower].pos, range: 1}));
        }
        return returnString;
    },

    zombie: function(creepName) {
        Game.creeps[creepName].memory.role = "zombie";
        return `${creepName} is now a zombie`;
    }    
}
module.exports = consoleCommands;
