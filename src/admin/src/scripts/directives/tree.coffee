App.directive "tree", ($compile) ->
  restrict: "A"
  link: (scope, element, attrs) ->
    #tree id
    treeId = attrs.treeId
    #tree model
    treeModel = attrs.treeModel
    #node id
    nodeId = attrs.nodeId or "id"
    #node label
    nodeLabel = attrs.nodeLabel or "label"
    #children
    nodeChildren = attrs.nodeChildren or "children"
    #tree template
    template =  """
      <ul>
        <li data-ng-repeat="node in {{treeModel}}">
          <i data-ng-show="node.{{nodeChildren}}.length &amp;&amp; node.collapsed" data-ng-click="{{treeId}}.selectNodeHead(node)" class="collapsed" />
          <i data-ng-show="node.{{nodeChildren}}.length &amp;&amp; !node.collapsed" data-ng-click="{{treeId}}.selectNodeHead(node)" class="expanded" />
          <i data-ng-hide="node.{{nodeChildren}}.length" class="normal" />
          <span data-ng-class="node.selected" data-ng-click="{{treeId}}.selectNodeLabel(node)">{{node.{{nodeLabel}}}}</span>
          <div data-ng-hide="node.collapsed" data-tree-id="{{treeId}}" data-tree-model="node.{{nodeChildren}}" data-node-id="{{nodeId}}" data-node-label="{{nodeLabel}}" data-node-children="{{nodeChildren}}" />
        </li>
      </ul>
    """
    #check tree id, tree model
    return  if not treeId or not treeModel
    #root node
    if attrs.angularTreeview
      #create tree object if not exists
      scope[treeId] = scope[treeId] or {}
      #if node head clicks,
      scope[treeId].selectNodeHead = scope[treeId].selectNodeHead or (selectedNode) ->
        #Collapse or Expand
        selectedNode.collapsed = not selectedNode.collapsed
        return
      #if node label clicks,
      scope[treeId].selectNodeLabel = scope[treeId].selectNodeLabel or (selectedNode) ->
        #remove highlight from previous node
        scope[treeId].currentNode.selected = `undefined`  if scope[treeId].currentNode and scope[treeId].currentNode.selected
        #set highlight to selected node
        selectedNode.selected = "selected"
        #set currentNode
        scope[treeId].currentNode = selectedNode
        return
    #Rendering template.
    element.html("").append $compile(template)(scope)
    return