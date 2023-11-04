
let commonLogic = {

    getRepairList: function(roomName) {
        let containerRepairs = Game.rooms[roomName].find(FIND_STRUCTURES, { 
            filter: (structure) => { return structure.hits < structure.hitsMax && structure.structureType == STRUCTURE_CONTAINER}});
        let pendingRepairs = containerRepairs.concat(_.sortBy(Game.rooms[roomName].find(FIND_STRUCTURES, { 
            filter: (structure) => { return structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_CONTAINER}}), (struct) => struct.hits));
        return pendingRepairs;
    },

    getBuildList: function() {
        let targets = [];
        for (let i in Game.rooms){
            targets = targets.concat(Game.rooms[i].find(FIND_CONSTRUCTION_SITES, { filter: (site) => { 
                return (site.structureType == STRUCTURE_WALL || 
                        site.structureType == STRUCTURE_RAMPART ||
                        site.structureType == STRUCTURE_TOWER) &&
                        site.my}}
            ));
        }
        for (let i in Game.rooms){
            targets = targets.concat(Game.rooms[i].find(FIND_CONSTRUCTION_SITES, {filter: (site) => { 
                return (site.structureType != STRUCTURE_WALL && 
                        site.structureType != STRUCTURE_RAMPART &&
                        site.structureType != STRUCTURE_TOWER) &&
                        site.my}}));
        }
        return targets;
    },

    /** @param {Creep} creep **/
    moveToAssignedRoom: function(creep){
        let newRoom = new RoomPosition(24, 24, creep.memory.assignedRoom);
        creep.moveTo(newRoom, {visualizePathStyle: {stroke: '#ffffff'}});
    }

}
module.exports = commonLogic;