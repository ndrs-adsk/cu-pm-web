app.factory('floorsGetServ',function(restServ){return restServ.getCrud(
  '/floor/:floor_id/floor_usage/:range/peak',
  {getWith: {method: 'GET', params: {floor_id: '@floor_id', range: '@range'}}}
);});
app.factory('floorsLoadGetServ',function(restServ){return restServ.getCrud(
  '/floor/:floor_id/devices_usage/:range',
  {getWith: {method: 'GET', params: {floor_id: '@floor_id', range: '@range'}}}
);});
app.factory('zoneListServ',function(restServ){return restServ.getCrud('/floor/:id/rooms','w');});
app.factory('zoneGetServ',function(restServ){return restServ.getCrud(
  '/floor/:floor_id/rooms_usage/:range/energy',
  {getAllWith: {method: 'GET', isArray: true, params: {floor_id: '@floor_id', range: '@range'}}}
);});
app.factory('MeanGetServ',function(restServ){return restServ.getCrud('/room/room_type','a');});

app.factory('floorsServ',function(floorsGetServ,floorsLoadGetServ,zoneListServ,zoneGetServ,MeanGetServ,uiServ,chartServ,constServ,structureCrudAdminServ){
  var floor = {};
  var area = {};
  var load = {};
  var zones = {};
  var means = {};

  return {
    set: function(zone,period,chk){
      var self = this;

      floor = floorsGetServ.getWith({floor_id: sessionStorage.getItem('floor_id'),range: period},function(){
        if(zone === 'all') {
          if(period === 'day') self.setGraph(period,floor.name,floor.graph,floor.quota.pw);
          else self.setGraph(period,floor.name,floor.graph);
        }
        uiServ.loader0hide();
      });
      area = zoneGetServ.getAllWith({floor_id: sessionStorage.getItem('floor_id'),range: period},function(){
        var floor_temp = {};
        if(chk){
          var areaUsage = [];
          var areaTotal = 0;
          for(var run in area){ if(area[run].hasOwnProperty('energy')) {
            if (area[run].name != 'PRM Headquater' && area[run].name != 'PV'){
              areaUsage.push({name: area[run].name, y: area[run].energy,unit: 'kWh'});
              areaTotal += parseFloat(area[run].energy);
            }
          }}
          var area_temp = angular.copy(chartServ.getPie3(areaUsage));
          area_temp.plotOptions.pie.dataLabels.distance = 5;
          area_temp.title.y = -50;
          area_temp.title.style.fontSize = '1.1em';
          area_temp.subtitle.text = areaTotal.toFixed(2)+' kWh';
          area_temp.subtitle.y = -25;

          floor_temp = structureCrudAdminServ.get({id: sessionStorage.getItem('floor_id')},function(){
            area_temp.title.text = floor_temp.name;
            $('#bems-floor-section-area-usage').highcharts(area_temp);
            uiServ.loader0hide();
          });
        }

        if(zone !== 'all') {
          if(period === 'day') self.setGraph(period,area[zone].name,area[zone].graph,area[zone].quota.pw);
          else self.setGraph(period,area[zone].name,area[zone].graph);
        }
      });
    },
    setLoad: function(period){
      load = floorsLoadGetServ.getWith({floor_id: sessionStorage.getItem('floor_id'),range: period},function(){
        var floor_temp = {};
        var load_temp = angular.copy(chartServ.getPie3([
          {name: 'A/C',y: load.aircon.energy,unit: 'kWh'},
          {name: 'Light',y: load.light.energy,unit: 'kWh'},
          {name: 'Outlet',y: load.outlet.energy,unit: 'kWh'}
        ]));
        load_temp.plotOptions.pie.dataLabels.distance = 5;
        load_temp.title.y = -20;
        load_temp.title.style.fontSize = '1.5em';
        load_temp.subtitle.text = (parseFloat(load.aircon.energy)+parseFloat(load.light.energy)+parseFloat(load.outlet.energy)).toFixed(2)+' kWh';
        load_temp.subtitle.y = 5;

        floor_temp = structureCrudAdminServ.get({id: sessionStorage.getItem('floor_id')},function(){
          load_temp.title.text = floor_temp.name;
          $('#bems-floor-section-load-usage').highcharts(load_temp);
          uiServ.loader0hide();
        });
      });
    },
    setZone: function(){zones = zoneListServ.getWith({id : sessionStorage.getItem('floor_id')});},
    setMean: function(){means = MeanGetServ.getAll();},
    setGraph: function(cPeriod,cName,cGraph,cQuota){
      var chart = angular.copy(chartServ.getCommon(cPeriod,'power'));
      function setTitle(period,name){
        var temp = 'Area : '+name+' | ';
        temp += (period == 'day')?'Daily':((period == 'month')?'Monthly':'Yearly');
        temp += ' Consumption';
        return {text: temp};
      }
      chart.title = setTitle(cPeriod,cName);
      chart.series[0] = {
        name: cName,
        data: cGraph,
        type: 'column'
      };
      chart.chart.height = 300;
      if(typeof cQuota !== 'undefined'){
        chart.yAxis.plotLines = [];
        chart.yAxis.plotLines[0] = chartServ.getPlotLine('Alert',cQuota.red,constServ.getColor('red'));
        chart.yAxis.plotLines[1] = chartServ.getPlotLine('Warning',cQuota.yellow,constServ.getColor('yellow'));
      }
      $('#bems-floor-section-graph').highcharts(chart);
    },
    get: function(){return floor;},
    getZone: function(){return zones;},
    getArea: function(){return area;},
    getMean: function(){return means;}
  };
});

app.controller('floorsCtrl',function($scope,floorsServ,structureAdminServ,uiServ){
  $scope.zoneTab = 'all';
  $scope.zone = 'all';
  $scope.rangeTab = 'day';
  $scope.meanVisibility = false;
  $scope.pointVisibility = "2";

  floorsServ.set($scope.zoneTab,$scope.rangeTab,true);
  $scope.floor = floorsServ.get();
  $scope.area = floorsServ.getArea();
  floorsServ.setLoad($scope.rangeTab);

  $scope.bld = structureAdminServ.getOne(sessionStorage.getItem('bld_id'));
  $scope.bld_id = sessionStorage.getItem('bld_id');

  floorsServ.setZone();
  $scope.zones = floorsServ.getZone();
  floorsServ.setMean();
  $scope.means = floorsServ.getMean();

  // $scope.viewChanged = function() {
  //   $scope.pointVisibility = $scope.mode;
  // };

  $scope.zoneChanged = function() {
    console.log($scope.zone);
    uiServ.loader0show();
    $scope.zoneTab = $scope.zone;
    floorsServ.set($scope.zoneTab,$scope.rangeTab,false);
    $scope.area = floorsServ.getArea();
  };

  // $scope.tabZone = function(zone){
  //   console.log(zone);
  //   uiServ.loader0show();
  //   $scope.zoneTab = zone;
  //   floorsServ.set($scope.zoneTab,$scope.rangeTab,false);
  //   $scope.area = floorsServ.getArea();
  // };
  $scope.tabRange = function(range){
    uiServ.loader0show();
    $scope.rangeTab = range;
    floorsServ.set($scope.zoneTab,$scope.rangeTab,true);
    floorsServ.setLoad($scope.rangeTab);
    $scope.area = floorsServ.getArea();
  };

  $scope.usagePercent = function(quota,value){ return (value>quota || $scope.rangeTab == 'year')?100:Math.round((value*100)/quota);};
  $scope.usageClass = function(quota,value){
    if($scope.rangeTab == 'year') return 'progress-bar-success';
    else if(value > quota.red) return 'progress-bar-danger';
    else if(value > quota.yellow) return 'progress-bar-warning';
    else return 'progress-bar-success';
  };
  $scope.zonePolygon = function(style){
    var temp = angular.copy(style);
    temp['clip-path'] = 'polygon('+temp.polygon+')';
    temp['-webkit-clip-path'] = 'polygon('+temp.polygon+')';
    // temp['line-height'] = temp.height;
    delete temp.polygon;
    return temp;
  };
  $scope.zoneColor = function(quota,value,id){
    var temp = '';
    if($scope.rangeTab == 'year') temp = 'green';
    else if(value > quota.red) temp = 'red';
    else if(value > quota.yellow) temp = 'yellow';
    else temp = 'green';

    if($scope.zone == id) temp += ' area-blink';
    return temp;
  };


  $scope.showZoom = function(){return ((window.innerWidth < (80000/96)));};
  $scope.zoom = true;
  if(window.innerWidth < (80000/96)) $scope.floorStyle = {'zoom': (((window.innerWidth * 96) - 3000)/(770)-2)+'%'};
  $scope.zoomFloor = function(){
    if($scope.zoom) $scope.floorStyle = {'zoom': '100%'};
    else $scope.floorStyle = {'zoom': (((window.innerWidth * 96) - 3000)/(770)-2)+'%'};
    $scope.zoom = !$scope.zoom;
  };
});


  