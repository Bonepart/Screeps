const roleDefinitions = [
    //<roleName>, <maxLimit>
    [ROLE_BUILDER, 2],
    [ROLE_HARVESTER, 2],
    [ROLE_UPGRADER, 1],
    [ROLE_MAINTENANCE, 1],

    [ARMY_DEFENDER, 0],
    [ARMY_VIKING, 0],
    [ARMY_RANGED, 0],
    [ARMY_HEALER, 0],

    [ROLE_LONGHAUL, 0],
    [ROLE_CLAIMER, 0]
];

var config = {

    loadRoles: function(){
        if (typeof Memory.roles === undefined) { Memory.roles = { limit: {}, index: {} } }
        for (let role in roleDefinitions) {
            if (typeof Memory.roles.limit[role[0]] === undefined) { Memory.roles.limit[role[0]] = role[1] }
            if (typeof Memory.roles.index[role[0]] === undefined) { Memory.roles.index[role[0]] = 1 }
        }
        if(typeof Memory.repairPersistance === undefined) { Memory.repairPersistance = false }
    },

    sourceData: function(){
        if (typeof Memory.sourceList === undefined){
            console.log('Building sourceList');
            let sData = [];
            var sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES);
            for (let source in sources){
                let newData = {};
                newData.id = sources[source].id;
                newData.openSpaces = openSpaces(sources[source].room, sources[source].pos);
                newData.roadStatus = 0;
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