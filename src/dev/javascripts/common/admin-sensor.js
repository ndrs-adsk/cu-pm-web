app.factory('sensorGetAdminServ',function(restServ){return restServ.getCrud('/setting/sensors_subscribe/:id','w');});

app.factory('sensorUpdateAdminServ',function(restServ){return restServ.getCrud(
  '/setting/sensor_subscribe/:id/monitor/:type',
  {updateSub: {method: 'PUT', params: {id: '@id', type: '@type'}}}
);});

app.factory('sensorAdminServ',function(sensorGetAdminServ,sensorUpdateAdminServ,userAdminServ){
  var sub = {};
  var subber = {};
  var type = '';

  return {
    check: function(type,fixId){
      var i = -1;
      for(var run in sub) if(sub[run].type === type) i = run;
      for(var run2 in sub[i].user) if(sub[i].user[run2].id === fixId) return true;
      return false;
    },
    set: function(id){
      window.dirtySubSensor = true;
      sub = sensorGetAdminServ.getWith({id: id});
    },
    setSub: function(type){
      var self = this;
      subber = userAdminServ.get();
      setTimeout(function(){for(var run in subber){
        if(subber[run].hasOwnProperty('id') && self.check(type,subber[run].id)) subber[run].chk = true;
        else if(subber[run].hasOwnProperty('id')) subber[run].chk = false;
      }},500);
    },
    get: function(){return sub;},
    getSub: function(){return subber;},
    update: function(id,type){
      var self = this;
      var upLoad = [];
      var fixId = id;

      for(var run in subber){ if(subber[run].hasOwnProperty('id') && subber[run].chk) {
        upLoad.push({
          id: subber[run].id,
          name: subber[run].name
        });
      }}
      sensorUpdateAdminServ.updateSub({id: id,type: type.substr(8)},upLoad,function(){
        self.set(fixId);
      });
    }
  };
});

app.controller('sensorAdminCtrl',function($scope,$timeout,$interval,structureAdminServ,sensorAdminServ,userAdminServ){
  structureAdminServ.set();
  $scope.data = structureAdminServ.get();
  userAdminServ.set();
  $scope.users = userAdminServ.get();

  $scope.hideNode = true;

  $scope.checkEdit = function(point){
    for(var run in point){switch(point[run].type){
      case 'monitor/temperature':
      case 'monitor/humidity':
      case 'monitor/illuminance': return true;
      default: break;
    }}
    return false;
  };

  $scope.collapseAll = function(){$scope.$broadcast('angular-ui-tree:collapse-all');};
  $scope.expandAll = function(){$scope.$broadcast('angular-ui-tree:expand-all');};

  $scope.isLast = function(nodes){return (nodes.length === 0);};

  $scope.editNode = function(id){
    $scope.hideNode = false;
    $scope.detailNode = structureAdminServ.getOne(id);
    sensorAdminServ.set(id);
    $scope.detailSub = sensorAdminServ.get();
  };

  $scope.sensorSubVisibility = function(bool){
    var sensorModal = "#bems-admin-sensor-subscribe-modal";
    if(bool) $(sensorModal).show();
    else $(sensorModal).hide();
  };
  $scope.editSub = function(type){
    $scope.detailType = type;
    sensorAdminServ.setSub($scope.detailType);
    $timeout(function(){
      $scope.users = sensorAdminServ.getSub();
      $scope.sensorSubVisibility(1);
    },750);
  };
  var intervalAdminSensor = $interval(function(){ if(window.dirtySubSensor) {
    $scope.detailSub = sensorAdminServ.get();
    $timeout(function(){
      $scope.$apply(function(){
        $scope.detailSub = sensorAdminServ.get();
        window.dirtySubSensor = false;
      });
    },250);
  }},500);
  $scope.$on('$destroy',function(){if(intervalAdminSensor) $interval.cancel(intervalAdminSensor);});
  $scope.sensorUpdateSub = function(id,type){
    sensorAdminServ.update(id,type);
    $scope.sensorSubVisibility(0);
  };
});
