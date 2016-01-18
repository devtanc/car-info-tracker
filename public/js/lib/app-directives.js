var carTrackerApp = angular.module('carTrackerApp');

carTrackerApp.directive('submissionButtons', function() {
	return {
		templateUrl: '/temps/submission-buttons.temp.html'
	};
});
