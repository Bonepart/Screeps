let consoleCommand = require('console');
let common = require('logic.common');
let helper = require('helper');

let roleStorageBuddy = {

    /** @param {Creep} creep **/
    run: function(creep){
        if (creep.memory.assignedRoom) {
            if (creep.room.name != creep.memory.assignedRoom) {
                common.moveToAssignedRoom(creep);
                return;
            }
        }

        let myStorage = creep.room.find(FIND_MY_STRUCTURES, {filter: (structure) => { return structure.structureType == STRUCTURE_STORAGE }});
        if (myStorage.length == 0) {
            console.log(`${creep.name} has no storage to be buddies with`);
            consoleCommand.zombie(creep.name);
        }
        let myLink = myStorage[0].pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_LINK}});

        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            if(creep.transfer(myStorage[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(myStorage[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            if(creep.withdraw(myLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(myLink, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
}
module.exports = roleStorageBuddy;