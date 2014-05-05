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
    key = "cms4-#{key}"
    #save to disk
    if val is `undefined`
      localStorage.removeItem key
    else
      json = JSON.stringify(val)
      localStorage.setItem key, json
    return

  #init
  Object.keys(localStorage).forEach (fullkey) ->
    key = /^cms4-(.*)/.test(fullkey) and RegExp.$1
    return unless key
    json = localStorage.getItem fullkey
    scope[key] = JSON.parse json

  scope