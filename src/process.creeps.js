let helper = require('helper');
let bodytype = require('constants.bodytype');
const { ceil } = require("lodash");

let processCreeps = {

    checkForSpawn: function(spawnIndex){
        let spawner = Game.spawns[spawnIndex];

        let builderList = {};
        let harvesterList = {};
        let upgraderList = {};
        let maintList = {};
        let goferList = {};
        let storageBuddyList = {};

        for (let i in Game.rooms){
            if (Memory.rooms[i].roomState == ROOM_OWNED || Memory.rooms[i].roomState == ROOM_OWNED_SAFE){
                builderList[i] = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_BUILDER && creep.memory.assignedRoom == i).length;
                harvesterList[i] = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_HARVESTER && creep.memory.assignedRoom == i).length;
                upgraderList[i] = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_UPGRADER && creep.memory.assignedRoom == i).length;
                maintList[i] = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_MAINTENANCE && creep.memory.assignedRoom == i).length;
                goferList[i] = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_GOFER && creep.memory.assignedRoom == i).length;
                storageBuddyList[i] = _.filter(Game.creeps, (creep) => creep.memory.role == ROLE_STORAGEBUDDY && creep.memory.assignedRoom == i).length;
            }
        }
        
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
            if (defenderList.length < Memory.roles.limit[ARMY_DEFENDER]){
                if (creepTier >= bodytype.defender.length) { creepTier = bodytype.defender.length - 1}
                body = bodytype.defender[creepTier]
                spawnCreep(spawnIndex, ARMY_DEFENDER, body, creepTier);
            }
            else if (healerList.length < Memory.roles.limit[ARMY_HEALER]){
                if (creepTier >= bodytype.healer.length) { creepTier = bodytype.healer.length - 1}
                body = bodytype.healer[creepTier]
                spawnCreep(spawnIndex, ARMY_HEALER, body, creepTier);
            }
            else {
                let i = spawner.room.name;
                if (harvesterList[i] < Memory.roles.limit[ROLE_HARVESTER]){
                    if (creepTier >= bodytype.harvester.length) { creepTier = bodytype.harvester.length - 1}
                    body = bodytype.harvester[creepTier]
                    if (spawnCreep(spawnIndex, ROLE_HARVESTER, body, creepTier, i)) { return }
                }
                else if(maintList[i] < Memory.roles.limit[ROLE_MAINTENANCE]){
                    if (creepTier >= bodytype.maintenance.length) { creepTier = bodytype.maintenance.length - 1}
                    body = bodytype.maintenance[creepTier]
                    if (spawnCreep(spawnIndex, ROLE_MAINTENANCE, body, creepTier, i)) { return }
                }
                else if(builderList[i] < Memory.roles.limit[ROLE_BUILDER]){
                    if (creepTier >= bodytype.builder.length) { creepTier = bodytype.builder.length - 1}
                    body = bodytype.builder[creepTier]
                    if (spawnCreep(spawnIndex, ROLE_BUILDER, body, creepTier, i)) { return }
                }
                else if (storageBuddyList[i] == 0){
                    let energyStorage = Game.rooms[i].find(FIND_STRUCTURES, {
                        filter: (structure) => { return structure.structureType == STRUCTURE_STORAGE }}).length;
                    if (energyStorage > 0){
                        body = bodytype.storagebuddy;
                        if (spawnCreep(spawnIndex, ROLE_STORAGEBUDDY, body, -1, i)) { return }
                    }
                    
                }
                else if (goferList[i] < Memory.roles.limit[ROLE_GOFER]){
                    if (creepTier >= bodytype.gofer.length) { creepTier = bodytype.gofer.length - 1}
                    body = bodytype.gofer[creepTier]
                    if (spawnCreep(spawnIndex, ROLE_GOFER, body, creepTier, i)) { return }
                }
                else if(upgraderList[i] < Memory.roles.limit[ROLE_UPGRADER]){
                    if (creepTier >= bodytype.upgrader.length) { creepTier = bodytype.upgrader.length - 1}
                    body = bodytype.upgrader[creepTier]
                    if (spawnCreep(spawnIndex, ROLE_UPGRADER, body, creepTier, i)) { return }
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
            if (Memory.rooms[name].sentryID === undefined) { continue }
            if (Memory.rooms[name].sentryID !== null && Game.creeps[Memory.rooms[name].sentryID] === undefined) {
                Memory.rooms[name].sentryID = null;
                console.log(`Clearing invalid Sentry ID from ${name}`);
            }
        }
    }
};
module.exports = processCreeps;

function spawnCreep(spawnIndex, role, body, creepTier, assignRoom = undefined){
    let spawner = Game.spawns[spawnIndex];
    let newName = role + Memory.roles.index[role];

    let result = spawner.spawnCreep(body, newName, { dryRun: true});
    while (result === -3){
        Memory.roles.index[role]++;
        newName = role + Memory.roles.index[role];
        result = spawner.spawnCreep(body, newName, { dryRun: true});
    }
    if (result == OK) {
        if (creepTier == -1){ spawner.spawnCreep(body, newName, { memory: {role: role, assignedRoom: assignRoom}}) }
        else { spawner.spawnCreep(body, newName, { memory: {role: role, tier: creepTier + 1, assignedRoom: assignRoom}}) }
        Memory.roles.index[role]++;
        if (assignRoom) { console.log(`${spawnIndex}: Spawning T${creepTier+1} ${newName} assigned to ${assignRoom}`);}
        else { console.log(`${spawnIndex}: Spawning T${creepTier+1} ${newName}`) }
        return true;
    } else { logSpawnResults(result, newName, creepTier); return false }
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
