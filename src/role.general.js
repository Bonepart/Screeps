let helper = require('helper');

let roleGeneral = {

    run: function(roomName=null){
        console.log(`Called general.run\troomName = ${roomName}`);
        let vikingList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_VIKING);
        let hostiles = vikingList[0].room.find(FIND_HOSTILE_CREEPS);
        let target = vikingList[0].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0){
            for (let i in vikingList){
                let creep = vikingList[i];
                if (creep.spawning) {continue}
                if (target){
                    let result = creep.attack(target);
                    switch(result){
                        case OK:
                            console.log(`${creep.name} attacked ${target.name}! (${target.hits}/${target.hitsMax})`);
                            break;
                        case ERR_NOT_IN_RANGE:
                            creep.rangedAttack(target);
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                            break;
                        default:
                            console.log(`${creep.name} tried to attck ${target.name}, got error ${result}`);
                    }
                } 
            }
        } else {
            hostiles = vikingList[0].room.find(FIND_HOSTILE_SPAWNS);
            if (hostiles.length > 0){
                for (let i in vikingList){
                    let creep = vikingList[i];
                    if (creep.spawning) {continue}
                    let target = creep.pos.findClosestByRange(FIND_HOSTILE_SPAWNS);
                    if (target){
                        let result = creep.attack(target);
                        switch(result){
                            case OK:
                                console.log(`${creep.name} attacked ${target.name}! (${target.hits}/${target.hitsMax})`);
                                break;
                            case ERR_NOT_IN_RANGE:
                                creep.rangedAttack(target);
                                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                                break;
                            default:
                                console.log(`${creep.name} tried to attck ${target.name}, got error ${result}`);
                        }
                    } 
                }
            }
        }
        if (roomName != null){
            let destRoom = Game.rooms[roomName];
            let newRoomPos = undefined;
            if (destRoom == undefined){newRoomPos = new RoomPosition(24, 45, creep.memory.assignedRoom)}
            else {newRoomPos = destRoom.controller.pos}
            for (let i in vikingList){
                let creep = vikingList[i];
                if (creep.spawning) {continue}
                if (creep.room.name != roomName){
                    creep.moveTo(newRoomPos, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    },

    moveToFlag: function(roomName){
        let vikingList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_VIKING);
        let dFlag = Game.rooms[roomName].find(FIND_FLAGS, {filter: (flag) => {return flag.name == "Defenders"}});
        if (dFlag){
            for (let i in vikingList){
                let creep = vikingList[i];
                if (creep.spawning) {continue}
                creep.moveTo(dFlag[0].pos, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
}
module.exports = roleGeneral;