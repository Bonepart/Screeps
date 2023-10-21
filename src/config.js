var config = {
    memory: function(){
        if(!Memory.maxHarvesters){
            Memory.maxHarvesters = 2;
        }
        if(!Memory.maxBuilders){
            Memory.maxBuilders = 4;
        }
        if(!Memory.maxUpgraders){
            Memory.maxUpgraders = 1;
        }
        if(!Memory.maxDefenders){
            Memory.maxDefenders = 1;
        }

        if(!Memory.harvesterIndex){
            Memory.harvesterIndex = 1;
        }
        if(!Memory.builderIndex){
            Memory.builderIndex = 1;
        }
        if(!Memory.upgraderIndex){
            Memory.upgraderIndex = 1;
        }
        if(!Memory.defenderIndex){
            Memory.defenderIndex = 1;
        }
    },
    sourceData: function(){
        if (!Memory.sourceList || Memory.sourceList.length == 0){
            console.log('Building sourceList');
            let sData = [];
            var sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES);
            for (let source in sources){
                let newData = {};
                newData.id = sources[source].id;
                newData.openSpaces = openSpaces(sources[source].room, sources[source].pos);
                newData.roadStatus = 0;
                //newData.harvesterList = [];
    
                sData.push(newData);
            }
            Memory.sourceList = sData;
        }
    }
};
module.exports = config;

function openSpaces(room, position){
    let count = 0;
    let data = [];
    let terrain = Game.map.getRoomTerrain(room.name);
    if (terrain.get(position.x, position.y-1) == 0){ 
        count++;
        data.push({x: position.x, y: position.y});
    };
    if (terrain.get(position.x+1, position.y-1) == 0){ 
        count++;
        data.push({x: position.x+1, y: position.y-1});
    };
    if (terrain.get(position.x+1, position.y) == 0){ 
        count++;
        data.push({x: position.x+1, y: position.y});
    };
    if (terrain.get(position.x+1, position.y+1) == 0){ 
        count++;
        data.push({x: position.x+1, y: position.y+1});
    };
    if (terrain.get(position.x, position.y+1) == 0){ 
        count++;
        data.push({x: position.x, y: position.y+1});
    };
    if (terrain.get(position.x-1, position.y+1) == 0){ 
        count++;
        data.push({x: position.x-1, y: position.y+1});
    };
    if (terrain.get(position.x-1, position.y) == 0){ 
        count++;
        data.push({x: position.x-1, y: position.y});
    };
    if (terrain.get(position.x-1, position.y-1) == 0){ 
        count++;
        data.push({x: position.x-1, y: position.y-1});
    };
    data.unshift(count);
    return data;
}