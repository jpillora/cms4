App.run ($rootScope, store, aws) ->
  window.root = $rootScope
  console.log 'run'
  $rootScope.endpoints = s3hook.endpoints()#.map (url) -> {url}
  $rootScope.files =  []
  $rootScope.$watch 'filesTree.currentNode', (f) -> $rootScope.file = f
