App.directive "resize", ($window, $timeout) ->
  (scope, element) ->
    w = angular.element($window)
    recalc = ->
      scope.height = $window.innerHeight
      scope.width = $window.innerWidth
      scope.$apply()
      return
    t = 0
    w.bind "resize", ->
      $timeout recalc
    $timeout recalc
    return
