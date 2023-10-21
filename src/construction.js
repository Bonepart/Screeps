var helper = require('helper');

var construction = {

    checkSpawnRoads: function (spawnIndex) {
        if (Memory.spawns[spawnIndex].hasRoads != -1){
            this.buildSpawnRoads(spawnIndex, Memory.spawns[spawnIndex].hasRoads);
            //let result = Game.spawns[spawnIndex].room.lookForAt(LOOK_STRUCTURES, Game.spawns[spawnIndex].pos.x+1, Game.spawns[spawnIndex].pos.y-1).length;
            //if (result > 0) 
            Memory.spawns[spawnIndex].hasRoads++;
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
        var numConstructionSites = Game.spawns[spawnIndex].room.find(FIND_CONSTRUCTION_SITES).length;
        //console.log("Running sourceList for roads...");
        for (let i in Memory.sourceList){
            //console.log(`--${Memory.sourceList[i].id}`);
            //console.log(`--roadStatus = ${Memory.sourceList[i].roadStatus}`);
            switch(Memory.sourceList[i].roadStatus){
                case 0:
                    //console.log('----Case 0');
                    if (numConstructionSites == 0){
                        //console.log('----Building Roads');
                        let source = Game.getObjectById(Memory.sourceList[i].id);
                        let roadPath = calcPath(spawnIndex, {pos: source.pos, range: 1});
                        //let str = JSON.stringify(roadPath, null, 4);
                        //console.log(`roadPath: ${str}`);
                        if (roadPath.incomplete){ 
                            console.log('------Unable to find path');
                            return;
                        };
                        for (let i = 0; i <= roadPath.ops; i++){
                            let result = Game.spawns[spawnIndex].room.createConstructionSite(roadPath.path[i], STRUCTURE_ROAD);
                            //console.log(`Creating Road Site at ${roadPath.path[i]}`);
                            //console.log(`Response: ${result}`);
                        }
                        Memory.sourceList[i].roadStatus = 1;
                    }
                    return;
                case 1:
                    //console.log('----Case 1');
                    if (numConstructionSites > 0){ return }
                    //console.log('----Road Complete?');
                    Memory.sourceList[i].roadStatus = 2;
                    this.checkSpawnRoads(spawnIndex);
                    break;
            }
        }
    },

    checkExtensions: function (spawnIndex) {
        let spawner = Game.spawns[spawnIndex];
        let maxEx = helper.possibleExtensions(spawner.room.controller.level);
        if (maxEx > helper.maxKnownExSites) {maxEx = helper.maxKnownExSites};
        console.log(`maxEx = ${maxEx}`);
        if (maxEx > 0) {
            let numUnderConstruction = spawner.room.find(FIND_CONSTRUCTION_SITES, { filter: (conSite) => {return conSite.structureType == STRUCTURE_EXTENSION}}).length;
            console.log(`numUnderConstruction = ${numUnderConstruction}`);
            let numBuilt = spawner.room.find(FIND_MY_STRUCTURES, { filter: (structure) => {return structure.structureType == STRUCTURE_EXTENSION}}).length;
            console.log(`numBuilt = ${numBuilt}`);
            let possibleSites = helper.getPossibleExtensionSites(spawnIndex);
            //console.log(`possibleSites = ${possibleSites}`);
            for (let i = numUnderConstruction + numBuilt; i < maxEx; i++){
                console.log(`Construction Loop Index = ${i}`);
                let foundSite = false;
                while(!foundSite){
                    if (spawner.room.lookForAt(LOOK_STRUCTURES, possibleSites[0]).length > 0){ possibleSites.shift()}
                    else {
                        spawner.room.createConstructionSite(possibleSites.shift(), STRUCTURE_EXTENSION);
                        foundSite = true;
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

function calcPath(spawnIndex, goal){
    return PathFinder.search(Game.spawns[spawnIndex].pos, goal);
}