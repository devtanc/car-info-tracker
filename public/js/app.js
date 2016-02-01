angular.module('carTrackerApp', ['ngRoute', 'google.places'])
.config(function($routeProvider, $locationProvider) {
	$routeProvider
	.when('/', {
		templateUrl: '/temps/menu.temp.html',
		controller: 'MenuController'
	})
	.when('/fuel-input', {
		templateUrl: '/temps/fuel-input.temp.html',
		controller: 'CarTrackerController',
	})
	.when('/oil-level-input', {
		templateUrl: '/temps/oil-level-input.temp.html',
		controller: 'OilLevelController'
	});
});
