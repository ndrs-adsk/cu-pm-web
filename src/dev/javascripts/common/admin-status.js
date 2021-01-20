/******************************************************************************

  POINT ID STATUS

******************************************************************************/
app.factory('pointAdminGetServ',function(restServ){return restServ.getCrud('/structure/pointids','a');});

app.factory('pointAdminServ',function(pointAdminGetServ,constServ,uiServ){
  var pointID = [];

  return {
    toArray: function(ngObj){
      var newArray = [];
      for(var key in ngObj) if(typeof ngObj[key].name === 'string') newArray.push(ngObj[key].name);
      return newArray;
    },
    check: function(pointList){
      var now = new Date();
      var start = new Date(now.getTime()-(15*60*1000));
      var storage = new IEEE1888();

      storage.setURL(constServ.getStorageUrl());
      storage.setKeyAttr("attrName","time");
      storage.setKeyAttr("gt",isoDate(start));
      storage.setKeyAttr("lt",isoDate(now));
      storage.setPointID(pointList);
      storage.setCallbackFunc(response);
      storage.query();
      function response(data){
        var newArray = [];
        for(var run in data){
          if(data[run] === null) newArray.push({name: run,status: false});
          else newArray.push({name: run,status: true});
        }
        window.pointStatus = newArray;
        uiServ.loader0hide();
      }
    },
    set: function(){
      var self = this;
      pointID = pointAdminGetServ.getAll(function(){
        self.check(self.toArray(pointID));
      });
    },
    get: function(){return pointID;}
  };
});
/******************************************************************************

  LOG

******************************************************************************/
app.factory('logAdminGetServ',function(restServ){return restServ.getCrud('/setting/log','a');});
app.factory('logAdminGetInServ',function(restServ){return restServ.getCrud(
  '/setting/log/:start/:end',
  {getIn: {method: 'GET', isArray: true, params: {start: '@start', end: '@end'}}}
);});

app.factory('logAdminServ',function(logAdminGetServ,logAdminGetInServ){
  var logs = [];

  return {
    set: function(){logs = logAdminGetServ.getAll();},
    setIn: function(start,end){logs = logAdminGetInServ.getIn({start: start,end: end},function(){
      window.dirtyLogs = true;
    });},
    get: function(){return logs;}
  };
});
/******************************************************************************

  SYSTEM STATUS

******************************************************************************/
app.controller('systemAdminCtrl',function($scope,$window,$interval,pointAdminServ,logAdminServ){
  $scope.tab = true;
  $scope.tabbing = function(bool){$scope.tab = bool;};

  var now = new Date(new Date().setSeconds(0));
  var dateTime = {
    yearStart:2010,
    yearEnd: 2100,
    format:'Y-m-d H:i:00P',
    startDate: new Date(),
    lang:'en'
  };

  $('#bems-admin-log-start-input').datetimepicker(dateTime);
  $('#bems-admin-log-end-input').datetimepicker(dateTime);

  $scope.startTime = isoDate(new Date(now.getTime()-(24*60*60*1000))).replace('T',' ');
  $scope.endTime = isoDate(now).replace('T',' ');

  pointAdminServ.set();
  $scope.$watch(function(){return $window.pointStatus;},function(n,o){
    $scope.pointStatus = window.pointStatus;
  },true);

  logAdminServ.set();
  $scope.logs = logAdminServ.get();
  $scope.reloadLog = function(start,end){ if(start.length !== 0 && end.length !== 0){
    logAdminServ.setIn(isoDate(new Date(start)),isoDate(new Date(end)));
  }};
  var intervalLog = $interval(function(){ if(window.dirtyLogs){
    window.dirtyLogs = false;
    $scope.logs = logAdminServ.get();
  }},500);
  $scope.$on('$destroy',function(){if(intervalLog) $interval.cancel(intervalLog);});

  $scope.platform = function(str,type){
    var agent = '';
    if(type) agent = str.substring(str.indexOf('(')+1,str.indexOf(';',str.indexOf(';')));
    else agent = str.substring(str.indexOf(';',str.indexOf(';'))+1,str.indexOf(')'));
    return (agent.length !== 0)? agent : ((type)? 'BOT':'');
  };
});
