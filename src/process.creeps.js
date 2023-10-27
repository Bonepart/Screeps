let helper = require('helper');
let bodytype = require('constants.bodytype');
const { ceil } = require("lodash");

let processCreeps = {

    checkForSpawn: function(spawnIndex){
        let spawner = Game.spawns[spawnIndex];

        let builderList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_BUILDER);
        let harvesterList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_HARVESTER);
        let upgraderList = {};
        let maintList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_MAINTENANCE);

        for (let i in Game.rooms){
            if (Memory.rooms[i].roomState == ROOM_OWNED || Memory.rooms[i].roomState == ROOM_OWNED_SAFE){
                upgraderList[i] = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_UPGRADER && creep.memory.assignedRoom == i).length;
            }
        }
        let goferList = 0;
        if (Memory.roles.limit[ROLE_GOFER] > 0){goferList = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_GOFER)}
        
        let defenderList = 0;
        let vikingList = 0;
        let rangedList = 0;
        let healerList = 0;

        if (Memory.roles.limit[ARMY_DEFENDER] > 0){defenderList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_DEFENDER)}
        if (Memory.roles.limit[ARMY_VIKING] > 0){vikingList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_VIKING)}
        if (Memory.roles.limit[ARMY_RANGED] > 0){rangedList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_RANGED)}
        if (Memory.roles.limit[ARMY_HEALER] > 0){healerList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_HEALER)}

        let zombieList = _.filter(Game.creeps, (creep) => creep.memory.role == ZOMBIE);

        if (zombieList == 0){
            if (builderList.length > Memory.roles.limit[ROLE_BUILDER]){ 
                builderList[0].memory.role = ZOMBIE;
                console.log(`Too many Builders: ${builderList.length}/${Memory.roles.limit[ROLE_BUILDER]}, ${builderList[0].name} is now a zombie`);
            }
        }

        let creepTier = spawner.room.memory.spawnTier - 1;

        if (spawner.store[RESOURCE_ENERGY] >= 250){
            let body = null;
            if (harvesterList.length < Memory.roles.limit[ROLE_HARVESTER]){
                //Spawn Tier 0 Harvester if there are zero Harvesters
                if (harvesterList.length == 0 && creepTier > 0){creepTier = 0}
                else if (creepTier >= bodytype.harvester.length) { creepTier = bodytype.harvester.length - 1}
                body = bodytype.harvester[creepTier]
                spawnCreep(spawnIndex, ROLE_HARVESTER, body, creepTier);
            }
            else if (goferList.length < Memory.roles.limit[ROLE_GOFER]){
                if (creepTier >= bodytype.gofer.length) { creepTier = bodytype.gofer.length - 1}
                body = bodytype.gofer[creepTier]
                spawnCreep(spawnIndex, ROLE_GOFER, body, creepTier);
            }
            else if (defenderList.length < Memory.roles.limit[ARMY_DEFENDER]){
                if (creepTier >= bodytype.defender.length) { creepTier = bodytype.defender.length - 1}
                body = bodytype.defender[creepTier]
                spawnCreep(spawnIndex, ARMY_DEFENDER, body, creepTier);
            }
            else if (healerList.length < Memory.roles.limit[ARMY_HEALER]){
                if (creepTier >= bodytype.healer.length) { creepTier = bodytype.healer.length - 1}
                body = bodytype.healer[creepTier]
                spawnCreep(spawnIndex, ARMY_HEALER, body, creepTier);
            }
            else if(maintList.length < Memory.roles.limit[ROLE_MAINTENANCE]){
                if (creepTier >= bodytype.maintenance.length) { creepTier = bodytype.maintenance.length - 1}
                body = bodytype.maintenance[creepTier]
                spawnCreep(spawnIndex, ROLE_MAINTENANCE, body, creepTier);
            }
            else if(builderList.length < Memory.roles.limit[ROLE_BUILDER]){
                if (creepTier >= bodytype.builder.length) { creepTier = bodytype.builder.length - 1}
                body = bodytype.builder[creepTier]
                spawnCreep(spawnIndex, ROLE_BUILDER, body, creepTier);
            }
            else {
                for (let i in Game.rooms) {
                    if(upgraderList[i] < Memory.roles.limit[ROLE_UPGRADER]){
                        if (creepTier >= bodytype.upgrader.length) { creepTier = bodytype.upgrader.length - 1}
                        body = bodytype.upgrader[creepTier]
                        spawnCreep(spawnIndex, ROLE_UPGRADER, body, creepTier, i);
                    }
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

function spawnCreep(spawnIndex, role, body, creepTier, assignRoom = undefined){
    let spawner = Game.spawns[spawnIndex];
    let newName = role + Memory.roles.index[role];

    let result = spawner.spawnCreep(body, newName, { dryRun: true, memory: {role: role, tier: creepTier + 1}});
    while (result === -3){
        Memory.roles.index[role]++;
        newName = role + Memory.roles.index[role];
        result = spawner.spawnCreep(body, newName, { dryRun: true, memory: {role: role, tier: creepTier + 1}});
    }
    if (result == OK) {
        spawner.spawnCreep(body, newName, { memory: {role: role, tier: creepTier + 1, assignedRoom: assignRoom}});
        Memory.roles.index[role]++;
        console.log(`Spawning ${newName} at T${creepTier+1}`);
    } else { logSpawnResults(result, newName, creepTier) }
}

function logSpawnResults(result, newName, creepTier) {
    switch(result){
        case OK:
        case ERR_NOT_ENOUGH_ENERGY:
            break;
        default:
            console.log(`Spawn of ${newName} (T${creepTier+1}) failed: ${result}`);
    }
}
