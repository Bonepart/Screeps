let bodytype = require('constants.bodytype');
let helper = require('helper');

let spawningLogic = {

    spawnCreep: function (spawnIndex, role, body, memoryObject) {
        let spawner = Game.spawns[spawnIndex];
        let newName = role + Memory.roles.index[role];
    
        let result = spawner.spawnCreep(body, newName, { dryRun: true});
        while (result == ERR_NAME_EXISTS){
            Memory.roles.index[role]++;
            newName = role + Memory.roles.index[role];
            result = spawner.spawnCreep(body, newName, { dryRun: true});
        }
        if (result == OK) {
            spawner.spawnCreep(body, newName, { memory: memoryObject});
            Memory.roles.index[role]++;
            console.log(`${spawnIndex}: Spawning T${memoryObject.tier} ${newName} assigned to ${memoryObject.assignedRoom}`);
            return true;
        } else { logSpawnResults(spawnIndex, result, newName); return false }
    },

    spawnExCreep: function (role, roomName) {
        newName = role + Memory.roles.index[role];
        for (let i in Game.spawns){
            if (!helper.isAvailable(i)) { continue }
            let spawner = Game.spawns[i];
            let creepTier = spawner.room.memory.spawnTier - 1;
            if (creepTier < 2) { continue }
            let body = undefined;
            switch (role){
                case ROLE_CLAIMER:
                    if (creepTier >= bodytype.claimer.length) { creepTier = bodytype.claimer.length - 1}
                    body = bodytype.claimer[creepTier]
                    break;
                case ROLE_LONGHAUL:
                    if (creepTier >= bodytype.longhauler.length) { creepTier = bodytype.longhauler.length - 1}
                    body = bodytype.longhauler[creepTier]
                    break;
            }
            let result = spawner.spawnCreep(body, newName, { dryRun: true });
            while (result == ERR_NAME_EXISTS){
                Memory.roles.index[role]++;
                newName = role + Memory.roles.index[role];
                result = spawner.spawnCreep(body, newName, { dryRun: true });
            }
            if (result == OK) {
                result = spawner.spawnCreep(body, newName, { memory: {role: role, assignedRoom: roomName}});
                if (result != OK) {
                    console.log(`${i}: Error, dry run said OK, real spawn failed: ${result}`);
                }
                Memory.roles.index[role]++;
                console.log(`${i}: Spawning ${newName} assigned to ${roomName}`);
                return newName;
            }
        }
        return null;
    },

    spawnGofer: function (spawnIndex, creepTier, memoryObject) {
        let spawner = Game.spawns[spawnIndex];
        let newName = memoryObject.task + Memory.roles.index[ROLE_GOFER];

        let body = undefined;
        if (creepTier >= bodytype.gofer.length) { creepTier = bodytype.gofer.length - 1}
        body = bodytype.gofer[creepTier]

        let result = spawner.spawnCreep(body, newName, { dryRun: true});
        while (result === -3){
            Memory.roles.index[ROLE_GOFER]++;
            newName = memoryObject.task + Memory.roles.index[ROLE_GOFER];
            result = spawner.spawnCreep(body, newName, { dryRun: true});
        }
        if (result == OK) {
            memoryObject.tier = creepTier + 1;
            spawner.spawnCreep(body, newName, { memory: memoryObject});
            Memory.roles.index[ROLE_GOFER]++;
            console.log(`${spawnIndex}: Spawning T${memoryObject.tier} ${newName} assigned to ${memoryObject.assignedRoom} for task ${memoryObject.task}`);
            return true;
        } else { logSpawnResults(spawnIndex, result, newName); return false }
    },

    spawnSentry: function (spawnIndex) {
        let spawner = Game.spawns[spawnIndex];
        let role = ROLE_SENTRY;
        let body = bodytype.sentry;

        for (let roomName in Memory.rooms) {
            if (Memory.rooms[roomName].sentryID == 'NA') { continue }
            if ((Memory.rooms[roomName].sentryID != null && Game.creeps[Memory.rooms[roomName].sentryID] == undefined) || 
                    Memory.rooms[roomName].sentryID === null){
                newName = role + Memory.roles.index[role];
                let result = spawner.spawnCreep(body, newName, { dryRun: true });
                while (result === -3){
                    Memory.roles.index[role]++;
                    newName = role + Memory.roles.index[role];
                    result = spawner.spawnCreep(body, newName, { dryRun: true });
                }
                if (result == OK) {
                    spawner.spawnCreep(body, newName, { memory: {role: role, assignedRoom: roomName}});
                    Memory.roles.index[role]++;
                    Memory.rooms[roomName].sentryID = newName;
                    console.log(`${spawnIndex}: Spawning ${newName} to surveil ${roomName}`);
                    return true;
                }else {logSpawnResults(spawnIndex, result, newName)}
            }
        }
    },

    spawnViking: function (vikingCount) {
        body = bodytype.viking[2];
        for (let i in Game.spawns){
            let creepTier = Memory.rooms[Game.spawns[i].room.name].spawnTier - 1;
            if (creepTier < 2) { continue }
            if (creepTier >= bodytype.viking.length) { creepTier = bodytype.viking.length - 1}
            body = bodytype.viking[creepTier]
            newName = ARMY_VIKING + Memory.roles.index[ARMY_VIKING];
            if (vikingCount >= Memory.roles.limit[ARMY_VIKING]) { return }
            if (!helper.isAvailable(i)) { continue }
            let result = Game.spawns[i].spawnCreep(body, newName, { dryRun: true });
            while (result === -3){
                Memory.roles.index[ARMY_VIKING]++;
                newName = ARMY_VIKING + Memory.roles.index[ARMY_VIKING];
                result = Game.spawns[i].spawnCreep(body, newName, { dryRun: true });
            }
            if (result == OK) {
                Game.spawns[i].spawnCreep(body, newName, { memory: { role: ARMY_VIKING, tier: creepTier + 1 }});
                Memory.roles.index[ARMY_VIKING]++;
                vikingCount++;
                console.log(`${i}: Spawning ${newName}`);
            }
        }
    }

}
module.exports = spawningLogic;

function logSpawnResults(spawnName, result, newName) {
    switch(result){
        case OK:
        case ERR_NOT_ENOUGH_ENERGY:
            break;
        default:
            console.log(`${spawnName}: Spawn of ${newName} failed: ${result}`);
    }
}