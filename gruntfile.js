module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		ngAnnotate: {
			options: {
				singleQuotes: true
			},
			app: {
				files: {
					'./public/js/min/min-safe/components/app-controllers.js': ['./public/js/app-controllers.js'],
					'./public/js/min/min-safe/components/app-directives.js': ['./public/js/app-directives.js'],
					'./public/js/min/min-safe/components/app-services.js': ['./public/js/app-services.js'],
					'./public/js/min/min-safe/app.js': ['./public/js/app.js']
				}
			}
		},
		concat: {
			js: {
				src: ['./public/js/min/min-safe/app.js', './public/js/min/min-safe/components/*.js'],
				dest: './public/js/min/min-safe/app-concat.js'
			}
		},
		uglify: {
			js: {
				src: ['./public/js/min/min-safe/app-concat.js'],
				dest: './public/js/min/app-min.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-ng-annotate');

	grunt.registerTask('default', ['ngAnnotate', 'concat', 'uglify']);
};
