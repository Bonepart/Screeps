let bodytype = require('constants.bodytype');
let helper = require('helper');

let roleGeneral = {

    /** @param {RoomPosition} roomPos **/
    run: function(roomPos){
        let vikingList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_VIKING);
        if (vikingList.length < Memory.roles.limit[ARMY_VIKING]) { spawnViking(vikingList.length) }
        if (vikingList.length == 0) { return }

        let targetRoom = Game.rooms[roomPos.roomName];
        if (!targetRoom) {
            for (let i in vikingList){
                let creep = vikingList[i];
                if (creep.spawning) {continue}
                creep.moveTo(roomPos, {visualizePathStyle: {stroke: '#ff0000'}});
            }
            return;
        }

        let hostiles = Game.rooms[roomPos.roomName].find(FIND_HOSTILE_CREEPS);
        let hostileTowers = Game.rooms[roomPos.roomName].find(FIND_HOSTILE_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_TOWER}});
        let hostileStructures = Game.rooms[roomPos.roomName].find(FIND_HOSTILE_SPAWNS);
        hostileStructures = hostileStructures.concat(Game.rooms[roomPos.roomName].find(FIND_HOSTILE_STRUCTURES, { 
            filter: (structure) => { return structure.structureType != STRUCTURE_TOWER &&
                                            structure.structureType != STRUCTURE_CONTROLLER &&
                                            structure.structureType != STRUCTURE_SPAWN}
            })
        );
        hostileStructures = hostileStructures.concat(vikingList[0].room.find(FIND_HOSTILE_CONSTRUCTION_SITES));

        let priorityTarget = null;
        if (Memory.killList != undefined && Memory.killList.length > 0) {
            priorityTarget = Game.getObjectById(Memory.killList[0])
            if (priorityTarget != null) { if (priorityTarget.pos.roomName != roomPos.roomName) { priorityTarget = null } }
            
        }

        if (hostiles.length > 0 || hostileStructures.length > 0){
            for (let i in vikingList){
                let creep = vikingList[i];
                if (creep.spawning) {continue}

                if (creep.room.name != roomPos.roomName) { 
                    creep.moveTo(roomPos, {visualizePathStyle: {stroke: '#ff0000'}});
                    continue;
                }

                let targets = creep.pos.findInRange(hostiles, 3);
                if (targets.length > 0) {
                    creep.rangedAttack(targets[0]);
                    let result = creep.attack(targets[0]);
                    switch(result){
                        case OK:
                            console.log(`${creep.name} attacked ${targets[0].name}! (${targets[0].hits}/${targets[0].hitsMax})`);
                            continue;
                        case ERR_NOT_IN_RANGE:
                            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ff0000'}});
                            break;
                        default:
                            console.log(`(findInRange) ${creep.name} tried to attack ${targets[0].name}, got error ${result}`);
                    }
                }

                if (priorityTarget != null) {
                    creep.rangedAttack(priorityTarget);
                    let result = creep.attack(priorityTarget);
                    switch(result){
                        case OK:
                            continue;
                        case ERR_NOT_IN_RANGE:
                            creep.moveTo(priorityTarget, {visualizePathStyle: {stroke: '#ffffff'}});
                            continue;
                        default:
                            console.log(`(priorityTarget) ${creep.name} tried to attack ${priorityTarget.id}, got error ${result}`);
                    }
                }

                if (hostileTowers.length > 0){
                    let target = creep.pos.findClosestByPath(hostileTowers);
                    if (target){
                        creep.rangedAttack(target);
                        let result = creep.attack(target);
                        switch(result){
                            case OK:
                                console.log(`${creep.name} attacked Tower! (${target.hits}/${target.hitsMax})`);
                                continue;
                            case ERR_NOT_IN_RANGE:
                                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                                continue;
                            default:
                                console.log(`${creep.name} tried to attack Tower ${target.id}, got error ${result}`);
                        }
                    }
                }

                if (hostiles.length > 0){
                    let target = creep.pos.findClosestByPath(hostiles);
                    if (target){
                        creep.rangedAttack(target);
                        let result = creep.attack(target);
                        switch(result){
                            case OK:
                                console.log(`${creep.name} attacked ${target.name}! (${target.hits}/${target.hitsMax})`);
                                continue;
                            case ERR_NOT_IN_RANGE:
                                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                                continue;
                            default:
                                console.log(`${creep.name} tried to attack ${target.name}, got error ${result}`);
                        }
                    }
                }

                if (hostileStructures.length > 0){
                    let target = hostileStructures[0];
                    if (target){
                        creep.rangedAttack(target);
                        let result = creep.attack(target);
                        switch(result){
                            case OK:
                                console.log(`${creep.name} attacked ${target.id}! (${target.hits}/${target.hitsMax})`);
                                continue;
                            case ERR_NOT_IN_RANGE:
                                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                                continue;
                            default:
                                console.log(`${creep.name} tried to attack ${target.id}, got error ${result}`);
                        }
                    }
                }
            }
        }
        else {
            for (let i in vikingList){
                let creep = vikingList[i];
                if (creep.spawning) {continue}
                creep.moveTo(roomPos, {visualizePathStyle: {stroke: '#ff0000'}});
            }
            if (Memory.flags.crusade.roomName != undefined) {
                if (Memory.flags.crusade.roomName == roomPos.roomName) { Memory.flags.crusade = {} }
            }
        }
    },

    killTarget: function(targetID){
        let vikingList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_VIKING);
        if (vikingList.length < Memory.roles.limit[ARMY_VIKING]) { spawnViking(vikingList.length) }

        let target = Game.getObjectById(targetID);
        if (target === null) { return }
        if (vikingList.length == 0) { return }
        for (let i in vikingList){
            let creep = vikingList[i];
            if (creep.spawning) {continue}
            creep.rangedAttack(target);
            let result = creep.attack(target);
            switch(result){
                case OK:
                    break;
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    break;
                default:
                    console.log(`${creep.name} tried to attck ${target.name}, got error ${result}`);
            }
        }
        if(Game.time % 40 == 0) {
            console.log(`killList: ${target.id} (${target.hits})`);
        }
    },

    defendPoint: function(){
        let vikingList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_VIKING);
        let dFlag = Game.rooms[roomName].find(FIND_FLAGS, {filter: (flag) => {return flag.name == "Defend Point"}});
    },

    moveToFlag: function(roomName){
        let vikingList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_VIKING);
        let dFlag = Game.rooms[roomName].find(FIND_FLAGS, {filter: (flag) => {return flag.name == "Defenders"}});
        if (dFlag.length > 0){
            for (let i in vikingList){
                let creep = vikingList[i];
                if (creep.spawning) {continue}
                creep.moveTo(dFlag[0].pos, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    },


}
module.exports = roleGeneral;

function spawnViking(vikingCount){
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