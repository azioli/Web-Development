var myApp = angular.module('myApp', ['ngAnimate', 'ui.bootstrap']);

myApp.factory("SearchFactory", ['$http', function($http) {
	var obj = {};
	var _type = 'Users';
	var _lat = null;
	var _lon = null;
	obj.getResult = function(_keyword) {
		var req;
		if(angular.equals(_type, 'Places') && _lat && _lon) {
			req = {
				method: "GET",
				url: "query.php",
				params: {
					keyword: _keyword,
					type: _type,
					lat: _lat,
					lon: _lon
				}
			};
		} else {
			req = {
				method: "GET",
				url: "query.php",
				params: {
					keyword: _keyword,
					type: _type
				}
			};
		}
		return $http(req);
	};
	obj.getType = function() {
		return _type;
	};
	obj.setType = function(typename) {
		_type = typename;
	};
	obj.setLocation = function(location) {
		_lat = location.latitude;
		_lon = location.longitude;
	};
	return obj;
}]);

myApp.factory("DetailFactory", ['$http', function($http) {
	var obj = {};
	obj.getResult = function(_id) {
		var req = {
			method: "GET",
			url: "query.php",
			params: {
				id: _id
			}
		};
		return $http(req);
	};
	return obj;
}]);

function success($scope, $http, jsonObj, selectedType) {
	$scope.recordGroup[selectedType] = {
		'data': jsonObj.data,
		'keyword': $scope.keyword
	};
	var paging = jsonObj.paging;
	$scope.pagingGroup[selectedType] = paging;
	if(paging && paging.next) {

		$("#tab-" + selectedType).find(".btn-next").removeClass("hide");

	} else {

		$("#tab-" + selectedType).find(".btn-next").addClass("hide");

	}
	if(paging && paging.previous) {

		$("#tab-" + selectedType).find(".btn-prev").removeClass("hide");

	} else {

		$("#tab-" + selectedType).find(".btn-prev").addClass("hide");

	}
}

function TopController($scope, $http, $log, $rootScope, $timeout, SearchFactory, DetailFactory) {
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			$scope.$apply(function() {
				$scope.position = position;
				SearchFactory.setLocation($scope.position.coords);
			});
		});
	}

	$rootScope.favRecord = localStorage.getItem("favRecord") !== null ? JSON.parse(localStorage.getItem("favRecord")) : {};

	$scope.recordGroup = [
		{ 'Users': {} },
		{ 'Pages': {} },
		{ 'Events': {} },
		{ 'Places': {} },
		{ 'Groups': {} },
		{ 'Favorites': {} }
	];

	$scope.pagingGroup = [
		{ 'Users': {} },
		{ 'Pages': {} },
		{ 'Events': {} },
		{ 'Places': {} },
		{ 'Groups': {} },
	];

	$scope.types = [
		{ name: 'Users' },
		{ name: 'Pages' },
		{ name: 'Events' },
		{ name: 'Places' },
		{ name: 'Groups' },
		{ name: 'Favorites' }
	];

	$scope.albums = [
		{ 'Users': {} },
		{ 'Pages': {} },
		{ 'Events': {} },
		{ 'Places': {} },
		{ 'Groups': {} },
		{ 'Favorites': {} }
	];
	$scope.posts = [
		{ 'Users': {} },
		{ 'Pages': {} },
		{ 'Events': {} },
		{ 'Places': {} },
		{ 'Groups': {} },
		{ 'Favorites': {} }
	];

	$scope.selectedRecord = [
		{ 'Users': {} },
		{ 'Pages': {} },
		{ 'Events': {} },
		{ 'Places': {} },
		{ 'Groups': {} },
		{ 'Favorites': {} }
	];

	$scope.favFilter = function(type) {
		return !angular.equals(type.name, 'Favorites');
	};

	var defaultPage = true;

	$scope.submit = function() {

		$(".carousel .right-part").removeClass("active");
		$(".carousel .left-part").addClass("active");

		var selectedType = SearchFactory.getType();
		if($scope.keyword_temp) {
			$scope.keyword = $scope.keyword_temp;
		}
		if($scope.keyword && !angular.equals(selectedType, 'Favorites')) {

			$(".tab-pane").addClass("hide");
			$("#progress-bar-table").removeClass("hide");

			SearchFactory.getResult($scope.keyword).then(
				function(response) {
					if(!angular.isUndefined(response.data)) {
						success($scope, $http, response.data, selectedType);

						$("#progress-bar-table").addClass("hide");
						$("#tab-" + selectedType).removeClass("hide");

					} else {
						alert('Unable to fetch data from AWS, please try again later.');
					}

					$("#progress-bar-table").addClass("hide");

				},
				function(response) {
					alert('Unable to fetch data from AWS, please try again later.');

					$("#progress-bar-table").addClass("hide");

				}
			);
		}
	};

	$scope.goNext = function(typename) {
		var selectedType = SearchFactory.getType();
		if($scope.pagingGroup[typename] && $scope.pagingGroup[typename].next) {
			var next_url = $scope.pagingGroup[typename].next;
			$http({
				method: 'GET',
				url: next_url
			}).then(function(response) {
				success($scope, $http, response.data, selectedType);
			}, function(response) {
				alert('Unable to fetch data from Facebook, please try again later.');
			});
		}
	};

	$scope.goPrev = function(typename) {
		var selectedType = SearchFactory.getType();
		if($scope.pagingGroup[typename] && $scope.pagingGroup[typename].previous) {
			var prev_url = $scope.pagingGroup[typename].previous;
			$http({
				method: 'GET',
				url: prev_url
			}).then(function(response) {
				success($scope, $http, response.data, selectedType);
			}, function(response) {
				alert('Unable to fetch data from Facebook, please try again later.');
			});
		}
	};

	$scope.goDetail = function(record, typename) {
		$scope.selectedRecord[typename] = record;
		var id = record.id;

		$("#progress-bar-albums-" + typename).removeClass("hide");
		$("#progress-bar-posts-" + typename).removeClass("hide");

		$("#accordion-" + typename).addClass("hide");
		$("#noalbum-" + typename).addClass("hide");
		$("#nopost-" + typename).addClass("hide");

		$scope.albums[typename] = {};
		$scope.posts[typename] = {};

		$timeout(function() {
			DetailFactory.getResult(id).then(function(response) {
				if(angular.isDefined(response.data) && (angular.isDefined(response.data.albums) || angular.isDefined(response.data.posts))) {
					if(angular.isDefined(response.data.albums)) {
						$scope.albums[typename] = response.data.albums.data;

						$("#progress-bar-albums-" + typename).addClass("hide");
						$("#accordion-" + typename).removeClass("hide");

					} else {
						$("#progress-bar-albums-" + typename).addClass("hide");
						$("#noalbum-" + typename).removeClass("hide");
					}
					if(angular.isDefined(response.data.posts)) {
						$("#progress-bar-posts-" + typename).addClass("hide");
						$scope.posts[typename] = response.data.posts.data;
					} else {
						$("#progress-bar-posts-" + typename).addClass("hide");
						$("#nopost-" + typename).removeClass("hide");
					}
				} else {

					$("#progress-bar-albums-" + typename).addClass("hide");
					$("#progress-bar-posts-" + typename).addClass("hide");
					$("#noalbum-" + typename).removeClass("hide");
					$("#nopost-" + typename).removeClass("hide");

				}
			}, function(response) {

				$("#progress-bar-albums-" + typename).addClass("hide");
				$("#progress-bar-posts-" + typename).addClass("hide");
				$("#noalbum-" + typename).removeClass("hide");
				$("#nopost-" + typename).removeClass("hide");

			});
		}, 1000);

	};

	$scope.transferTime = function(create_time) {
		var ret = create_time.substring(0, create_time.length - 5);
		ret = ret.replace('T', ' ');
		return ret;
	};

	$scope.inFavor = function(record, typename) {
		if($rootScope.favRecord && record && record.id) {
			return $rootScope.favRecord.hasOwnProperty(record.id + '-' + typename);
		}
		return false;
	};

	$scope.toggleFavor = function(record, typename) {
		var id = record.id;
		if($scope.inFavor(record, typename)) {
			$scope.deleteFromFavor(record, typename);
		} else {
			var favRecord = angular.copy(record);
			favRecord.type = typename;
			$rootScope.favRecord[id + '-' + typename] = favRecord;
		}
		localStorage.setItem("favRecord", JSON.stringify($rootScope.favRecord));
	};

	$scope.deleteFromFavor = function(record, typename) {
		var id = record.id;
		if($scope.inFavor(record, typename)) {
			delete $rootScope.favRecord[id + '-' + typename];
		}
		localStorage.setItem("favRecord", JSON.stringify($rootScope.favRecord));
	};

	$scope.fbPost = function(_pic_url, _name) {
		FB.ui({
			app_id: '212013145941711',
			method: 'feed',
			link: window.location.href,
			picture: _pic_url,
			name: _name,
			caption: 'FB SEARCH FROM USC CSCI571'
		}, function(response) {
			if(response && !response.error_message) {
				alert("Posted Successfully");
			} else {
				alert("Not Posted");
			}
		});
	};

	$scope.clear = function() {
		$("#navlist li").removeClass("active");
		$("#li-Users").addClass("active");
		$(".tab-pane").addClass("hide");
		
		SearchFactory.setType("Users");
		$scope.keyword_temp="";
		$scope.keyword=undefined;
		$scope.recordGroup = [
			{ 'Users': {} },
			{ 'Pages': {} },
			{ 'Events': {} },
			{ 'Places': {} },
			{ 'Groups': {} },
			{ 'Favorites': {} }
		];

		$scope.pagingGroup = [
			{ 'Users': {} },
			{ 'Pages': {} },
			{ 'Events': {} },
			{ 'Places': {} },
			{ 'Groups': {} },
		];

		$scope.albums = [
			{ 'Users': {} },
			{ 'Pages': {} },
			{ 'Events': {} },
			{ 'Places': {} },
			{ 'Groups': {} },
			{ 'Favorites': {} }
		];
		$scope.posts = [
			{ 'Users': {} },
			{ 'Pages': {} },
			{ 'Events': {} },
			{ 'Places': {} },
			{ 'Groups': {} },
			{ 'Favorites': {} }
		];

		$scope.selectedRecord = [
			{ 'Users': {} },
			{ 'Pages': {} },
			{ 'Events': {} },
			{ 'Places': {} },
			{ 'Groups': {} },
			{ 'Favorites': {} }
		];
	};

}

function NavController($scope, $http, SearchFactory) {
	$scope.setType = function(typename) {
		$("#navlist li").removeClass("active");
		$("#li-"+typename).addClass("active");
		SearchFactory.setType(typename);
		var selectedType = SearchFactory.getType();
		if(!angular.equals(selectedType, 'Favorites')) {

			$("#tab-Favorites").addClass("hide");

			if(!$scope.recordGroup[selectedType] || $scope.recordGroup[selectedType].keyword != $scope.keyword) {
				if($scope.keyword) {

					$(".tab-pane").addClass("hide");
					$("#progress-bar-table").removeClass("hide");

					if($scope.recordGroup[selectedType] && $scope.recordGroup[selectedType].keyword != $scope.keyword) {
						$scope.recordGroup[selectedType] = {};

						$("#tab-" + selectedType).find(".btn-next").addClass("hide");
						$("#tab-" + selectedType).find(".btn-prev").addClass("hide");

					}
					SearchFactory.getResult($scope.keyword).then(
						function(response) {
							if(!angular.isUndefined(response.data)) {
								success($scope, $http, response.data, selectedType);

								$("#progress-bar-table").addClass("hide");
								$("#tab-" + typename).removeClass("hide");

							} else {
								alert('Unable to fetch data from AWS, please try again later.');

								$("#progress-bar-table").addClass("hide");

							}
						},
						function(response) {
							alert('Unable to fetch data from AWS, please try again later.');

							$("#progress-bar-table").addClass("hide");

						}
					);

				}
			} else {
				if($scope.keyword) {

					$(".tab-pane").addClass("hide");
					$("#tab-" + typename).removeClass("hide");

				}
			}
		} else {

			$("#carousel-Favorites .right-part").removeClass("active");
			$("#carousel-Favorites .left-part").addClass("active");
			$(".tab-pane").addClass("hide");
			$("#tab-Favorites").removeClass("hide");

		}
	};
}

myApp.controller('TopController', TopController);
myApp.controller('NavController', NavController);

/*jquery*/
$(function(){
	$("#li-Users").addClass("active");
});
