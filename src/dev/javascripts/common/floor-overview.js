app.factory('floorOverviewGetServ',function(restServ){ return restServ.getCrud('/building/:id/floors_usage/default/peak','w'); });

app.factory('floorOverviewServ',function(floorOverviewGetServ,structureCrudAdminServ,uiServ,constServ,chartServ){
  var floorList = [];
  var nowNode = {};

  return {
    set: function(){
      var self = this;

      floorList = floorOverviewGetServ.getWith({id: 1},function(){
        console.log(floorList);
        var bld_id = sessionStorage.getItem('bld_id');
        var energyTotal = 0;
        var bld_temp = {};

        for(var run in floorList){ if(angular.isDefined(floorList[run].graph)){
          floorList[run].chart = self.getChart(floorList[run].graph,floorList[run].quota.pw,floorList[run].name);
          floorList[run].bld_id = bld_id;
          energyTotal += parseFloat(floorList[run].energy);
        }}
        var bldPie = chartServ.getPie2(self.getCompare());
        bldPie.chart.height = 400;
        bldPie.subtitle.text = energyTotal.toFixed(2)+' kWh';
        bld_temp = structureCrudAdminServ.get({id: bld_id},function(){
          bldPie.title.text = bld_temp.name;
          $('#bems-floor-overview-donut').highcharts(bldPie);
          uiServ.loader0hide();
        });
      });
    },
    setName: function(){nowNode = structureCrudAdminServ.get({id: fixId});},
    get: function(){return floorList;},
    getName: function(){return nowNode;},
    getChart: function(data,quota,name){
      var chart = {};
      chart.options = chartServ.getCommon('day','power');
      chart.options.chart.height = 180;
      chart.series = [{type: 'column',name: name,data: data,zIndex: 1}];

      chart.xAxis = chartServ.getXAxis('day');
      chart.yAxis = chartServ.getYAxis('power');

      var today = (new Date());
      today.setHours(0,0,0,0);
      var tomorrow = angular.copy(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      chart.xAxis.min = today.getTime();
      chart.xAxis.max = tomorrow.getTime();

      chart.yAxis.plotLines = [];
      chart.yAxis.plotLines[0] = chartServ.getPlotLine('Alert',quota.red,constServ.getColor('red'));
      chart.yAxis.plotLines[1] = chartServ.getPlotLine('Warning',quota.yellow,constServ.getColor('yellow'));
      return chart;
    },
    getCompare: function(){
      var compareAry = [];

      function pushCompare(key){
        if(floorList[key].hasOwnProperty('name')){
          var temp = {name: floorList[key].name};

          temp.y = floorList[key].energy;
          temp.unit = 'kWh';

          compareAry.push(temp);
        }
      }

      for(var run in floorList) pushCompare(run);
      return compareAry;
    },
    getEnergyPercent: function(emonth,etotal,ered,eyellow){
      var temp = emonth/etotal * 100;
      if(emonth > ered){
        $(".bems-floor-overview-percent").css("background-color",constServ.getColor('red'));
        if(temp > 100) return 100;
      }
      else if(emonth > eyellow) $(".bems-floor-overview-percent").css("background-color",constServ.getColor('yellow'));
      return temp;
    },
    getNow: function(){
      var now = (new Date()).getDate()+' '+constServ.getMonth((new Date()).getMonth())+' '+(new Date()).getFullYear()+' | ';
      if((new Date()).getHours()<10) now+='0';
      now+=((new Date()).getHours()+':');
      if((new Date()).getMinutes()<10) now+='0';
      now+=(new Date()).getMinutes();
      return now;
    }
  };
});

app.controller('floorOverviewCtrl',function($scope,floorOverviewServ,structureAdminServ,chartServ){
  floorOverviewServ.set();
  $scope.floorList = floorOverviewServ.get();

  $scope.bld = structureAdminServ.getOne(sessionStorage.getItem('bld_id'));

  $scope.date = floorOverviewServ.getNow();
  $scope.getEnergyPercent = floorOverviewServ.getEnergyPercent;
});
