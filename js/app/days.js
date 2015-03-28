// create our main controller and get access to firebase
scheduleAppControllers.controller('mainController', ["$scope", "$firebaseObject", function($scope, $firebaseObject) {

  // connect to firebase
  var ref = new Firebase("https://boiling-heat-3704.firebaseio.com/days") 
  // var fb = $firebase(ref);
  var obj = $firebaseObject(ref);

  // three way data binding
  obj.$bindTo($scope, "days").then(function() {
    console.log($scope.days); // { foo: "bar" }
  });



  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.dt = null;
  };

  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];


  // // function to set the default data
  // $scope.reset = function() {    

  //   fb.$set({
  //     monday: {
  //       name: 'Monday',
  //       slots: {
  //         0900: {
  //           time: '9:00am',
  //           booked: false
  //         },
  //         0110: {
  //           time: '11:00am',
  //           booked: false
  //         }
  //       }
  //     },
  //     tuesday: {
  //       name: 'Tuesday',
  //       slots: {
  //         0900: {
  //           time: '9:00am',
  //           booked: false
  //         },
  //         0110: {
  //           time: '11:00am',
  //           booked: false
  //         }
  //       }
  //     }
  //   });    

  // };
  
}]);