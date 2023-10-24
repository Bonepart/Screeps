let helper = require('helper');
let bodytype = require('constants.bodytype');
const { ceil } = require("lodash");

let processCreeps = {

    checkForSpawn: function(spawnIndex){
        let spawner = Game.spawns[spawnIndex];

        let builderList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_BUILDER);
        let harvesterList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_HARVESTER);
        let upgraderList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_UPGRADER);
        let maintList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_MAINTENANCE);

        let defenderList = 0;
        let vikingList = 0;
        let rangedList = 0;
        let healerList = 0;

        if (Memory.roles.limit[ARMY_DEFENDER] > 0){defenderList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_DEFENDER)}
        if (Memory.roles.limit[ARMY_VIKING] > 0){vikingList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_VIKING)}
        if (Memory.roles.limit[ARMY_RANGED] > 0){rangedList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_RANGED)}
        if (Memory.roles.limit[ARMY_HEALER] > 0){healerList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_HEALER)}

        let zombieList = _.filter(Game.creeps, (creep) => creep.memory.role == ZOMBIE);

        //let numRoads = spawner.room.find(FIND_STRUCTURES, { filter: (structure) => {return structure.structureType == STRUCTURE_ROAD}}).length;
        //let numRamparts = spawner.room.find(FIND_MY_STRUCTURES, { filter: (structure) => {return structure.structureType == STRUCTURE_RAMPART}}).length;
        //let numTowers = spawner.room.find(FIND_MY_STRUCTURES, { filter: (structure) => {return structure.structureType == STRUCTURE_TOWER}}).length;

        //if (Memory.roles.limit[ROLE_UPGRADER] < (1 + ((spawner.room.controller.level - 1) * 2))) {Memory.roles.limit[ROLE_UPGRADER] = (1 + ((spawner.room.controller.level - 1) * 2))};
        //if (Memory.roles.limit[ROLE_MAINTENANCE] < (ceil(numRoads / 50) + ceil(numRamparts / 4)) - numTowers) {Memory.roles.limit[ROLE_MAINTENANCE] = (ceil(numRoads / 50) + ceil(numRamparts / 4)) - numTowers};

        if (zombieList == 0){
            if (builderList.length > Memory.roles.limit[ROLE_BUILDER]){ 
                builderList[0].memory.role = ZOMBIE;
                console.log(`Too many Builders: ${builderList.length}/${Memory.roles.limit[ROLE_BUILDER]}, ${builderList[0].name} is now a zombie`);
            }
        }

        let creepTier = spawner.room.memory.spawnTier - 1;

        if (spawner.store[RESOURCE_ENERGY] >= 250){
            let newName = '';
            let result = null;
            if (harvesterList.length < Memory.roles.limit[ROLE_HARVESTER]){
                //Spawn Tier 0 Harvester if there are zero Harvesters
                if (harvesterList.length == 0 && creepTier > 0){creepTier = 0};
                newName = ROLE_HARVESTER + Memory.roles.index[ROLE_HARVESTER];
                result = spawner.spawnCreep(bodytype.harvester[creepTier], newName, { memory: {role: ROLE_HARVESTER, tier: creepTier + 1}});
                while (result === -3){
                    Memory.roles.index[ROLE_HARVESTER]++;
                    newName = ROLE_HARVESTER + Memory.roles.index[ROLE_HARVESTER];
                    result = spawner.spawnCreep(bodytype.harvester[creepTier], newName, { memory: {role: ROLE_HARVESTER, tier: creepTier + 1}});
                }
                if(result == OK){Memory.roles.index[ROLE_HARVESTER]++};
                logSpawnResults(result, newName);
            }
            else if (defenderList.length < Memory.roles.limit[ARMY_DEFENDER]){
                newName = ARMY_DEFENDER + Memory.roles.index[ARMY_DEFENDER];
                result = spawner.spawnCreep(bodytype.defender[creepTier], newName, { memory: {role: ARMY_DEFENDER, tier: creepTier + 1}});
                while (result === -3){
                    Memory.roles.index[ARMY_DEFENDER]++;
                    newName = ARMY_DEFENDER + Memory.roles.index[ARMY_DEFENDER];
                    result = spawner.spawnCreep(bodytype.defender[creepTier], newName, { memory: {role: ARMY_DEFENDER, tier: creepTier + 1}});
                }
                if(result == OK){Memory.roles.index[ARMY_DEFENDER]++};
                logSpawnResults(result, newName);
            }
            else if (healerList.length < Memory.roles.limit[ARMY_HEALER]){
                newName = ARMY_HEALER + Memory.roles.index[ARMY_HEALER];
                result = spawner.spawnCreep(bodytype.healer[creepTier], newName, { memory: {role: ARMY_HEALER, tier: creepTier + 1}});
                while (result === -3){
                    Memory.roles.index[ARMY_HEALER]++;
                    newName = ARMY_HEALER + Memory.roles.index[ARMY_HEALER];
                    result = spawner.spawnCreep(bodytype.healer[creepTier], newName, { memory: {role: ARMY_HEALER, tier: creepTier + 1}});
                }
                if(result == OK){Memory.roles.index[ARMY_HEALER]++};
                logSpawnResults(result, newName);
            }
            else if(maintList.length < Memory.roles.limit[ROLE_MAINTENANCE]){
                newName = ROLE_MAINTENANCE + Memory.roles.index[ROLE_MAINTENANCE];
                result = spawner.spawnCreep(bodytype.maintenance[creepTier], newName, { memory: {role: ROLE_MAINTENANCE, tier: creepTier + 1}});
                while (result === -3){
                    Memory.roles.index[ROLE_MAINTENANCE]++;
                    newName = ROLE_MAINTENANCE + Memory.roles.index[ROLE_MAINTENANCE];
                    result = spawner.spawnCreep(bodytype.maintenance[creepTier], newName, { memory: {role: ROLE_MAINTENANCE, tier: creepTier + 1}});
                }
                if(result == OK){Memory.roles.index[ROLE_MAINTENANCE]++};
                logSpawnResults(result, newName);
            }
            else if(upgraderList.length < Memory.roles.limit[ROLE_UPGRADER]){
                newName = ROLE_UPGRADER + Memory.roles.index[ROLE_UPGRADER];
                result = spawner.spawnCreep(bodytype.upgrader[creepTier], newName, { memory: {role: ROLE_UPGRADER, tier: creepTier + 1}});
                while (result === -3){
                    Memory.roles.index[ROLE_UPGRADER]++;
                    newName = ROLE_UPGRADER + Memory.roles.index[ROLE_UPGRADER];
                    result = spawner.spawnCreep(bodytype.upgrader[creepTier], newName, { memory: {role: ROLE_UPGRADER, tier: creepTier + 1}});
                }
                if(result == OK){Memory.roles.index[ROLE_UPGRADER]++};
                logSpawnResults(result, newName);
            }    
            else if(builderList.length < Memory.roles.limit[ROLE_BUILDER]){
                newName = ROLE_BUILDER + Memory.roles.index[ROLE_BUILDER];
                result = spawner.spawnCreep(bodytype.builder[creepTier], newName, { memory: {role: ROLE_BUILDER, tier: creepTier + 1}});
                while (result === -3){
                    Memory.roles.index[ROLE_BUILDER]++;
                    newName = ROLE_BUILDER + Memory.roles.index[ROLE_BUILDER];
                    result = spawner.spawnCreep(bodytype.builder[creepTier], newName, { memory: {role: ROLE_BUILDER, tier: creepTier + 1}});
                }
                if(result == OK){Memory.roles.index[ROLE_BUILDER]++};
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

                if ( Memory.rooms[name].exits[exit].id != null && Game.getObjectById(Memory.rooms[name].exits[exit].id) === null) {
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
