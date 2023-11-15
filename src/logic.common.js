let pathing = require('logic.pathing');
let helper = require('helper');

let commonLogic = {

    getEnergyConsumerList: function*(roomName, creepList) {
        let searchRoom = Game.rooms[roomName];
        let excludeList = buildEnergyExcludeList(creepList);
        let findResults = searchRoom.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN) && 
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            }
        });
        findResults = findResults.concat(searchRoom.find(FIND_MY_STRUCTURES, {
            filter: (structure) => { return structure.structureType == STRUCTURE_TOWER  &&
                                            structure.store.getUsedCapacity(RESOURCE_ENERGY) < 700}
            }
        ));
        findResults = findResults.concat(searchRoom.find(FIND_MY_STRUCTURES, {
            filter: (structure) => { return structure.structureType == STRUCTURE_STORAGE  &&
                                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}
            }
        ));
        for (let result of findResults){
            if (excludeList.includes(result.id)) { continue }
            if (result.structureType == STRUCTURE_STORAGE){
                while (result.store.getUsedCapacity(RESOURCE_ENERGY) <= 600000){
                    yield result;
                }
            } else { yield result }
        }
        return;
    },

    getRepairList: function*(roomName, creepList) {
        let excludeList = buildRepairExcludeList(creepList);
        let containerRepairs = Game.rooms[roomName].find(FIND_STRUCTURES, { 
            filter: (structure) => { return structure.hits < structure.hitsMax && structure.structureType == STRUCTURE_CONTAINER}}
        );
        let pendingRepairs = containerRepairs.concat(_.sortBy(Game.rooms[roomName].find(FIND_STRUCTURES, { 
            filter: (structure) => { return structure.hits < structure.hitsMax && structure.structureType == STRUCTURE_ROAD}}), (struct) => struct.hits)
        );
        pendingRepairs = pendingRepairs.concat(_.sortBy(Game.rooms[roomName].find(FIND_STRUCTURES, { 
            filter: (structure) => { return structure.hits < structure.hitsMax && 
                                            structure.structureType != STRUCTURE_CONTAINER && 
                                            structure.structureType != STRUCTURE_ROAD}}), (struct) => struct.hits)
        );
        for (let pendingRepair of pendingRepairs){
            if (excludeList.includes(pendingRepair.id)) { continue }
            yield pendingRepair;
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
        let searchTarget = creep.pos.findClosestByRange(creep.room.find(FIND_DROPPED_RESOURCES, {filter: (resource) => { return resource.resourceType == RESOURCE_ENERGY}}));
        if (searchTarget) {
            if(creep.pickup(searchTarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(searchTarget, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            return true;
        }
        searchTarget = pathing.findClosestRuin(creep);
        if (searchTarget){
            if(creep.withdraw(searchTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(searchTarget, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            return true;
        }
        return false
    },

    /** @param {Creep} creep **/
    getLooseResources: function(creep) {
        let searchTarget = creep.pos.findClosestByRange(creep.room.find(FIND_DROPPED_RESOURCES));
        if (searchTarget) {
            let result = creep.pickup(searchTarget);
            switch (result){
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(searchTarget, {visualizePathStyle: {stroke: '#ffaa00'}});
                case OK:
                    return true;
                default:
                    console.log(`${creep.name} pickup ${searchTarget.resourceType} failed (${result})`);
                    return false;
            }
        }
        searchTarget = pathing.findClosestRuinX(creep);
        if (searchTarget){
            for (let resource in searchTarget.store){
                let result = creep.withdraw(searchTarget, resource);
                switch (result){
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(searchTarget, {visualizePathStyle: {stroke: '#ffaa00'}});
                    case OK:
                        return true;
                    default:
                        console.log(`${creep.name} withdraw ${resource} from ${searchTarget.id} failed (${result})`);
                        return false;
                }
            }
        }
        return false;
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

function buildEnergyExcludeList(creepList){
    let excludeList = [];
    for (let creep of creepList){
        if (creep.memory.role == ROLE_HARVESTER && creep.memory.depositID != undefined){
            excludeList.push(creep.memory.depositID);
        }
        else if (creep.memory.role == ROLE_GOFER){
            switch(creep.memory.task){
                case 'ContainerImporter':
                    if (creep.memory.targetID != undefined){ excludeList.push(creep.memory.targetID) }
                    break;
            }
        }
    }
    return excludeList;
}