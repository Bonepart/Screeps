let pathing = require('logic.pathing');
let helper = require('helper');

let roleSentry = {
    
    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.EOP) { return }
        let newRoom = new RoomPosition(24, 24, creep.memory.assignedRoom);
        let result = creep.moveTo(newRoom, {visualizePathStyle: {stroke: '#ffffff'}});
        switch(result){
            case OK:
                break;
            case ERR_NO_PATH:
                if (creep.pos.x == 0) {newRoom.x = 1; newRoom.y = creep.pos.y}
                else if (creep.pos.y == 0) {newRoom.x = creep.pos.x; newRoom.y = 1}
                else if (creep.pos.x == 49) {newRoom.x = 48; newRoom.y = creep.pos.y}
                else if (creep.pos.y == 49) {newRoom.x = creep.pos.x; newRoom.y = 48}
                creep.moveTo(newRoom, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.memory.EOP = true;
                break;
            default:
                console.log(`${creep.name} tried to move, got error ${result}`);
        }  
    }
}
module.exports = roleSentry;
    