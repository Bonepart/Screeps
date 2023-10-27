let bodytype = require('constants.bodytype');
let helper = require('helper');

let processExploration = {
    
    checkForMissionary: function (roomName){
        for (let i in Memory.rooms[roomName].exits){
            let checkName = Memory.rooms[roomName].exits[i];
            if (Memory.rooms[checkName].roomState == ROOM_NEUTRAL || Memory.rooms[checkName].roomState == ROOM_RESERVED){
                if ((Memory.rooms[checkName].missionaryID != null && 
                        Game.creeps[Memory.rooms[checkName].missionaryID] == undefined) || 
                        Memory.rooms[checkName].missionaryID == null) { 
                    let missionaryName = this.spawnCreep(ROLE_CLAIMER, bodytype.claimer[1], checkName);
                    if (missionaryName != null) {Memory.rooms[checkName].missionaryID = missionaryName}
                }
            }
        }
    },

    checkExits: function (roomName, sentryCheck=false) {
        thisRoom = Game.rooms[roomName];
        if (thisRoom.memory.exits === undefined){
            thisRoom.memory.exits = {};
            let exitInfo = Game.map.describeExits(roomName);
            for (let i in exitInfo){
                thisRoom.memory.exits[i] = exitInfo[i];
                if (Memory.rooms[exitInfo[i]] == undefined) { Memory.rooms[exitInfo[i]] = { sentryID: null }}
            }
        }
        if (sentryCheck){
            for (let i in thisRoom.memory.exits){
                if (Memory.rooms[thisRoom.memory.exits[i]] == undefined) {Memory.rooms[thisRoom.memory.exits[i]] = { sentryID: null }}
                if (Memory.rooms[thisRoom.memory.exits[i]].sentryID == undefined) {Memory.rooms[thisRoom.memory.exits[i]].sentryID = null }
            }
        }
    },

    spawnCreep: function(role, body, roomName){
        newName = role + Memory.roles.index[role];
        for (let i in Game.spawns){
            let result = Game.spawns[i].spawnCreep(body, newName, { dryRun: true, memory: {role: role, assignedRoom: roomName, originRoom: Game.spawns[i].room.name}});
            while (result === -3){
                Memory.roles.index[role]++;
                newName = role + Memory.roles.index[role];
                result = Game.spawns[i].spawnCreep(body, newName, { dryRun: true, memory: {role: role, assignedRoom: roomName, originRoom: Game.spawns[i].room.name}});
            }
            if (result == OK) {
                Game.spawns[i].spawnCreep(body, newName, { memory: {role: role, assignedRoom: roomName, originRoom: Game.spawns[i].room.name}});
                Memory.roles.index[role]++;
                console.log(`Spawning ${newName} assigned to ${roomName}`);
                return newName;
            } else { return null }
        }        
    },

    spawnSentry: function (spawnIndex) {
        let spawner = Game.spawns[spawnIndex];
        if (spawner.room.energyAvailable < 800) { return }
        let role = ROLE_SENTRY;
        let body = bodytype.sentry;

        for (let i in Game.rooms) {
            let thisRoom = Game.rooms[i];
            for (let j in thisRoom.memory.exits){
                exitName = thisRoom.memory.exits[j]
                if (Memory.rooms[exitName].sentryID === null){
                    newName = role + Memory.roles.index[role];
                    let result = spawner.spawnCreep(body, newName, { dryRun: true, memory: {role: role, assignedRoom: exitName}});
                    while (result === -3){
                        Memory.roles.index[role]++;
                        newName = role + Memory.roles.index[role];
                        result = spawner.spawnCreep(body, newName, { dryRun: true, memory: {role: role, assignedRoom: exitName}});
                    }
                    if (result == OK) {
                        spawner.spawnCreep(body, newName, { memory: {role: role, assignedRoom: exitName}});
                        Memory.roles.index[role]++;
                        Memory.rooms[exitName].sentryID = 'spawning';
                        console.log(`Spawning ${newName} to surveil ${exitName}`);
                        return true;
                    }else {logSpawnResults(result, newName)}
                }
            }
        }
    },

    assignLongHauls: function(roomName){
        let longhaulList = 0;
        if (Memory.roles.limit[ROLE_LONGHAUL] > 0){longhaulList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_LONGHAUL)}
        if (longhaulList.length < Memory.roles.limit[ROLE_LONGHAUL]){
            this.spawnCreep(ROLE_LONGHAUL, bodytype.longhauler[0], roomName);
        }

        longhaulList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_LONGHAUL && !creep.spawning && creep.memory.assignedRoom == roomName);
        //console.log(`Longhauls assigned to ${roomName}: ${longhaulList.length}`);
    }
}
module.exports = processExploration;

function logSpawnResults(result, newName) {
    switch(result){
        //case ERR_BUSY:
        //case ERR_NOT_ENOUGH_ENERGY:
           // break;
        default:
            console.log(`Spawn of ${newName} failed: ${result}`);
    }
}
