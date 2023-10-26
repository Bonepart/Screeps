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
    [ROLE_GOFER, 0],
    [ROLE_CLAIMER, 0],
    [ROLE_SENTRY, 0]
];

let config = {

    loadRoles: function(){
        if (Memory.roles === undefined) { Memory.roles = { limit: {}, index: {} } }
        for (let role in roleDefinitions) {
            if (Memory.roles.limit[roleDefinitions[role][0]] === undefined) { Memory.roles.limit[roleDefinitions[role][0]] = roleDefinitions[role][1] }
            if (Memory.roles.index[roleDefinitions[role][0]] === undefined) { Memory.roles.index[roleDefinitions[role][0]] = 1 }
        }
        if(Memory.roles.repairPersistance === undefined) { Memory.roles.repairPersistance = false }
    },
};
module.exports = config;