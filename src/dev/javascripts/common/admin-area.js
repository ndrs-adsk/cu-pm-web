app.factory('roomCrudAdminServ',function(restServ){return restServ.getCrud('/room/:id','ru');});
app.factory('roomTypeCrudAdminServ',function(restServ){return restServ.getCrud(
  '/room/room_type',
  {
    getAll: {method: 'GET', isArray: true},
    updateAll: {method: 'PUT', isArray: true}
  }
);});

app.factory('roomAdminServ',function(roomCrudAdminServ,roomTypeCrudAdminServ,structureGetAdminServ,uiServ){
  var structure = [];
  var roomType = [];

  return {
    set: function(){structure = structureGetAdminServ.getAll(function(){
      window.dirtyRoom = true;
      uiServ.loader0hide();
    });},
    setType: function(){roomType = roomTypeCrudAdminServ.getAll();},
    getOne: function(fixId){return roomCrudAdminServ.get({id: fixId}); },
    get: function(){return structure;},
    getType: function(){return roomType;},
    update: function(room,fixId){
      var self = this;

      roomCrudAdminServ.update({id: fixId},room,function(){
        $('#bems-admin-room-type-modal-success').modal('show');
        self.set();
      });
    },
    updateType: function(type){roomTypeCrudAdminServ.updateAll(type,function(){$('#bems-admin-room-modal-success').modal('show');});}
  };
});

app.controller('roomAdminCtrl',function($scope,$interval,$timeout,roomAdminServ,Upload,constServ){
  roomAdminServ.set();
  $scope.data = roomAdminServ.get();
  roomAdminServ.setType();
  $scope.roomType = roomAdminServ.getType();

  $scope.tOps = {nodeChildren: 'nodes'};

  $scope.roomTab = true;
  $scope.hideRoom = true;
  window.dirtyRoom = false;
  var intervalAdminRoom = $interval(function(){ if(window.dirtyRoom){
    $scope.data = roomAdminServ.get();
    window.dirtyRoom = false;
  }},500);
  $scope.$on('$destroy',function(){if(intervalAdminRoom) $interval.cancel(intervalAdminRoom);});
  $scope.nocacheImg = function(src){return src+'?decache='+(new Date()).getTime();};
  $scope.tabbing = function(bool){$scope.roomTab = bool;};

  $scope.removeFile = function(){
    $scope.roomFile = null;
    $scope.roomText = "";
  };
  $scope.editRoom = function(id){
    $scope.hideRoom = false;
    $scope.idRoom = id;
    $scope.detailRoom = roomAdminServ.getOne(id);
    $scope.removeFile();
    $('html,body').scrollTop(0);
  };

  $scope.update = function(room){
    if(room.name.length !== 0) roomAdminServ.update(room,$scope.idRoom);
    else $('#bems-admin-room-modal-alert').modal('show');
  };

  $scope.uploadFile = function(file,fixId){
    file.upload = Upload.upload({
      url: constServ.getUrl()+'/setting/image/room/'+fixId,
      data: {image: file},
      headers: {'token': sessionStorage.getItem('ustk')}
    });

    file.upload.then(function(response){ $timeout(function(){
      $('#bems-admin-room-img-modal-success').modal('show');
    });});
  };

  function checkRoomType(type){
    for(var run in type) if(typeof type[run].name !== 'undefined') if(type[run].name.length === 0) return false;
    return true;
  }
  $scope.updateType = function(type){
    if(checkRoomType(type)) roomAdminServ.updateType(type);
    else $('#bems-admin-room-type-modal-alert').modal('show');
  };
});
