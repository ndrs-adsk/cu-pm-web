app.factory('rankingGetAdminServ',function(restServ){return restServ.getCrud('/system_overview/competitive','a');});
app.factory('rankingCrudAdminServ',function(restServ){return restServ.getCrud('/system_overview/competitive/:id','ud');});

app.factory('rankingAdminServ',function(rankingGetAdminServ,rankingCrudAdminServ,userCrudAdminServ,passCrudServ,uiServ){
  var result_data = {};
  return {
    set: function(){result_data = rankingGetAdminServ.getAll(function(){
      window.dirtyRanking = true;
      uiServ.loader0hide();
    });},
    get: function(){
      return result_data;},
    put: function(id){
      rankingCrudAdminServ.update({id: id},this.set);
    },
    delete: function(id){
      rankingCrudAdminServ.delete({id: id},this.set);
    },
  };
});




app.controller('rankingAdminCtrl',function($scope,$interval,rankingAdminServ,structureAdminServ){
  window.dirtyRanking = false;
  rankingAdminServ.set();
  $scope.result_data = rankingAdminServ.get();
  console.log($scope.result_data);
   structureAdminServ.set();
  $scope.data = structureAdminServ.get();

  var intervalRanking = $interval(function(){ if(window.dirtyRanking) {
    $scope.result_data = rankingAdminServ.get();
    window.dirtyRanking = false;
  }},500);
  $scope.$on('$destroy',function(){if(intervalRanking) $interval.cancel(intervalRanking);});

  $scope.isCreated = function(nodeId){
    return ($scope.result_data.find(function(data){return data.id == nodeId;}))?true:false;
  };

  $scope.tOps = {nodeChildren: 'nodes'};
  $scope.isLast = function(nodes){return (nodes.length === 0);};
  $scope.addCompetitor = function(nodeId,nodeName){
    console.log(nodeId);
    $.alert({
      title: 'Do you want to add this area?',
      content: 'Add "'+nodeName+'" for competitive?',
      type: 'blue',
      buttons: {
        'OK': {
            text: 'OK',
            btnClass: 'btn-blue',
            action: function () {
              console.log(nodeId);
              $('#bems-admin-user-modal-own').modal('hide');
              rankingAdminServ.put(nodeId);
            }
        },
        cancel: function () {
        }
      }
    });
  };
  $scope.removeCompetitor = function(nodeId,nodeName){
    console.log(nodeId);
    $.alert({
      title: 'Do you want to remove this area?',
      content: 'Remove "'+nodeName+'"  from competition?',
      type: 'red',
      buttons: {
        'OK': {
            text: 'OK',
            btnClass: 'btn-red',
            action: function () {
              console.log(nodeId);
              rankingAdminServ.delete(nodeId);
            }
        },
        cancel: function () {
        }
      }
    });
  };
});
