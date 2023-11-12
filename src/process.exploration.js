let spawnLogic = require('logic.spawning');
let bodytype = require('constants.bodytype');
let helper = require('helper');

let processExploration = {
    
    checkForMissionary: function (roomName){
        for (let i in Memory.rooms[roomName].exits){
            let checkName = Memory.rooms[roomName].exits[i];
            if (Memory.rooms[checkName] == undefined) { continue }
            if (Memory.rooms[checkName].roomState == ROOM_NEUTRAL || Memory.rooms[checkName].roomState == ROOM_RESERVED){
                if ((Memory.rooms[checkName].missionaryID != null && 
                        Game.creeps[Memory.rooms[checkName].missionaryID] == undefined) || 
                        Memory.rooms[checkName].missionaryID === null) { 
                    let missionaryName = spawnLogic.spawnExCreep(ROLE_CLAIMER, bodytype.claimer[1], checkName);
                    if (missionaryName != null) {Memory.rooms[checkName].missionaryID = missionaryName}
                }
            }
        }
    },

    checkExits: function (roomName, sentryCheck=false) {
        thisRoom = Game.rooms[roomName];
        if (thisRoom.memory.exits === undefined) { 
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

    assignLongHauls: function(roomName){
        let longhaulList = 0;
        if(Memory.importContainers == undefined || Memory.importContainers.length == 0) { return }
        if (Memory.roles.limit[ROLE_LONGHAUL] > 0) { longhaulList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_LONGHAUL) }
        if (longhaulList.length < Memory.roles.limit[ROLE_LONGHAUL]){
            spawnLogic.spawnExCreep(ROLE_LONGHAUL, bodytype.longhauler[0], roomName);
        }

        //longhaulList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_LONGHAUL && !creep.spawning && creep.memory.assignedRoom == roomName);
        //console.log(`Longhauls assigned to ${roomName}: ${longhaulList.length}`);
    }
}
module.exports = processExploration;