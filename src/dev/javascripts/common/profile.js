app.factory('profileGetServ',function(restServ){return restServ.getCrud(
  '/profile/display/:range/:type',
  {getPro: {method: 'GET',isArray: true,params: { range: '@range', type: '@type'}}}
);});

app.factory('profileServ',function(chartServ,constServ,profileGetServ,uiServ){
  var demands = {};

  return {
    set: function(range,type){
      var self = this;
      var inRange = range;
      var inType = type;

      demands = profileGetServ.getPro({range: inRange,type: inType},
        function(){
          for(var run in demands){ if(angular.isDefined(demands[run].graph)){
            if(inRange === 'year') demands[run].chart = self.getChartYear(demands[run].graph,inRange,inType);
            else demands[run].chart = self.getChart(demands[run].graph,inRange,inType,demands[run].quota.pw,demands[run].display_name,demands[run].is_supply);
          }}
          uiServ.loader0hide();
        }
      );
    },
    get: function(){return demands;},
    getCompare: function(type){
      var compareAry = [];
      function pushCompare(key,type){
        if(demands[key].hasOwnProperty('display_name')){
          var temp = {name: demands[key].display_name};
          if(type == 'energy') {
            temp.y = +demands[key].energy;
            temp.unit = 'kWh';
          }
          else if(type == 'peak') {
            temp.y = demands[key].peak;
            temp.unit = 'kW';
          }
          else {
            temp.y = +demands[key].bill;
            temp.unit = 'baht';
          }
          compareAry.push(temp);
        }
      }
      for(var key in demands) if(demands[key].compare) pushCompare(key,type);
      if(compareAry.length === 0) for(var run in demands) pushCompare(run,type);
      return compareAry;
    },
    getClass: function(quota,value,gap){
      if(gap !== 'year'){
        if(value > quota.red) return 'alert-value';
        else if(value > quota.yellow) return 'warning-value';
        else return 'normal-value';
      }
    },
    getChartYear: function(data,gap,last,quota,name,isis){
      if(isis) window.isSupply = true;
      var chart = {};
      chart.options = chartServ.getCommon(gap,last);
      chart.options.chart.height = 180;
      // chart.series = [];
      chart.series = [

        {
          type: 'column',
          name: 'last year',
          data: data.old
        },
        {
          type: 'column',
          name: 'this year',
          data: data.now
        }
      ];
      
      chart.xAxis = chartServ.getXAxis(gap);
      chart.yAxis = chartServ.getYAxis(last);
      // chart.series.push({type: 'column', zIndex: 1, name: name});
      // chart.series[0].data = data.now;
      return chart;
    },
    getChart: function(data,gap,last,quota,name,isis){
      if(isis) window.isSupply = true;
      var chart = {};
      chart.options = chartServ.getCommon(gap,last);
      chart.options.chart.height = 180;
      chart.series = [];
      chart.series.push({type: 'column', zIndex: 1, name: name});
      chart.series[0].data = data;
      chart.xAxis = chartServ.getXAxis(gap);
      chart.yAxis = chartServ.getYAxis(last);
      if(gap !== 'month' && gap !== 'year' && last === 'peak' && !isis){
        chart.yAxis.plotLines = [];
        chart.yAxis.plotLines[0] = chartServ.getPlotLine('Alert',quota.red,constServ.getColor('red'));
        chart.yAxis.plotLines[1] = chartServ.getPlotLine('Warning',quota.yellow,constServ.getColor('yellow'));
      }
      return chart;
    },
    pullPie: function(id){for(var key in demands) if(demands[key].id === id) demands.splice(key,1);}
  };
});

app.controller('profileCtrl',function($scope,$window,$timeout,chartServ,profileServ,uiServ,$location){
  $scope.supply = false;
  function getProfile(){
    uiServ.loader0show();
    profileServ.set($scope.profileGap,$scope.lastType);
    $scope.demands = profileServ.get();
    console.log($scope.demands);
  }
  $scope.user = sessionStorage.getItem("usnm");
  $scope.privilege = $scope.user !== null;
  $scope.power = sessionStorage.getItem('usty') != 3 && sessionStorage.getItem('usty') !== null;
  $scope.super = sessionStorage.getItem('usty') == 1;
  $scope.active = function(name){
    if($location.path() === name || $location.path().substr(0,6) === name) return true;
    else return false;
  };

  $scope.profileSortType = 'name';
  $scope.profileSortReverse = false;
  $scope.$watch(function(){return $window.isSupply;},function(n,o){
    $scope.supply = window.isSupply;
    var t = $timeout(function(){$scope.supply = window.isSupply;},500);
  },true);

  $scope.profileSorting = function(num){
    if(+num % 2 === 0) $scope.profileSortReverse = true;
    else $scope.profileSortReverse = false;
    switch(+num){
      case 3: case 4:
        $scope.profileSortType = 'energy';
        break;
      case 5: case 6:
        $scope.profileSortType = 'power';
        break;
      case 7: case 8:
        $scope.profileSortType = 'peak';
        break;
      case 9: case 10:
        $scope.profileSortType = 'bill';
        break;
      default:
        $scope.profileSortType = 'name';
    }
  };
  $scope.profileGap = "default";
  $scope.gapTabbing = function(range){
    $scope.profileGap = range;
    getProfile();
    $scope.profilePie = false;
  };
  $scope.profileType = "peak";
  $scope.lastType = "peak";
  $scope.typeTabbing = function(type){
    $scope.profileType = type;
    if(type !== 'bill') {
      $scope.lastType = type;
      getProfile();
    }
    $scope.profilePie = false;
  };

  getProfile();
  $scope.profilePie = false;
  $scope.pieData = {};

  $scope.getChart = profileServ.getChart;
  $scope.getPie = function(){
    chkPie = true;
    $scope.pieData = chartServ.getPie4(profileServ.getCompare($scope.profileType));
    $scope.profilePie = true;

    
  };
  $scope.reFlowPie =function() {
    if($scope.profilePie == true){
      $timeout(function () {
        console.log($scope.profilePie);
        $('#bems-profile-pie-chart').highcharts().reflow();
      }, 1000);
    }
  };
  $scope.getClass = profileServ.getClass;

  $scope.pulledPie = [];
  $scope.pullPie = function(id){
    $scope.pulledPie.push(id);
    profileServ.pullPie(id);
  };
  
  $scope.redirectProfile = function(proMapId,proMapLv){
    console.log(proMapId,proMapLv);
    if(proMapLv =="floor"){
      window.location = "#/floor/section/2/"+proMapId;
    }
    else if(proMapLv =="area"){
      window.location = "#/area/"+proMapId;
    }
  };


  $scope.isPulled = function(id,supply,bool){return !$scope.pulledPie.includes(id) && (supply == bool);};

  $scope.getTooltipTextEN = function(index){return 'Warning Level : '+$scope.demands[index].quota.en.yellow+' kWh\nAlert Level : '+$scope.demands[index].quota.en.red+' kWh';};
  $scope.getTooltipTextPW = function(index){return 'Warning Level : '+$scope.demands[index].quota.pw.yellow+' kW\nAlert Level : '+$scope.demands[index].quota.pw.red+' kW';};
});
