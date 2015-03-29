// create our main controller and get access to firebase
scheduleAppControllers.controller('OverviewController', ['$scope', '$location', '$firebaseArray', '$firebaseObject', '$routeParams', '$filter', function($scope, $location, $firebaseArray, $firebaseObject, $routeParams, $filter) {

  // three way data binding
  // syncObject.$bindTo($scope, 'tables');

  var tables = [];
  var root = new Firebase("https://boiling-heat-3704.firebaseio.com/");
  var fbTables= new Firebase(root + "tables/")
  $scope.tables = $firebaseArray(fbTables);
  fbTables.on("value", function(snapshot) {
    tables = snapshot.val();
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });

  // $scope.days = $firebaseArray(new Firebase(root + "tables"));

  // $scope.tables.$loaded()
  //   .then(function(data){
  //     console.log(data);

  //   })
  //   .catch(function(err){

  //   });


  // $scope.tables.$watch(function(e){
  //   // console.log(e);
  // });



  // ****************************
  // ******* DATE PICKER ********
  // ****************************

  



  $scope.today = function() {
    $scope.dt = new Date();
  };
  // $scope.today();

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


  $scope.$watch('dt', function(newValue, oldValue){
    console.log("newValue, oldValue)", newValue, oldValue);
    if (newValue.valueOf() !== oldValue.valueOf()) {
      var d = newValue.getUTCFullYear()
          d += '/'+ (newValue.getUTCMonth()+1)
          d += '/' + newValue.getUTCDate()
      console.log("d", d);
      $location.path('/overview/' + d ).replace()
    }
  }, true);

  // ********************

  // format date for firebase 2015/04/23
  $scope.dt = new Date($routeParams.y, $routeParams.m-1, $routeParams.d);
  var firebaseFormattedDate = $filter('date')($scope.dt, 'yyyy/MM/dd')

  var fbDay= new Firebase(root + "days/" + firebaseFormattedDate)
  $scope.day = $firebaseObject(fbDay);

  //observe loading day bookings data
  $scope.day.$loaded()
  .then(function onDayBookingsLoaded(data){
    // console.log($scope.day.length);
    if (!$scope.day.length) {
      // console.log("$scope.tables", $scope.tables);
      // fbDay.set(tables)
    }

  })
  .catch(function(err){

  });


  // ****************************
  // ******* HOURS  *************
  // ****************************
  var hours = [],
      h = 9,
      m = 0

  for(; h<22; h++) {
    var hh = h
    m = 0
    for(; m<60; m += 15) {
      var string = hh.toString() + ':' + m.toString()
      var datetime = new Date($scope.dt)
      datetime.setUTCHours(h)
      datetime.setUTCMinutes(m)
      hours.push({
        string: string,
        datetime: datetime
      })
    }
  }
  $scope.hours = hours


  // ****************************
  // ******* ADD NEW BOOKING ****
  // ****************************
  $scope.onTableClicked = function($event) {
    // console.log("e", $event);
    // console.log("$event", $event.target);
    // console.log("data", angular.element($event.target).data());
    var tdData = angular.element($event.target)
    var tableId = tdData.attr('data-tableid')
    var time = tdData.attr('data-timestring')
    var datetime = new Date(parseInt(tdData.attr('data-datetime'), 10))
    datetime.setUTCHours(datetime.getUTCHours() + 2)
    // console.log("tableId", tableId);
    // console.log("time", time);

    var endDateTime = new Date($scope.dt)
    // endDateTime.setUTCHour()
    addBooking({
      tableId: tableId,
      time: time,
      date: firebaseFormattedDate,
      endDateTime: datetime.valueOf()
    })
  }

  // var fbBookingsOnTheDay= new Firebase(root + "days/" + firebaseFormattedDate)
  // $scope.fbBookingsOnTheDay = $firebaseArray(fbBookingsOnTheDay);
  // console.log("$scope.fbBookingsOnTheDay", $scope.fbBookingsOnTheDay);

  // load detaile bookings
  $scope.bookingsArr = []
  var refDetailedBookingsInfo = new Firebase(root+"/bookings");
  refDetailedBookingsInfo.orderByChild("date").equalTo(firebaseFormattedDate).on("value", function(snapshot) {
    console.log(snapshot.val());
    $scope.detailedBookingsArr = snapshot.val()
  });

  function addBooking(newBooking) {
    console.log("newBooking", newBooking);
    // console.log("newBooking", newBooking);



    // // TODO check if doesn't already exist or is clashing
    // fbBookingsOnTheDay.child("/bookings").on("value", function(snapshot) {
    //   tables = snapshot.val();
    // }, function (errorObject) {
    //   console.log("The read failed: " + errorObject.code);
    // });


    var id = root.child("/bookings").push();
    id.set(newBooking, function(err) {
      if (!err) {
        var bookingId = id.key();
        var t = newBooking.tableId
        $scope.day[newBooking.time] = {}
        $scope.day[newBooking.time][t] = {
            bookingId: bookingId,
            endDateTime: newBooking.endDateTime
        }
        $scope.day.$save()
        // var timeRef = "/days/" + firebaseFormattedDate + "/" +newBooking.time+ "/"

        // root.child( timeRef ).set(
        //   {
        //     bookingId: bookingId,
        //     tableId: newBooking.tableId,
        //     endDateTime: newBooking.endDateTime
        //   }
        // );
        // root.child("/users/" + comment.author + "/bookings/" + name).set(true);
      }
    });
  }

  // ****************************
  // ******* RENDER BOOKINGS ****
  // ****************************

  $scope.day.$watch(function(e){
    console.log(e);
    if(e.event === 'value') {
      console.log("e.val", e);
      console.log("$scope.day", $scope.day);
      // var fbBookingObj = new Firebase(root + "/bookings/" + e.key)
      // $scope.bookingsArr.push(newObj)
      // fbBookingObj.$bindTo($scope, "days")

      // $firebaseObject(fbBookingsOnTheDay)
      // console.log("$scope.bookingsArr", $scope.bookingsArr);
    }
  });
  // fbBookingsOnTheDay.on("value", function(snapshot) {
  //   tables = snapshot.val();
  // }, function (errorObject) {
  //   console.log("The read failed: " + errorObject.code);
  // });


}]);