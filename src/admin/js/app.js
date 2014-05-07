(function() {
  var App;

  App = angular.module('cms4', ['angularTreeview']);

  App.directive("resize", function($window, $timeout) {
    return function(scope, element) {
      var recalc, t, w;
      w = angular.element($window);
      recalc = function() {
        scope.height = $window.innerHeight;
        scope.width = $window.innerWidth;
        scope.$apply();
      };
      t = 0;
      w.bind("resize", function() {
        return $timeout(recalc);
      });
      $timeout(recalc);
    };
  });

  App.directive("tree", function($compile) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        var nodeChildren, nodeId, nodeLabel, template, treeId, treeModel;
        treeId = attrs.treeId;
        treeModel = attrs.treeModel;
        nodeId = attrs.nodeId || "id";
        nodeLabel = attrs.nodeLabel || "label";
        nodeChildren = attrs.nodeChildren || "children";
        template = "<ul>\n  <li data-ng-repeat=\"node in {{treeModel}}\">\n    <i data-ng-show=\"node.{{nodeChildren}}.length &amp;&amp; node.collapsed\" data-ng-click=\"{{treeId}}.selectNodeHead(node)\" class=\"collapsed\" />\n    <i data-ng-show=\"node.{{nodeChildren}}.length &amp;&amp; !node.collapsed\" data-ng-click=\"{{treeId}}.selectNodeHead(node)\" class=\"expanded\" />\n    <i data-ng-hide=\"node.{{nodeChildren}}.length\" class=\"normal\" />\n    <span data-ng-class=\"node.selected\" data-ng-click=\"{{treeId}}.selectNodeLabel(node)\">{{node.{{nodeLabel}}}}</span>\n    <div data-ng-hide=\"node.collapsed\" data-tree-id=\"{{treeId}}\" data-tree-model=\"node.{{nodeChildren}}\" data-node-id=\"{{nodeId}}\" data-node-label=\"{{nodeLabel}}\" data-node-children=\"{{nodeChildren}}\" />\n  </li>\n</ul>";
        if (!treeId || !treeModel) {
          return;
        }
        if (attrs.angularTreeview) {
          scope[treeId] = scope[treeId] || {};
          scope[treeId].selectNodeHead = scope[treeId].selectNodeHead || function(selectedNode) {
            selectedNode.collapsed = !selectedNode.collapsed;
          };
          scope[treeId].selectNodeLabel = scope[treeId].selectNodeLabel || function(selectedNode) {
            if (scope[treeId].currentNode && scope[treeId].currentNode.selected) {
              scope[treeId].currentNode.selected = undefined;
            }
            selectedNode.selected = "selected";
            scope[treeId].currentNode = selectedNode;
          };
        }
        element.html("").append($compile(template)(scope));
      }
    };
  });

  App.factory('aws', function($rootScope, $http, $timeout) {
    var aws, base, checkLogin, getFiles, setFiles, store, update;
    aws = $rootScope.aws = {};
    store = $rootScope.store;
    base = null;
    aws.loggedIn = false;
    update = function() {
      var accessKey, bucket, endpoint, ready, secretKey;
      bucket = store.bucket, endpoint = store.endpoint, accessKey = store.accessKey, secretKey = store.secretKey;
      ready = bucket && endpoint && accessKey && secretKey;
      $timeout.cancel(checkLogin.t);
      if (ready) {
        base = "" + endpoint + "/" + bucket;
        s3hook.set(accessKey, secretKey);
        checkLogin.t = $timeout(checkLogin, 1000);
      } else if (base) {
        aws.showAuth = true;
        s3hook.clear();
      }
    };
    checkLogin = function() {
      return getFiles();
    };
    $rootScope.$watch('store.bucket', update);
    $rootScope.$watch('store.endpoint', update);
    $rootScope.$watch('store.accessKey', update);
    $rootScope.$watch('store.secretKey', update);
    setFiles = function(items) {
      var addFile, dirs, files, keys, root;
      files = [];
      dirs = [];
      root = {
        children: []
      };
      keys = {};
      addFile = function(file) {
        var parent;
        parent = file.parentKey ? keys[file.parentKey] : root;
        if (!parent) {
          /^(.+\/)?(.+)\/?/.test(file.parentKey);
          parent = {
            isFile: false,
            parentKey: RegExp.$1 || '',
            name: RegExp.$2,
            Key: file.parentKey,
            children: []
          };
          addFile(parent);
        }
        keys[file.Key] = file;
        return parent.children.push(file);
      };
      items.forEach(function(f) {
        if (/\/$/.test(f.Key)) {
          return;
        }
        /^(.+\/)?(.+)/.test(f.Key);
        f.isFile = true;
        f.children = [];
        f.parentKey = RegExp.$1 || '';
        f.name = RegExp.$2;
        return addFile(f);
      });
      return $rootScope.files = root.children;
    };
    getFiles = function() {
      console.log("GET " + base);
      return $http({
        method: 'GET',
        url: base
      }).then(function(response) {
        setFiles(response.data.ListBucketResult.Contents);
        return aws.loggedIn = true;
      }, function(data) {
        return aws.loggedIn = false;
      });
    };
    return aws;
  });

  App.factory('store', function($rootScope) {
    var commit, scope;
    scope = $rootScope.store = window.store = {};
    $rootScope.$watch('store', function(s, prev) {
      var k;
      for (k in s) {
        if (!(k in prev) || s[k] !== prev[k]) {
          commit(k, s[k]);
        }
      }
    }, true);
    commit = function(key, val) {
      var json;
      key = "cms4-" + key;
      if (val === undefined) {
        localStorage.removeItem(key);
      } else {
        json = JSON.stringify(val);
        localStorage.setItem(key, json);
      }
    };
    Object.keys(localStorage).forEach(function(fullkey) {
      var json, key;
      key = /^cms4-(.*)/.test(fullkey) && RegExp.$1;
      if (!key) {
        return;
      }
      json = localStorage.getItem(fullkey);
      return scope[key] = JSON.parse(json);
    });
    return scope;
  });

  App.run(function($rootScope, store, aws) {
    window.root = $rootScope;
    console.log('run');
    $rootScope.endpoints = s3hook.endpoints();
    $rootScope.files = [];
    return $rootScope.$watch('filesTree.currentNode', function(f) {
      return $rootScope.file = f;
    });
  });

}).call(this);
