/* global document, angular */
var carTrackerApp = angular.module('carTrackerApp');

carTrackerApp.controller('MenuController', ['$scope', '$location', function($scope, $location) {
	$scope.goTo = function(path) {
		$location.path(path);
	};
}]);

carTrackerApp.controller('CarTrackerController', ['$scope', 'couchReq', 'dynamoReq', function($scope, couchReq, dynamoReq) {
//	couchReq.get({view:'fuel', queryParams:{ limit:25 }}).then(function(history) {
//		$scope.history = couchReq.parseTimestamps(history);
//	});

	dynamoReq.get('recent').then(function(history) {
		$scope.history = dynamoReq.parseTimestamps(history);
	});

	var BLANK  = {
		"timestamp": "",
		"transaction_type": "fuel",
		"car_name": "Gypsy-Danger",
		"odometer": "",
		"gallons": "",
		"price": "",
		"total": "",
		"location": "",
		"fuelGrade": "",
		"full": false
	};

	$scope.newRefuel = {};

	$scope.submitForm = function() {
		$scope.newRefuel.location = $scope.newRefuel.location.formatted_address;
		dynamoReq.add($scope.newRefuel).then($scope.resetForm);
	};

	$scope.resetForm = function() {
		for(var key in BLANK) {
			$scope.newRefuel[key] = BLANK[key];
		}
	};

	$scope.resetForm();
}]);

carTrackerApp.controller('OilLevelController', ['$scope', 'couchReq', function($scope, couchReq) {
	couchReq.get({view:'oil', queryParams:{ limit:25 }}).then(function(history) {
		$scope.history = couchReq.parseTimestamps(history);
	});

	var BLANK = {
		"timestamp": "",
		"type": "oil",
		"car": "Gypsy-Danger",
		"odometer": "",
		"oilLevel": 0,
		"engineTemp": ""
	};

	$scope.newOilLevelCheck = {};

	$scope.updateOilAmount = function(event) {
		$scope.newOilLevelCheck.oilLevel = Math.round(event.offsetX / document.getElementById('oilLevelIndicator').clientWidth * 100);
	};

	$scope.submitForm = function() {
		couchReq.add($scope.newOilLevelCheck).then($scope.resetForm);
	};

	$scope.resetForm = function() {
		for(var key in BLANK) {
			$scope.newOilLevelCheck[key] = BLANK[key];
		}
	};

	$scope.resetForm();
}]);
