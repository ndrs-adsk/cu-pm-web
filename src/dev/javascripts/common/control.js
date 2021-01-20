app.factory('ctrlctrlServ',function(restServ){return restServ.getCrud('/structure/control/:id','u');});

app.factory('ctrlServ',function(ctrlctrlServ,constServ,chartServ,structureCrudAdminServ,uiServ){
  var controlNode = {};
  var controlPoint = [];
  var montiorPoint = [];

  return {
    chkType: function(str){return str.substr(0,str.indexOf('/'));},
    chkVal: function(str){return str.substr(str.indexOf('/')+1);},
    connectStorage: function(pointArray,type,response){
      var storage = new IEEE1888();

      storage.setURL(constServ.getStorageUrl());
      storage.setKeyAttr("attrName","time");

      if(type){
        var now = new Date();
        var start = new Date(now.getTime()-(2*60*60*1000));

        storage.setKeyAttr("gt",isoDate(start));
        storage.setKeyAttr("lt",isoDate(now));
      }
      else storage.setKeyAttr("select","maximum");

      storage.setPointID(pointArray);
      storage.setCallbackFunc(response);
      storage.query();
    },
    setNode: function(id){
      var self = this;
      controlPoint = [];
      montiorPoint = [];

      controlNode = structureCrudAdminServ.get({id: id},function(){
        var nodePoint = angular.copy(controlNode.pointid);
        var monitorType = [];

        for(var run in nodePoint){switch(self.chkType(nodePoint[run].type)){
          case 'control':
            controlPoint.push(nodePoint[run].name);
            break;
          case 'monitor':
            if(monitorType.indexOf(self.chkVal(nodePoint[run].type)) === -1) monitorType.push(self.chkVal(nodePoint[run].type));
            if(self.chkVal(nodePoint[run].type) != 'ip_address')montiorPoint.push(nodePoint[run].name);
            break;
          default: break;
        }}

        for(var run2 in monitorType){
         if (monitorType[run2] == 'energy'){
          monitorType[run2] = 'power';
         }
         // console.log(monitorType[run2]);
         switch(monitorType[run2]){
          case 'power': window.ctrlMon.power.has = true;break;
          case 'temperature': window.ctrlMon.temp.has = true; break;
          case 'humidity': window.ctrlMon.humid.has = true; break;
          default: break;
        }}

        window.ctrlCtrl = {
          power: {has: false, val: ''},
          fan: {has: false, val: ''},
          temp: {has: false, val: ''},
          mode: {has: false, val: ''}
        };

        self.connectStorage(controlPoint,false,function(data){
          for(var key in data){ for(var run in nodePoint){ if(key === nodePoint[run].name){ switch(nodePoint[run].type){
            case 'control/power':
              window.ctrlCtrl.power.has = true;
              window.ctrlCtrl.power.val = data[key].value[0];
              break;
            case 'control/fan_speed':
              window.ctrlCtrl.fan.has = true;
              window.ctrlCtrl.fan.val = parseInt(data[key].value[0]);
              break;
            case 'control/set_temp':
              window.ctrlCtrl.temp.has = true;
              window.ctrlCtrl.temp.val = parseInt(data[key].value[0]);
              break;
            case 'control/mode':
              window.ctrlCtrl.mode.has = true;
              window.ctrlCtrl.mode.val = data[key].value[0];
              break;
              default: break;
          }}}}
        });

        self.connectStorage(montiorPoint,true,function(data){
          window.ctrlMon = {
            power: {has: false, show:true, val: 0, order: 0},
            temp: {has: false, show:true, val: '', order: 0},
            humid: {has: false, show:true, val: '', order: 0},
            illu: {has: false, show:true, val: '', order: 0}
          };

          var series = [];
          var datum = [];
          var chart = chartServ.getCommon2();
          var tempType = '';
          var templastVal = 0;
          var tempSery = {};

          chart.chart.zoomType = 'x';
          chart.chart.height = 180;
          chart.plotOptions.column.borderWidth = 0.01;
          chart.plotOptions.column.stacking = 'normal';
          chart.series = [];
          chart.yAxis = [];

          for(var i = 0;i<monitorType.length;i++) {
            if(monitorType[i] != 'ip_address') {
              chart.yAxis.push(chartServ.getYAxis2(monitorType[i],(i % 2 !== 0)));
              if(chart.yAxis[chart.yAxis.length -1].title.text === 'Temperature(°C)' || chart.yAxis[chart.yAxis.length -1].title.text === 'Humidity (%)' || chart.yAxis[chart.yAxis.length -1].title.text === 'Illuminance (lux)') {
                chart.yAxis[chart.yAxis.length -1].title.style = {};
                if(chart.yAxis[chart.yAxis.length -1].title.text === 'Humidity (%)') {
                  chart.yAxis[chart.yAxis.length -1].labels = {style: {color: constServ.getColor('m-blue')}};
                  chart.yAxis[chart.yAxis.length -1].title.style.color = constServ.getColor('m-blue');
                  window.ctrlMon.humid.order = i;
                }
                else if(chart.yAxis[chart.yAxis.length -1].title.text === 'Temperature(°C)') {
                  chart.yAxis[chart.yAxis.length -1].labels = {style: {color: constServ.getColor('m-green')}};
                  chart.yAxis[chart.yAxis.length -1].title.style.color = constServ.getColor('m-green');
                  window.ctrlMon.temp.order = i;
                }
                else {
                  chart.yAxis[chart.yAxis.length -1].labels = {style: {color: constServ.getColor('m-red')}};
                  chart.yAxis[chart.yAxis.length -1].title.style.color = constServ.getColor('m-red');
                  window.ctrlMon.illu.order = i;
                }
              }
              else if(monitorType[chart.yAxis.length -1] === 'power') window.ctrlMon.power.order = i;
            }
          }

          for(var run1 in data){ if(data[run1] !== null){
            datum = [];
            tempType = '';
            templastVal = 0;
            tempSery = {};

            for(var run3 in nodePoint) if(nodePoint[run3].name === run1) {
              tempType = self.chkVal(nodePoint[run3].type);
              templastVal = data[run1].value[(data[run1].value.length-1)];
              if (tempType == 'energy'){
                tempType = 'power';
              }
              switch(tempType){
                case 'power':
                  window.ctrlMon.power.has = true;
                  window.ctrlMon.power.val += parseFloat(templastVal*60);
                  break;
                case 'temperature':
                  window.ctrlMon.temp.has = true;
                  window.ctrlMon.temp.val = templastVal;
                  break;
                case 'humidity':
                  window.ctrlMon.humid.has = true;
                  window.ctrlMon.humid.val = templastVal;
                  break;
                case 'illuminance':
                  window.ctrlMon.illu.has = true;
                  window.ctrlMon.illu.val = templastVal;
                  break;
                default: break;
              }
            }
            for(var run2 in data[run1].time) {
              // console.log(tempType);
              if(tempType === 'power') datum.push([Date.parse(data[run1].time[run2]),parseFloat(data[run1].value[run2])*60]);
              else if(tempType.includes('status'));
              else datum.push([Date.parse(data[run1].time[run2]),parseFloat(data[run1].value[run2])]);
            }
              datum.sort();
            tempSery = {name: tempType, data: datum, ctrlType: tempType};
            switch(tempType){
              case 'power':
                tempSery.type = 'column';
                tempSery.stack = 'power';
                tempSery.yAxis = window.ctrlMon.power.order;
                break;
              case 'temperature':
                tempSery.color = constServ.getColor('m-green');
                tempSery.yAxis = window.ctrlMon.temp.order;
                tempSery.zIndex = 10;
                break;
              case 'humidity':
                tempSery.color = constServ.getColor('m-blue');
                tempSery.yAxis = window.ctrlMon.humid.order;
                tempSery.zIndex = 11;
                break;
              case 'illuminance':
                tempSery.color = constServ.getColor('m-red');
                tempSery.yAxis = window.ctrlMon.illu.order;
                tempSery.zIndex = 12;
                break;
              default: break;
            }
            chart.series.push(tempSery);
          }}
          var now = (new Date());
          var later = angular.copy(now);
          later.setHours(later.getHours() + -2);
          chart.xAxis.min = later.getTime();
          chart.xAxis.max = now.getTime();

          window.ctrlMon.power.show = true;
          window.ctrlMon.temp.show = true;
          window.ctrlMon.humid.show = true;
          window.ctrlMon.illu.show = true;

          window.ctrlChart = angular.copy(chart);
          window.ctrlTempChart = angular.copy(chart);
          $('#bems-control-graph').highcharts(window.ctrlChart);
        });

        uiServ.loader0hide();
      });
    },
    get: function(){return controlNode;},
    init: function(){
      window.ctrlMon = {
        power: {has: false, show:true, val: ''},
        temp: {has: false, show:true, val: ''},
        humid: {has: false, show:true, val: ''},
        illu: {has: false, show:true, val: ''}
      };
      window.ctrlCtrl = {
        power: {has: true, val: ''},
        fan: {has: true, val: ''},
        temp: {has: true, val: ''},
        mode: {has: true, val: ''}
      };
    },
    updateCtrl: function(fixId,ctrlCtrl){

      ctrlctrlServ.update(
        {id: fixId},ctrlCtrl,
        function(){$('#bems-control-success-modal-alert').modal('show');},
        function(){$('#bems-control-alert-modal-alert').modal('show');}
      );
    }
  };
});

app.controller('ctrlCtrl',function($scope,$window,$timeout,$interval,constServ,ctrlServ,structureAdminServ,deviceListGetAdminServ,uiServ){
  ctrlServ.init();
  $scope.controlTab = true;
  $scope.controlTabbing = function(bool){$scope.controlTab = bool;};


  $scope.$watch(function(){return $window.ctrlMon;},function(n,o){
    $scope.ctrlMon = window.ctrlMon;
    $timeout(function(){$scope.ctrlMon = window.ctrlMon;},500);
  },true);
  $scope.$watch(function(){return $window.ctrlCtrl;},function(n,o){
    $scope.ctrlCtrl = window.ctrlCtrl;
    $timeout(function(){$scope.ctrlCtrl = window.ctrlCtrl;},500);
  },true);
  $scope.data = structureAdminServ.get();  

  var pointArrayDeviceStatus  =[];

  structureAdminServ.set();
  $scope.devices = deviceListGetAdminServ.getWith({id: 190},function(){
    
    var checkMonitorType = function(x){return x.type == 'monitor/status' || x.type == 'monitor/status1' || x.type == 'monitor/status2'; };

    for(var runDevice in $scope.devices){ if($scope.devices[runDevice].hasOwnProperty('pointid')){
      for(var runPointId in $scope.devices[runDevice].pointid){
        if(
          $scope.devices[runDevice].pointid[runPointId].type == 'monitor/status' ||
          $scope.devices[runDevice].pointid[runPointId].type == 'monitor/status1' ||
          $scope.devices[runDevice].pointid[runPointId].type == 'monitor/status2'
        ){
          pointArrayDeviceStatus.push($scope.devices[runDevice].pointid[runPointId].name);
        }
      }
    }}
    // console.log(pointArrayDeviceStatus);

  });
  function refreshData(){
    // console.log(pointArrayDeviceStatus);
    var storage = new IEEE1888();
    storage.setURL(constServ.getStorageUrl());
    storage.setKeyAttr("attrName","time");
    storage.setKeyAttr("select","maximum");
    storage.setPointID(angular.copy(pointArrayDeviceStatus));
    storage.setCallbackFunc(function(res){
       // console.log(res);
      
      for(var runDevice2 in $scope.devices){ if($scope.devices[runDevice2].hasOwnProperty('pointid')){
        $scope.devices[runDevice2].mStatus = false;
        
        for(var runP2 in $scope.devices[runDevice2].pointid){
          for(var runRes in res){
            if($scope.devices[runDevice2].pointid[runP2].name == runRes) {
              if(res[runRes].value[0] == 1) $scope.devices[runDevice2].mStatus = true;
              break;
            }
          }
        }
      }}
    });
    storage.query();
  }
  refreshData();
  var intervalControlDevice = $interval(refreshData,5 * 1000);
  $scope.$on('$destroy',function(){if(intervalControlDevice) $interval.cancel(intervalControlDevice);});
  console.log($scope.devices);
  $scope.collapseAll = function(){$scope.$broadcast('angular-ui-tree:collapse-all');};
  $scope.expandAll = function(){$scope.$broadcast('angular-ui-tree:expand-all');};
  $scope.isLast = function(nodes){return (nodes.length === 0);};

  function getSetNode(id){
    ctrlServ.setNode(id);
    $scope.chosenNode = ctrlServ.get();
  }
  $scope.chooseNode = function(nodeIndex,id){
    uiServ.loader0show();


    var temp = {};
    // console.log(nodeIndex);
    // console.log($scope.devices[nodeIndex]);
    $scope.DeviceVar = $scope.devices[nodeIndex].name;

    var fullname = $scope.devices[nodeIndex].pointid[0].name;
    var parts = fullname.split('/');
    $scope.roomname = parts[parts.length - 5];

    $scope.typeDevice = $scope.devices[nodeIndex].type;

    // console.log($scope.devices[nodeIndex].type);
    var devicePnt = $scope.devices[nodeIndex].pointid;
    for(var pnt in devicePnt){
      // console.log(devicePnt[pnt]);
      if(devicePnt[pnt].type == "control/status1"){
        $scope.ctrlNum = '1switch';
      }
      else if(devicePnt[pnt].type == "control/status2"){
        $scope.ctrlNum = '2switch';
      }
      else if(devicePnt[pnt].type == "control/status"){
        $scope.ctrlNum = 'switch';
      }
      // console.log($scope.ctrlNum);
    }


    $scope.chosenNodeId = id;
    var intervalControl = $interval(getSetNode(id),60 * 1000);
    $scope.$on('$destroy',function(){if(intervalControl) $interval.cancel(intervalControl);});
  };
  if(sessionStorage.getItem('node_id') !== null) $scope.chooseNode(sessionStorage.getItem('node_id'));

  $scope.showGraph = function(){
    window.ctrlChart = angular.copy(window.ctrlTempChart);
    function showingGraph(type){for(var run in window.ctrlChart.series) if(window.ctrlChart.series[run].ctrlType == type) window.ctrlChart.series.splice(run,1);}
    if(!$scope.ctrlMon.power.show) showingGraph('power');
    if(!$scope.ctrlMon.temp.show) showingGraph('temperature');
    if(!$scope.ctrlMon.humid.show) showingGraph('humidity');
    if(!$scope.ctrlMon.illu.show) showingGraph('illuminance');

    $('#bems-control-graph').highcharts(window.ctrlChart);
  };

  function actionCtrl(dataCtrl){ctrlServ.updateCtrl($scope.chosenNodeId,dataCtrl);}
  $scope.switchNode = function(pntType,ctrlVal){

    // console.log($scope.chosenNodeId,ctrlVal,pntType);
    var dataCtrl = {};
    var key = pntType;
    
    dataCtrl[key] = ctrlVal;
    
    // console.log($scope.chosenNodeId,dataCtrl);
    actionCtrl(dataCtrl);
  };
  $scope.switchMode = function(mode){
    $scope.ctrlCtrl.mode.val = mode;
    // actionCtrl();
  };
  $scope.countTemp = function(mode){
    if(mode && $scope.ctrlCtrl.temp.val < 30) $scope.ctrlCtrl.temp.val++;
    else if($scope.ctrlCtrl.temp.val > 15) $scope.ctrlCtrl.temp.val--;
    // actionCtrl();
  };
  $scope.tempUpdate = function(){
    $scope.ctrlCtrl.temp.val = Math.round($scope.ctrlCtrl.temp.val);
    if($scope.ctrlCtrl.temp.val < 15) $scope.ctrlCtrl.temp.val = 15;
    if($scope.ctrlCtrl.temp.val > 30) $scope.ctrlCtrl.temp.val = 30;
    // actionCtrl();
  };
  $scope.switchSpeed = function(mode){
    if(mode){
      if($scope.ctrlCtrl.fan.val === 3) $scope.ctrlCtrl.fan.val = 0;
      else $scope.ctrlCtrl.fan.val++;
    }
    else{
      if($scope.ctrlCtrl.fan.val === 0) $scope.ctrlCtrl.fan.val = 3;
      else $scope.ctrlCtrl.fan.val--;
    }
    // actionCtrl();
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
    // console.log(index);
    // console.log($scope.devices[index]);
    $scope.DeviceVar = $scope.devices[index].name;

    var fullname = $scope.devices[index].pointid[0].name;
    var parts = fullname.split('/');
    $scope.roomname = parts[parts.length - 5];

    $scope.typeDevice = $scope.devices[index].type;

    // console.log($scope.devices[index].type);
    // if(checkDevice(index)){ for(var i = $scope.deviceGraph.length-1;i>-1;i--) {
    //   console.log($scope.deviceGraph[i]);
    //   if(angular.equals($scope.devices[index].pin_pos,$scope.deviceGraph[i].pin_pos)) $scope.deviceGraph.splice(i,1);
    // }} else { for(var key in $scope.devices) { if(typeof $scope.devices[key].pin_pos !== 'undefined') { if(angular.equals($scope.devices[index].pin_pos,$scope.devices[key].pin_pos)) {
    //   temp = angular.copy($scope.devices[key]);
    //   for(var key2 in temp.pointid) temp.pointid[key2].show = true;
    //   $scope.deviceGraph.push(temp);
    // }}}}
    // $scope.showGraph = true;

    // if($scope.deviceGraph.length === 0) $scope.showGraph = false;
    // else roomServ.devicePlot($scope.deviceGraph);
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

  $scope.chkSta = function(fixId,fixType){
    if(fixType == "multi sensor"){
      return true;
    }
    else{
      return fixId;
    }
    // for (var dlist in $scope.devices){
    //   // console.log($scope.devices[dlist].id);
    //   // if($scope.devices[dlist].id == fixId){
    //   //   console.log()
    //   // }
    // }
    // if(fixId == 201){
    //   return "bems-room-section-img-device-alt";
    // }
    // else if(fixId == 200){
    //   return "bems-room-section-img-device-on";
    // }
    // else if(fixId == 196){
    //   return "bems-room-section-img-device";
    // }
  };
  //structureAdminServ.searchy(parseInt($scope.chosenNodeId));
  // var intervalTreeControll = $interval(function(){console.log(window.treeList);if(window.treeList.device.chk){

  //   $scope.tree = window.treeList;
  //   $interval.cancel(intervalTreeControll);
  // }},500);
  $scope.$on('$destroy',function(){if(intervalTreeControll) $interval.cancel(intervalTreeControll);});
});
