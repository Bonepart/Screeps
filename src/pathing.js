let helper = require('helper');

let pathing = {

    findClosestSource: function (pos){
        return pos.findClosestByPath(FIND_SOURCES_ACTIVE, {filter: (source) => {
            return !Memory.rooms[pos.roomName].keeperLair.threatActive || (Memory.rooms[pos.roomName].keeperLair.threatActive && source.id != Memory.rooms[pos.roomName].keeperLair.sourceID);
        }});
    },

    findClosestEnergyConsumer: function(pos) {
        let findResult = pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN) && 
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            }
        });
        if (findResult) { return findResult }
        findResult = pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (structure) => { return structure.structureType == STRUCTURE_TOWER  &&
                                            structure.store.getUsedCapacity(RESOURCE_ENERGY) < 700}
            }
        );
        if (findResult) { return findResult }
        findResult = pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (structure) => { return structure.structureType == STRUCTURE_STORAGE  &&
                                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}
            }
        );
        if (findResult) { return findResult }
        return false;
    },

    findClosestRuin: function (pos){
        if (Game.rooms[pos.roomName].find(FIND_HOSTILE_CREEPS).length > 0) { return false };
        let target = pos.findClosestByPath(FIND_TOMBSTONES, { filter: (tombstone) => { return tombstone.store.getUsedCapacity(RESOURCE_ENERGY) > 0 }});
        if (!target) {target = pos.findClosestByPath(FIND_RUINS, { filter: (ruin) => { return ruin.store.getUsedCapacity(RESOURCE_ENERGY) > 0 }})};
        return target;
    },

    calcPathForRoad: function (pos, goal){
        return PathFinder.search(pos, goal, { plainCost: 2, swampCost: 10,        
            roomCallback: function(roomName) {
                let room = Game.rooms[roomName];
                if (!room) return;
                let costs = new PathFinder.CostMatrix;
        
                room.find(FIND_STRUCTURES).forEach(function(struct) {
                    if (struct.structureType === STRUCTURE_ROAD) {costs.set(struct.pos.x, struct.pos.y, 1)}
                    else if (struct.structureType !== STRUCTURE_CONTAINER && (struct.structureType !== STRUCTURE_RAMPART || !struct.my)) {
                        // Can't walk through non-walkable buildings
                        costs.set(struct.pos.x, struct.pos.y, 0xff);
                    }
                });       
                return costs;
            },
        });
    }
}
module.exports = pathing;