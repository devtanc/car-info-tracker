angular.module('carTrackerApp', [])
.service('couchReq', ['$http', function($http) {
	var couchConfig = {
		"baseUrl": 'http://192.168.1.25:40570/',
		"db": 'car_info',
		"headers": {
			"Content-Type": 'application/json'
		}
	};

	var uuidList = [];

	var refillUUIDList = function(number) {
		$http.get(couchConfig.baseUrl + "_uuids?count=" + number).then(function success(res) {
			uuidList = res.data.uuids;
		}, function failure(err) {
			if (err.message.indexOf("ECONNREFUSED")){
				console.log("Unable to connect to database to obtain UUIDs. Connection refused.");
			} else {
				console.log("Caught " + err.name + " | " + err.message);
			}
		});
	};

	refillUUIDList(25);

	var getUUID = function() {

		var uuid = uuidList[0];
		uuidList.splice(0, 1);

		if (uuidList.length === 0) {
			refillUUIDList(25);
		}

		return uuid;
	};

	this.delete = function(_id, _rev) {
		var options = {
			url: couchConfig.baseUrl + couchConfig.db + "/" + _id + "?rev=" + _rev,
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		};

		$http(options).then(function success(res) {
			console.log("DELETED: " + res.data);
		}, function failure(err) {
			console.log(err);
		});
	};

	this.add = function(item) {
		var options = {
			url: couchConfig.baseUrl + couchConfig.db + "/" + getUUID(),
			method: "PUT",
			data: item,
			headers: {
				'Content-Type': 'application/json'
			}
		};

		$http(options).then(function success(res) {
			console.log("PUT NEW SUCCESSFUL: " + res);
			return {
				id: res.id,
				rev: res.rev
			};
		}, function failure(err) {
			console.log(err);
		});
	};

	this.update = function(item) {
		if (item.hasOwnProperty('$$hashKey')) {
			delete item.$$hashKey;
		}

		var options = {
			url: couchConfig.baseUrl + couchConfig.db + "/" + item._id,
			method: 'PUT',
			data: item,
			headers: {
				'Content-Type': 'application/json'
			}
		};

		$http(options).then(function success(res) {
			console.log("PUT SUCCESSFUL: " + res);
		}, function failure(err) {
			console.log(err);
		});
	};
}])
.controller('carTrackerController', ['$scope', 'couchReq', function($scope, couchReq) {
	$scope.newItem = {
		"timestamp": "",
		"type": "",
		"car": "Gypsy-Danger",
		"subtype": null,
		"odometer": "",
		"gallons": "",
		"price": "",
		"total": "",
		"location": "",
		"fuelGrade": ""
	};

	$scope.submitForm = function() {
		couchReq.add($scope.newItem);
	}
}]);
