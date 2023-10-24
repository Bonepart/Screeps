module.exports = function(grunt) {

    let config = require('./.screeps.json')
    let branch = grunt.option('branch') || config.branch;
    let email = grunt.option('email') || config.email;
    let token = grunt.option('token') || config.token;
    if(grunt.option('dev')){ branch = config.devBranch;}

    grunt.loadNpmTasks('grunt-screeps');
    grunt.initConfig({
        screeps: {
            options: {
                email: email,
                token: token,
                branch: branch,
                //server: 'season'
            },
            dist: {
                src: ['src/*.js']
            }
        }
    });
}