scheduleAppControllers.controller('DaypickerController', ['$scope', '$routeParams', 'dateFilter', function($scope, $routeParams, dateFilter) {

  $scope.today = function() {
    $scope.dt = new Date();
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
    console.log("open");
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.format = 'dd-MMMM-yyyy';


  $scope.$watch('dt', function(newValue, oldValue){
    console.log("newValue, oldValue)", newValue, oldValue);
    if (newValue.valueOf() !== oldValue.valueOf()) {
      var d = dateFilter(newValue, 'yyyy/MM/dd')
      $scope.$emit('DAYPICKER:DATE:CHANGE', d)
    }
  }, true);

}]);