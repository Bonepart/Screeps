let bodytype = require('constants.bodytype');
let helper = require('helper');

let spawningLogic = {

    spawnCreep: function (spawnIndex, role, body, creepTier, assignRoom = undefined) {
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
        } else { logSpawnResults(spawnIndex, result, newName); return false }
    },

    spawnExCreep: function (role, body, roomName) {
        newName = role + Memory.roles.index[role];
        for (let i in Game.spawns){
            if (!helper.isAvailable(i)) { continue }
            let result = Game.spawns[i].spawnCreep(body, newName, { dryRun: true });
            while (result === -3){
                Memory.roles.index[role]++;
                newName = role + Memory.roles.index[role];
                result = Game.spawns[i].spawnCreep(body, newName, { dryRun: true });
            }
            if (result == OK) {
                result = Game.spawns[i].spawnCreep(body, newName, { memory: {role: role, assignedRoom: roomName, originRoom: Game.spawns[i].room.name}});
                if (result != OK) {
                    console.log(`${i}: Error, dry run said OK, real spawn failed: ${result}`);
                }
                Memory.roles.index[role]++;
                console.log(`${i}: Spawning ${newName} assigned to ${roomName}`);
                return newName;
            } else { return null }
        }        
    },

    spawnGofer: function (spawnIndex, creepTier, optionsObject) {
        let spawner = Game.spawns[spawnIndex];
        let newName = ROLE_GOFER + Memory.roles.index[ROLE_GOFER];

        let body = undefined;
        if (creepTier >= bodytype.gofer.length) { creepTier = bodytype.gofer.length - 1}
        body = bodytype.gofer[creepTier]

        let result = spawner.spawnCreep(body, newName, { dryRun: true});
        while (result === -3){
            Memory.roles.index[ROLE_GOFER]++;
            newName = ROLE_GOFER + Memory.roles.index[ROLE_GOFER];
            result = spawner.spawnCreep(body, newName, { dryRun: true});
        }
        if (result == OK) {
            switch (optionsObject.task){
                case TASK_STORE_MINERALS:
                    spawner.spawnCreep(body, newName, { memory: {
                        role: ROLE_GOFER, 
                        tier: creepTier + 1, 
                        assignedRoom: optionsObject.assignedRoom,
                        task: optionsObject.task,
                        containerID: optionsObject.containerID,
                        storageID: optionsObject.storageID,
                        mineralType: optionsObject.mineralType
                    }});
                    break;
                case TASK_TOWER_SUPPLY:
                    spawner.spawnCreep(body, newName, { memory: {
                        role: ROLE_GOFER, 
                        tier: creepTier + 1, 
                        assignedRoom: optionsObject.assignedRoom,
                        task: optionsObject.task,
                        towerID: optionsObject.towerID,
                        storageID: optionsObject.storageID
                    }});
                    break;
                default:
                    console.log(`${spawner.name} ERROR: spawnGofer unhandled task ${optionsObject.task}`);
                    return false;
            }
            Memory.roles.index[ROLE_GOFER]++;
            console.log(`${spawnIndex}: Spawning T${creepTier+1} ${newName} assigned to ${optionsObject.assignedRoom} for task ${optionsObject.task}`);
            return true;
        } else { logSpawnResults(spawnIndex, result, newName); return false }
    },

    spawnSentry: function (spawnIndex) {
        let spawner = Game.spawns[spawnIndex];
        let role = ROLE_SENTRY;
        let body = bodytype.sentry;

        for (let roomName in Memory.rooms) {
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