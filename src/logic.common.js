let pathing = require('pathing');
let helper = require('helper');

let commonLogic = {

    getRepairList: function*(roomName, creepList) {
        let excludeList = buildRepairExcludeList(creepList);
        let containerRepairs = Game.rooms[roomName].find(FIND_STRUCTURES, { 
            filter: (structure) => { return structure.hits < structure.hitsMax && structure.structureType == STRUCTURE_CONTAINER}}
        );
        let pendingRepairs = containerRepairs.concat(_.sortBy(Game.rooms[roomName].find(FIND_STRUCTURES, { 
            filter: (structure) => { return structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_CONTAINER}}), (struct) => struct.hits)
        );
        if (excludeList.length > 0){
            for (let i in pendingRepairs){
                if (excludeList.includes(pendingRepairs[i].id)) { delete pendingRepairs[i] }
            }
        }
        for (let i in pendingRepairs){
            yield pendingRepairs[i];
        }
        return;
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
    getLooseEnergy: function(creep) {
        let searchTarget = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: (resource) => { return resource.resourceType == RESOURCE_ENERGY}});
        if (searchTarget) {
            if(creep.pickup(searchTarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(searchTarget, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            return true;
        }
        searchTarget = pathing.findClosestRuin(creep.pos);
        if (searchTarget){
            if(creep.withdraw(searchTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(searchTarget, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            return true;
        }
        return false
    },

    /** @param {Creep} creep **/
    moveToAssignedRoom: function(creep){
        let newRoom = new RoomPosition(24, 24, creep.memory.assignedRoom);
        creep.moveTo(newRoom, {visualizePathStyle: {stroke: '#ffffff'}});
    }

}
module.exports = commonLogic;

function buildRepairExcludeList(creepList){
    let excludeList = [];
    for (let creep of creepList){
        if (creep.memory.role == ROLE_MAINTENANCE && creep.memory.repairID != undefined){
            excludeList.push(creep.memory.repairID);
        }
    }
    return excludeList;
}