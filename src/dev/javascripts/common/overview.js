app.factory('overviewGetServ',function(restServ){return restServ.getCrud('/profile/overview_profile','r');});

app.factory('overviewServ',function(overviewGetServ,constServ,chartServ,uiServ){
  var overview = {};
  return {
    set: function() {
      var self = this;
      overview = overviewGetServ.get(function(){
        // console.log(overview.quota);
        // console.log(overview.quota.en);
        // console.log(overview.quota.pw);
        $('#Overview-chart-consumption').highcharts(self.getChart(overview.graph,overview.quota.pw));
        $('#Overview-chart').highcharts(self.getChart(overview.graph,overview.quota.pw));
        window.energyQuota = angular.copy(overview.quota.en);
        uiServ.loader0hide();
      });
    },
    get: function(){return overview;},
    getEnergyPercent: function(emonth,etotal,ered,eyellow){
      var temp = emonth/etotal * 100;
      if(emonth > ered){
        $(".bems-overview-percent").css("background-color",constServ.getColor('red'));
        if(temp > 100) return 100;
      }
      else if(emonth > eyellow) $(".bems-overview-percent").css("background-color",constServ.getColor('yellow'));
      return temp;
    },
    getChart: function(data,quota){
      var chart = chartServ.getCommon('day','power');
      chart.chart.height = 180;
      chart.series = [
        {
          type: 'column',
          name: 'today',
          data: data.today,
          zIndex: 1
        },
        {
          type: 'column',
          name: 'yesterday',
          data: data.yesterday
        },
        {
          type: 'line',
          name: 'yesterday',
          data: data.yesterday,
          color: "rgba(171, 168, 168, 0.5)",
          zIndex: 9999
        },
      ];
      chart.tooltip = {
        pointFormat: '<b>{series.name}</b> : {point.y:.2f} kW<br>',
        shared: true
      };
      chart.plotOptions.column.stacking = null;
      chart.plotOptions.column.grouping = false;
      chart.yAxis.plotLines = [];
      chart.yAxis.plotLines[0] = chartServ.getPlotLine('Alert',quota.red,constServ.getColor('red'));
      chart.yAxis.plotLines[1] = chartServ.getPlotLine('Warning',quota.yellow,constServ.getColor('yellow'));
      return chart;
    }
  };
});

app.controller('overviewCtrl',function($scope,$interval,constServ,overviewServ,uiServ){
  $scope.date = constServ.getMonth((new Date()).getMonth())+' '+(new Date()).getDate()+', '+(new Date()).getFullYear();

  Highcharts.setOptions({global: {useUTC: false}});

  function fetchOverview(){
    overviewServ.set();
    $scope.overview = overviewServ.get();
    uiServ.loader0hide();
  }
  $scope.getChart = function(data,quota){$("#bems-overview-grah").highcharts().reflow();};
  $scope.getEnergyPercent = overviewServ.getEnergyPercent;
  fetchOverview();
  var intervalOverview = $interval(fetchOverview,60 * 1000);
  $scope.$on('$destroy',function(){if(intervalOverview) $interval.cancel(intervalOverview);});
});
