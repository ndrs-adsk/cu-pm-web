app.factory('roomGetServ',function(restServ){return restServ.getCrud(
  '/room/:room_id/room_usage/:range/peak',
  {getWith: {method: 'GET', params: {room_id: '@room_id', range: '@range'}}}
);});

app.factory('roomLoadGetServ',function(restServ){return restServ.getCrud(
  '/room/:room_id/devices_usage/:range/:type',
  {getWith: {method: 'GET', params: {room_id: '@room_id', range: '@range', type: '@type'}}}
);});

app.factory('roomServ',function(roomGetServ,roomLoadGetServ,uiServ,chartServ,constServ,structureCrudAdminServ){
  var room = {};
  var roomLoad = {};
  var load = {};

  return {
    set: function(range,type){
      var self = this;

      if(type === 'overall'){room = roomGetServ.getWith({room_id: sessionStorage.getItem('room_id'), range: range},function(){
        if(range === 'day') self.setGraph(range,room.name,room.graph,room.quota.pw);
        else self.setGraph(range,room.name,room.graph);
        uiServ.loader0hide();
      });} else { roomLoad = roomLoadGetServ.getWith({room_id: sessionStorage.getItem('room_id'), range: range, type: 'peak'},function(){
        self.setGraph(range,room.name+', '+type,roomLoad[type].graph);
      });}
    },
    setPie: function(range){
      load = roomLoadGetServ.getWith({room_id: sessionStorage.getItem('room_id'), range: range, type: 'energy'},function(){
        var room_temp = {};

        var roomPieData = [];
        if(load.hasOwnProperty('aircon')) roomPieData.push({name: 'A/C',y: load.aircon.energy,unit: 'kWh'});
        if(load.hasOwnProperty('light')) roomPieData.push({name: 'Light',y: load.light.energy,unit: 'kWh'});
        if(load.hasOwnProperty('outlet')) roomPieData.push({name: 'Outlet',y: load.outlet.energy,unit: 'kWh'});
        var roomPie = chartServ.getPie2(roomPieData);
        roomPie.chart.height = 250;
        roomPie.plotOptions.pie.dataLabels.distance = 5;
        roomPie.title.y = 10;
        roomPie.title.style.fontSize = '1.5em';
        roomPie.subtitle.text = (
          ((load.hasOwnProperty('aircon'))?parseFloat(load.aircon.energy):0)+
          ((load.hasOwnProperty('light'))?parseFloat(load.light.energy):0)+
          ((load.hasOwnProperty('outlet'))?parseFloat(load.outlet.energy):0)
        ).toFixed(2)+' kWh';
        roomPie.subtitle.y = 35;

        room_temp = structureCrudAdminServ.get({id: sessionStorage.getItem('room_id')},function(){
          // roomPie.title.text = room_temp.name;
          roomPie.title.text = 'Overall';
          $('#bems-room-section-overview-pie').highcharts(roomPie);
        });
      });
    },
    setGraph: function(cPeriod,cName,cGraph,cQuota){
      var chart = angular.copy(chartServ.getCommon(cPeriod,'power'));
      chart.series[0] = {
        name: cName,
        data: cGraph,
        type: 'column'
      };
      chart.chart.height = 250;
      if(typeof cQuota !== 'undefined'){
        chart.yAxis.plotLines = [];
        chart.yAxis.plotLines[0] = chartServ.getPlotLine('Alert',cQuota.red,constServ.getColor('red'));
        chart.yAxis.plotLines[1] = chartServ.getPlotLine('Warning',cQuota.yellow,constServ.getColor('yellow'));
      }
      $('#bems-room-section-profile-graph').highcharts(chart);
    },
    get: function(){return room;},
    connectStorage: function(n,s,pointArray,callBackFunc){
      var storage = new IEEE1888();

      storage.setURL(constServ.getStorageUrl());
      storage.setKeyAttr("attrName","time");
      storage.setKeyAttr("gt",isoDate(s));
      storage.setKeyAttr("lt",isoDate(n));
      storage.setPointID(pointArray);
      storage.setCallbackFunc(callBackFunc);
      storage.query();
    },
    devicePlot: function(devices){
      uiServ.loader0show();
      window.roomCtrlGraph = {power: false, temperature: false, humidity: false};
      var tempType = '';
      var inTempType = '';
      var now = new Date(new Date().setHours(24,0,0,0));
      var start = new Date(new Date().setHours(0,0,0,0));
      var tempPointArray = [];
      var roomGraph = chartServ.getCommon();
      roomGraph.chart.zoomType = 'x';
      roomGraph.chart.height = 200;
      roomGraph.tooltip = {
        shared: true,
        valueDecimals: 2
      };

      function countPower(i){
        var count = 0;
        for(var run in devices[i].pointid) if(devices[run].pointid[run2].type === 'monitor/power') count++;
        return count;
      }

      var waitData = function(data){
        var yAxisCount = 0;
        var roomOrder = {};
        var roomOrderCounter = 0;
        var tempSery = {};

        roomGraph.yAxis = [];
        for(var run in window.roomCtrlGraph) { if(window.roomCtrlGraph[run]) {
          roomOrder[run] = roomOrderCounter++;
          var tempYAxis = chartServ.getYAxis(run,(yAxisCount++ % 2 !==0));
          switch(run){
            case 'humidity':
            tempYAxis.labels = {style: {color: constServ.getColor('m-blue')}};
            tempYAxis.title.style = {color: constServ.getColor('m-blue')};
              break;
            case 'illuminance':
            tempYAxis.labels = {style: {color: constServ.getColor('m-red')}};
            tempYAxis.title.style = {color: constServ.getColor('m-red')};
              break;
            case 'temperature':
              tempYAxis.labels = {style: {color: constServ.getColor('m-green')}};
              tempYAxis.title.style = {color: constServ.getColor('m-green')};
              break;
            default:
              break;
          }
          roomGraph.yAxis.push(tempYAxis);
        }}

        for(var drun in devices){
          tempSery =  {};
          if(window.roomCtrlGraph.power) tempSery.power = {name: devices[drun].name+" : power", data: [], yAxis: roomOrder.power, tooltip: {valueSuffix: ' kW'}};
          if(window.roomCtrlGraph.temperature) tempSery.temperature = {name: devices[drun].name+" : temperature", data: [], yAxis: roomOrder.temperature, tooltip: {valueSuffix: ' °C'}};
          if(window.roomCtrlGraph.humidity) tempSery.humidity = {name: devices[drun].name+" : humidity", data: [], yAxis: roomOrder.humidity, tooltip: {valueSuffix: ' %'}};
          if(window.roomCtrlGraph.illuminance) tempSery.illuminance = {name: devices[drun].name+" : illuminance", data: [], yAxis: roomOrder.illuminance, tooltip: {valueSuffix: ' lux'}};

          firstPower = true;
          for(var prun in devices[drun].pointid){ if(devices[drun].pointid[prun].type.substr(0,7) === 'monitor' && devices[drun].pointid[prun].type != 'monitor/ip_address'){
            inTempType = devices[drun].pointid[prun].type.substr(8);
            if(devices[drun].pointid[prun].show){ switch(inTempType){
              case 'humidity':
                for(var frun in data[devices[drun].pointid[prun].name].time) tempSery.humidity.data.push([Date.parse(data[devices[drun].pointid[prun].name].time[frun]),parseFloat(data[devices[drun].pointid[prun].name].value[frun])]);
                break;
              case 'illuminance':
                for(var frun4 in data[devices[drun].pointid[prun].name].time) tempSery.illuminance.data.push([Date.parse(data[devices[drun].pointid[prun].name].time[frun4]),parseFloat(data[devices[drun].pointid[prun].name].value[frun4])]);
                break;
              case 'temperature':
                for(var frun1 in data[devices[drun].pointid[prun].name].time) tempSery.temperature.data.push([Date.parse(data[devices[drun].pointid[prun].name].time[frun1]),parseFloat(data[devices[drun].pointid[prun].name].value[frun1])]);
                break;
              default:
                if(data[devices[drun].pointid[prun].name] !== null){
                  if(data[devices[drun].pointid[prun].name].time.length > 0){
                    for(var frun2 in data[devices[drun].pointid[prun].name].time) {
                      tempSery.power.data.push([Date.parse(data[devices[drun].pointid[prun].name].time[frun2]),parseFloat(data[devices[drun].pointid[prun].name].value[frun2]/100*6)]);
                    }
                  }
                }
            }
          }}}

          if(tempSery.hasOwnProperty('power')) { if(tempSery.power.data.length !== 0){
            tempSery.power.data = tempSery.power.data.sort(function(a,b){return a[0] - b[0];});
            console.log(tempSery.power);
            roomGraph.series.push(tempSery.power);
            roomGraph.series[0].dataGrouping = {
              approxmation: 'sum',
              enabled: true,
              forced: true,
              units: [['minute'][1]]
            };
          }}
          if(tempSery.hasOwnProperty('temperature')) { if(tempSery.temperature.data.length !== 0) {
            tempSery.temperature.color = constServ.getColor('m-green');
            roomGraph.series.push(tempSery.temperature);
          }}
          if(tempSery.hasOwnProperty('humidity')) { if(tempSery.humidity.data.length !== 0) {
            tempSery.humidity.color = constServ.getColor('m-blue');
            roomGraph.series.push(tempSery.humidity);
          }}
          if(tempSery.hasOwnProperty('illuminance')) { if(tempSery.illuminance.data.length !== 0) {
            tempSery.illuminance.color = constServ.getColor('m-red');
            roomGraph.series.push(tempSery.illuminance);
          }}
        }

        $('#bems-room-section-point-graph').highcharts(roomGraph);
        uiServ.loader0hide();
      };
      for(var run in devices){ for(var run2 in devices[run].pointid) {
        tempType = devices[run].pointid[run2].type.substr(8);
        if(devices[run].pointid[run2].type.substr(0,7) === 'monitor' && devices[run].pointid[run2].type !== 'monitor/ip_address' && devices[run].pointid[run2].show){
          switch(tempType){
            case 'humidity': window.roomCtrlGraph.humidity = true; break;
            case 'illuminance': window.roomCtrlGraph.illuminance = true; break;
            case 'temperature': window.roomCtrlGraph.temperature = true; break;
            default: window.roomCtrlGraph.power = true;
          }
          tempPointArray.push(devices[run].pointid[run2].name);
        }
      }}

      this.connectStorage(now,start,tempPointArray,waitData);
      setTimeout(uiServ.loader0hide,30 * 1000);
    }
  };
});

app.controller('roomCtrl',function($scope,$interval,roomServ,structureAdminServ,deviceAdminServ,ownGetServ,$routeParams){
  structureAdminServ.set();
  $scope.data = structureAdminServ.get();
  $scope.devices = deviceAdminServ.getDevice(sessionStorage.getItem('room_id'));
  console.log($scope.devices);
  $scope.tOps = {nodeChildren: 'nodes'};
  $scope.isLast = function(nodes){return (nodes.length === 0);};
  $scope.expandedNodes = [$scope.data[0]];

  window.treeList = {};
  structureAdminServ.searchy(parseInt(sessionStorage.getItem('room_id')));
  var intervalTreeRoom = $interval(function(){ if(window.treeList.room){ if(window.treeList.room.chk){

    $scope.tree = window.treeList;
    $interval.cancel(intervalTreeRoom);
  }}},500);
  $scope.$on('$destroy',function(){if(intervalTreeRoom) $interval.cancel(intervalTreeRoom);});

  $scope.roomOwnShip = ownGetServ.get({id: sessionStorage.getItem('usid')});
  $scope.room_id = sessionStorage.getItem('room_id');

  $scope.roomRange = 'day';
  $scope.profileType = 'overall';
  $scope.deviceGraph = [];
  $scope.showGraph = false;
  $scope.showingGraph = function(){
    $scope.deviceGraph = [];
    $scope.showGraph = false;
  };

  roomServ.set($scope.roomRange,$scope.profileType);
  roomServ.setPie($scope.roomRange);
  $scope.room = roomServ.get();
  console.log($scope.room);

  $scope.tabRange = function(range){
    $scope.roomRange = range;
    roomServ.set($scope.roomRange,$scope.profileType);
    roomServ.setPie($scope.roomRange);
    $scope.room = roomServ.get();
  };
  $scope.tabType = function(type){
    $scope.profileType = type;
    roomServ.set($scope.roomRange,$scope.profileType);
  };

  $scope.getPercent = function(val,max){return Math.round(((val * 100 / max)>100||$scope.roomRange === 'year')?100:(val * 100 / max));};
  $scope.getClass = function(val,yellow,red){
    if($scope.roomRange !== 'year'){
      if(val<yellow) return 'progress-bar-success';
      else if(val<red) return 'progress-bar-warning';
      else return 'progress-bar-danger';
    } else return 'progress-bar-success';
  };
  $scope.getAward = function(){
    if($scope.roomRange !== 'year'){
      if($scope.room.energy<$scope.room.quota.en.yellow && $scope.room.power<$scope.room.quota.pw.yellow) return {show: true, img: 'svg/green.svg', text: 'Eco-Friendly'};
      else if($scope.room.energy>$scope.room.quota.en.red || $scope.room.power>$scope.room.quota.pw.red) return {show: true, img: 'svg/waste.svg', text: 'Global Warmer'};
      else return {show: true, img: 'svg/consumer.svg', text: 'CAUTION!'};
    } else return {show: false, img: '', text: ''};
  };

  $scope.checkPin = function(pinpos){return (pinpos !== null);};
  $scope.checkBluePlus = function(id,pin){
    for(var run in $scope.devices) if(typeof $scope.devices[run].id !== 'undefined' && $scope.devices[run].id != id && angular.equals($scope.devices[run].pin_pos,pin)) return true;
    return false;
  };
  $scope.checkCtrl = function(pointid){
    for(var run in pointid) if(pointid[run].type.substr(0,7) == 'control') if(sessionStorage.getItem('usty') == 1 || sessionStorage.getItem('usty') == 2 || $scope.roomOwnShip.room_id == $routeParams.room_id) return true;
    return false;
  };

  function checkDevice(index){
    for(var run in $scope.deviceGraph) if($scope.deviceGraph[run].id === $scope.devices[index].id) return true;
    return false;
  }
  $scope.checkGraphDeviceOption = function(type){
    var chk = false;
    for(var runDevices in $scope.devices) if($scope.devices[runDevices].type == type) chk = true;
    return chk;
  };
  $scope.chooseDevice = function(index){
    var temp = {};
    if(checkDevice(index)){ for(var i = $scope.deviceGraph.length-1;i>-1;i--) {
      console.log($scope.deviceGraph[i]);
      if(angular.equals($scope.devices[index].pin_pos,$scope.deviceGraph[i].pin_pos)) $scope.deviceGraph.splice(i,1);
    }} else { for(var key in $scope.devices) { if(typeof $scope.devices[key].pin_pos !== 'undefined') { if(angular.equals($scope.devices[index].pin_pos,$scope.devices[key].pin_pos)) {
      temp = angular.copy($scope.devices[key]);
      for(var key2 in temp.pointid) temp.pointid[key2].show = true;
      $scope.deviceGraph.push(temp);
    }}}}
    $scope.showGraph = true;

    if($scope.deviceGraph.length === 0) $scope.showGraph = false;
    else roomServ.devicePlot($scope.deviceGraph);
  };
  $scope.choosePoint = function(index){
    var chk = 0;
    var chkCtrl = 0;
    for(var rchk in $scope.deviceGraph[index].pointid) {
      if($scope.deviceGraph[index].pointid[rchk].show) chk++;
      if($scope.deviceGraph[index].pointid[rchk].type.substr(0,7) == 'control' || $scope.deviceGraph[index].pointid[rchk].type == 'monitor/ip_address') chkCtrl++;
    }
    if(chk === chkCtrl) $scope.deviceGraph.splice(index,1);

    if($scope.deviceGraph.length === 0) $scope.showGraph = false;
    else roomServ.devicePlot($scope.deviceGraph);
  };

  $scope.showZoom = function(){return (window.innerWidth < (45000/96));};
  $scope.zoom = true;
  if(window.innerWidth < (45000/96)) $scope.roomStyle = {'zoom': (((window.innerWidth * 96) - 3000)/(420)-5)+'%'};
  $scope.zoomRoom = function(){
    if($scope.zoom) $scope.roomStyle = {'zoom': '100%'};
    else $scope.roomStyle = {'zoom': (((window.innerWidth * 96) - 3000)/(420)-5)+'%'};
    $scope.zoom = !$scope.zoom;
  };

  $scope.hideCtrl = function(type){return !(type.substr(0,7) === 'monitor' && type !== 'monitor/ip_address');};

  $scope.chkOp = function(fixId){
    for(var orun in $scope.deviceGraph) if($scope.deviceGraph[orun].id === fixId) return true;
    return false;
  };


  $scope.pointNameShort = function(pntName){
    var fullPnt = pntName.split("/");
    var pntNameResult ;
    if(pntName.includes('energy')){
      pntNameResult = fullPnt[fullPnt.length - 4]+fullPnt[fullPnt.length - 3]+'/'+fullPnt[fullPnt.length - 1]; 
      return pntNameResult;
    }
    else{
      pntNameResult = fullPnt[fullPnt.length - 2]+'/'+fullPnt[fullPnt.length - 1]; 
      return pntNameResult;
    }
  };

});
