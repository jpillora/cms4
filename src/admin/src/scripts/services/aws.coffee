App.factory 'aws', ($rootScope, $http, $timeout) ->

  aws = $rootScope.aws = {}
  store = $rootScope.store

  base = null
  aws.loggedIn = false

  update = ->
    {bucket,endpoint,accessKey,secretKey} = store
    ready = bucket and endpoint and accessKey and secretKey
    $timeout.cancel checkLogin.t
    if ready
      base = "#{endpoint}/#{bucket}"
      s3hook.set(accessKey, secretKey)
      checkLogin.t = $timeout checkLogin, 1000
    else if base
      aws.showAuth = true
      s3hook.clear()
    return

  checkLogin = -> getFiles()

  $rootScope.$watch 'store.bucket', update
  $rootScope.$watch 'store.endpoint', update
  $rootScope.$watch 'store.accessKey', update
  $rootScope.$watch 'store.secretKey', update

  setFiles = (items) ->
    files = []
    dirs = []
    root = {children:[]}
    keys = {}

    addFile = (file) ->
      parent = if file.parentKey then keys[file.parentKey] else root
      #create parent if missing
      unless parent
        /^(.+\/)?(.+)\/?/.test file.parentKey
        parent =
          parentKey: RegExp.$1 or ''
          name: RegExp.$2
          Key: file.parentKey
          children:[]
        addFile parent
      #create file
      keys[file.Key] = file
      parent.children.push(file)

    #add all to root
    items.forEach (f) ->
      return if /\/$/.test f.Key
      /^(.+\/)?(.+)/.test f.Key
      f.children = []
      f.parentKey = RegExp.$1 or ''
      f.name = RegExp.$2
      addFile f

    #swap over
    $rootScope.files = root.children

  getFiles = ->
    $http(
      method: 'GET'
      url: base
    ).then (response) ->
      setFiles response.data.ListBucketResult.Contents
      aws.loggedIn = true
    , (data) ->
      aws.loggedIn = false

  return aws