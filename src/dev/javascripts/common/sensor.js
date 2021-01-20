app.factory('sensorGetServ',function(restServ){return restServ.getCrud('/profile/user_sensor/:id','w');});

app.factory('sensorServ',function(uiServ,sensorGetServ,chartServ){
  var sensors = {};
  return {
    set: function(){
      var self = this;
      sensors = sensorGetServ.getWith({id: sessionStorage.getItem("usid")},function(){
        for(var run in sensors){ if(angular.isDefined(sensors[run].graph)){
          sensors[run].chart = self.getChart(sensors[run].graph,sensors[run].type.substr(8),sensors[run].node);
        }}
        uiServ.loader0hide();
      });
    },
    get: function(){return sensors;},
    getChart: function(data,type,name){
      var chart = {};
      chart.options = chartServ.getCommon('day',type);
      chart.options.chart.height = 180;
      chart.series = [];
      chart.series.push({zIndex: 1, name: name});
      switch(type){
        //darken('material',10%)
        case 'temperature': chart.series[0].color = '#439a46'; break;
        case 'humidity': chart.series[0].color = '#0286c2'; break;
        case 'illuminance': chart.series[0].color = '#d39e00'; break;
        default: break;
      }
      chart.series[0].data = data;
      chart.xAxis = chartServ.getXAxis('day');
      chart.yAxis = chartServ.getYAxis(type);

      var today = (new Date());
      today.setHours(0,0,0,0);
      var tomorrow = angular.copy(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      chart.xAxis.min = today.getTime();
      chart.xAxis.max = tomorrow.getTime();
      if(data.length > 0){
        var min = data[0]['1'];
        for(var run in data) if(data[run]['1'] < min && data[run]['1'] > 0) min = data[run]['1'];
        chart.yAxis.min = min;
      }
      return chart;
    }
  };
});

app.controller('sensorCtrl',function($scope,sensorServ){
  sensorServ.set();
  $scope.sensors = sensorServ.get();

  $scope.sensorSortType = 'node';
  $scope.sensorSortReverse = false;
  $scope.sensorSorting = function(num){
    if(+num % 2 === 0) $scope.sensorSortReverse = true;
    else $scope.sensorSortReverse = false;
    switch(+num){
      case 3: case 4:
        $scope.sensorSortType = 'type';
        break;
      default:
        $scope.sensorSortType = 'name';
    }
  };

  $scope.getLastVal = function(graph){
    if(graph.length > 0) return graph[graph.length - 1][1];
    else return '-';
  };
  $scope.getLastUnit = function(type){
    switch(type){
      case 'monitor/temperature': return '°C';
      case 'monitor/humidity': return '%';
      case 'monitor/illuminance': return 'lux';
      default: break;
    }
  };
  $scope.getClass = function(type){
    switch(type){
      case 'monitor/temperature': return 'bems-sensor-temperature';
      case 'monitor/humidity': return 'bems-sensor-humidity';
      case 'monitor/illuminance': return 'bems-sensor-illuminance';
      default: break;
    }
  };
  $scope.getImgSrc = function(type){
    switch(type){
      case 'monitor/temperature': return 'svg/temp.svg';
      case 'monitor/humidity': return 'svg/humidity.svg';
      case 'monitor/illuminance': return 'svg/illuminance.svg';
      default: break;
    }
  };
  $scope.pull = function(index){ $scope.sensors.splice(index,1); };
  $scope.getChart = sensorServ.getChart;
});
