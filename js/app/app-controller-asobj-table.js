// create our main controller and get access to firebase
scheduleAppControllers.controller('tablesAsArrayController', ["$scope", "$firebaseArray", function($scope, $firebaseArray) {
  console.log("tables as arrey cntrl loaded");
  // connect to firebase
  // var ref = new Firebase("https://boiling-heat-3704.firebaseio.com/tables");
  // three way data binding
  // syncObject.$bindTo($scope, 'tables');
  $scope.tables = $firebaseArray(new Firebase("https://boiling-heat-3704.firebaseio.com/tables"));
  $scope.sortByRule = '-name';
  $scope.sortByKey = 'name';
  $scope.sortByAsc = {
    name: true,
    maxPeople: true,
    enabled: true
  };

  $scope.tables.$loaded()
    .then(function(data){
      console.log($scope.tables);

    })
    .catch(function(err){

    });

  //
  $scope.addTable = function() {
    $scope.tables.$add({
      name: 'Table Name',
      maxPeople: 0,
      enabled: false
    });
  };

  //
  $scope.removeTable = function(id) {
    console.log(id)
    var indexOfObj = $scope.tables.$indexFor(id);
    if (indexOfObj>=0) {
      $scope.tables.$remove(indexOfObj);
    }
  };

  //
  $scope.saveTable = function(id) {
    var indexOfObj = $scope.tables.$indexFor(id);
    if (indexOfObj>=0) {
      $scope.tables.$save(indexOfObj);
    }
    return true;
  };

  //
  $scope.sortBy = function(sortByKey) {

    $scope.sortByKey = sortByKey;
    $scope.sortByAsc[$scope.sortByKey] = !$scope.sortByAsc[$scope.sortByKey];
    $scope.sortByRule = ($scope.sortByAsc[$scope.sortByKey] ? '' : '-') + $scope.sortByKey;

    console.log($scope.tables[0]);

  };

  $scope.tables.$watch(function(e){
    console.log(e);
  });

}]);