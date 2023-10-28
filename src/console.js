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

	configureLinks: function(fromID, toID, roomName){
		let thisRoom = Game.rooms[roomName];
		if (thisRoom == undefined) { return `Error: ${roomName} is an invalid room` }
		if (thisRoom.memory.links == undefined) { thisRoom.memory.links = [] }
		let newLink = { from: fromID, to: toID};
		thisRoom.memory.links.push(newLink);
		return 'Link added';
	},

    countCreeps: function() {
        let roleList = {};
        for (let i in Game.creeps){
            if(roleList[Game.creeps[i].memory.role] == undefined){ roleList[Game.creeps[i].memory.role] = {role: Game.creeps[i].memory.role, count: 1}}
            else { roleList[Game.creeps[i].memory.role].count++}
        }
        for (let role in roleList){
            console.log(`${roleList[role].count.toString().padStart(2)} ${roleList[role].role}`);
        }
    },

    listCreeps: function() {
        for (let i in Game.creeps){
            let tier = Game.creeps[i].memory.tier;
            if (tier == undefined){ tier = 'NA'};
            console.log(`${Game.creeps[i].name.padEnd(14)}T${tier}\t Body Size: ${Game.creeps[i].body.length}`);
        }
        return 'Complete';
    },

    toggleRP: function() {
        if (Memory.roles.repairPersistance) { Memory.roles.repairPersistance = false }
        else { Memory.roles.repairPersistance = true }
		return `Repair Persistance = ${Memory.roles.repairPersistance}`;
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

    resetIndex: function() {
        for (let i in Memory.roles.index) { Memory.roles.index[i] = 1 }
        return 'Complete';
    },

    setImportContainer: function(roomName, containerID) {
        let thisRoom = Game.rooms[roomName];
		if (thisRoom == undefined) { return `Error: ${roomName} is an invalid room` }
        let container = Game.getObjectById(containerID);
        if (container.structureType != STRUCTURE_CONTAINER && container.structureType != STRUCTURE_LINK) { return `Error: ${containerID} is not a valid Import Target`};
        thisRoom.memory.importContainerID = containerID;
        return 'Comeplete';
    },

    wipeRooms: function(){
        for (let i in Memory.rooms){
            let thisRoom = Game.rooms[i];
            if (thisRoom == undefined){
                console.log(`Wiping ${i} from memory`);
                Memory.rooms[i] = undefined;
            } else { console.log(`Room ${i} is visible`)}
        }
        return 'Comeplete';
    },

    zombie: function(creepName) {
        creep = Game.creeps[creepName];
        if (creep == undefined) {return `${creepName} is not a valid name`}
        creep.memory.role = ZOMBIE;
        return `${creepName} is now a zombie`;
    },

    massZombie: function(role) {
        roleList = _.filter(Game.creeps, (creep) => creep.memory.role == role);
        for (let i in roleList){
            roleList[i].memory.role = ZOMBIE;
            console.log(`${roleList[i].name} is now a zombie`);
        }
        return `Complete`;
    }    
}
module.exports = consoleCommands;
