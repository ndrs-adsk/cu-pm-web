app.factory('bookmarkCrudAdminServ',function(restServ){return restServ.getCrud('/users/favorite','ud');});

app.factory('bookmarkAdminServ',function(bookmarkCrudAdminServ,uiServ){
  var result_data = {};
  return {
    put: function(path){
      bookmarkCrudAdminServ.update({path: path},this.set);
    }
  };
});



app.controller('menuCtrl',function($scope,$location,authenServ, $interval,bookmarkAdminServ){
  $scope.user = sessionStorage.getItem("usnm");
  $scope.privilege = $scope.user !== null;
  $scope.power = sessionStorage.getItem('usty') != 3 && sessionStorage.getItem('usty') !== null;
  $scope.super = sessionStorage.getItem('usty') == 1;
  $scope.owner = sessionStorage.getItem('usty') == 2 && sessionStorage.getItem('rid') == '190';
  $scope.active = function(name){
    if($location.path() === name || $location.path().substr(0,6) === name) return true;
    else return false;
  };
  function updateTime() {
    $scope.CurrentDate = new Date();
  }
  updateTime();
  $interval(updateTime, 1000);

  $scope.logout = authenServ.deauthen;
  $scope.userSetting = function() {
    window.location = "#/user";
  };
  var bookmark_link = localStorage.getItem('bookmark');
  if($location.path() == bookmark_link){
    $scope.bmPage = 'samepage';
  }
  else{
    $scope.bmPage = 'notsamepage';
  }
  if(bookmark_link != undefined){
    $scope.bmStatus = 'havelink';
  }

  $scope.bookmark = function() {
    var pathBM = $location.path();
    bookmarkAdminServ.put(pathBM);
    localStorage.setItem('bookmark',pathBM);
    $scope.bmPage = 'samepage';
  };
  $scope.goto_bookmark = function() {
    var BMpath = localStorage.getItem('bookmark');
    window.location = "#"+BMpath;
  };
  
});

app.controller('footerCtrl',function($scope,$location,$window,overviewGetServ){


  $scope.checkDevice = function () {
    if( /iPad/i.test(navigator.userAgent) ) {
     return true;
    }
  };
});