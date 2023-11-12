let pathing = require('logic.pathing');
let helper = require('helper');

let roleSentry = {
    
    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.room.name == creep.memory.assignedRoom && !creep.memory.scouted) { scoutRoom(creep) }
        if (creep.memory.EOP) { return }
        let newRoom = new RoomPosition(24, 24, creep.memory.assignedRoom);
        let result = creep.moveTo(newRoom, {visualizePathStyle: {stroke: '#ffffff'}});
        switch(result){
            case OK:
                if (atDestination(creep.pos, newRoom)) { creep.memory.EOP = true }
                break;
            case ERR_NO_PATH:
                if (creep.pos.x == 0) {newRoom.x = 1; newRoom.y = creep.pos.y}
                else if (creep.pos.y == 0) {newRoom.x = creep.pos.x; newRoom.y = 1}
                else if (creep.pos.x == 49) {newRoom.x = 48; newRoom.y = creep.pos.y}
                else if (creep.pos.y == 49) {newRoom.x = creep.pos.x; newRoom.y = 48}
                creep.moveTo(newRoom, {visualizePathStyle: {stroke: '#ffffff'}});
                if (atDestination(creep.pos, newRoom)) { creep.memory.EOP = true }
                break;
            default:
                console.log(`${creep.name} tried to move, got error ${result}`);
        }  
    }
}
module.exports = roleSentry;

/** @param {Creep} creep **/
function scoutRoom(creep){
    if (creep.room.controller != undefined) {
        creep.room.memory.missionaryID = null;
    }
    creep.memory.scouted = true;
}

function atDestination(pos, roomPos){
    return pos.x == roomPos.x && pos.y == roomPos.y && pos.roomName == roomPos.roomName;
}