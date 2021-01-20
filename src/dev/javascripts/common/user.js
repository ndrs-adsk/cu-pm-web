app.factory('userCrudServ',function(restServ){return restServ.getCrud('/security/user/:id','ru');});
app.factory('passCrudServ',function(restServ){return restServ.getCrud('/security/pass/:id','u');});

app.factory("userServ",function(userCrudServ,uiServ,passCrudServ,loginServ,rsaGetServ){
  var self = this;
  var user = {};

  var rsa = new RSAKey();
  var key = {};
  var passpharse;

  return {
    set: function(){user = userCrudServ.get({id: sessionStorage.getItem('usid')},function(){
      user.facebook = [];
      for(var run in user.facebook_id) user.facebook.push({id: user.facebook_id[run]});
      uiServ.loader0hide();
    });},
    get: function(){return user;},
    update: function(uUser){userCrudServ.update({id: sessionStorage.getItem('usid')},uUser,$('#bems-user-modal').modal('show'));},
    setKey: function(opswd,npswd,callback){
      var self = this;

      key = rsaGetServ.get(function(){
        rsa.setPublic(key.pk[0],key.pk[1]);
        passpharse = rsa.encrypt(JSON.stringify({user: sessionStorage.getItem('usnm'), pass: opswd, remember: false, bsid: key.bsid}));
        self.password(npswd,callback);
      });
    },
    password: function(npswd,callback){
      var self = this;
      var authenVar = {};

      authenVar = loginServ.authen({encrypt: passpharse},function(){
        if(authenVar.valid){
          user.password = npswd;
          passCrudServ.update({id: sessionStorage.getItem('usid')},user,callback(true));
        }
        else callback(false);
      });
    },
  };
});

app.controller('userCtrl',function($scope,userServ){
  $scope.userTab = true;
  $scope.tabbing = function(bool){
    $scope.userTab = bool;
    $scope.passMatch = {match: true,ok: false,min: true};
    $scope.opswd = '';
    $scope.npswd = '';
    $scope.cpswd = '';
  };

  $scope.faceIdNew = '';

  userServ.set();
  $scope.user = userServ.get();
  $scope.updateUser = function(){
    var temp = [];
    for(var run in $scope.user.facebook) temp.push($scope.user.facebook[run].id);
    $scope.user.facebook_id = angular.copy(temp);
    userServ.update($scope.user);
  };

  function boolMatch(bool){
    $scope.passMatch.match = bool;
    $scope.passMatch.ok = bool;
  }

  $scope.passwordFill = function(){
    if($scope.opswd.length !== 0 && $scope.npswd.length !== 0 && $scope.cpswd.length !== 0 && $scope.npswd.length >= 6){
      if($scope.npswd == $scope.cpswd) boolMatch(true);
      else boolMatch(false);
    }
    else $scope.passMatch.ok = false;
  };

  function callbackPassword(result){
    $scope.passMatch.alert = true;
    if(result) $scope.passMatch.msg = true;
    else $scope.passMatch.msg = false;
    $('#bems-user-modal-password').modal('show');
  }

  $scope.updatePassword = function(oldp,newp){userServ.setKey(oldp,newp,callbackPassword);};

  function checkId(){
    for(var run in $scope.user.facebook) if($scope.user.facebook[run].id === $scope.faceIdNew) return true;
    if($scope.faceIdNew.length > 0) return false;
    else return true;
  }
  $scope.pushFaceId = function(){ if(!checkId()){
    $scope.user.facebook.push({id: $scope.faceIdNew});
    $scope.faceIdNew = '';
  }};
  $scope.keyEnter = function($event){if($event.keyCode === 13) $scope.pushFaceId(); };
  $scope.popFaceId = function(index){ $scope.user.facebook.splice(index,1); };
});
