/* global angular */

var carTrackerApp = angular.module('carTrackerApp');

carTrackerApp.service('couchReq', ['$http', function($http) {
	this.get = function(params) {
		return $http({
			url: '/api/get',
			method: 'POST',
			data: params, //Object which requires { view: String, queryParams: list of url query param keys and values }
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(function success(res) {
			console.log("RETRIEVED: " + res.data.rows.length + " objects");
			return res.data.rows;
		}, function failure(err) {
			console.log(err);
		});
	};

	this.delete = function(id, rev) {
		return $http({
			url: '/api',
			method: 'DELETE',
			data: {
				_id: id,
				_rev: rev
			},
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(function success(res) {
			console.log("DELETED: " + res.data);
		}, function failure(err) {
			console.log(err);
		});
	};

	this.add = function(item) {
		return $http({
			url: '/api',
			method: "POST",
			data: item,
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(function success(res) {
			console.log("POST NEW SUCCESSFUL: " + res);
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

		return $http({
			url: '/api',
			method: 'PUT',
			data: item,
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(function success(res) {
			console.log("PUT SUCCESSFUL: " + res);
		}, function failure(err) {
			console.log(err);
		});
	};

	this.parseTimestamps = function(obj) {
		obj.forEach(function(element) {
			if (element.value.timestamp) {
				var date = new Date(element.value.timestamp);
				element.value.timestamp = date.toLocaleDateString();
			}
		});
		return obj;
	};
}]);

carTrackerApp.service('dynamoReq', ['$http', function($http) {
	this.get = function(limit) {
		return $http({
			url: '/api/dynamo/get/' + limit,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(function success(res) {
			console.log("RETRIEVED: " + res.data.length + " objects");
			return res.data;
		}, function failure(err) {
			console.log(err);
		});
	};

	this.parseTimestamps = function(obj) {
		obj.forEach(function(element) {
			if (element.timestamp) {
				var date = moment(element.timestamp);
				element.timestamp = date.format('YYYY-MM-DD');
			}
		});
		return obj;
	};

	this.add = function(item) {
		return $http({
			url: '/api/dynamo',
			method: "POST",
			data: item,
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(function success(res) {
			console.log("POST NEW SUCCESSFUL: " + res);
			return res;
		}, function failure(err) {
			console.log(err);
		});
	};
}]);
