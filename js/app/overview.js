// create our main controller and get access to firebase
 // var underscore = angular.module('underscore', []);
scheduleAppControllers.factory('_', function() {
  debugger
  return window._; // assumes underscore has already been loaded on the page
});

scheduleAppControllers.controller('OverviewController', 
  ['$scope',
  '$location',
  '$firebaseArray',
  '$firebaseObject',
  '$routeParams',
  'dateFilter',
  '_',
  function($scope, $location, $firebaseArray, $firebaseObject, $routeParams, dateFilter) {

    var tables = [],
        root = null,
        fbtables = null,
        fbday,
        refDetailedBookingsInfo,
        firebaseFormattedDate;


    $scope.tables = null;
    $scope.dt = null;
    $scope.day = null;
    $scope.hours = null;
    $scope.bookingsArr = null;
    $scope.detailedBookingsArr = null;


    (function init() {

      $scope.dt = new Date($routeParams.y, $routeParams.m-1, $routeParams.d);
      firebaseFormattedDate = dateFilter($scope.dt, 'yyyy/MM/dd') // format date for firebase 2015/04/23

      root = new Firebase("https://boiling-heat-3704.firebaseio.com/");
      fbtables= new Firebase(root + "tables/")
      fbday = new Firebase(root + "days/" + firebaseFormattedDate)
      // refDetailedBookingsInfo = new Firebase(root+"/bookings");

      // scope fields
      $scope.tables = $firebaseArray(fbtables);
      $scope.day = $firebaseObject(fbday);
      $scope.hours = (function buildHours() {
        var hours = [],
            h = 9

        for(; h<22; h++) {
          var m = 0
          for(; m<60; m += 15) {
            var date = new Date($scope.dt)
            date.setHours(h)
            date.setMinutes(m)
            date.setSeconds(0)
            date.setMilliseconds(0)
            console.log("date", date);
            hours.push({
              date: date,
              string: dateFilter(date, 'H:mm')
            })
          }
        }
        return hours
      })();


      // refDetailedBookingsInfo.orderbychild("date").equalto(firebaseFormattedDate).on("value", function(snapshot) {
      //   $scope.detailedBookingsArr = snapshot.val()
      // });

    })();

    (function watchfFirebaseEvents() {
      fbday.on("child_added", function(snapshot) {

      }, function (errorobject) {
        // console.log("the read failed: " + errorobject.code);
      });

    })();

    (function watchScopeVariables() {

      $scope.$watch('dt', function(newvalue, oldvalue){
        if (newvalue.valueOf() !== oldvalue.valueOf()) {
          firebaseFormattedDate = dateFilter(newvalue, 'yyyy/MM/dd')
          $location.path('/overview/' + firebaseFormattedDate ).replace()
        }
      }, true);

    })();

    (function bindUIEvents() {

      $scope.onTDClicked = function addBookingFromUI($event, i, tableId, datetime) {
        var endDateTime = new Date(datetime)
        endDateTime.setHours(endDateTime.getHours() + 2)
        var startTime = dateFilter(new Date(datetime), 'H:mm')

        addBooking({
          tableId: tableId,
          time: startTime,
          date: firebaseFormattedDate,
          endDateTime: endDateTime.valueOf(),
          startTimeSlotIndex: i
        })
      }

      $scope.$on('bookingChangedFromUI', function changeBookingFromUI(e, startTimeSlot, durationSlots, tableId, bookingId, timestring){

        var endDateTime_ts = $scope.hours[startTimeSlot].date.valueOf()
        endDateTime_ts += 15 * 60000 * durationSlots // 15min * 1min * timeslots

        changeBooking(timestring, bookingId, tableId, {
          tableId: tableId,
          time: $scope.hours[startTimeSlot].string,
          endDateTime: endDateTime_ts,
          startTimeSlotIndex: startTimeSlot
        })
      });

    })();


  //observe loading day bookings data
  // $scope.day.$loaded()
  // .then(function ondaybookingsloaded(data){
  //   if (!$scope.day.length) {
  //   }
  // })
  // .catch(function(err){
  // });


  // ****************************
  // ******* add new booking ****
  // ****************************

  // var fbbookingsontheday= new Firebase(root + "days/" + firebaseFormattedDate)
  // $scope.fbbookingsontheday = $firebaseArray(fbbookingsontheday);
  // // console.log("$scope.fbbookingsontheday", $scope.fbbookingsontheday);



  // {
  //   tableId: tableId,
  //   time: time,
  //   date: firebaseFormattedDate,
  //   endDateTime: datetime.valueOf()
  // }
  function addBooking(newBooking) {

    var id = root.child("/bookings").push();
    id.set(newBooking, function(err) {
      if (!err) {
        var bookingId = id.key();
        var t = newBooking.tableId
        $scope.day[newBooking.tableId] = $scope.day[newBooking.tableId] || {}
        $scope.day[newBooking.tableId][newBooking.time] = {
            bookingId: bookingId,
            endDateTime: newBooking.endDateTime,
            startTimeSlotIndex: newBooking.startTimeSlotIndex
        }
        // $scope.day[newBooking.time] = $scope.day[newBooking.time] || {}
        // $scope.day[newBooking.time][t] = {
        //     bookingId: bookingId,
        //     endDateTime: newBooking.endDateTime
        // }
        $scope.day.$save()
      }
    });
  }

  function changeBooking(currentKeyTime, bookingId, tableId, newBooking) {
    var f = $scope.day[newBooking.tableId]
    console.log("f", f);
    debugger
    // var fbday_booking = new Firebase(root + "days/" + firebaseFormattedDate + '/' + currentKeyTime)

    var bookingChanging = _.findWhere($scope.day[newBooking.tableId], {bookingId: bookingId})
    // fbday_booking.remove()

    f[currentKeyTime] = null // TODO just set an inactive flag first before transactino completes
    f[newBooking.time] = {
      bookingId: bookingId,
      endDateTime: newBooking.endDateTime,
      startTimeSlotIndex: newBooking.startTimeSlotIndex
    }

    $scope.day.$save().then(function(ref) {

      var b = root.child("/bookings/" + bookingId)

      b.update({
        endDateTime: newBooking.endDateTime,
        startTimeSlotIndex: newBooking.startTimeSlotIndex,
        time: newBooking.time
      }, function(e) {
        console.log("success e", e);
      })

    }, function(error) {
      console.log("Error:", error);
    });

  }


  // ****************************
  // ******* render bookings ****
  // ****************************

  $scope.day.$watch(function(e){
    // console.log(e);
    if(e.event === 'value') {
      // // console.log("e.val", e);
      // // console.log("$scope.day", $scope.day);
      // var fbbookingobj = new Firebase(root + "/bookings/" + e.key)
      // $scope.bookingsArr.push(newobj)
      // fbbookingobj.$bindto($scope, "days")

      // $firebaseObject(fbbookingsontheday)
      // // console.log("$scope.bookingsArr", $scope.bookingsArr);
    }
  });
}]);