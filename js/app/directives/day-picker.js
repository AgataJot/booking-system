// create our main controller and get access to firebase
scheduleAppControllers.directive('dayPicker', ['dateFilter', function(dateFilter) {

  return {
    restrict: 'E',
    templateUrl: 'templates/day-picker.html',
    controller: function($scope, $element, $attrs) {

      this.isOpen = true;

      this.toggle = function() {
        this.isOpen = !this.isOpen
        $scope.customerInfo = !$scope.customerInfo
      }

      this.today = function() {
        $scope.dat = new Date();
      };

      // Disable weekend selection
      this.disabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
      };

      this.toggleMin = function() {
        this.minDate = this.minDate ? null : new Date();
      };
      this.toggleMin();

      this.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        this.opened = true;
      };

      this.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };

      this.format = 'dd-MMMM-yyyy';

    },
    controllerAs: "daypicker",
    scope: {
      dat: '=dat'
    }
  };
}]);
