// To create a empty resizable and draggable box
function placeNode(node, top, left) {
    node.css({
      position: "absolute",
      top: top + "px"
    });
  }
var multiplies = 37
function emitChangeEvent($scope, $element, $attrs) {

  var top = $element[0].offsetTop / multiplies
  var height = $element[0].offsetHeight / multiplies
  //$element[0].getBoundingClientRect().top

  console.warn("$attrs", $attrs);
  $scope.$emit('bookingChangedFromUI', top, height, $attrs.tableId, $attrs.bookingId, $attrs.timestring)

}
// scheduleAppControllers.directive("ceBoxCreator", function($document, $compile) {
//   return {
//     restrict: 'A',
//     link: function($scope, $element, $attrs) {
//       $element.on("click", function($event) {

//         var newNode = $compile('<div class="contentEditorBox" ce-drag ce-resize></div>')($scope);
//         placeNode(newNode, $event.pageY - 25, $event.pageX - 25);
//         // angular.element($document[0].body).append(newNode);
//         angular.element($document[0].body).append(newNode);
//       });
//     }
//   }
// });

// To manage the drag
// scheduleAppControllers.directive("ceDrag", [function() {

scheduleAppControllers.directive("ceDrag", ['$document', '$timeout', function($document, $timeout) {
  return {
    controller: function($scope, $element, $attrs) {
      var startX = 0,
          startY = 0;

      var newElement = angular.element('<div class="draggable"></div>');

      $element.append(newElement);
      newElement.on("mousedown", function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        // To keep the last selected box in front
        angular
          .element(document.querySelectorAll(".contentEditorBox"))
          .css("z-index", "0");
        $element.css("z-index", "1");

        startX = $event.pageX - $element[0].offsetLeft;
        startY = $event.pageY - $element[0].offsetTop;
        $document.on("mousemove", mousemove);
        $document.on("mouseup", mouseup);
      });

      function mousemove($event) {
        placeNode( $element , $event.pageY - startY , $event.pageX - startX );
      }

      function mouseup() {
        $timeout(function(){

          var originalT = $element.prop('offsetTop')
          var slots = originalT / multiplies
          var destT = Math.round(slots) * multiplies

          $element.css({
            top: destT + "px"
          });

          _.partial(emitChangeEvent, $scope, $element, $attrs)()

        }, 100);
        $document.off("mousemove", mousemove);
        $document.off("mouseup", mouseup);
      }
    }
  }
}]);


// To manage the resizers
scheduleAppControllers.directive("ceResize", ['$document', '$timeout', function($document, $timeout) {

  return {
    scope: {

    },
    controller: function($scope, $element, $attrs) {
      //Reference to the original
      var $mouseDown;
      var $container = $element.parent('draggable-container')
      var $containerTop = $container[0].offsetTop

      // Function to manage resize down event
      var resizeDown = function($event) {


        var margin = 50,
            uppest = $element[0].offsetTop + margin,
            height = $event.pageY - $element[0].getBoundingClientRect().top
            // ,
            // TODO manage the upper most border
            // posT = $element[0].offsetTop,
            // height = (height > uppest) ? (height) : margin

        $element.css({
          height: height + "px"
        });

      };

      var createResizer = function createResizer( className , handlers ){

        newElement = angular.element( '<div class="' + className + '"></div>' );
        $element.append(newElement);
        newElement.on("mousedown", function($event) {
          console.log("$even", $event);

          $document.on("mousemove", mousemove);
          $document.on("mouseup", mouseup);

          //Keep the original event around for up / left resizing
          $mouseDown = $event;
          $mouseDown.top = $element[0].offsetTop;
          $mouseDown.left = $element[0].offsetLeft
          $mouseDown.width = $element[0].offsetWidth;
          $mouseDown.height = $element[0].offsetHeight;

          function mousemove($event) {
            $event.preventDefault();
            $event.stopPropagation();
            for( var i = 0 ; i < handlers.length ; i++){
              handlers[i]( $event );
            }
          }

          function mouseup($even) {

            $timeout(function(){

              var originalH = $element.prop('offsetHeight')
              var slots = originalH / multiplies
              var destHeight = Math.round(slots) * multiplies

              $element.css({
                height: destHeight + "px"
              });

              // var top = $element[0].offsetTop / multiplies + 1
              // var height = $element[0].offsetHeight / multiplies
              // //$element[0].getBoundingClientRect().top

              // console.warn("$attrs", $attrs);
              // $scope.$emit('yo', top, height, $attrs.tableId, $attrs.bookingId)
              _.partial(emitChangeEvent, $scope, $element, $attrs)()

            }, 100);
            $document.off("mousemove", mousemove);
            $document.off("mouseup", mouseup);

          }
        });
      }

      createResizer( 's-resize' , [ resizeDown ] );
    }
  };

}]);
