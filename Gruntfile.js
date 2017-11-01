module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        uglify: {
            fv: {
                files: {
                    'field-validator.min.js': ['field-validator.js']
                }
            }
        },

        watch: {
            scripts: {
                files: '**/*.js',
                tasks: ['uglify']
            }
        }
    });
};