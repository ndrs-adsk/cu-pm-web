app.factory('deviceTypeGetAdminServ',function(restServ){return restServ.getCrud('/device/device_type','a');});
app.factory('deviceListGetAdminServ',function(restServ){return restServ.getCrud('/room/:id/devices','w');});
app.factory('deviceCrudAdminServ',function(restServ){return restServ.getCrud('/device/:id','crud');});

app.factory('deviceAdminServ',function(deviceTypeGetAdminServ,deviceCrudAdminServ,deviceListGetAdminServ,structureGetAdminServ,roomGetServ,uiServ){
  var structure = [];
  var type = [];

  return {
    set: function(){structure = structureGetAdminServ.getAll(function(){
      uiServ.loader0hide();
      window.dirtyStructure = true;
    });},
    setType: function(){type = deviceTypeGetAdminServ.getAll();},
    get: function(){return structure;},
    getOne: function(fixId){return roomGetServ.getWith({room_id: fixId, range: 'day'});},
    getDevice: function(fixId){return deviceListGetAdminServ.getWith({id: fixId});},
    getType: function(){return type;},
    create: function(device,roomId){
      var self = this;
      deviceCrudAdminServ.create(device,function(){
        self.set();
        window.dirtyDevice = true;
      });
    },
    update: function(dList){
      var chkUp = 0;
      function chkUpdate(){
        chkUp++;
        if(chkUp === dList.length) $('#bems-admin-device-modal-success').modal('show');
      }
      for(var run in dList){
        var temp = angular.copy(dList[run]);
        delete temp.pointid;
        if(typeof temp.id !== 'undefined') deviceCrudAdminServ.update({id: temp.id},temp,chkUpdate);
      }
    },
    delete: function(fixId,roomId){
      var self = this;
      console.log(this);
      deviceCrudAdminServ.delete({id: fixId},function(){
        self.set();
        window.dirtyDevice = true;
      });
    }
  };
});

app.controller('deviceAdminCtrl',function($scope,$interval,deviceAdminServ){
  window.dirtyDevice = false;
  window.dirtyStructure = false;
  deviceAdminServ.set();
  deviceAdminServ.setType();
  $scope.data = deviceAdminServ.get();
  $scope.type = deviceAdminServ.getType();
  $scope.tOps = {nodeChildren: 'nodes'};

  $scope.hidePanel = true;
  $scope.chooseRoom = function(id){
    $scope.room = deviceAdminServ.getOne(id);
    $scope.dList = deviceAdminServ.getDevice(id);
    $scope.currentId = id;
    $scope.hidePanel = false;

    $('html,body').scrollTop(0);
  };

  var intervalAdminDevice = $interval(function(){
    if(window.dirtyDevice) {
      $scope.dList = deviceAdminServ.getDevice($scope.currentId);
      window.dirtyDevice = false;
    }
    if(window.dirtyStructure){
      $scope.data = deviceAdminServ.get();
      window.dirtyStructure = false;
    }
  },500);
  $scope.$on('$destroy',function(){if(intervalAdminDevice) $interval.cancel(intervalAdminDevice);});

  $scope.pinDevice = function(){
    $scope.devicePinX = event.offsetX - 15;
    $scope.devicePinY = (event.offsetY - 15 < 0 || event.offsetY - 15 > $('#bems-admin-device-img').height() - 30)?((event.offsetY - 15 < 0)?0:($('#bems-admin-device-img').height() - 30)):event.offsetY - 15;
    $scope.chosenPin = -1;
    $('#bems-admin-device-dialog-modal').modal('show');
  };
  $scope.changePos = function(bool){
    if(typeof bool !== 'undefined'){
      $scope.dList[$scope.newPin].pin_pos = angular.copy($scope.maniPinpos);
      $scope.newPin = -1;
    }
    else if($scope.chosenPin !== -1) {
      $scope.dList[$scope.chosenPin].pin_pos = {
        left: $scope.devicePinX+"px",
        top: $scope.devicePinY+"px"
      };
      $('#bems-admin-device-dialog-modal').modal('hide');
    }
    else $('#bems-admin-device-modal-alert').modal('show');
  };
  $scope.checkSamPos = function(pin){return angular.equals($scope.maniPinpos,pin);};
  $scope.checkBluePlus = function(id,pin){
    for(var run in $scope.dList) if(typeof $scope.dList[run].id !== 'undefined' && $scope.dList[run].id != id && angular.equals($scope.dList[run].pin_pos,pin)) return true;
    return false;
  };
  $scope.maniPin = function(pinpos){
    $scope.maniPinpos = angular.copy(pinpos);
    $scope.newPin = -1;
    $('#bems-admin-device-modal-manipulate').modal('show');
  };
  $scope.checkPin = function(pinpos){return (pinpos !== null);};
  $scope.changeType = function(key,type){ for(var run in $scope.type) if(type === $scope.type[run].name) $scope.dList[key].icon = $scope.type[run].icon; };
  $scope.changeNewType = function(type){ for(var run in $scope.type) if(type === $scope.type[run].name) $scope.newDevice.icon = $scope.type[run].icon; };

  $scope.addNewDevice = function(){
    $scope.newDevice = {parent_node_id: $scope.currentId, name: '', type: 'light', icon: 'svg/light.svg', pin_pos: null};
    $('#bems-admin-device-modal-create').modal('show');
  };
  $scope.confirmCreateDevice = function(){
    deviceAdminServ.create($scope.newDevice);
  };
  $scope.updateRoom = deviceAdminServ.update;
  $scope.delDevice = {fixId: 0, name: ''};
  $scope.deleteDevice = function(fixId,name){
    $scope.delDevice.fixId = fixId;
    $scope.delDevice.name = name;
    $('#bems-admin-device-modal-delete').modal('show');
  };
  $scope.confirmDelDevice = function(fixId){
    deviceAdminServ.delete(fixId);
  };
});
