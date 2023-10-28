let helper = {

    stringifyToLog: function (object) {
        let str = JSON.stringify(object, null, 4);
        console.log(str);
    },

    isAvailable: function (index){
        return Game.spawns[index].my && Game.spawns[index].isActive() && Game.spawns[index].spawning === null;
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

    maxKnownExSites: 16,
    getPossibleExtensionSites: function (spawnIndex) {
        let spawner = Game.spawns[spawnIndex];
        let siteList = [];
        siteList.push(new RoomPosition(spawner.pos.x-2, spawner.pos.y-3, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x+2, spawner.pos.y-3, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x+3, spawner.pos.y-2, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x+3, spawner.pos.y+2, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x+2, spawner.pos.y+3, spawner.room.name));

        siteList.push(new RoomPosition(spawner.pos.x-2, spawner.pos.y+3, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x-3, spawner.pos.y+2, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x-3, spawner.pos.y-2, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x-1, spawner.pos.y-3, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x+1, spawner.pos.y-3, spawner.room.name));

        siteList.push(new RoomPosition(spawner.pos.x+3, spawner.pos.y-1, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x+3, spawner.pos.y+1, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x+1, spawner.pos.y+3, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x-1, spawner.pos.y+3, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x-3, spawner.pos.y+1, spawner.room.name));

        siteList.push(new RoomPosition(spawner.pos.x-3, spawner.pos.y-1, spawner.room.name));

        return siteList;
    },

    maxKnownConSites: 4,
    getPossibleContainerSites: function (spawnIndex) {
        let spawner = Game.spawns[spawnIndex];
        let siteList = [];
        siteList.push(new RoomPosition(spawner.pos.x+3, spawner.pos.y, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x, spawner.pos.y+3, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x-3, spawner.pos.y, spawner.room.name));
        siteList.push(new RoomPosition(spawner.pos.x, spawner.pos.y-3, spawner.room.name));

        return siteList;
    }
}
module.exports = helper;