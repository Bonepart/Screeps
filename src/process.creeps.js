const harvesterBody = [
    [WORK, CARRY, MOVE, MOVE], //Cost 250
    [WORK, WORK, WORK, CARRY, MOVE, MOVE] //Cost 450
];
const upgraderBody = [
    [WORK, CARRY, MOVE, MOVE], //Cost 250
    [WORK, WORK, WORK, CARRY, MOVE, MOVE] //Cost 450
];
const builderBody = [
    [WORK, CARRY, MOVE, MOVE], //Cost 250
    [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] //Cost 500
];
const defenderBody = [
    [TOUGH, TOUGH, ATTACK, MOVE, MOVE, MOVE], //Cost 250
    [TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] //Cost 500
];

module.exports = {

    checkForSpawn: function(spawnIndex){
        let spawner = Game.spawns[spawnIndex];
        var harvesterList = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        var upgraderList = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        var builderList = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        var defenderList = _.filter(Game.creeps, (creep) => creep.memory.role == 'defender');

        let creepTier = 0;
        if (spawner.room.energyCapacityAvailable >= 500) { creepTier = 1 };

        if (spawner.store[RESOURCE_ENERGY] >= 250){   
            let newName = '';
            let result = 1;
            if (harvesterList.length < Memory.maxHarvesters){
                newName = 'harvester' + Memory.harvesterIndex;
                result = spawner.spawnCreep(harvesterBody[creepTier], newName, { memory: {role: 'harvester', tier: creepTier}});
                //console.log(`Trying to spawn harvester ${newName}, result = ${result}`);
                while (result === -3){
                    Memory.harvesterIndex++;
                    newName = 'harvester' + Memory.harvesterIndex;
                    result = spawner.spawnCreep(harvesterBody[creepTier], newName, { memory: {role: 'harvester', tier: creepTier}});
                }
                if (result === 0){
                    console.log(`Spawning new ${Game.creeps[newName].memory.role}: ${newName}`);
                    Memory.harvesterIndex++;
                } else if (result !== 1) {
                    console.log(`Spawn of new ${Game.creeps[newName].memory.role} failed: ${result} - ${newName}`);
                }
            }else if(upgraderList.length < Memory.maxUpgraders){
                newName = 'upgrader' + Memory.upgraderIndex;
                result = spawner.spawnCreep(upgraderBody[creepTier], newName, { memory: {role: 'upgrader', tier: creepTier}});
                //console.log(`Trying to spawn upgrader ${newName}, result = ${result}`);
                while (result === -3){
                    Memory.upgraderIndex++;
                    newName = 'upgrader' + Memory.upgraderIndex;
                    result = spawner.spawnCreep(upgraderBody[creepTier], newName, { memory: {role: 'upgrader', tier: creepTier}});
                }
                if (result === 0){
                    console.log(`Spawning new ${Game.creeps[newName].memory.role}: ${newName}`);
                    Memory.upgraderIndex++;
                } else if (result !== 1) {
                    console.log(`Spawn of new ${Game.creeps[newName].memory.role} failed: ${result} - ${newName}`);
                }
            }else if(builderList.length < Memory.maxBuilders){
                newName = 'builder' + Memory.builderIndex;
                result = spawner.spawnCreep(builderBody[creepTier], newName, { memory: {role: 'builder', tier: creepTier}});
                //console.log(`Trying to spawn builder ${newName}, result = ${result}`);
                while (result === -3){
                    Memory.builderIndex++;
                    newName = 'builder' + Memory.builderIndex;
                    result = spawner.spawnCreep(builderBody[creepTier], newName, { memory: {role: 'builder', tier: creepTier}});
                }
                if (result === 0){
                    console.log(`Spawning new ${Game.creeps[newName].memory.role}: ${newName}`);
                    Memory.builderIndex++;
                } else if (result !== 1) {
                    console.log(`Spawn of new ${Game.creeps[newName].memory.role} failed: ${result} - ${newName}`);
                }
            }else if(defenderList.length < Memory.maxDefenders){
                newName = 'defender' + Memory.defenderIndex;
                result = spawner.spawnCreep(defenderBody[creepTier], newName, { memory: {role: 'defender', tier: creepTier}});
                //console.log(`Trying to spawn defender ${newName}, result = ${result}`);
                while (result === -3){
                    Memory.defenderIndex++;
                    newName = 'defender' + Memory.defenderIndex;
                    result = spawner.spawnCreep(defenderBody[creepTier], newName, { memory: {role: 'defender', tier: creepTier}});
                }
                if (result === 0){
                    console.log(`Spawning new ${Game.creeps[newName].memory.role}: ${newName}`);
                    Memory.defenderIndex++;
                } else if (result !== 1) {
                    console.log(`Spawn of new ${Game.creeps[newName].memory.role} failed: ${result} - ${newName}`);
                }
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