let bodytype = require('constants.bodytype');
let roleGeneral = require('role.general');
let helper = require('helper');

//Defensive Functions
let processDefense = {
    scanForHostiles: function(roomName) {
        let hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
        hostiles = hostiles.concat(Game.rooms[roomName].find(FIND_HOSTILE_STRUCTURES));
        if (hostiles.length > 0){
            let vikingList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_VIKING);
            if (vikingList.length < Memory.roles.limit[ARMY_VIKING]) {
                this.spawnViking(vikingList.length);
            }
            if (vikingList.length > 0) {roleGeneral.run(roomName)}
        } //else {roleGeneral.moveToFlag(roomName)}
    },

    checkKillList: function(){
        if (Memory.killList === undefined || Memory.killList.length === 0) { return }
        if (Game.getObjectById(Memory.killList[0]) === null) {
            console.log(`Checking killList: ${Memory.killList[0]} has been destroyed`);
            Memory.killList.shift();
        } else { 
            let vikingList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_VIKING).length;
            if (vikingList < Memory.roles.limit[ARMY_VIKING]) {
                this.spawnViking(vikingList.length);
            }
            if (vikingList > 0) {roleGeneral.killTarget(Memory.killList[0])}
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
                    default:
                        console.log(`Hostile Found!!  Owned by ${hostiles[i].owner.username}`);
                }
                
            }
        }
        room.memory.keeperLair.threatActive = keeperCreeperFound;
    },

    spawnViking: function(vikingCount){
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
module.exports = processDefense;