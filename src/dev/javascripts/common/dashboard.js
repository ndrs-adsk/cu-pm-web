app.factory('dashboardGetServ',function(restServ){return restServ.getCrud('/profile/overview_dashboard','a');});

app.factory('dashboardServ',function(dashboardGetServ,uiServ){
  var boards = [];

  return {
    set: function(){boards = dashboardGetServ.getAll(function(){uiServ.loader0hide();});},
    get: function(){return boards;},
    ontop: function(index){
      var temp = boards[index];
      boards[index] = boards[0];
      boards[0] = temp;
    }
  };
});

app.controller('dashboardCtrl',function($scope,$interval,dashboardServ){
  function fetchDashboard(){
    dashboardServ.set();
    $scope.boards = dashboardServ.get();
  }
  fetchDashboard();
  var intervalDashboard = $interval(fetchDashboard(),60 * 1000);
  $scope.$on('$destroy',function(){if(intervalDashboard) $interval.cancel(intervalDashboard);});
  $scope.classColor = function(fixId){return 'bems-dashboard-item-'+fixId;};

  $scope.selectedED = -1;
  $scope.selectionED = function(num){
    if(num == $scope.selectedED) $scope.selectedED = -1;
    else $scope.selectedED = num;
  };
});
