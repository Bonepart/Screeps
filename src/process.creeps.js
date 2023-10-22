const { ceil } = require("lodash");

const harvesterBody = [
    [WORK, CARRY, MOVE, MOVE], //Cost 250
    [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] //Cost 500
];
const upgraderBody = [
    [WORK, CARRY, MOVE, MOVE], //Cost 250
    [WORK, WORK, WORK, CARRY, MOVE, MOVE] //Cost 450
];
const builderBody = [
    [WORK, CARRY, MOVE, MOVE], //Cost 250
    [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] //Cost 500
];
const maintenanceBody = [
    [WORK, CARRY, MOVE, MOVE], //Cost 250
    [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] //Cost 500
];
const defenderBody = [
    [TOUGH, TOUGH, ATTACK, MOVE, MOVE, MOVE], //Cost 250
    [TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] //Cost 500
];

var processCreeps = {

    checkForSpawn: function(spawnIndex){
        let spawner = Game.spawns[spawnIndex];
        var harvesterList = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        var upgraderList = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        var builderList = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        var defenderList = _.filter(Game.creeps, (creep) => creep.memory.role == 'defender');
        var maintList = _.filter(Game.creeps, (creep) => creep.memory.role == 'maintenance');

        let numRoads = spawner.room.find(FIND_STRUCTURES, { filter: (structure) => {return structure.structureType == STRUCTURE_ROAD}}).length;
        let numRamparts = spawner.room.find(FIND_MY_STRUCTURES, { filter: (structure) => {return structure.structureType == STRUCTURE_RAMPART}}).length;
        //console.log(`numRoads = ${numRoads}`);
        //console.log(`Desired  = ${ceil(numRoads / 50)}`);
        if (Memory.maxMaint < ceil(numRoads / 50) + ceil(numRamparts / 4)) {Memory.maxMaint = ceil(numRoads / 50) + ceil(numRamparts / 4)};

        let creepTier = 0;
        if (spawner.room.energyCapacityAvailable >= 500) { creepTier = 1 };

        if (spawner.store[RESOURCE_ENERGY] >= 250){   
            let newName = '';
            let result = null;
            if (harvesterList.length < Memory.maxHarvesters){
                //Spawn Tier 0 Harvester if there are zero Harvesters
                if (harvesterList.length == 0 && creepTier > 0){creepTier = 0};
                newName = 'harvester' + Memory.harvesterIndex;
                result = spawner.spawnCreep(harvesterBody[creepTier], newName, { memory: {role: 'harvester', tier: creepTier}});
                while (result === -3){
                    Memory.harvesterIndex++;
                    newName = 'harvester' + Memory.harvesterIndex;
                    result = spawner.spawnCreep(harvesterBody[creepTier], newName, { memory: {role: 'harvester', tier: creepTier}});
                }
                if(result == OK){Memory.harvesterIndex++};
                logSpawnResults(result, newName);
            }
            else if (defenderList.length < Memory.maxDefenders){
                newName = 'defender' + Memory.defenderIndex;
                result = spawner.spawnCreep(defenderBody[creepTier], newName, { memory: {role: 'defender', tier: creepTier}});
                while (result === -3){
                    Memory.defenderIndex++;
                    newName = 'defender' + Memory.defenderIndex;
                    result = spawner.spawnCreep(defenderBody[creepTier], newName, { memory: {role: 'defender', tier: creepTier}});
                }
                if(result == OK){Memory.defenderIndex++};
                logSpawnResults(result, newName);
            }
            else if(maintList.length < Memory.maxMaint){
                newName = 'maintenance' + Memory.maintIndex;
                result = spawner.spawnCreep(maintenanceBody[creepTier], newName, { memory: {role: 'maintenance', tier: creepTier}});
                while (result === -3){
                    Memory.maintIndex++;
                    newName = 'maintenance' + Memory.maintIndex;
                    result = spawner.spawnCreep(maintenanceBody[creepTier], newName, { memory: {role: 'maintenance', tier: creepTier}});
                }
                if(result == OK){Memory.maintIndex++};
                logSpawnResults(result, newName);
            }
            else if(upgraderList.length < Memory.maxUpgraders){
                newName = 'upgrader' + Memory.upgraderIndex;
                result = spawner.spawnCreep(upgraderBody[creepTier], newName, { memory: {role: 'upgrader', tier: creepTier}});
                while (result === -3){
                    Memory.upgraderIndex++;
                    newName = 'upgrader' + Memory.upgraderIndex;
                    result = spawner.spawnCreep(upgraderBody[creepTier], newName, { memory: {role: 'upgrader', tier: creepTier}});
                }
                if(result == OK){Memory.upgraderIndex++};
                logSpawnResults(result, newName);
            }    
            else if(builderList.length < Memory.maxBuilders){
                newName = 'builder' + Memory.builderIndex;
                result = spawner.spawnCreep(builderBody[creepTier], newName, { memory: {role: 'builder', tier: creepTier}});
                while (result === -3){
                    Memory.builderIndex++;
                    newName = 'builder' + Memory.builderIndex;
                    result = spawner.spawnCreep(builderBody[creepTier], newName, { memory: {role: 'builder', tier: creepTier}});
                }
                if(result == OK){Memory.builderIndex++};
                logSpawnResults(result, newName);
            }
        }
    },
    clearMemory: function(){
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }
};
module.exports = processCreeps;

function logSpawnResults(result, newName) {
    switch(result){
        case OK:
            console.log(`Spawning ${newName}`);
            break;
        case ERR_NOT_ENOUGH_ENERGY:
            break;
        default:
            console.log(`Spawn of ${newName} failed: ${result}`);
    }
}