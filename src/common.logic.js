
let commonLogic = {

    makeRepairs: function() {
        let containerRepairs = creep.room.find(FIND_STRUCTURES, { 
            filter: (structure) => { return structure.hits < structure.hitsMax && structure.structureType == STRUCTURE_CONTAINER}});
        let pendingRepairs = containerRepairs.concat(_.sortBy(creep.room.find(FIND_STRUCTURES, { 
            filter: (structure) => { return structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_CONTAINER}}), (struct) => struct.hits));

        if (creep.repair(repairTarget) == ERR_NOT_IN_RANGE) {
            creep.moveTo(repairTarget, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    },

    /** @param {Creep} creep **/
    moveToAssignedRoom: function(creep){
        let newRoom = new RoomPosition(24, 24, creep.memory.assignedRoom);
        creep.moveTo(newRoom, {visualizePathStyle: {stroke: '#ffffff'}});
    }

}
module.exports = commonLogic;