let helper = require('helper');
let pathing = require('pathing');

let construction = {

    checkSpawnRoads: function (spawnIndex) {
        if (Memory.spawns[spawnIndex].hasRoads != -1){
            this.buildSpawnRoads(spawnIndex, Memory.rooms[Game.spawns[spawnIndex].room.name].spawns[0].hasRoads);
            Memory.rooms[Game.spawns[spawnIndex].room.name].spawns[0].hasRoads++;
        }
    },

    buildSpawnRoads: function (spawnIndex, stage) {
        let spawner = Game.spawns[spawnIndex];
        switch(stage){
            case 0:
                //Build spokes
                spawner.room.createConstructionSite(spawner.pos.x+1, spawner.pos.y-1, STRUCTURE_ROAD);
                spawner.room.createConstructionSite(spawner.pos.x+1, spawner.pos.y+1, STRUCTURE_ROAD);
                spawner.room.createConstructionSite(spawner.pos.x-1, spawner.pos.y+1, STRUCTURE_ROAD);
                spawner.room.createConstructionSite(spawner.pos.x-1, spawner.pos.y-1, STRUCTURE_ROAD);

                spawner.room.createConstructionSite(spawner.pos.x+2, spawner.pos.y-2, STRUCTURE_ROAD);
                spawner.room.createConstructionSite(spawner.pos.x+2, spawner.pos.y+2, STRUCTURE_ROAD);
                spawner.room.createConstructionSite(spawner.pos.x-2, spawner.pos.y-2, STRUCTURE_ROAD);
                spawner.room.createConstructionSite(spawner.pos.x-2, spawner.pos.y+2, STRUCTURE_ROAD);
                break;
            case 1:
                //Connect spokes
                spawner.room.createConstructionSite(spawner.pos.x, spawner.pos.y-1, STRUCTURE_ROAD);
                spawner.room.createConstructionSite(spawner.pos.x+1, spawner.pos.y, STRUCTURE_ROAD);
                spawner.room.createConstructionSite(spawner.pos.x, spawner.pos.y+1, STRUCTURE_ROAD);
                spawner.room.createConstructionSite(spawner.pos.x-1, spawner.pos.y, STRUCTURE_ROAD);
                break;
            case 2:
                spawner.room.createConstructionSite(spawner.pos.x-1, spawner.pos.y-2, STRUCTURE_ROAD);
                spawner.room.createConstructionSite(spawner.pos.x, spawner.pos.y-2, STRUCTURE_ROAD);
                spawner.room.createConstructionSite(spawner.pos.x+1, spawner.pos.y-2, STRUCTURE_ROAD);

                spawner.room.createConstructionSite(spawner.pos.x+2, spawner.pos.y-1, STRUCTURE_ROAD);
                spawner.room.createConstructionSite(spawner.pos.x+2, spawner.pos.y, STRUCTURE_ROAD);
                spawner.room.createConstructionSite(spawner.pos.x+2, spawner.pos.y+1, STRUCTURE_ROAD);

                spawner.room.createConstructionSite(spawner.pos.x-1, spawner.pos.y+2, STRUCTURE_ROAD);
                spawner.room.createConstructionSite(spawner.pos.x, spawner.pos.y+2, STRUCTURE_ROAD);
                spawner.room.createConstructionSite(spawner.pos.x+1, spawner.pos.y+2, STRUCTURE_ROAD);

                spawner.room.createConstructionSite(spawner.pos.x-2, spawner.pos.y-1, STRUCTURE_ROAD);
                spawner.room.createConstructionSite(spawner.pos.x-2, spawner.pos.y, STRUCTURE_ROAD);
                spawner.room.createConstructionSite(spawner.pos.x-2, spawner.pos.y+1, STRUCTURE_ROAD);
                Memory.spawns[spawnIndex].hasRoads = -1;
                break;
        }
    },

    buildSourceRoads: function (spawnIndex) {
        let spawner = Game.spawns[spawnIndex];
        let memoryLoc = Memory.rooms[spawner.room.name];
        let numConstructionSites = spawner.room.find(FIND_CONSTRUCTION_SITES).length;
        //console.log(`numConstructionSites = ${numConstructionSites}`)
        for (let i in memoryLoc.sourceList){
            switch(memoryLoc.sourceList[i].roadStatus){
                case 0:
                    if (numConstructionSites == 0){
                        let source = Game.getObjectById(memoryLoc.sourceList[i].id);
                        let roadPath = pathing.calcPathForRoad(spawner.pos, {pos: source.pos, range: 1});
                        if (roadPath.incomplete){ 
                            console.log('------Unable to find path');
                            return;
                        };
                        for (let j = 0; j < roadPath.path.length; j++){
                            let result = Game.spawns[spawnIndex].room.createConstructionSite(roadPath.path[j], STRUCTURE_ROAD);
                        }
                        memoryLoc.sourceList[i].roadStatus = 1;
                    }
                    return;
                case 1:
                    //console.log(`Case 1: ID = ${Memory.sourceList[i].id}`);
                    if (numConstructionSites == 0){ memoryLoc.sourceList[i].roadStatus = 2 }
                    return;
                case 2:
                    //console.log(`Case 2: ID = ${Memory.sourceList[i].id}`);
                    for (let j = 1; j <= memoryLoc.sourceList[i].openSpaces[0]; j++){
                        Game.spawns[spawnIndex].room.createConstructionSite(memoryLoc.sourceList[i].openSpaces[j].x, memoryLoc.sourceList[i].openSpaces[j].y, STRUCTURE_ROAD);
                    }
                    let originPos = new RoomPosition(memoryLoc.sourceList[i].openSpaces[1].x, memoryLoc.sourceList[i].openSpaces[1].y, Game.spawns[spawnIndex].room.name);
                    for (let j = 2; j <= memoryLoc.sourceList[i].openSpaces[0]; j++){
                        let destinationPos = new RoomPosition(memoryLoc.sourceList[i].openSpaces[j].x, memoryLoc.sourceList[i].openSpaces[j].y, Game.spawns[spawnIndex].room.name);
                        let roadPath = pathing.calcPathForRoad(originPos, destinationPos);
                        if (roadPath.incomplete){ continue };
                        for (let h = 0; h < roadPath.path.length; h++){
                            Game.spawns[spawnIndex].room.createConstructionSite(roadPath.path[h], STRUCTURE_ROAD);
                        }
                    }
                    memoryLoc.sourceList[i].roadStatus = 3;
                    this.checkSpawnRoads(spawnIndex);
                    return;
            }
        }
        return true;
    },

    buildControllerRoad: function(roomController) {
        let numConstructionSites = roomController.room.find(FIND_CONSTRUCTION_SITES, { filter: (site) => {return site.structureType == STRUCTURE_ROAD}}).length;

        switch(roomController.room.memory.controllerRoad){
            case 0:
                if (numConstructionSites == 0){
                    let source = roomController.pos.findClosestByRange(FIND_SOURCES);

                    let roadPath = pathing.calcPathForRoad(roomController.pos, {pos: source.pos, range: 1});
                    if (roadPath.incomplete){ 
                        console.log('------Unable to find path');
                        return;
                    };
                    for (let j = 0; j < roadPath.path.length; j++){
                        roomController.room.createConstructionSite(roadPath.path[j], STRUCTURE_ROAD);
                    }
                    roomController.room.memory.controllerRoad = 1;
                }
                break;
            case 1:
                //console.log(`Case 1: ID = ${Memory.sourceList[i].id}`);
                if (numConstructionSites == 0){ roomController.room.memory.controllerRoad = 2 }
                break;
        }
    },

    buildRoad: function(startPos, endPos){
        let roadPath = pathing.calcPathForRoad(startPos, endPos);
        if (roadPath.incomplete){ 
            return 'Error: Unable to find path';
        };
        let count = 0;
        for (let j = 0; j < roadPath.path.length; j++){
            let result = Game.rooms[roadPath.path[j].roomName].createConstructionSite(roadPath.path[j], STRUCTURE_ROAD);
            if (result == OK){ count++ }
        }
        return `Created ${count} roads out of ${roadPath.path.length}`;
    },

    checkExtensions: function (spawnIndex) {
        let spawner = Game.spawns[spawnIndex];
        let maxEx = helper.possibleExtensions(spawner.room.controller.level);
        if (maxEx > helper.maxKnownExSites) {maxEx = helper.maxKnownExSites};
        //console.log(`maxEx = ${maxEx}`);
        if (maxEx > 0) {
            let numUnderConstruction = spawner.room.find(FIND_CONSTRUCTION_SITES, { filter: (conSite) => {return conSite.structureType == STRUCTURE_EXTENSION}}).length;
            //console.log(`numUnderConstruction = ${numUnderConstruction}`);
            let numBuilt = spawner.room.find(FIND_MY_STRUCTURES, { filter: (structure) => {return structure.structureType == STRUCTURE_EXTENSION}}).length;
            //console.log(`numBuilt = ${numBuilt}`);
            let otherSites = spawner.room.find(FIND_CONSTRUCTION_SITES, { filter: (conSite) => {
                return conSite.structureType != STRUCTURE_EXTENSION && 
                       conSite.structureType != STRUCTURE_ROAD}}).length;
            if (numUnderConstruction == 0 && numBuilt < maxEx && otherSites == 0){
                let possibleSites = helper.getPossibleExtensionSites(spawnIndex);
                //console.log(`possibleSites = ${possibleSites}`);
                for (let i in possibleSites){
                    if (spawner.room.lookForAt(LOOK_STRUCTURES, possibleSites[i]).length == 0){
                        let result = spawner.room.createConstructionSite(possibleSites[i], STRUCTURE_EXTENSION);
                        if (result == 0){ 
                            console.log(`Created Extension construction site at Pos(X:${possibleSites[i].x}, Y:${possibleSites[i].y})`);
                            return;
                        }
                        else { console.log(`Create Construction Site Failed: ${result}`) }
                    }
                }
            }
        }
    },

    getOpenSourcePoints: function (sourceID) {
        let source = Game.getObjectById(sourceID);
    }
}
module.exports = construction;