app.factory('floorCrudAdminServ',function(restServ){return restServ.getCrud('/floor/:id','ru');});

app.factory('floorAdminServ',function(floorCrudAdminServ,structureGetAdminServ,uiServ){
  var structure = [];

  return {
    set: function(){structure = structureGetAdminServ.getAll(function(){
      window.dirtyFloor = true;
      uiServ.loader0hide();
    });},
    getOne: function(fixId){return floorCrudAdminServ.get({id: fixId}); },
    get: function(){ return structure; },
    update: function(floor,fixId){
      var self = this;

      floorCrudAdminServ.update({id: fixId},floor,function(){
        $('#bems-admin-floor-modal-success').modal('show');
        self.set();
      });
    }
  };
});

app.controller('floorAdminCtrl',function($scope,$interval,$timeout,floorAdminServ,Upload,constServ){
  floorAdminServ.set();
  $scope.data = floorAdminServ.get();
  $scope.tOps = {nodeChildren: 'nodes'};

  $scope.hideFloor = true;
  window.dirtyFloor = false;
  var intervalAdminFloor = $interval(function(){ if(window.dirtyFloor){
    $scope.data = floorAdminServ.get();
    window.dirtyFloor = false;
  }},500);
  $scope.$on('$destroy',function(){if(intervalAdminFloor) $interval.cancel(intervalAdminFloor);});

  $scope.removeFile = function(){
    $scope.floorFile = null;
    $scope.floorText = "";
  };
  $scope.editFloor = function(id){

    $scope.nocacheImg = function(src){return src+'?decache='+(new Date()).getTime();};
    $scope.hideFloor = false;
    $scope.idFloor = id;
    $scope.detailFloor = floorAdminServ.getOne(id);

    console.log($scope.detailFloor);
    $scope.removeFile();

    $('html,body').scrollTop(0);
  };

  $scope.update = function(floor){
    if(floor.name.length !== 0) floorAdminServ.update(floor,$scope.idFloor);
    else $('#bems-admin-floor-modal-alert').modal('show');
  };

  $scope.uploadFile = function(file,fixId){
    console.log(file,fixId);
    file.upload = Upload.upload({
      url: constServ.getUrl()+'/setting/image/floor/'+fixId,
      data: {image: file},
      headers: {'token': sessionStorage.getItem('ustk')}
    });

    file.upload.then(function(response){ $timeout(function(){
      $('#bems-admin-floor-img-modal-success').modal('show');
    });});
  };
});
