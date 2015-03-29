// create our angular module and inject firebase
var scheduleAppControllers = angular.module('scheduleApp', ['ngRoute', 'firebase', 'ui.bootstrap'])
  .controller('IndexController', function($scope, $route, $routeParams, $location) {
  })

	.config(function($routeProvider, $locationProvider) {
	  $routeProvider
	   .when('/Book/:bookId', {
  	    templateUrl: 'book.html',
  	    controller: 'BookController',
  	    resolve: {
  	      // I will cause a 1 second delay
  	      delay: function($q, $timeout) {
  	        var delay = $q.defer();
  	        $timeout(delay.resolve, 1000);
  	        return delay.promise;
  	      }
  	    }
  	  })
      .when('/tables/configure', {
        templateUrl: 'templates/restaurant.html',
        controller: 'tablesAsArrayController',
      })
      .when('/overview/:y/:m/:d', {
        templateUrl: 'templates/overview.html',
        controller: 'OverviewController',
      })
      .when('/days', {
        templateUrl: 'templates/datepicker.html',
        controller: 'mainController',
      });

	  // configure html5 to get links working on jsfiddle
	  // $locationProvider.html5Mode(false);

	});