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
    // // console.log("The read failed: " + errorObject.code);
  });

  // $scope.days = $firebaseArray(new Firebase(root + "tables"));

  // $scope.tables.$loaded()
  //   .then(function(data){
      // // console.log(data);

  //   })
  //   .catch(function(err){

  //   });


  // $scope.tables.$watch(function(e){
    // console.log(e);
  // });


  // format date for firebase 2015/04/23
  $scope.dt = new Date($routeParams.y, $routeParams.m-1, $routeParams.d);
  $scope.firebaseFormattedDate = $filter('date')($scope.dt, 'yyyy/MM/dd')

  $scope.$watch('firebaseFormattedDate', function(newValue, oldValue){
    if (newValue.valueOf() !== oldValue.valueOf()) {
      $location.path('/overview/' + newValue ).replace()
    }
  });
  $scope.$on('DAYPICKER:DATE:CHANGE', function(e, v) {
    $scope.firebaseFormattedDate = v;
  });



  var fbDay= new Firebase(root + "days/" + $scope.firebaseFormattedDate)
  $scope.day = $firebaseObject(fbDay);

  //observe loading day bookings data
  $scope.day.$loaded()
  .then(function onDayBookingsLoaded(data){
    // // console.log($scope.day.length);
    if (!$scope.day.length) {
      // // console.log("$scope.tables", $scope.tables);
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
      var datetime = new Date($scope.dt)
      datetime.setHours(h)
      datetime.setMinutes(m)
      hours.push({
        datetime: datetime,
        string: $filter('date')(datetime, 'HH:mm')
      })
    }
  }
  $scope.hours = hours


  // ****************************
  // ******* ADD NEW BOOKING ****
  // ****************************
  $scope.onTableClicked = function($event) {
    // // console.log("e", $event);
    // // console.log("$event", $event.target);
    // // console.log("data", angular.element($event.target).data());
    var tdData = angular.element($event.target)
    var tableId = tdData.attr('data-tableid')
    var time = tdData.attr('data-timestring')
    var datetime = new Date(parseInt(tdData.attr('data-datetime'), 10))
    datetime.setUTCHours(datetime.getUTCHours() + 2)
    // // console.log("tableId", tableId);
    // // console.log("time", time);

    var endDateTime = new Date($scope.dt)
    // endDateTime.setUTCHour()
    addBooking({
      tableId: tableId,
      time: time,
      date: $scope.firebaseFormattedDate,
      endDateTime: datetime.valueOf()
    })
  }

  // var fbBookingsOnTheDay= new Firebase(root + "days/" + $scope.firebaseFormattedDate)
  // $scope.fbBookingsOnTheDay = $firebaseArray(fbBookingsOnTheDay);
  // // console.log("$scope.fbBookingsOnTheDay", $scope.fbBookingsOnTheDay);

  // load detailed bookings
  $scope.bookingsArr = []
  var refDetailedBookingsInfo = new Firebase(root+"/bookings");
  refDetailedBookingsInfo.orderByChild("date").equalTo($scope.firebaseFormattedDate).on("value", function(snapshot) {
    // // console.log(snapshot.val());
    $scope.detailedBookingsArr = snapshot.val()
  });

  function addBooking(newBooking) {
    // console.log("newBooking", newBooking);
    // // console.log("newBooking", newBooking);



    // // TODO check if doesn't already exist or is clashing
    // fbBookingsOnTheDay.child("/bookings").on("value", function(snapshot) {
    //   tables = snapshot.val();
    // }, function (errorObject) {
      // // console.log("The read failed: " + errorObject.code);
    // });


    var id = root.child("/bookings").push();
    id.set(newBooking, function(err) {
      if (!err) {
        var bookingId = id.key();
        var t = newBooking.tableId
        $scope.day[newBooking.time] = $scope.day[newBooking.time] || {}
        $scope.day[newBooking.time][t] = {
            bookingId: bookingId,
            endDateTime: newBooking.endDateTime
        }
        $scope.day.$save()



        // add the rest of the booking

        // var timeRef = "/days/" + $scope.firebaseFormattedDate + "/" +newBooking.time+ "/"

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

  // day2[hour.string][table.$id]
  $scope.day.$watch(function(e){
    // console.log(e);
    if(e.event === 'value') {
      // // console.log("e.val", e);
      // // console.log("$scope.day", $scope.day);
      // $scope.day2
      // var fbBookingObj = new Firebase(root + "/bookings/" + e.key)
      // $scope.bookingsArr.push(newObj)
      // fbBookingObj.$bindTo($scope, "days")

      // $firebaseObject(fbBookingsOnTheDay)
      // // console.log("$scope.bookingsArr", $scope.bookingsArr);
    }
  });
  $scope.day2 = {}
  window.day2 = $scope.day2
  window.calculateFooHeight = function() {
    var t = '09:45'
    var t2 = '1429173900000'
    var tid = '-JlZyp_4hwdHMRQtx0p9'
    var booking = this.day2[t][tid]
    var bookingLasting = 9
    var h = $('table td.tid-' + tid).outerHeight()*bookingLasting
    var w = $('table td.tid-' + tid).outerWidth()
    $('#foo').height(h)
    $('#foo').width(w)

    // pos
    var off = $('tr.h-'+t2).find('td.tid-' + tid).position()
    $('#foo').css({
      top: off.top + 'px',
      left: off.left + 'px',
    })
  }

  fbDay.on("child_added", function(snapshot) {

    // console.log("snapshot", snapshot.val());
    var key = snapshot.key()
    var addedObject = snapshot.val()
    var firstHour = key
    var foundFirst = false
    var tableId = Object.keys(addedObject)[0]
    var endTime = addedObject[tableId].endDateTime

    // $scope.day2[firstHour].push(addedObject)
    hours.forEach(function(hourObj, i) {
      if (hourObj.string===firstHour) {
        foundFirst = true
      }

      if (foundFirst && endTime >= hourObj.datetime) {
        $scope.day2[hourObj.string] =  $scope.day2[hourObj.string] || {}
        $scope.day2[hourObj.string][tableId] = addedObject[tableId]
      }

      return
    })
    // console.warn($scope.day2);

    // $scope.day2
  }, function (errorObject) {
    // // console.log("The read failed: " + errorObject.code);
  });


}]);