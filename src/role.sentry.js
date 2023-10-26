let pathing = require('pathing');
let helper = require('helper');

let roleSentry = {
    
    /** @param {Creep} creep **/
    run: function (creep) {
        if (Memory.rooms[creep.memory.assignedRoom].sentryID == 'spawning') { Memory.rooms[creep.memory.assignedRoom].sentryID = creep.id }
        else if (Memory.rooms[creep.memory.assignedRoom].sentryID != creep.id) {
            console.log(`Error: Room ${creep.memory.assignedRoom} sentryID = ${Memory.rooms[creep.memory.assignedRoom].sentryID}`);
            return;
        }

        let newRoom = new RoomPosition(24, 24, creep.memory.assignedRoom);
        let result = creep.moveTo(newRoom, {visualizePathStyle: {stroke: '#ffffff'}});
        switch(result){
            case OK:
                break;
            default:
                console.log(`${creep.name} tried to move, got error ${result}`);
        }
    }
}
module.exports = roleSentry;
    