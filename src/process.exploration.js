let bodytype = require('constants.bodytype');
let helper = require('helper');

let processExploration = {
    
    run: function (roomName) {
        thisRoom = Game.rooms[roomName];
        if (Memory.roles.limit[ROLE_LONGHAUL] === undefined) {
            Memory.roles.limit[ROLE_LONGHAUL] = 0;
            Memory.roles.index[ROLE_LONGHAUL] = 1;
        }

        if (thisRoom.memory.exits === undefined){
            thisRoom.memory.exits = {};
            let exitInfo = Game.map.describeExits(roomName);
            if(exitInfo[1]){
                thisRoom.memory.exits[1] = {};
                thisRoom.memory.exits[1].name = exitInfo[1];
                thisRoom.memory.exits[1].id = null;
            }
            if(exitInfo[3]){
                thisRoom.memory.exits[3] = {};
                thisRoom.memory.exits[3].name = exitInfo[3];
                thisRoom.memory.exits[3].id = null;
            }
            if(exitInfo[5]){
                thisRoom.memory.exits[5] = {};
                thisRoom.memory.exits[5].name = exitInfo[5];
                thisRoom.memory.exits[5].id = null;
            }
            if(exitInfo[7]){
                thisRoom.memory.exits[7] = {};
                thisRoom.memory.exits[7].name = exitInfo[7];
                thisRoom.memory.exits[7].id = null;
            }
        }


        //spawnExplorers(thisRoom.memory.spawns[0].name);


    }
}
module.exports = processExploration;

function spawnExplorers(spawnIndex) {
    let spawner = Game.spawns[spawnIndex];
    let longhaulList = _.filter(Game.creeps, (creep) => creep.memory.role == 'longhauler');

    if (longhaulList.length < Memory.roles.limit[ROLE_LONGHAUL]){
        newName = 'longhaul' + Memory.longhaulerIndex;
        result = spawner.spawnCreep(bodytype.longhauler[0], newName, { memory: {role: 'longhauler', originRoom: spawner.room.name, assignedRoom: null}});
        while (result === -3){
            Memory.longhaulerIndex++;
            newName = 'harvester' + Memory.longhaulerIndex;
            result = spawner.spawnCreep(bodytype.longhauler[0], newName, { memory: {role: 'longhauler', assignedRoom: null}});
        }
        if(result == OK){Memory.longhaulerIndex++};
        logSpawnResults(result, newName);
    }
}

function logSpawnResults(result, newName) {
    switch(result){
        case OK:
            console.log(`Spawning ${newName}`);
            break;
        case ERR_BUSY:
        case ERR_NOT_ENOUGH_ENERGY:
            break;
        default:
            console.log(`Spawn of ${newName} failed: ${result}`);
    }
}