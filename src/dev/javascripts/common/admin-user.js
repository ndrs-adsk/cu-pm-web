app.factory('userGetAdminServ',function(restServ){return restServ.getCrud('/security/users','a');});
app.factory('userCrudAdminServ',function(restServ){return restServ.getCrud('/security/user/:id','crud');});

app.factory('userAdminServ',function(userGetAdminServ,userCrudAdminServ,passCrudServ,uiServ){
  var users = {};
  var newUser = {
    id: -1,
    username: "new_user", password: "1234",
    name: "new user", lastname: "test",
    email: "test@bems.com", group_id: 3,
    facebook_id: ["test"], active: false,
    subscrible: null
  };

  return {
    set: function(){users = userGetAdminServ.getAll(function(){
      uiServ.loader0hide();
      window.dirtyUser = true;
    });},
    get: function(){return users;},
    getNew: function(){return newUser;},
    update: function(fixId,upUser){userCrudAdminServ.update({id: fixId},upUser,function(){$('#bems-admin-user-modal-success').modal('show');});},
    create: function(user){
      var temp = angular.copy(user);
      delete user.id;
      userCrudAdminServ.create(temp,this.set);
    },
    delete: function(fixId){userCrudAdminServ.delete({id: fixId},this.set);},
    confirm: function(){$('#bems-admin-user-modal-delete').modal('show');},
    password: function(user,password){
      var temp = angular.copy(user);
      temp.password = password;
      passCrudServ.update({id: temp.id},temp);
    }
  };
});

app.controller('userAdminCtrl',function($scope,$route,$interval,constServ,userAdminServ,structureAdminServ){
  window.dirtyUser = false;
  userAdminServ.set();
  $scope.users = userAdminServ.get();

  structureAdminServ.set();
  $scope.data = structureAdminServ.get();
  $scope.tOps = {nodeChildren: 'nodes'};

  $scope.userType = [
    {id: 1, name: 'Admin'},
    {id: 2, name: 'Area Owner'},
    {id: 3, name: 'Member'}
  ];

  $scope.adminUpdateUser = function(id,index){
    console.log($scope.users[index]);
    if(
      $scope.users[index].username.length !== 0 &&
      $scope.users[index].name.length !== 0 &&
      $scope.users[index].lastname.length !== 0 &&
      $scope.users[index].email.length !== 0
    ){userAdminServ.update(id,$scope.users[index]);}
    else $('#bems-admin-user-modal-alert').modal('show');
  };

  $scope.delId = 0;
  $scope.delUser = '';
  $scope.newInput = false;

  var intervalUser = $interval(function(){ if(window.dirtyUser) {
    $scope.users = userAdminServ.get();
    window.dirtyUser = false;
  }},500);
  $scope.$on('$destroy',function(){if(intervalUser) $interval.cancel(intervalUser);});
  $scope.preAdminCreateUser = function(){ if(!$scope.users.find(function(x){return x.id == -1;})){
    $scope.users.push(angular.copy(userAdminServ.getNew()));
  }};
  $scope.adminCreateUser = function(user){userAdminServ.create(user);};
  $scope.adminConfirmDelUser = function(fixId,name){
    $scope.delId = fixId;
    $scope.delUser = name;
    userAdminServ.confirm();
  };
  $scope.adminDelUser = function(fixId){userAdminServ.delete(fixId);};
  $scope.adminPopUser = function(){$scope.users.pop();};

  $scope.keyAdminEnter = function($event){if($event.keyCode === 13) $scope.pushFaceId(); };

  $scope.visPswd = false;
  $scope.setPassword = function(fixId){
   $scope.setPasswordId = fixId;
   $('#bems-admin-user-modal-password').modal('show');
 };
 $scope.confirmSetPassword = function(user,pswd){
   $scope.inputNewPSWD = '';
   userAdminServ.password(user,pswd);
 };

 $scope.setOwner = function(fixId){
   $scope.setOwnerId = fixId;
   $('#bems-admin-user-modal-own').modal('show');
 };
});
