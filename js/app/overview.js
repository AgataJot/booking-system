// create our main controller and get access to firebase
scheduleAppControllers.controller('OverviewController', ['$scope', '$location', '$firebaseArray', '$firebaseObject', '$routeParams', 'dateFilter',
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
    $scope.day2 = {};


    (function init() {

      $scope.dt = new Date($routeParams.y, $routeParams.m-1, $routeParams.d);
      firebaseFormattedDate = dateFilter($scope.dt, 'yyyy/MM/dd') // format date for firebase 2015/04/23

      root = new Firebase("https://boiling-heat-3704.firebaseio.com/");
      fbtables= new Firebase(root + "tables/")
      fbday= new Firebase(root + "days/" + firebaseFormattedDate)
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
            var datetime = new Date($scope.dt)
            datetime.setHours(h)
            datetime.setMinutes(m)
            hours.push({
              datetime: datetime,
              string: dateFilter(datetime, 'H:mm')
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

        var tableId = snapshot.key()
        var addedObject = snapshot.val()
        var firstHour = Object.keys(addedObject)[0]
        var endTime = addedObject[firstHour].endDateTime
        var foundFirst = false

        $scope.hours.forEach(function(hourobj, i) {
          if (hourobj.string===firstHour) {
            foundFirst = true
          }

          if (foundFirst && endTime >= hourobj.datetime.valueOf()) {
            $scope.day2[tableId] =  $scope.day2[tableId] || {}
            $scope.day2[tableId][hourobj.string] = addedObject[firstHour]
          }

          return
        })
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

    (function bindEvents() {

      $scope.onTDClicked = function addnewBooking($event, i, tableId, datetime) {
        var endDateTime = new Date(datetime)
        endDateTime.setHours(endDateTime.getHours() + 2)
        var time = dateFilter(new Date(datetime), 'H:mm')

        // var endDateTime = new Date($scope.dt)

        addBooking({
          tableId: tableId,
          time: time,
          date: firebaseFormattedDate,
          endDateTime: endDateTime.valueOf(),
          startTimeSlotIndex: i
        })
      }

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



    // // todo check if doesn't already exist or is clashing
    // fbbookingsontheday.child("/bookings").on("value", function(snapshot) {
    //   tables = snapshot.val();
    // }, function (errorobject) {
      // // console.log("the read failed: " + errorobject.code);
    // });


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



        // add the rest of the booking

        // var timeref = "/days/" + firebaseFormattedDate + "/" +newBooking.time+ "/"

        // root.child( timeref ).set(
        //   {
        //     bookingid: bookingid,
        //     tableId: newBooking.tableId,
        //     endDateTime: newBooking.endDateTime
        //   }
        // );
        // root.child("/users/" + comment.author + "/bookings/" + name).set(true);
      }
    });
  }

  // ****************************
  // ******* render bookings ****
  // ****************************

  // day2[hour.string][table.$id]
  $scope.day.$watch(function(e){
    // console.log(e);
    if(e.event === 'value') {
      // // console.log("e.val", e);
      // // console.log("$scope.day", $scope.day);
      // $scope.day2
      // var fbbookingobj = new Firebase(root + "/bookings/" + e.key)
      // $scope.bookingsArr.push(newobj)
      // fbbookingobj.$bindto($scope, "days")

      // $firebaseObject(fbbookingsontheday)
      // // console.log("$scope.bookingsArr", $scope.bookingsArr);
    }
  });

  window.day2 = $scope.day2
  window.calculatefooheight = function() {
    var t = '09:45'
    var t2 = '1429173900000'
    var tid = '-jlzyp_4hwdhmrqtx0p9'
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



}]);