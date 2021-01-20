/******************************************************************************

  ENERGY & POWER

******************************************************************************/
app.factory('buildingGetAdminServ',function(restServ){return restServ.getCrud(
  '/highlight/all_data/node/:type/:month',
  {getH: {method: 'GET',params: {type: '@type', month: '@month'}}}
);});
app.factory('buildingUpdateAdminServ',function(restServ){return restServ.getCrud(
  '/highlight/:update/node/:type/:month',
  {update: {method: 'PUT',params: {update: '@update', type: '@type', month: '@month'}}}
);});
app.factory('buildingAdminServ',function(buildingGetAdminServ,buildingUpdateAdminServ,constServ,timeServ,uiServ){
  var energy = [];
  var power = [];

  return {
    set: function(type){
      var highlight = [];
      for(var i = 1;i <= 12;i++) highlight.push(buildingGetAdminServ.getH({type: type, month: i}));
      if(type === 'EN') energy = highlight;
      else if(type === 'PW') power = highlight;
      uiServ.loader0hide();
    },
    get: function(type){
      if(type === 'energy') return energy;
      else if(type === 'power') return power;
      else return 0;
    },
    update: function(update,type,index){
      var temp = {};
      switch(update){
        case 'data':
          if(type === 'EN') temp.hl_data = energy[index].hl_data;
          else temp.hl_data = power[index].hl_data;
          break;
        case 'parameter':
          if(type === 'EN') temp.hl_par = energy[index].hl_par;
          else temp.hl_par = power[index].hl_par;
          break;
        case 'holiday':
          if(type === 'EN') temp.holiday = energy[index].holiday;
          else temp.holiday = power[index].holiday;
          break;
        default: break;
      }
      buildingUpdateAdminServ.update({update: update, type: type, month: index + 1},temp,$('#bems-admin-highlight-modal').modal('show'));
    },
    eUpdateHoliday: function(day,index){
      var holidayArray = [];
      var chk = true;
      var chkVal = 0;
      for(var key in energy[index].holiday) {
        chkVal = energy[index].holiday[key];
        if(chkVal === day) chk = false;
        else holidayArray.push(chkVal);
      }
      if(chk) holidayArray.push(day);
      energy[index].holiday = holidayArray;
      this.update('holiday','EN',index);
    },
    pUpdateHoliday: function(day,index){
      var holidayArray = [];
      var chk = true;
      var chkVal = 0;
      for(var key in power[index].holiday) {
        chkVal = power[index].holiday[key];
        if(chkVal === day) chk = false;
        else holidayArray.push(chkVal);
      }
      if(chk) holidayArray.push(day);
      power[index].holiday = holidayArray;
      this.update('holiday','PW',index);
    },
    updateTotal: function(total,index1,index2,runDay){
      energy[index1].hl_data[index2].weekday = this.partWay('weekday',total,index1,runDay);
      energy[index1].hl_data[index2].saturday = this.partWay('saturday',total,index1,runDay);
      energy[index1].hl_data[index2].sunday = this.partWay('sunday',total,index1,runDay);
      energy[index1].hl_data[index2].holiday = this.partWay('holiday',total,index1,runDay);
    },
    isHoliday: function(stop,key,day){
      for(var run in stop) if(stop[run] === day + 1) return true;
      return false;
    },
    oneWay: function(weekday,saturday,sunday,holiday,runDay){
      var sum = 0;
      sum += weekday * runDay.weekday;
      sum += saturday * runDay.saturday;
      sum += sunday * runDay.sunday;
      sum += holiday * runDay.holiday;
      return sum.toFixed(1);
    },
    partWay: function(type,sum,index,runDay){
      var totalRatio = (energy[index].hl_par.weekday_ratio * runDay.weekday) + (energy[index].hl_par.saturday_ratio * runDay.saturday) + (energy[index].hl_par.sunday_ratio * runDay.sunday) + (energy[index].hl_par.holiday_ratio * runDay.holiday);
      switch(type){
        case 'weekday': return ((sum * energy[index].hl_par.weekday_ratio )/ totalRatio).toFixed(1);
        case 'saturday': return ((sum * energy[index].hl_par.saturday_ratio )/ totalRatio).toFixed(1);
        case 'sunday': return ((sum * energy[index].hl_par.sunday_ratio )/ totalRatio).toFixed(1);
        case 'holiday': return ((sum * energy[index].hl_par.holiday_ratio )/ totalRatio).toFixed(1);
        default: return 0;
      }
    },
    setGap: function(mth){
      var mthNum = mth;
      function getFirstGap(mmm){return (new Date((new Date()).getFullYear(),mmm,1)).getDay(); }
      function doGapWidth(num){
        var inNum = num;
        if(num === 0) return {'display':'none'};
        else return {'width':(inNum * 45)};
      }
      return doGapWidth(getFirstGap(mthNum));
    }
  };
});
/******************************************************************************

  ENERGY SETTING

******************************************************************************/
app.controller('eBuildingAdminCtrl',function($scope,buildingAdminServ,constServ,timeServ,structureAdminServ){
  $scope.tab = true;
  $scope.tabbing = function(bool){$scope.tab = bool;};
  $scope.activeEnergy = (new Date()).getMonth();
  $scope.fGap = buildingAdminServ.setGap($scope.activeEnergy);
  $scope.activeEnergyTabbing = function(num){
    $scope.activeEnergy = num;
    $scope.fGap = buildingAdminServ.setGap($scope.activeEnergy);
  };

  $scope.nameList = {};
  $scope.data = structureAdminServ.getAll();
  $scope.$watch('data',function(n,o){
    $scope.nameList = structureAdminServ.pathy($scope.data,"");
  },true);
  $scope.checkPathName = function(fixId){
    var tmpName = '';
    for(var runName in $scope.nameList) if(runName == fixId) tmpName = $scope.nameList[runName];
    return tmpName;
  };


  //SET
  buildingAdminServ.set('EN');
  $scope.eHighlight = buildingAdminServ.get('energy');

  //CONST
  $scope.getFullMonth = constServ.getFullMonth;
  $scope.getMonth = constServ.getMonth;
  $scope.monthDay = timeServ.monthDay;
  $scope.getTimeArray = timeServ.getArray;

  //CONTROL
  $scope.isHoliday = buildingAdminServ.isHoliday;
  $scope.oneWay = buildingAdminServ.oneWay;
  $scope.partWay = buildingAdminServ.partWay;
  $scope.getIn = function(type,mnum){return timeServ.get(type,mnum,$scope.eHighlight[mnum].holiday);};

  //UPDATE
  $scope.update = buildingAdminServ.update;
  $scope.updateHoliday = function(day,index){buildingAdminServ.eUpdateHoliday(day,index);};
  $scope.updateTotal = function(total,index1,index2,runDay){
    buildingAdminServ.updateTotal(total,index1,index2,runDay);
    $scope.eHighlight = buildingAdminServ.get('energy');
  };
  $scope.hl_copy = function(oIndex){
    $scope.eHighlight[$scope.activeEnergy].hl_data = angular.copy($scope.eHighlight[oIndex].hl_data);
    $scope.eHighlight[$scope.activeEnergy].hl_par = angular.copy($scope.eHighlight[oIndex].hl_par);
  };
});
/******************************************************************************

  POWER SETTING

******************************************************************************/
app.controller('pBuildingAdminCtrl',function($scope,buildingAdminServ,constServ,timeServ,structureAdminServ){
  $scope.tab = true;
  $scope.tabbing = function(bool){$scope.tab = bool;};
  $scope.activePower = (new Date()).getMonth();
  $scope.fGap = buildingAdminServ.setGap($scope.activePower);
  $scope.activePowerTabbing = function(num){
    $scope.activePower = num;
    $scope.fGap = buildingAdminServ.setGap($scope.activePower);
  };

  $scope.nameList = {};
  $scope.data = structureAdminServ.getAll();
  $scope.$watch('data',function(n,o){
    $scope.nameList = structureAdminServ.pathy($scope.data,"");
  },true);
  $scope.checkPathName = function(fixId){
    var tmpName = '';
    for(var runName in $scope.nameList) if(runName == fixId) tmpName = $scope.nameList[runName];
    return tmpName;
  };

  //SET
  buildingAdminServ.set('PW');
  $scope.pHighlight = buildingAdminServ.get('power');

  //CONST
  $scope.getFullMonth = constServ.getFullMonth;
  $scope.getMonth = constServ.getMonth;
  $scope.monthDay = timeServ.monthDay;
  $scope.getTimeArray = timeServ.getArray;

  $scope.activeEnergyTabbing = function(num){
    $scope.activeEnergy = num;
    $scope.fGap = buildingAdminServ.setGap($scope.activeEnergy);
  };

  //CONTROL
  $scope.isHoliday = buildingAdminServ.isHoliday;
  $scope.getIn = function(type,mnum){return timeServ.get(type,mnum,$scope.pHighlight[mnum].holiday);};

  //UPDATE
  $scope.update = buildingAdminServ.update;
  $scope.updateHoliday = function(day,index){buildingAdminServ.pUpdateHoliday(day,index);};
  $scope.hl_copy = function(oIndex){
    $scope.pHighlight[$scope.activePower].hl_data = angular.copy($scope.pHighlight[oIndex].hl_data);
    $scope.pHighlight[$scope.activePower].hl_par = angular.copy($scope.pHighlight[oIndex].hl_par);
  };
});
