app.factory('notificationGetAdminServ',function(restServ){return restServ.getCrud('/setting/noti','a');});
app.factory('notificationCrudAdminServ',function(restServ){return restServ.getCrud('/setting/noti/:id','ud');});

app.factory('notificationAdminServ',function(notificationGetAdminServ,notificationCrudAdminServ,userCrudAdminServ,passCrudServ,uiServ){
  var result_data = {};
  return {
    set: function(){result_data = notificationGetAdminServ.getAll(function(){
      window.dirtynotification = true;
      uiServ.loader0hide();
    });},
    get: function(){
      return result_data;},
    put: function(id,name,type,map_id,key){
      notificationCrudAdminServ.update({id: id,name : name,type : type ,map_id : map_id,key :key},function(){
        $('#bems-admin-noti-modal-success').modal('show');
        this.set();
      },
      function(){
        $('#bems-admin-noti-modal-failed').modal('show'); 
      });
    },
  };
});

app.factory('notiMsgGetAdminServ',function(restServ){return restServ.getCrud('/setting/noti_msg','a');});
app.factory('notiMsgCrudAdminServ',function(restServ){return restServ.getCrud('/setting/noti_msg/:id','ud');});

app.factory('notiMsgAdminServ',function(notiMsgGetAdminServ,notiMsgCrudAdminServ,userCrudAdminServ,passCrudServ,uiServ){
  var result_data = {};
  return {
    set: function(){result_data = notiMsgGetAdminServ.getAll(function(){

      uiServ.loader0hide();
    });},
    get: function(){
      return result_data;},
    put: function(id,name,type,message){
      notiMsgCrudAdminServ.update({id: id,name : name,type : type ,message :message},function(){
        $('#bems-admin-noti-modal-success').modal('show');
        this.set();
      },
      function(){
        $('#bems-admin-noti-modal-failed').modal('show'); 
      });
    },
  };
});



app.controller('notificationAdminCtrl',function($scope,$interval,notificationAdminServ,notiMsgAdminServ){
  notificationAdminServ.set();
  $scope.noti_data = notificationAdminServ.get();
  console.log($scope.noti_data);

   notiMsgAdminServ.set();
  $scope.notiMsg_data = notiMsgAdminServ.get();
  console.log($scope.notiMsg_data);

  $scope.tabbing = function(bool){$scope.tab = bool;};

  $scope.updateKey = function(subId,subName,subType,subMap,subKey){
    console.log(subId,subName,subType,subMap,subKey);
    notificationAdminServ.put(subId,subName,subType,subMap,subKey);
  };

  $scope.updateMessage = function(msgId,msgName,msgType,msgMessage){
    console.log(msgId,msgName,msgType,msgMessage);
    notiMsgAdminServ.put(msgId,msgName,msgType,msgMessage);
  };

});
