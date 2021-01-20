app.factory('compareAdminServ',function(pointAdminGetServ,pointAdminServ,chartServ,constServ,uiServ){
  var points = [];
  var graphType = [];

  return {
    set: function(){points = pointAdminGetServ.getAll(function(){uiServ.loader0hide();});},
    get: function(){return points;},
    checkType: function(nnew,old){
      for(var run in old) if(old[run] === nnew) return true;
      return false;
    },
    setAxis: function(yType){
      var temp = [];
      for(var key in yType) if(!this.checkType(yType[key],temp)) temp.push(yType[key]);
      return temp;
    },
    setType: function(comparePoints){
      var temp = [];
      for(var run in comparePoints) temp.push(comparePoints[run].type.substr(8));
      return temp;
    },
    setColor: function(name,list){
      for(var cr in list) if(list[cr].name == name) return list[cr].color;
      return '#FFF';
    },
    setGG: function(){

    },
    compare: function(start,end,list){
      var self = this;
      var storage = new IEEE1888();
      var pointList = [];
      for(var run in list) pointList.push(list[run].url);
      this.setType(list);

      storage.setURL(constServ.getStorageUrl());
      storage.setKeyAttr("attrName","time");
      storage.setKeyAttr("gt",isoDate(new Date(start)));
      storage.setKeyAttr("lt",isoDate(new Date(end)));
      storage.setPointID(pointAdminServ.toArray(list));
      storage.setCallbackFunc(response);
      storage.query();
      function response(data){
        var series = [];
        var datum = [];
        var axisNum = 0;
        var chart = chartServ.getCommon();
        var yType = self.setType(list);
        var yTypeAxis = self.setAxis(yType);

        chart.chart.zoomType = 'x';
        chart.chart.type = window.compareType;
        chart.plotOptions.column.borderWidth = 0.01;
        chart.series = [];
        chart.yAxis = [];

        var syncI = 0;
        for(var run1 in data){ if(data[run1] !== null){
          datum = [];
          axisNum = 0;
          if(yType[syncI] == 'power') for(var run2 in data[run1].time) datum.push([Date.parse(data[run1].time[run2]),parseFloat(data[run1].value[run2]/1000)]);
          else for(var run3 in data[run1].time) datum.push([Date.parse(data[run1].time[run3]),parseFloat(data[run1].value[run3])]);
          for(var run4 in yTypeAxis) if(yTypeAxis[run4] === yType[syncI]) axisNum = parseInt(run4);
          chart.series.push({name: yType[syncI++]+" : "+run1, data: datum, yAxis: axisNum, color: self.setColor(run1,list)});
        }}
        for(var i = 0;i<yTypeAxis.length;i++) chart.yAxis.push(chartServ.getYAxis(yTypeAxis[i],(i % 2 !==0)));
        chart.exporting.enabled = true;
        window.compareChart = angular.copy(chart);
        window.compareTempChart = angular.copy(chart);
        $('#bems-search-graph').highcharts(window.compareChart);
      }
    },
    changeType: function(type){
      window.compareType = type;
      if(window.compareChart !== undefined){
        window.compareChart.chart.type = type;
        window.compareTempChart.chart.type = type;
        $('#bems-search-graph').highcharts(window.compareChart);
      }
    },
    changeGap: function(gap){
      window.chartGap = gap;
      if(window.compareChart !== undefined){
        for(var run1 in window.compareTempChart.series) window.compareTempChart.series[run1].dataGrouping = chartServ.getGroupping(gap);
        for(var run2 in window.compareChart.series) window.compareChart.series[run2].dataGrouping = chartServ.getGroupping(gap);
        $('#bems-search-graph').highcharts(window.compareChart);
      }
    },
    swapGraph: function(all){
      window.compareChart = angular.copy(window.compareTempChart);
      var temp = angular.copy(all);
      for(var i = temp.length - 1;i > -1;i--) if(!(temp[i].show)) window.compareChart.series.splice(i,1);
      $('#bems-search-graph').highcharts(window.compareChart);
    },
    removeGraph: function(all){
      var temp = angular.copy(all);
      for(var i = temp.length - 1;i > -1;i--) if(!(temp[i].alt)) window.compareTempChart.series.splice(i,1);
      for(var j = temp.length - 1;j > -1;j--) if(!(temp[j].alt)) window.compareChart.series.splice(j,1);
      $('#bems-search-graph').highcharts(window.compareChart);
    }
  };
});

app.controller('compareAdminCtrl',function($scope,compareAdminServ,constServ){
  var colorR = 0;
  var genChk = false;
  var now = new Date(new Date().setSeconds(0));

  var dateTime = {
    yearStart:2010,
    yearEnd: 2100,
    format:'Y-m-d H:i:00P',
    startDate: new Date(),
    lang:'en'
  };

  $('#bems-search-date-start').datetimepicker(dateTime);
  $('#bems-search-date-end').datetimepicker(dateTime);

  $scope.searchStart = isoDate(new Date(now.getTime()-(24*60*60*1000))).replace('T',' ');
   $scope.searchEnd = isoDate(now).replace('T',' ');


  window.chartType = 'line';
  window.chartGap = 1;

  $scope.chartType = true;
  $scope.typeTabbing = function(bool,type){
    $scope.chartType = bool;
    compareAdminServ.changeType(type);
  };
  $scope.chartGap = true;
  $scope.gapTabbing = function(bool,val){
    $scope.chartGap = bool;
    compareAdminServ.changeGap(val);
  };
  $scope.searchInput = '';

  compareAdminServ.set();
  $scope.points = compareAdminServ.get();

  $scope.comparePoints = [];

  var chk = true;
  $scope.addComparePoint = function(name,type){
    for(var run in $scope.comparePoints) if(name === $scope.comparePoints[run].name) chk = false;
    if(chk) {
      $scope.comparePoints.push({name: name,type: type,show: true, alt: true, color: constServ.getSColor((colorR))});
      if(colorR == 15) colorR = 0;
      else colorR++;
    }
    chk = true;
    $scope.searchInput = '';

    if($scope.showGraph) $scope.genGraph();
  };
  $scope.removeComparePoint = function(index){
    $scope.comparePoints[index].alt = false;
    if(genChk) compareAdminServ.removeGraph($scope.comparePoints);
    $scope.comparePoints.splice(index,1);
  };
  $scope.pointTabbing = function(index,bool){
    $scope.comparePoints[index].show = bool;
    compareAdminServ.swapGraph($scope.comparePoints);
  };

  $scope.showGraph = false;
  $scope.showButton = function(){return ($scope.comparePoints.length !== 0 && $scope.searchStart.length !== 0 && $scope.searchStart.length !== 0);};
  $scope.genGraph = function(){
    for(var runShow in $scope.comparePoints) if($scope.comparePoints[runShow].name) $scope.comparePoints[runShow].show = true;
    genChk = true;
    $scope.chartGap = true;
    $scope.showGraph = true;
    compareAdminServ.compare($scope.searchStart,$scope.searchEnd,$scope.comparePoints);
  };
});
