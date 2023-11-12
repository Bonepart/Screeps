const roleDefinitions = [
    //<roleName>, <maxLimit>
    [ROLE_BUILDER, 2],
    [ROLE_HARVESTER, 2],
    [ROLE_UPGRADER, 1],
    [ROLE_MAINTENANCE, 1],
    [ROLE_MINER, -1],

    [ARMY_VIKING, 0],
    [ARMY_RANGED, -1],
    [ARMY_HEALER, -1],

    [ROLE_LONGHAUL, 0],
    [ROLE_GOFER, -1],
    [ROLE_STORAGEBUDDY, -1],
    [ROLE_CLAIMER, -1],
    [ROLE_SENTRY, -1]
];

let config = {

    loadRoles: function(){
        if (Memory.roles === undefined) { Memory.roles = { limit: {}, index: {} } }
        for (let role in roleDefinitions) {
            if (roleDefinitions[role][1] != -1){
                if (Memory.roles.limit[roleDefinitions[role][0]] === undefined) { Memory.roles.limit[roleDefinitions[role][0]] = roleDefinitions[role][1] }
            }
            if (Memory.roles.index[roleDefinitions[role][0]] === undefined) { Memory.roles.index[roleDefinitions[role][0]] = 1 }
        }
        if(Memory.roles.repairPersistance === undefined) { Memory.roles.repairPersistance = false }
        if(Memory.flags === undefined) { Memory.flags = {} }
    },
};
module.exports = config;