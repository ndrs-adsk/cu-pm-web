app.factory('structureGetAdminServ',function(restServ){return restServ.getCrud('/structure/nodes','a');});
app.factory('structureCrudAdminServ',function(restServ){return restServ.getCrud('/structure/node/:id','crud');});
app.factory('structurePointAdminServ',function(restServ){return restServ.getCrud('/structure/point_types','a');});

app.factory('structureAdminServ',function(structureGetAdminServ,structureCrudAdminServ,structurePointAdminServ,uiServ){
  var structure = [];
  var pointidList = [];
  var newStructure = {};
  var sStructure = [];

  return {
    set: function(){structure = structureGetAdminServ.getAll(function(){
      window.structureNode = structure[0].id;
      window.dirtyStucture = true;
      uiServ.loader0hide();
    });},
    setList: function(){pointidList = structurePointAdminServ.getAll();},
    get: function(){return structure;},
    getOne: function(fixId){return structureCrudAdminServ.get({id: fixId});},
    getAll: function(){return structureGetAdminServ.getAll();},
    getList: function(){return pointidList;},
    update: function(node){
      var self = this;

      structureCrudAdminServ.update({id: node.id},node,function(){
        $('#bems-admin-structure-modal-success').modal('show');
        self.set();
      });
    },
    create: function(obj){
      var self = this;
      newStructure = structureCrudAdminServ.create(obj,function(){
        window.structureNewNode = newStructure.id;
        window.dirtyStucture = true;
        self.set();
      });
    },
    delete: function(fixId){structureCrudAdminServ.delete({id: fixId},this.set);},
    confirm: function(){$('#bems-admin-structure-modal-delete').modal('show');},
    searchy: function(fixId){
      function _findInTree(id, tree) {
         if (tree.id === id) {
           var ptmp = {};
           ptmp[tree.level_name] = {chk: true};
           return ptmp;
         } else {
           for (var child_id in tree.nodes) {
             var tmp = _findInTree(id,tree.nodes[child_id]);
             if (!angular.equals({},tmp)) {
               tmp[tree.level_name] = {id: tree.id, name: tree.name};
               return tmp;
             }
           }
           return {};
         }
       }

      sStructure = structureGetAdminServ.getAll(function(){
        window.treeList = _findInTree(fixId,sStructure[0]);
      });
    },
    pathy: function(nodes,path){
      var nodes_path = {};
      for (var idx in nodes) {
          // var node_path = (nodes[idx].level_name === "device") ? path + "/" + nodes[idx].name : nodes[idx].name
          var node_path = (path === "" || path === "Overall") ? nodes[idx].name : path + "/" + nodes[idx].name;
          nodes_path[nodes[idx].id] = node_path;
          // check child exist
          if (nodes[idx].nodes != null) {
              var child_path = this.pathy(nodes[idx].nodes,node_path);
              nodes_path = Object.assign(nodes_path, child_path);
          }
      }
      return nodes_path;
    }
  };
});

app.controller('structureAdminCtrl',function($scope,$route,$timeout,$interval,$window,structureAdminServ){
  $scope.dirtyStructure = 0;
  window.dirtyStucture = false;
  structureAdminServ.set();
  $scope.data = structureAdminServ.get();
  structureAdminServ.setList();
  $scope.pointidList = structureAdminServ.getList();
  $scope.tOps = {nodeChildren: 'nodes'};

  $scope.delId = 0;
  $scope.delName = '';

  $scope.update = function(node){
    if(node.name.length !== 0) structureAdminServ.update(node);
    else $('#bems-admin-structure-modal-alert').modal('show');
  };
  $scope.controlUpdate = function(bool){$scope.detailNode.ctrl_node = bool;};

  $scope.hideNode = true;
  $scope.isLast = function(nodes){return (nodes.length === 0);};

  $scope.editNode = function(id){
    $scope.hideNode = false;
    $scope.detailNode = structureAdminServ.getOne(id);

    $('html,body').scrollTop(0);
  };
  $scope.$watch(function(){return $window.structureNode;},function(n,o){
    $timeout($scope.editNode(window.structureNode),500);
    $scope.firstNode = window.structureNode;
  },true);
  $scope.$watch(function(){return $window.structureNewNode;},function(n,o){
    $timeout($scope.editNode(window.structureNewNode),500);
    $scope.editNode(window.structureNewNode);
  },true);

  $scope.newPoint = {attr: '', val: ''};
  function pushPoint(attr,val){
    $scope.detailNode.pointid.push({type: attr, name: val});
    $scope.newPoint.attr = '';
    $scope.newPoint.val = '';
  }
  function chkPoint(attr){
    for(var key in $scope.detailNode.pointid) if($scope.detailNode.pointid[key].type === attr) return false;
    return true;
  }
  $scope.addPoint = function(){ if($scope.newPoint.attr.length !== 0 && $scope.newPoint.val.length !== 0 && typeof $scope.detailNode.pointid !== undefined){
    if($scope.newPoint.attr != "monitor/power" && $scope.newPoint.attr != "monitor/energy"){
      if(chkPoint($scope.newPoint.attr)) pushPoint($scope.newPoint.attr,$scope.newPoint.val);
    }
    else pushPoint($scope.newPoint.attr,$scope.newPoint.val);
  }};
  $scope.deletePoint = function(index){$scope.detailNode.pointid.splice(index,1);};

  var intervalStructure = $interval(function(){ if(window.dirtyStucture){
    $scope.data = structureAdminServ.get();
    window.dirtyStucture = false;
  }},500);
  $scope.$on('$destroy',function(){if(intervalStructure) $interval.cancel(intervalStructure);});
  $scope.newSubNode = function(id,name){structureAdminServ.create({parent_node_id: id, name: "child of "+name, pointid: []});};
  $scope.confirmDeleteNode = function(id,name){
    $scope.delId = id;
    $scope.delName = name;
    structureAdminServ.confirm();
  };
  $scope.deleteNode = function(id){structureAdminServ.delete(id);};
  $scope.toggle = function(scope){scope.toggle();};

  $scope.getNodeClass = function(node){
    if(node.ctrl_node) return 'glyphicon-record';
    else if(node.pointid.length !== 0) return 'glyphicon-stats';
    else return 'glyphicon-unchecked';
  };
});
