let common = require('common.logic');
let helper = require('helper');

let roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep){

        let destRoom = Game.rooms[creep.memory.assignedRoom];
        if (destRoom === undefined) {
            if (creep.room.name != creep.memory.assignedRoom) {
                common.moveToAssignedRoom(creep);
                return;
            }
        }
        else {
            let result = creep.claimController(destRoom.controller);
            switch (result){
                case OK:
                    return;
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(destRoom.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                    return;
                case ERR_GCL_NOT_ENOUGH:
                    break;
                default:
                    console.log(`${creep.name} had a claim error: ${result}`);
            }            
            result = creep.reserveController(destRoom.controller);
            switch (result){
                case OK:
                    break;
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(destRoom.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                    break;
                default:
                    console.log(`${creep.name} had a reserve error: ${result}`);
            }
        }
    }
}
module.exports = roleClaimer;
