var helper = {

    stringifyToLog: function (object) {
        let str = JSON.stringify(object, null, 4);
        console.log(str);
    },

    possibleExtensions: function (conLevel) {
        switch (conLevel) {
            case 1:
                return 0;
            case 2:
                return 5;
            case 3:
                return 10;
            case 4:
                return 20;
            case 5:
                return 30;
            case 6:
                return 40;
            case 7:
                return 50;
            case 8:
                return 60;
            default:
                throw 'Invalid Controller Level:' + conLevel;
        }
    },

    maxKnownExSites: 10,
    getPossibleExtensionSites: function (spawnIndex) {
        let spawner = Game.spawns[spawnIndex];
        let siteList = [];
        siteList.push(new RoomPosition(spawner.pos.x-2, spawner.pos.y-3, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x+2, spawner.pos.y-3, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x-2, spawner.pos.y+3, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x+2, spawner.pos.y+3, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x+3, spawner.pos.y-2, spawner.room.name));

        siteList.push(new RoomPosition(spawner.pos.x+3, spawner.pos.y+2, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x-3, spawner.pos.y-2, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x-3, spawner.pos.y+2, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x, spawner.pos.y-3, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x, spawner.pos.y+3, spawner.room.name));

        return siteList;
    },

    calcPathForRoad: function (pos, goal){
        return PathFinder.search(pos, goal, { plainCost: 2, swampCost: 10,        
            roomCallback: function(roomName) {
                let room = Game.rooms[roomName];
                if (!room) return;
                let costs = new PathFinder.CostMatrix;
        
                room.find(FIND_STRUCTURES).forEach(function(struct) {
                    if (struct.structureType === STRUCTURE_ROAD) {costs.set(struct.pos.x, struct.pos.y, 1)}
                    else if (struct.structureType !== STRUCTURE_CONTAINER && (struct.structureType !== STRUCTURE_RAMPART || !struct.my)) {
                        // Can't walk through non-walkable buildings
                        costs.set(struct.pos.x, struct.pos.y, 0xff);
                    }
                });       
                return costs;
            },
        });
    }
}
module.exports = helper;