App.factory 'store', ($rootScope) ->
  
  #isolate scope
  scope = $rootScope.store = window.store = {}

  $rootScope.$watch 'store', (s, prev) ->
    for k of s
      if k not of prev or s[k] isnt prev[k]
        commit k, s[k]
    return
  , true

  commit = (key, val) ->
    #save to disk
    if val is `undefined`
      localStorage.removeItem key
    else
      json = JSON.stringify(val)
      localStorage.setItem key, json
    return

  #init
  Object.keys(localStorage).forEach (key) ->
    json = localStorage.getItem key
    scope[key] = JSON.parse json

  scope