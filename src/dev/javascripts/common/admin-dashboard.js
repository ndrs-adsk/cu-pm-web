app.factory('dashboardGetAdminServ',function(restServ){return restServ.getCrud('/setting/dashboards','a');});
app.factory('dashboardCrudAdminServ',function(restServ){return restServ.getCrud('/setting/dashboards/:id','u');});

app.factory('dashboardAdminServ',function($q,dashboardGetAdminServ,dashboardCrudAdminServ,uiServ){
  var dashboard = {};

  return {
    set: function(){dashboard = dashboardGetAdminServ.getAll(function(){uiServ.loader0hide();});},
    get: function(){
      console.log(dashboard); return dashboard;},
    update: function(){
      for(var key in dashboard) if(dashboard[key].value) dashboardCrudAdminServ.update({id: dashboard[key].id},dashboard[key]).$promise; // jshint ignore:line
      $q.all().then(function(){$('#bems-admin-dashboard-modal-success').modal('show');});
    }
  };
});

app.controller('dashboardAdminCtrl',function($scope,dashboardAdminServ){
  dashboardAdminServ.set();
  $scope.dashboards = dashboardAdminServ.get();
  $scope.adminUpdateDashboard = dashboardAdminServ.update;
});
