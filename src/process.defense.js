let bodytype = require('constants.bodytype');
let roleGeneral = require('role.general');
let helper = require('helper');

//Defensive Functions
let processDefense = {
    scanForHostiles: function(roomName) {
        let hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0){
            let vikingList = _.filter(Game.creeps, (creep) => creep.memory.role == ARMY_VIKING);
            if (vikingList.length < Memory.roles.limit[ARMY_VIKING]) {
                this.spawnViking();
            }
            if (vikingList.length > 0) {roleGeneral.run(roomName)}
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

    spawnViking: function(){
        newName = ARMY_VIKING + Memory.roles.index[ARMY_VIKING];
        body = bodytype.viking[2];
        for (let i in Game.spawns){
            let result = Game.spawns[i].spawnCreep(body, newName, { dryRun: true, memory: {role: ARMY_VIKING, originRoom: Game.spawns[i].room.name}});
            while (result === -3){
                Memory.roles.index[ARMY_VIKING]++;
                newName = ARMY_VIKING + Memory.roles.index[ARMY_VIKING];
                result = Game.spawns[i].spawnCreep(body, newName, { dryRun: true, memory: {role: ARMY_VIKING, originRoom: Game.spawns[i].room.name}});
            }
            if (result == OK) {
                Game.spawns[i].spawnCreep(body, newName, { memory: {role: ARMY_VIKING, originRoom: Game.spawns[i].room.name}});
                Memory.roles.index[ARMY_VIKING]++;
                console.log(`Spawning ${newName}`);
                return true;
            } else { return false }
        }
    }
}
module.exports = processDefense;