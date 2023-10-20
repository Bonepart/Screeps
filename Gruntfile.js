module.exports = function(grunt) {

    var config = require('./.screeps.json')
    var branch = grunt.option('branch') || config.branch;
    var email = grunt.option('email') || config.email;
    var token = grunt.option('token') || config.token;
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