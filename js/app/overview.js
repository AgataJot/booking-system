// create our main controller and get access to firebase
scheduleAppControllers.controller('OverviewController', ["$scope", "$firebaseArray", function($scope, $firebaseArray) {
  console.log("tables as arrey cntrl loaded");
  // connect to firebase
  // var ref = new Firebase("https://boiling-heat-3704.firebaseio.com/tables");
  // three way data binding
  // syncObject.$bindTo($scope, 'tables');
  $scope.date = new Date();
  $scope.tables = $firebaseArray(new Firebase("https://boiling-heat-3704.firebaseio.com/tables"));

  $scope.tables.$loaded()
    .then(function(data){
      console.log($scope.tables);

    })
    .catch(function(err){

    });


  $scope.tables.$watch(function(e){
    // console.log(e);
  });



  // ****************************
  // ******* DATE PICKER ********
  // ****************************

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

  // ********************

}]);