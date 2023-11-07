let bodytype = require('constants.bodytype');


let spawningLogic = {

    spawnExCreep: function(role, body, roomName){
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
                Game.spawns[i].spawnCreep(body, newName, { memory: {role: role, assignedRoom: roomName, originRoom: Game.spawns[i].room.name}});
                Memory.roles.index[role]++;
                console.log(`${i}: Spawning ${newName} assigned to ${roomName}`);
                return newName;
            } else { return null }
        }        
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
                }else {logSpawnResults(result, newName)}
            }
        }
    },
    
    spawnViking: function (vikingCount) {
        newName = ARMY_VIKING + Memory.roles.index[ARMY_VIKING];
        body = bodytype.viking[2];
        for (let i in Game.spawns){
            if (vikingCount >= Memory.roles.limit[ARMY_VIKING]) { return }
            if (!helper.isAvailable(i)) { continue }
            let result = Game.spawns[i].spawnCreep(body, newName, { dryRun: true });
            while (result === -3){
                Memory.roles.index[ARMY_VIKING]++;
                newName = ARMY_VIKING + Memory.roles.index[ARMY_VIKING];
                result = Game.spawns[i].spawnCreep(body, newName, { dryRun: true });
            }
            if (result == OK) {
                Game.spawns[i].spawnCreep(body, newName, { memory: {role: ARMY_VIKING, originRoom: Game.spawns[i].room.name}});
                Memory.roles.index[ARMY_VIKING]++;
                vikingCount++;
                console.log(`${i}: Spawning ${newName}`);
            }
        }
    }

}
module.exports = spawningLogic;