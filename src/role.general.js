let helper = require('helper');

let roleGeneral = {

    run: function(roomName=null){
        //console.log(`Call to General for room ${roomName}`);
        let vikingList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_VIKING);
        let hostiles = vikingList[0].room.find(FIND_HOSTILE_CREEPS);
        
        if (hostiles.length > 0){
            for (let i in vikingList){
                let creep = vikingList[i];
                if (creep.spawning) {continue}
                let target = vikingList[i].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (target){
                    creep.rangedAttack(target);
                    let result = creep.attack(target);
                    switch(result){
                        case OK:
                            console.log(`${creep.name} attacked ${target.name}! (${target.hits}/${target.hitsMax})`);
                            break;
                        case ERR_NOT_IN_RANGE:
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                            break;
                        default:
                            console.log(`${creep.name} tried to attck ${target.name}, got error ${result}`);
                    }
                } 
            }
        } else {
            hostiles = vikingList[0].room.find(FIND_HOSTILE_SPAWNS);
            hostiles = hostiles.concat(vikingList[0].room.find(FIND_HOSTILE_STRUCTURES));
            hostiles = hostiles.concat(vikingList[0].room.find(FIND_HOSTILE_CONSTRUCTION_SITES));
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
            //console.log('General should be moving');
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
    }
}
module.exports = roleGeneral;