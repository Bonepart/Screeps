let helper = require('helper');
let bodytype = require('constants.bodytype');
const { ceil } = require("lodash");

let processCreeps = {

    checkForSpawn: function(spawnIndex){
        let spawner = Game.spawns[spawnIndex];

        let builderList = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        let defenderList = _.filter(Game.creeps, (creep) => creep.memory.role == 'defender');
        let harvesterList = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        let healerList = _.filter(Game.creeps, (creep) => creep.memory.role == 'healer');
        let maintList = _.filter(Game.creeps, (creep) => creep.memory.role == 'maintenance');
        let rangedList = _.filter(Game.creeps, (creep) => creep.memory.role == 'ranged');
        let upgraderList = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        let zombieList = _.filter(Game.creeps, (creep) => creep.memory.role == 'zombie');

        let numRoads = spawner.room.find(FIND_STRUCTURES, { filter: (structure) => {return structure.structureType == STRUCTURE_ROAD}}).length;
        let numRamparts = spawner.room.find(FIND_MY_STRUCTURES, { filter: (structure) => {return structure.structureType == STRUCTURE_RAMPART}}).length;
        let numTowers = spawner.room.find(FIND_MY_STRUCTURES, { filter: (structure) => {return structure.structureType == STRUCTURE_TOWER}}).length;

        //if (Memory.maxUpgraders < (1 + ((spawner.room.controller.level - 1) * 2))) {Memory.maxUpgraders = (1 + ((spawner.room.controller.level - 1) * 2))};
        //if (Memory.maxMaint < (ceil(numRoads / 50) + ceil(numRamparts / 4)) - numTowers) {Memory.maxMaint = (ceil(numRoads / 50) + ceil(numRamparts / 4)) - numTowers};

        if (zombieList == 0){
            if (builderList.length > Memory.maxBuilders){ 
                builderList[0].memory.role = 'zombie';
                console.log(`Builders: ${builderList.length}/${Memory.maxBuilders}, ${builderList[0].name} is now a zombie`)
            }
        }

        let creepTier = spawner.room.memory.spawnTier;

        if (spawner.store[RESOURCE_ENERGY] >= 250){
            let newName = '';
            let result = null;
            if (harvesterList.length < Memory.maxHarvesters){
                //Spawn Tier 0 Harvester if there are zero Harvesters
                if (harvesterList.length == 0 && creepTier > 0){creepTier = 0};
                newName = 'harvester' + Memory.harvesterIndex;
                result = spawner.spawnCreep(bodytype.harvester[creepTier], newName, { memory: {role: 'harvester', tier: creepTier}});
                while (result === -3){
                    Memory.harvesterIndex++;
                    newName = 'harvester' + Memory.harvesterIndex;
                    result = spawner.spawnCreep(bodytype.harvester[creepTier], newName, { memory: {role: 'harvester', tier: creepTier}});
                }
                if(result == OK){Memory.harvesterIndex++};
                logSpawnResults(result, newName);
            }
            else if (defenderList.length < Memory.maxDefenders){
                newName = 'defender' + Memory.defenderIndex;
                result = spawner.spawnCreep(bodytype.defender[creepTier], newName, { memory: {role: 'defender', tier: creepTier}});
                while (result === -3){
                    Memory.defenderIndex++;
                    newName = 'defender' + Memory.defenderIndex;
                    result = spawner.spawnCreep(bodytype.defender[creepTier], newName, { memory: {role: 'defender', tier: creepTier}});
                }
                if(result == OK){Memory.defenderIndex++};
                logSpawnResults(result, newName);
            }
            else if (healerList.length < Memory.maxHealers){
                newName = 'healer' + Memory.healerIndex;
                result = spawner.spawnCreep(bodytype.healer[creepTier], newName, { memory: {role: 'healer', tier: creepTier}});
                while (result === -3){
                    Memory.healerIndex++;
                    newName = 'healer' + Memory.healerIndex;
                    result = spawner.spawnCreep(bodytype.healer[creepTier], newName, { memory: {role: 'healer', tier: creepTier}});
                }
                if(result == OK){Memory.healerIndex++};
                logSpawnResults(result, newName);
            }
            else if(maintList.length < Memory.maxMaint){
                newName = 'maintenance' + Memory.maintIndex;
                result = spawner.spawnCreep(bodytype.maintenance[creepTier], newName, { memory: {role: 'maintenance', tier: creepTier}});
                while (result === -3){
                    Memory.maintIndex++;
                    newName = 'maintenance' + Memory.maintIndex;
                    result = spawner.spawnCreep(bodytype.maintenance[creepTier], newName, { memory: {role: 'maintenance', tier: creepTier}});
                }
                if(result == OK){Memory.maintIndex++};
                logSpawnResults(result, newName);
            }
            else if(upgraderList.length < Memory.maxUpgraders){
                newName = 'upgrader' + Memory.upgraderIndex;
                result = spawner.spawnCreep(bodytype.upgrder[creepTier], newName, { memory: {role: 'upgrader', tier: creepTier}});
                while (result === -3){
                    Memory.upgraderIndex++;
                    newName = 'upgrader' + Memory.upgraderIndex;
                    result = spawner.spawnCreep(bodytype.upgrader[creepTier], newName, { memory: {role: 'upgrader', tier: creepTier}});
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
        for(let name in Memory.rooms) {
            for (let exit in Memory.rooms[name].exits){
                if (Game.getObjectById(Memory.rooms[name].exits[exit].id) == null) {
                    Memory.rooms[name].exits[exit].id = null;
                    console.log(`Clearing invalid ID from ${name}-E${exit}`);
                }
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