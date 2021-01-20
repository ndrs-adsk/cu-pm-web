app.factory('storageServ',function(){
  var hash = [
    'd00a47f97afcb665f9c189261e36e49a',
    '9dddd5ce1b1375bc497feeb871842d4b',
    '15de21c670ae7c3f6f3f1f37029303c9',
    '9cdfb439c7876e703e307864c9167a15',
    '4eae35f1b35977a00ebd8086c259d4c9'
  ];

  return {
    checkSession: function(){
      var chk;
      return (
        sessionStorage.getItem('pswd') !== null &&
        sessionStorage.getItem('usnm') !== null &&
        sessionStorage.getItem('usid') !== null &&
        sessionStorage.getItem('usty') !== null &&
        sessionStorage.getItem('ustk') !== null
      );
    },
    checkLocal: function(){
      return (
        localStorage.getItem('pswd') !== null &&
        localStorage.getItem('usnm') !== null &&
        localStorage.getItem('usid') !== null &&
        localStorage.getItem('usty') !== null &&
        localStorage.getItem('ustk') !== null
      );
    },
    setSession: function(usnm,usid,usty,token){
      sessionStorage.setItem('pswd',hash[Math.floor(Math.random() * 5 + 1) - 1]);
      sessionStorage.setItem('usnm',usnm);
      sessionStorage.setItem('usid',usid);
      sessionStorage.setItem('usty',usty);
      sessionStorage.setItem('ustk',token);
    },
    setLocal: function(){
      localStorage.setItem('pswd',sessionStorage.getItem('pswd'));
      localStorage.setItem('usnm',sessionStorage.getItem('usnm'));
      localStorage.setItem('usid',sessionStorage.getItem('usid'));
      localStorage.setItem('usty',sessionStorage.getItem('usty'));
      localStorage.setItem('ustk',sessionStorage.getItem('ustk'));
    },
    clears: function(){
      localStorage.clear();
      sessionStorage.clear();
    }
  };
});

app.factory('loginServ',function(restServ){return restServ.getCrud(
  '/security/login/:encrypt',
  {authen: {method: 'GET', params: {encrypt: '@encrypt'}}}
);});
app.factory('checkLogServ',function(restServ){return restServ.getCrud(
  '/security/checkuser/:id/:type',
  {chkLog: {method: 'GET', params: {id: '@id',type: '@type'}}}
);});
app.factory('logoutServ',function(restServ){return restServ.getCrud(
  '/security/logout/:id/:type',
  {deauthen: {method: 'GET', params: {id: '@id',type: '@type'}}}
);});
app.factory('rsaGetServ',function(restServ){return restServ.getCrud('/security/getkey','r');});
app.factory('ownGetServ',function(restServ){return restServ.getCrud('/security/check_room_owner/:id','r');});

app.factory('tokenServ',function($http){
  if(localStorage.getItem('ustk') !== null) {
    $http.defaults.headers.common.token = localStorage.getItem('ustk');
    $http.defaults.headers.post.token = localStorage.getItem('ustk');
    $http.defaults.headers.put.token = localStorage.getItem('ustk');
    $http.defaults.headers.patch.token = localStorage.getItem('ustk');
  }

  return {
    refresh: function(){
      $http.defaults.headers.common.token = localStorage.getItem('ustk');
      $http.defaults.headers.post.token = localStorage.getItem('ustk');
      $http.defaults.headers.put.token = localStorage.getItem('ustk');
      $http.defaults.headers.patch.token = localStorage.getItem('ustk');
    },
    clears: function(){
      delete $http.defaults.headers.common.token;
      delete $http.defaults.headers.post.token;
      delete $http.defaults.headers.put.token;
      delete $http.defaults.headers.patch.token;
    }
  };
});

app.factory('authenServ',function($location,storageServ,loginServ,checkLogServ,logoutServ,rsaGetServ,tokenServ,$routeParams,structureGetAdminServ,ownGetServ){
  var rsa = new RSAKey();
  var key = {};
  var passpharse;

  return {
    setKey: function(usnm,pswd,remember){
      var self = this;

      key = rsaGetServ.get(function(){
        rsa.setPublic(key.pk[0],key.pk[1]);
        passpharse = rsa.encrypt(JSON.stringify({user: usnm, pass: pswd, remember: remember, bsid: key.bsid}));
        self.authen(usnm,pswd,remember);
      });
    },
    get: function(){return result;},
    authen: function(username,password,remember){
      var self = this;
      var authenVar = {};

      authenVar = loginServ.authen({encrypt: passpharse},function(){
        localStorage.setItem('bookmark',authenVar.path);
        if(authenVar.valid) self.authorize(username,remember,authenVar.uid,authenVar.gid,authenVar.token);
        else window.authenFeed = true;
      },function(){window.authenFeed = true;});
    },
    authorize: function(username,remember,id,type,token){
      storageServ.setSession(username,id,type,token);
      storageServ.setLocal();
      tokenServ.refresh();
      var bookmark_link = localStorage.getItem('bookmark');
      if(bookmark_link != undefined){
        window.location = '#'+bookmark_link;
      }
      $location.path('/overview');
    },
    deauthen: function(){
      logoutServ.deauthen({id: sessionStorage.getItem('usid'),type: sessionStorage.getItem('usty')});
      tokenServ.clears();
      storageServ.clears();
      console.log('deauthen');
      $location.path('/overview');
    },
    checkAuthen: function(){
      var chk;
      var room;
      var self = this;
      var reqStruct;
      var blame;

      function seeReq(element,fixId){
        if(fixId == element.id) {
          for(var equipId in element.nodes) { if(element.nodes[equipId].id == $routeParams.node_id){ return 'ok';}}
          return 'not ok';
        }
        else if(element.nodes.length !== 0){
          var res = null;
          for(var nodeId in element.nodes){
            res = seeReq(element.nodes[nodeId],fixId);
          }
          return res;
        }
        return null;
      }

      // if(storageServ.checkLocal()) storageServ.setSession(localStorage.getItem('usnm'),localStorage.getItem('usid'),localStorage.getItem('usty'),localStorage.getItem('ustk'));
      // if(($location.path().substr(0,6) === '/admin') || ($location.path().substr(0,8) === '/control')){
      //   if(!storageServ.checkSession()){
      //     $location.path('/login');
      //   }
      // }   

      if(storageServ.checkSession()){
        chk = checkLogServ.chkLog({id: sessionStorage.getItem('usid'),type: sessionStorage.getItem('usty')})
        .$promise.then(function(data){
          if(!data.valid) {
            $location.path('/login');
          }
          else if($location.path() === '/login') $location.path('/');
          else if(($location.path().substr(0,6) === '/admin' && data.gid !== 1)) $location.path('/');
          else if(data.gid === 2){
            room = ownGetServ.get({id: sessionStorage.getItem('usid')})
            .$promise.then(function(data){
              console.log(data.room_id);
                sessionStorage.setItem('rid',data.room_id);
                if($location.path().substr(0,8) === '/control'){
                  if(data.room_id != 190) $location.path('/');
                }
            });
          }
        });
      } 
      else {
        // if($location.path('/ov'))
        // $location.path('/login');
        if(storageServ.checkLocal()) storageServ.setSession(localStorage.getItem('usnm'),localStorage.getItem('usid'),localStorage.getItem('usty'),localStorage.getItem('ustk'));
        if(($location.path().substr(0,6) === '/admin') || ($location.path().substr(0,8) === '/control')){
          if(!storageServ.checkSession()){
            $location.path('/login');
          }
        }   
      }
    }
  };
});

app.controller('loginCtrl',function($scope,$interval,authenServ){
  $scope.remember = false;
  $scope.invalid = false;
  function toggleInvalid(){ $scope.invalid = !$scope.invalid; }

  $scope.login = function(){
    authenServ.setKey($scope.username,$scope.password,$scope.remember);
    window.authenFeed = false;
    $scope.invalid = false;
    var intervalFeed = $interval(function(){ if(window.authenFeed){
      $scope.invalid = true;
      $interval.cancel(intervalFeed);
    }},500);
    $scope.$on('$destroy',function(){ if(intervalFeed) $interval.cancel(intervalFeed); });
  };
  $scope.keyEnter = function($event){if($event.keyCode === 13) $scope.login();  };
});
