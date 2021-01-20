app.factory('quotaGetAdminServ',function(restServ){return restServ.getCrud(
  '/quota/overview/:mode/:id/:type',
  {getOverview: {method: 'GET', isArray: true , params: {mode: '@mode', id: '@id', type: '@type'}}}
);});
app.factory('quotaSetAdminServ',function(restServ){return restServ.getCrud(
  '/quota/setting/:mode/:type/month/:month',
  {
    getQuota: {method: 'GET', params: {mode: '@mode', type: '@type', month: '@month'}},
    updateQuota: {method: 'PUT', params: {mode: '@mode', type: '@type', month: '@month'}}
  }
);});
app.factory('quotaExtraAdminServ',function(restServ){return restServ.getCrud(
  '/quota/:extra/:mode/:type/month/:month',
  { getExtra: {method: 'GET', isArray: true, params: {extra: '@extra', mode: '@mode', type: '@type', month: '@month'}, transformResponse: function(data,header){
    if(Array.isArray(JSON.parse(data))){ return JSON.parse(data); }
    else { return [JSON.parse(data)]; }
  }}}
);});
app.factory('quotaBackupAdminServ',function(restServ){return restServ.getCrud(
  '/quota/backup/:mode/:type/year/:year/month/:month',
  { getBackup: {method: 'GET', params: {mode: '@mode', type: '@type', year: '@year', month: '@month'}}}
);});

app.factory('adminHighlightServ',function(timeServ,quotaGetAdminServ,quotaSetAdminServ,quotaExtraAdminServ,quotaBackupAdminServ,uiServ){
  var views;
  var setObj;
  var runDay;

  return {
    setDisplay: function(mode,fixId,type){
      views = quotaGetAdminServ.getOverview({mode: mode, id: fixId, type: type},function(){
        uiServ.loader0hide();
      });
    },
    setSetting: function(mode,type,month,chk){
      if(chk) uiServ.loader0show();

      setObj = quotaSetAdminServ.getQuota({mode: mode, type: type, month: month},function(){
        runDay = timeServ.get('obj',month,setObj.option.holiday);
        console.log('runDay',runDay);
        uiServ.loader0hide();
      });
    },
    getDisplay: function(){return views;},
    getSetting: function(){return setObj;},
    update: function(mode,type,month){
      quotaSetAdminServ.updateQuota({mode: mode, type: type, month: month},setObj,function(){
        $('#bems-admin-highlight-modal').modal('show');
      });
    },
    changeMode: function(mode,type,month){ if(setObj.option.mode !== 'manual'){
      uiServ.loader0show();

      quotaExtraAdminServ.getExtra({extra: (setObj.option.mode === '3m_avg')?'last_3m':'last_year', mode: mode, type: type, month: month},this.mergeData);
    }},
    useData: function(extra,mode,type,month){
      uiServ.loader0show();

      quotaExtraAdminServ.getExtra({extra: (extra === '3m_avg')?'last_3m':'last_year', mode: mode, type: type, month: month},this.mergeData);
    },
    mergeData: function(res){
      console.log(res);

      for(var runQuota in res){
        if(res[runQuota].hasOwnProperty('id') && res[runQuota].hasOwnProperty('quota')){
          for(var runSet in setObj.quota){ if(setObj.quota[runSet].id === res[runQuota].id){
            setObj.quota[runSet].quota = res[runQuota].quota;
            if(res[runQuota].none) setObj.quota[runSet].none = true;
            break;
          }}
        }
        if(res[runQuota].hasOwnProperty('error')){
          $('#bems-admin-highlight-modal-failed').modal('show');
          setObj.option.mode = 'manual';
          break;
        }
      }
      uiServ.loader0hide();
    },
    loadData: function(mode,type,year,month){
      uiServ.loader0show();

      quotaBackupAdminServ.getBackup({mode: mode, type: type, year: year, month: month},function(res){
        setObj.quota = angular.copy(res);
        uiServ.loader0hide();
      });
    },
    partWay: function(type,index){
      var totalRatio =
        (setObj.option.day_ratio.weekday * runDay.weekday) +
        (setObj.option.day_ratio.saturday * runDay.saturday) +
        (setObj.option.day_ratio.sunday * runDay.sunday) +
        (setObj.option.day_ratio.holiday * runDay.holiday);
      switch(type){
        case 'weekday': return ((setObj.quota[index].quota * (+setObj.option.percent/100) * setObj.option.day_ratio.weekday )/ totalRatio).toFixed(2);
        case 'saturday': return ((setObj.quota[index].quota * (+setObj.option.percent/100) * setObj.option.day_ratio.saturday )/ totalRatio).toFixed(2);
        case 'sunday': return ((setObj.quota[index].quota * (+setObj.option.percent/100) * setObj.option.day_ratio.sunday )/ totalRatio).toFixed(2);
        case 'holiday': return ((setObj.quota[index].quota * (+setObj.option.percent/100) * setObj.option.day_ratio.holiday )/ totalRatio).toFixed(2);
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
    },
    recursiveSumUp: function(data){
      for(var runQQQ in setObj.quota) setObj.quota[runQQQ].quota = this.sumUp(setObj.quota[runQQQ].id,data[0]);
    },
    sumUp: function(fixId,data){
      if(data.id == fixId){
        if(data.level == 4 || data.nodes.length === 0){
          return setObj.quota.find(function(x){return x.id === fixId;}).quota;
        } else {
          var sum = 0;
          for(var runInner in data.nodes) {
            sum += this.sumUp(data.nodes[runInner].id,data.nodes[runInner]);
          }
          return sum;
        }
      } else {
        for(var runInner2 in data.nodes){ if(this.sumUp(fixId,data.nodes[runInner2])){
            console.log("zzz",this.sumUp(fixId,data.nodes[runInner2]));
            return this.sumUp(fixId,data.nodes[runInner2]);
        }}
      }
    }
  };
});

/******************************************************************************

  PROFILE POWER SETTING

******************************************************************************/
app.controller('adminProfilePowerCtrl',function(
  $scope,constServ,uiServ,timeServ,
  adminHighlightServ,profileAdminServ
){
  $scope.tab = true;
  $scope.tabbing = function(bool){$scope.tab = bool;};
  $scope.selectedId = 1;
  $scope.activeMonth = (new Date()).getMonth();
  $scope.activeConstMonth = (new Date()).getMonth();
  $scope.activeYearPower = (new Date()).getFullYear();
  $scope.modeList = constServ.getMode();

  $scope.changeView = function(){
    uiServ.loader0show();
    adminHighlightServ.setDisplay('profile',$scope.selectedId,'power');
    $scope.views = adminHighlightServ.getDisplay();
  };
  $scope.changeView();
  profileAdminServ.set();
  $scope.profiles = profileAdminServ.get();

  $scope.getFullMonth = constServ.getFullMonth;
  $scope.months = constServ.getMonths();
  $scope.getTimeArray = timeServ.getArray;
  $scope.monthDay = timeServ.monthDay;
  $scope.isHoliday = function(index){return ($scope.setObj)?(
      ($scope.setObj.hasOwnProperty('option') && $scope.setObj.hasOwnProperty('quota'))?($scope.setObj.option.holiday.indexOf(index + 1) !== -1):false
    ):false;
  };
  $scope.updateHoliday = function(index){
    if($scope.setObj.option.holiday.indexOf(index + 1) !== -1) $scope.setObj.option.holiday.splice($scope.setObj.option.holiday.indexOf(index + 1),1);
    else $scope.setObj.option.holiday.push(index + 1);
  };
  $scope.updateSetting = function(){
    adminHighlightServ.update('profile','power',$scope.activeMonth + 1);
  };

  $scope.setMonth = function(month,chk){
    adminHighlightServ.setSetting('profile','power',month + 1,chk);
    $scope.fGap = adminHighlightServ.setGap($scope.activeMonth);
    $scope.setObj = adminHighlightServ.getSetting();
  };
  $scope.setMonth($scope.activeMonth,false);
  $scope.changeMonth = function(index){
    $scope.activeMonth = index;
    $scope.setMonth(index,true);
  };

  $scope.changeMode = function(){
    adminHighlightServ.changeMode('profile','power',$scope.activeMonth + 1);
  };
  $scope.useData = function(mode){
    adminHighlightServ.useData(mode,'profile','power',$scope.activeMonth);
  };
  $scope.useBackupData = function(month,year){
    adminHighlightServ.loadData('profile','power',year,month + 1);
  };

  $scope.adjustValue = function(index){
    $scope.setObj.quota[index].none = false;
  };
});

/******************************************************************************

  PROFILE ENERGY SETTING

******************************************************************************/
app.controller('adminProfileEnergyCtrl',function(
  $scope,constServ,uiServ,timeServ,
  adminHighlightServ,profileAdminServ
){
  $scope.tab = true;
  $scope.tabbing = function(bool){$scope.tab = bool;};
  $scope.selectedId = 1;
  $scope.activeMonth = (new Date()).getMonth();
  $scope.activeConstMonth = (new Date()).getMonth();
  $scope.activeYearPower = (new Date()).getFullYear();
  $scope.modeList = constServ.getMode();

  $scope.changeView = function(){
    uiServ.loader0show();
    adminHighlightServ.setDisplay('profile',$scope.selectedId,'energy');
    $scope.views = adminHighlightServ.getDisplay();
  };
  $scope.changeView();
  profileAdminServ.set();
  $scope.profiles = profileAdminServ.get();

  $scope.getFullMonth = constServ.getFullMonth;
  $scope.months = constServ.getMonths();
  $scope.getTimeArray = timeServ.getArray;
  $scope.monthDay = timeServ.monthDay;
  $scope.isHoliday = function(index){return ($scope.setObj)?(
      ($scope.setObj.hasOwnProperty('option') && $scope.setObj.hasOwnProperty('quota'))?($scope.setObj.option.holiday.indexOf(index + 1) !== -1):false
    ):false;
  };
  $scope.updateHoliday = function(index){
    if($scope.setObj.option.holiday.indexOf(index + 1) !== -1) $scope.setObj.option.holiday.splice($scope.setObj.option.holiday.indexOf(index + 1),1);
    else $scope.setObj.option.holiday.push(index + 1);
  };
  $scope.updateSetting = function(){
    adminHighlightServ.update('profile','energy',$scope.activeMonth + 1);
  };

  $scope.setMonth = function(month,chk){
    adminHighlightServ.setSetting('profile','energy',month + 1,chk);
    $scope.fGap = adminHighlightServ.setGap($scope.activeMonth);
    $scope.setObj = adminHighlightServ.getSetting();
  };
  $scope.setMonth($scope.activeMonth,false);
  $scope.changeMonth = function(index){
    $scope.activeMonth = index;
    $scope.setMonth(index,true);
  };

  $scope.changeMode = function(){
    adminHighlightServ.changeMode('profile','energy',$scope.activeMonth + 1);
  };
  $scope.useData = function(mode){
    adminHighlightServ.useData(mode,'profile','energy',$scope.activeMonth);
  };
  $scope.useBackupData = function(month,year){
    adminHighlightServ.loadData('profile','energy',year,month + 1);
  };

  $scope.getIn = function(type,mnum){
    return ($scope.setObj)?(
      ($scope.setObj.hasOwnProperty('option') && $scope.setObj.hasOwnProperty('quota'))?timeServ.get(type,mnum,$scope.setObj.option.holiday):''
    ):'';
  };
  $scope.partWay = function(type,obj){
    if($scope.setObj){ if($scope.setObj.hasOwnProperty('option') && $scope.setObj.hasOwnProperty('quota')) {
      return adminHighlightServ.partWay(type,$scope.setObj.quota.indexOf(obj));
    }}
  };
  $scope.adjustValue = function(index){
    $scope.setObj.quota[index].none = false;
  };
});

/******************************************************************************

  NODE POWER SETTING

******************************************************************************/
app.controller('adminBuildingPowerCtrl',function(
  $scope,constServ,uiServ,timeServ,
  adminHighlightServ,profileAdminServ,structureAdminServ
){
  $scope.tab = true;
  $scope.tabbing = function(bool){$scope.tab = bool;};
  $scope.selectedId = 1;
  $scope.activeMonth = (new Date()).getMonth();
  $scope.activeConstMonth = (new Date()).getMonth();
  $scope.activeYearPower = (new Date()).getFullYear();
  $scope.modeList = constServ.getMode();

  $scope.changeView = function(){
    uiServ.loader0show();
    adminHighlightServ.setDisplay('node',$scope.selectedId,'power');
    $scope.views = adminHighlightServ.getDisplay();
  };
  $scope.changeView();
  profileAdminServ.set();
  $scope.profiles = profileAdminServ.get();

  $scope.getFullMonth = constServ.getFullMonth;
  $scope.months = constServ.getMonths();
  $scope.getTimeArray = timeServ.getArray;
  $scope.monthDay = timeServ.monthDay;
  $scope.isHoliday = function(index){return ($scope.setObj)?(
      ($scope.setObj.hasOwnProperty('option') && $scope.setObj.hasOwnProperty('quota'))?($scope.setObj.option.holiday.indexOf(index + 1) !== -1):false
    ):false;
  };
  $scope.updateHoliday = function(index){
    if($scope.setObj.option.holiday.indexOf(index + 1) !== -1) $scope.setObj.option.holiday.splice($scope.setObj.option.holiday.indexOf(index + 1),1);
    else $scope.setObj.option.holiday.push(index + 1);
  };
  $scope.updateSetting = function(){
    adminHighlightServ.update('node','power',$scope.activeMonth + 1);
  };

  $scope.setMonth = function(month,chk){
    adminHighlightServ.setSetting('node','power',month + 1,chk);
    $scope.fGap = adminHighlightServ.setGap($scope.activeMonth);
    $scope.setObj = adminHighlightServ.getSetting();
  };
  $scope.setMonth($scope.activeMonth,false);
  $scope.changeMonth = function(index){
    $scope.activeMonth = index;
    $scope.setMonth(index,true);
  };

  $scope.changeMode = function(){
    adminHighlightServ.changeMode('node','power',$scope.activeMonth + 1);
  };
  $scope.useData = function(mode){
    adminHighlightServ.useData(mode,'node','power',$scope.activeMonth);
  };
  $scope.useBackupData = function(month,year){
    adminHighlightServ.loadData('node','power',year,month + 1);
  };

  $scope.adjustValue = function(index){
    $scope.setObj.quota[index].none = false;
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
  $scope.sumUp = function(){
    adminHighlightServ.recursiveSumUp($scope.data);
  };
});

/******************************************************************************

  NODE ENERGY SETTING

******************************************************************************/
app.controller('adminBuildingEnergyCtrl',function(
  $scope,constServ,uiServ,timeServ,
  adminHighlightServ,profileAdminServ,structureAdminServ
){
  $scope.tab = true;
  $scope.tabbing = function(bool){$scope.tab = bool;};
  $scope.selectedId = 1;
  $scope.activeMonth = (new Date()).getMonth();
  $scope.activeConstMonth = (new Date()).getMonth();
  $scope.activeYearPower = (new Date()).getFullYear();
  $scope.modeList = constServ.getMode();

  $scope.changeView = function(){
    uiServ.loader0show();
    adminHighlightServ.setDisplay('node',$scope.selectedId,'energy');
    $scope.views = adminHighlightServ.getDisplay();
  };
  $scope.changeView();
  profileAdminServ.set();
  $scope.profiles = profileAdminServ.get();

  $scope.getFullMonth = constServ.getFullMonth;
  $scope.months = constServ.getMonths();
  $scope.getTimeArray = timeServ.getArray;
  $scope.monthDay = timeServ.monthDay;
  $scope.isHoliday = function(index){return ($scope.setObj)?(
      ($scope.setObj.hasOwnProperty('option') && $scope.setObj.hasOwnProperty('quota'))?($scope.setObj.option.holiday.indexOf(index + 1) !== -1):false
    ):false;
  };
  $scope.updateHoliday = function(index){
    if($scope.setObj.option.holiday.indexOf(index + 1) !== -1) $scope.setObj.option.holiday.splice($scope.setObj.option.holiday.indexOf(index + 1),1);
    else $scope.setObj.option.holiday.push(index + 1);
  };
  $scope.updateSetting = function(){
    adminHighlightServ.update('node','energy',$scope.activeMonth + 1);
  };

  $scope.setMonth = function(month,chk){
    adminHighlightServ.setSetting('node','energy',month + 1,chk);
    $scope.fGap = adminHighlightServ.setGap($scope.activeMonth);
    $scope.setObj = adminHighlightServ.getSetting();
  };
  $scope.setMonth($scope.activeMonth,false);
  $scope.changeMonth = function(index){
    $scope.activeMonth = index;
    $scope.setMonth(index,true);
  };

  $scope.changeMode = function(){
    adminHighlightServ.changeMode('node','energy',$scope.activeMonth + 1);
  };
  $scope.useData = function(mode){
    adminHighlightServ.useData(mode,'node','energy',$scope.activeMonth);
  };
  $scope.useBackupData = function(month,year){
    adminHighlightServ.loadData('node','energy',year,month + 1);
  };

  $scope.getIn = function(type,mnum){
    return ($scope.setObj)?(
      ($scope.setObj.hasOwnProperty('option') && $scope.setObj.hasOwnProperty('quota'))?timeServ.get(type,mnum,$scope.setObj.option.holiday):''
    ):'';
  };
  $scope.partWay = function(type,obj){
    if($scope.setObj){ if($scope.setObj.hasOwnProperty('option') && $scope.setObj.hasOwnProperty('quota')) {
      return adminHighlightServ.partWay(type,$scope.setObj.quota.indexOf(obj));
    }}
  };
  $scope.adjustValue = function(index){
    $scope.setObj.quota[index].none = false;
    if($scope.flagAutoSum) adminHighlightServ.recursiveSumUp($scope.data);
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
});