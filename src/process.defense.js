let roleGeneral = require('role.general');
let helper = require('helper');

//Defensive Functions
let processDefense = {
    scanForHostiles: function(roomName) {
        let hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
        hostiles = hostiles.concat(Game.rooms[roomName].find(FIND_HOSTILE_STRUCTURES));
        if (hostiles.length > 0){ roleGeneral.run(hostiles[0].pos) }
    },

    checkKillList: function(){
        if (Memory.killList === undefined || Memory.killList.length === 0) { return }
        if (Game.getObjectById(Memory.killList[0]) === null) {
            console.log(`Checking killList: ${Memory.killList[0]} has been destroyed`);
            Memory.killList.shift();
        } 
        else { roleGeneral.killTarget(Memory.killList[0]) }
    },

    checkForCrusade: function(){
        if (Memory.flags.crusade.roomName != undefined) {
            roomPos = new RoomPosition(Memory.flags.crusade.x, Memory.flags.crusade.y, Memory.flags.crusade.roomName);
            roleGeneral.run(roomPos);
        }
    },

    checkForKeeperLair: function(roomName){
        let room = Game.rooms[roomName];
        if (room.memory.keeperLair == -1) { return };
        if (room.memory.keeperLair === undefined){
            let keeperLair = room.find(FIND_HOSTILE_STRUCTURES, { filter: (structure) => {return structure.structureType == STRUCTURE_KEEPER_LAIR}});
            if (keeperLair.length > 0){
                room.memory.keeperLair = {sourceID: null, threatActive: false}
                let sources = room.find(FIND_SOURCES);
                let closestRange = Infinity;
                for( let i in sources) {
                    let range = sources[i].pos.getRangeTo(keeperLair[0].pos);
                    if (range < closestRange){
                        room.memory.keeperLair.sourceID = sources[i].id;
                        closestRange = range;
                    }
                }
            } else {room.memory.keeperLair = -1}
        }

        let hostiles = room.find(FIND_HOSTILE_CREEPS);
        let keeperCreeperFound = false;
        if (hostiles.length > 0){
            for (let i in hostiles){
                switch(hostiles[i].owner.username){
                    case "Source Keeper":
                        keeperCreeperFound = true;
                        break;
                }
                
            }
        }
        room.memory.keeperLair.threatActive = keeperCreeperFound;
    },


}
module.exports = processDefense;