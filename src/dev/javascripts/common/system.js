// app.factory('systemGetServ',function(restServ){return restServ.getCrud('/system_overview/energy_usage','x');});
app.factory('systemGetRankingRealtimeServ',function(restServ){return restServ.getCrud('/system_overview/ranking/realtime','a');});
app.factory('systemGetRankingDailyServ',function(restServ){return restServ.getCrud('/system_overview/ranking/board','a');});
app.factory('systemGetRankingLastmonthServ',function(restServ){return restServ.getCrud('/system_overview/ranking/lastmonth','x');});
app.factory('systemGetEnergyUsageServ',function(restServ){return restServ.getCrud('/system_overview/energy_usage','a');});


app.factory('systemRankingRealtimeServ',function(systemGetRankingRealtimeServ,uiServ,constServ){
  var result_data = {};
  return {
    set: function(){result_data = systemGetRankingRealtimeServ.getAll(function(){
      window.dirtyRanking = true;
      uiServ.loader0hide();
    });},
    get: function(){
      return result_data;},
  };
});

app.factory('systemRankingDailyServ',function(systemGetRankingDailyServ,uiServ,constServ){
  var result_data_daily = {};
  return {
    set: function(){result_data_daily = systemGetRankingDailyServ.getAll(function(){
      window.dirtyRanking = true;
      uiServ.loader0hide();
    });},
    get: function(){
      return result_data_daily;},
  };
});

app.factory('systemRankingLastmonthServ',function(systemGetRankingLastmonthServ,uiServ,constServ){
  var lastmonth_data = {};
  return {
    set: function(){lastmonth_data = systemGetRankingLastmonthServ.just(function(){
      window.dirtyRanking = true;
      console.log(lastmonth_data);
      uiServ.loader0hide();
    });},
    get: function(){
      return lastmonth_data;},
  };
});

// app.factory('systemServ',function(systemGetServ,uiServ,constServ){
//   var demands = [];

//   return {
//     set: function(){
//       var self = this;
//       var points;

//       points = systemGetServ.just(function(){
//         demands = [];
//         for(var run in points){ if(typeof points[run].name !== 'undefined'){
//           var temp = {name: points[run].name};
//           for(var run2 in points[run].nodes) temp[points[run].nodes[run2].name] = points[run].nodes[run2].power / 1000;
//           demands.push(temp);
//         }}
//       });
//     },
//     get: function(){
//       return demands;
//     }
//   };
// });


app.factory('systemEnergyUsageServ',function(systemGetEnergyUsageServ,uiServ,constServ){
  var usage_data = {};
  return {
    set: function(){usage_data = systemGetEnergyUsageServ.getAll(function(){
        var max_energy = 0;
        var max_power = 0;
        for(var i in usage_data){
          if( i < 7){
            if( usage_data[i].energy >=max_energy){
              max_energy = usage_data[i].energy;
            }if( usage_data[i].power >=max_power){
              max_power = usage_data[i].power;
            }
          }
        }
        console.log(max_power,max_energy);
        for(var v in usage_data){
          if( v < 7){
            var energy_width = (100*usage_data[v].energy)/max_energy;
            var power_width = (100*usage_data[v].power)/max_power;
            usage_data[v].power_width = power_width;
            usage_data[v].energy_width = energy_width;
          }
        }
      window.dirtyRanking = true;
      uiServ.loader0hide();
    });},
    get: function(){
      return usage_data;},
  };
});


app.controller('systemCtrl',function($scope,$timeout,$interval,systemRankingRealtimeServ,systemEnergyUsageServ,systemRankingLastmonthServ,systemRankingDailyServ){
  $scope.fetchSystem = function(){
    // systemServ.set();
    // $scope.demands = systemServ.get();
    systemRankingRealtimeServ.set();
    $scope.ranking = systemRankingRealtimeServ.get();
    systemEnergyUsageServ.set();
    $scope.usage = systemEnergyUsageServ.get();
    systemRankingLastmonthServ.set();
    $scope.lastmonth = systemRankingLastmonthServ.get();
    systemRankingDailyServ.set();
    $scope.daily = systemRankingDailyServ.get();
    console.log($scope.ranking);
    console.log($scope.daily);

    // $timeout($scope.fetchSystem,60000);
  };
  $scope.fetchSystem();
  $timeout(function(){$scope.showName = "daily";},30000);
  var internalSystem = $interval($scope.fetchSystem,60 * 1000);
  $scope.$on('$destroy',function(){if(internalSystem) $interval.cancel(internalSystem);});

  $scope.sumPoint = function(demand){
    var sum = 0;
    sum += demand.aircon;
    sum += demand.light;
    sum += demand.outlet;
    return (sum > 1000)?(sum/1000).toFixed(2)+' MW':sum.toFixed(2)+' kW';
  };
  $scope.sumMEA = function(){
    var sum = 0;
    for(var run in $scope.demands){
      sum += $scope.demands[run].aircon;
      sum += $scope.demands[run].light;
      sum += $scope.demands[run].outlet;
    }
    return (sum > 1000)?(sum/1000).toFixed(2)+' MW':sum.toFixed(2)+' kW';
  };
  $scope.digit = function(src){
    src = parseFloat(src);
    src = Math.abs(src);
    if(src != undefined){
      return src.toFixed(2);
    }
  };
  $scope.showData = "energy";
  $scope.showMonth = function() {
    
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth(); //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10){dd = '0'+dd;} 
    if(mm<10){mm = '0'+mm;} 
    today = mm + '/' + dd + '/' + yyyy;
    var objDate = new Date(today),
    locale = "en-us",
    month = objDate.toLocaleString(locale, { month: "long" });
    return month ;
  
  };
  $scope.showRealPerf = function() {

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10){dd = '0'+dd;} 
    if(mm<10){mm = '0'+mm;} 
    today = mm + '/' + dd + '/' + yyyy;
    var objDate = new Date(today),
    locale = "en-us",
    month = objDate.toLocaleString(locale, { month: "short" });
    if(dd == 1){
      return"Best Performance award";
    }
    else if(dd == 2){
      return"Best Performance award [1 "+ month+"]";
    }
    else if(dd > 2){
      return "Best Performance award [1 "+ month + " - Now]";
    }
    // else 
  };

  $scope.showDailyPerf = function() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10){dd = '0'+dd;} 
    if(mm<10){mm = '0'+mm;} 
    today = mm + '/' + dd + '/' + yyyy;
    var objDate = new Date(today),
    locale = "en-us",
    month = objDate.toLocaleString(locale, { month: "short" });

    if(dd == 1){
      return"Best Performance award";
    }
    else if(dd == 2){
      return"Best Performance award [1 "+ month+"]";
    }
    else if(dd > 2){
      return "Best Performance award [1 "+ month + " - Yesterday]";
    }
    
  };

  $scope.showName = "daily";

  $scope.checkView = function(){
    $timeout(function(){$scope.showName = "daily";},30000);
  };


});
