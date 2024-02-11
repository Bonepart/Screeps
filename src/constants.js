global.ME = 'Bonepart';

//Basic Creeps
global.ROLE_BUILDER = 'builder';
global.ROLE_HARVESTER = 'harvester';
global.ROLE_UPGRADER = 'upgrader';
global.ROLE_MAINTENANCE = 'maintenance';
global.ROLE_MINER = 'miner';

//Army Creeps
global.ARMY_VIKING = 'viking';
global.ARMY_RANGED = 'ranged';
global.ARMY_HEALER = 'healer';

//Special Creeps
global.ROLE_LONGHAUL = 'longhaul';
global.ROLE_GOFER = 'gofer';
global.ROLE_CLAIMER = 'missionary';
global.ROLE_SENTRY = 'sentry';
global.ROLE_STORAGEBUDDY = 'storagebuddy';

//Zombie
global.ZOMBIE = 'zombie';

//Room States
global.ROOM_NO_CONTROLLER = -Infinity;
global.ROOM_HOSTILE_SAFE = -3;
global.ROOM_HOSTILE = -2;
global.ROOM_HOSTILE_RESERVED = -1;
global.ROOM_NEUTRAL = 0;
global.ROOM_RESERVED = 1;
global.ROOM_OWNED = 2;
global.ROOM_OWNED_SAFE = 3;

//Gofer Tasks
global.TASK_IMPORTER = 'Importer';
global.TASK_FILL_UPGRADE_CONTAINER = 'FillUpgradeContainer';
global.TASK_STORE_MINERALS = 'StoreMinerals'
global.TASK_TOWER_SUPPLY = 'TowerSupply';
global.TASK_TERMINAL_GOFER = 'TerminalGofer';

//Minimum Price
global.MINIMUM_PRICE = {};
global.MINIMUM_PRICE[RESOURCE_OXYGEN] = 10;
global.MINIMUM_PRICE[RESOURCE_GHODIUM_OXIDE] = 50;
global.MINIMUM_PRICE[RESOURCE_UTRIUM_HYDRIDE] = 75;
global.MINIMUM_PRICE[RESOURCE_ZYNTHIUM_HYDRIDE] = 50;
global.MINIMUM_PRICE[RESOURCE_KEANIUM_OXIDE] = 15;