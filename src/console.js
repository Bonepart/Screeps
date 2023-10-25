let construction = require('construction');
let helper = require('helper');

let consoleCommands = {
    displayTickLimit: function() {
        console.log(`tickLimit = ${Game.cpu.tickLimit}`);
    },

    assignRoomToCreep: function(creepName, roomName){
        let creep = Game.creeps[creepName];
        if (creep === undefined) { return `${creepName} is not a valid Creep` };
        creep.memory.assignedRoom = roomName;    
        return `${creepName} is now assigned to ${creep.memory.assignedRoom}`;
    },

    countCreeps: function() {
        let roleList = [];
        for (let i in Game.creeps){
            if(roleList[Game.creeps[i].memory.role === undefined]){ roleList[Game.creeps[i].memory.role] = {role: Game.creeps[i].memory.role, count: 1}}
            else { roleList[Game.creeps[i].memory.role].count++}
        }
        for (let role in roleList){
            console.log(`Role: ${roleList[role].role}`);
            console.log(`-- ${roleList[role].count}`);
        }
    },

    listCreeps: function() {
        for (let i in Game.creeps){
            console.log(`${Game.creeps[i].name.padEnd(14)}T${Game.creeps[i].memory.tier}\t Body Size: ${Game.creeps[i].body.length}`);
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
        Memory.roles.limit[role] = newMax;
        return `${role} limit = ${Memory.roles.limit[role]}`;
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

    setImportContainer: function(roomName, containerID) {
        let thisRoom = Game.rooms[roomName];
        let container = Game.getObjectById(containerID);
        if (container.structureType != STRUCTURE_CONTAINER) { return `Error: ${containerID} is not a valid container`};
        thisRoom.memory.importContainerID = containerID;
        return 'Comeplete';
    },

    zombie: function(creepName) {
        creep = Game.creeps[creepName];
        if (creep == undefined) {return `${creepName} is not a valid name`}
        creep.memory.role = ZOMBIE;
        return `${creepName} is now a zombie`;
    }    
}
module.exports = consoleCommands;
