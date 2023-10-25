let helper = require('helper');

let roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep){
        
        assignedRoom = creep.memory.assignedRoom;

        let destRoom = Game.rooms[creep.memory.assignedRoom];
        if (destRoom == undefined){
            let newRoom = new RoomPosition(24, 24, creep.memory.assignedRoom);
            creep.moveTo(newRoom, {visualizePathStyle: {stroke: '#ffffff'}});
        }
        else {
            if (destRoom.memory.missionaryID == 'spawning') { destRoom.memory.missionaryID = creep.id }
            let result = creep.reserveController(destRoom.controller);
            //if (destRoom.controller.isActive()){ result = creep.claimController(destRoom.controller)}
            //else {result = creep.reserveController(destRoom.controller)}
            switch (result){
                case OK:
                    break;
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(destRoom.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                    break;
                default:
                    console.log(`${creep.name} had an error: ${result}`);
            }
            if (creep.ticksToLive < 5) { destRoom.memory.missionaryID = null }
        }
        
    }
}
module.exports = roleClaimer;