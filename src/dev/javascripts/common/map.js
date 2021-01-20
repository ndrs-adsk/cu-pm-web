app.factory('mapGetPmServ',function(restServ){return restServ.getCrud('/stations/pm_graph','a');});
app.factory('mapGetPmHrServ',function(restServ){return restServ.getCrud('/stations/pm_data','a');});

app.factory('mapPmServ',function(mapGetPmServ,uiServ,constServ,chartServ){
  return {
    set: function() {
      var self = this;
      pmData = mapGetPmServ.getAll(function () {
        uiServ.loader0hide();
        window.pmGraph = true;
      });
    },
    get: function() {
      // uiServ.loader0hide();
      return pmData;
    },
    getChart: function(data1hr, data24hr){
      var self = this;
      var graph24hr = [];
      var result;
      for (var key in data24hr) {
        result = self.calColorAQI(data24hr[key][1]);
        // console.log(result[0], result[1]);
        graph24hr[key] = {x:data24hr[key][0],y: data24hr[key][1],color: result[1]};
      }
      var chart = {};
      chart = chartServ.getCommon('day','energy');
      chart.chart.height = 200;
      chart.series = [
        {
          type: 'line',
          name: 'Average 1 hr',
          data: data1hr,
          zIndex: 1,
        },
        {
          color: result[1],
          type: 'column',
          name: 'Average 24 hr',
          data: graph24hr,
        }
      ];

      chart.tooltip = {
        snap: 0,
        pointFormat: '<b>{series.name}</b> : {point.y:.0f}<br>',
        shared: true,
      };

      chart.plotOptions = {
        series: {
          stickyTracking: false,
          pointWidth: 12
        }
      };

      chart.xAxis = chartServ.getXAxis('day');
      chart.yAxis = chartServ.getYAxis('pm');

      // console.log(chart);
      return chart;
    },
    getChartAQI: function(data24hr) {
      var self = this ;
      var AQIdata = [];
      for (var key in data24hr) {
        var result = self.calColorAQI(data24hr[key][1]);
        // console.log(result[0], result[1]);
        AQIdata[key] = {x:data24hr[key][0],y: result[0],color: result[1]};
      }
      // console.log(AQIdata);
      var chart = {};
      chart = chartServ.getCommon('day','AQI');
      chart.legend = {
        enabled: false
      };
      chart.chart.height = 200;
      chart.series = [
        {
          type: 'column',
          name: 'AQI',
          data: AQIdata,
        }
      ];

      chart.tooltip = {
        snap: 0,
        pointFormat: '<b>{series.name}</b> : {point.y:.0f}<br>',
        shared: true,
      };

      chart.plotOptions = {
        series: {
          stickyTracking: false,
          pointWidth: 12
        }
      };
      return chart;
    },
    calColorAQI: function(pm) {
      var PmLow, AQILow, cal;
      var arrayAQI = [];
      // for (var key in pm) {
        // console.log(Math.round(pm));
        pm = Math.round(pm);
        // pm = 91;
        // var color ='';
        if (pm !== 'undefined') {
          if (pm >= 0 && pm <=25) {
            cal = ((25-0)/(25-0));
            PmLow = 0;
            AQILow = 0;
            color = '#8edcff';
          } else if (pm >= 26 && pm <=37) {
            cal = ((50-26)/(37-26));
            PmLow = 26;
            AQILow = 26;
            color = '#2dff2d';
          } else if (pm >= 38 && pm <= 50) {
            cal = ((100-51)/(50-38));
            PmLow = 38;
            AQILow = 51;
            color = '#fff200';
          } else if (pm >= 51 && pm <= 90) {
            cal = ((200-101)/(90-51));
            PmLow = 51;
            AQILow = 101;
            color = '#fda50f';
          } else if (pm >= 91) {
            cal = 1; // (derived from Air4Thai Calculator) http://air4thai.pcd.go.th/webV2/aqi_info.php
            PmLow = 91;
            AQILow = 201;
            color = '#d8392d';
            // return (201, '#f44336');
            // return [201,''];
          }
          // console.log(Math.round(cal*(pm-PmLow)+AQILow));
        }
      // }
      return [Math.round(cal*(pm-PmLow)+AQILow), color];
    }
  };
});

app.factory('mapPmHrServ',function (mapGetPmHrServ, uiServ) {
  return{
    set: function () {
      pmHrData = mapGetPmHrServ.getAll(function () {
        window.pmDataHr = true;
      });
    },
    get: function () {
      return pmHrData;
    }
  };
});

app.controller('mapCtrl',function($scope,uiServ,mapPmServ,mapPmHrServ,overviewServ,$interval,$timeout){

  $scope.ShowName = false;

  $scope.orientation = window.orientation;
  // console.log($scope.orientation);
  // console.log(window.innerWidth);

  mapPmHrServ.set();
  $scope.pmDataHr = mapPmHrServ.get();
  
  mapPmServ.set();
  $scope.pmDataList = mapPmServ.get();

  // var intervalData = $interval(function(){ if(window.pmGraph && window.pmDataHr) {
  //   uiServ.loader0hide();
  //   window.pmGraph = !window.pmGraph;
  //   window.pmDataHr = !window.pmDataHr;
  
  // }},500);
  // $scope.$on('$destroy',function(){if(intervalData) $interval.cancel(intervalData);});

  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    // console.log("Windows Phone");
  }
  if (/android/i.test(userAgent)) {
      // console.log("Android");
  }
  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      // console.log("iOS");
  }
  

  $scope.displayPm = [{
    nameplace: '',
    avg1hr : ''
  }];

  // console.log('pmDataHr', $scope.pmDataHr)
  $scope.pmDataHr.$promise.then(function(data) {
    var strSplit;
    for (var run in data) {
      if (data[run].pm_data !== undefined) {
        if (!isNaN(Math.round(data[run].pm_data))) {
          $scope.displayPm[run] = {
            avg1hr : Math.round(data[run].pm_data)
            };
        } else {
          $scope.displayPm[run] = {
            avg1hr : '-'
          };
        }
      }
    }
  });

  $scope.displays = [{
    id:'',
    hr1:'',
    hr24:''
  }];

  $scope.pmDataList.$promise.then(function(data) {
    for (var key in data) {
        if (data[key].pm_avg1hr !== undefined && data[key].pm_avg24hr !== undefined) {
          var lenght1hr = data[key].pm_avg1hr.length;
          var lenght24hr = data[key].pm_avg24hr.length;
          if (lenght1hr !== 0 && lenght24hr !== 0) {
            // console.log(data[key].id);
            $scope.displays[key] = {
              id: data[key].id
            };
            if (!isNaN(Math.round(data[key].pm_avg1hr[lenght1hr-1][1]))) {
              $scope.displays[key].hr1 = Math.round(data[key].pm_avg1hr[lenght1hr-1][1]);
            } else {
              $scope.displays[key].hr1 = '-';
            }
            if(!isNaN(Math.round(data[key].pm_avg24hr[lenght24hr-1][1]))) {
              $scope.displays[key].hr24 = Math.round(data[key].pm_avg24hr[lenght24hr-1][1]);
            } else {
              $scope.displays[key].hr24 = '-';
            }
            if (data[key].name !== undefined) {
              strSplit = data[key].name.split('/');
              if (!strSplit[1].includes("@")) {
                $scope.displays[key].nameplace = strSplit[1];
              } else {
                $scope.displays[key].nameplace = strSplit[1].replace("@", "");
              }
            }
          } else {
            $scope.displays[key] = {
              id: data[key].id,
              hr1: 0,
              hr24: 0
            };
          }
        }
    }
  });

  // console.log('pmDatahr', $scope.pmDataHr);
  // console.log('pmDataList', $scope.pmDataList);
  // console.log('displays', $scope.displays);

  $scope.GetDetailsModal = function(id, nameplace) {
    uiServ.loader0show();
    switch (nameplace) {
      case 'dorm_witthayanives':
        $scope.nameplace = 'โรงอาหารหอพักนิสิต จุฬาฯ';
        break;
      case 'chulapat14':
        $scope.nameplace = 'จุฬาพัฒน์ 14';
        break;
      case 'central_library':
        $scope.nameplace = 'หอสมุดกลาง (ภายในอาคาร)';
        break;
      case 'gate_5':
        $scope.nameplace = 'สาธิตจุฬาประถม ประตู 5';
        break;
      case 'gate_3':
        $scope.nameplace = 'สาธิตจุฬาประถม โรงอาหารฝั่งริมถนน';
        break;
      case 'cham4_canteen':
        $scope.nameplace = 'โรงอาหารรวม ข้างอาคารจามจุรี 4';
        break;
      case 'parking':
        $scope.nameplace = 'โรงพยาบาลสัตว์เล็ก(ด้านหน้า) ลานจอดรถ คณะสัตวแพทย์';
        break;
      case 'hospital':
        $scope.nameplace = 'โรงพยาบาลสัตว์เล็ก(อาคารสัตววิทยวิจักษ์) คณะสัตวแพทย์';
        break;
      case '60y_bldg':
        $scope.nameplace = 'อาคาร 60 ปี ข้างเครื่องถ่ายเอกสาร คณะสัตวแพทย์';
        break;
      case '100y_bldg':
        $scope.nameplace = 'อาคารวิศว 100 ปี คณะวิศวกรรมศาสตร์';
        break;
      case 'ahs':
        $scope.nameplace = 'คณะสหเวชศาสตร์';
        break;
      case 'spsc':
        $scope.nameplace = 'คณะวิทยาศาสตร์การกีฬา';
        break;
      case '50y_bldg_walkway':
        $scope.nameplace = 'อาคาร 50 ปี เวชระเบียน ช่องทางเดิน คณะสัตวแพทย์';
        break;
      case 'arch':
        $scope.nameplace = 'คณะสถาปัตยกรรมศาสตร์';
        break;
      case 'visid_bldg':
        $scope.nameplace = 'อาคารวิศิษฐ์ ประจวบเหมาะ';
        break;
      case '3rd_bldg_store_rm':
        $scope.nameplace = 'ห้องพัสดุ อาคาร3 คณะวิศวกรรมศาสตร์';
        break;
      case 'chulachak_canteen':
        $scope.nameplace = 'โรงอาหารจุลจักรพงษ์ ด้านตลาดนัด';
        break;
      case 'live_learn_rm':
        $scope.nameplace = 'Live&Learn คณะวิศวกรรมศาสตร์';
        break;
      case 'pol_sci':
        $scope.nameplace = 'คณะรัฐศาสตร์';
        break;
      case 'sve':
        $scope.nameplace = 'ภาควิชาวิศวกรรมสำรวจ คณะวิศวกรรมศาสตร์';
        break;
    }

    for (var key in $scope.pmDataList) {
      if ($scope.pmDataList[key].hasOwnProperty('id') && $scope.pmDataList[key].id == id) {
        var data1hr = $scope.pmDataList[key].pm_avg1hr;
        var data24hr = $scope.pmDataList[key].pm_avg24hr;
        for (var hr1 in data1hr) {
          if (data1hr[hr1][1] == '-') {
            data1hr[hr1][1] = null;
          }
        }
        for (var hr24 in data24hr) {
          if (data24hr[hr24][1] == '-') {
            data24hr[hr24][1] = null;
          }
        }
        // if (data1hr[0][1] == '-' || data24hr[0][1] == '-' || data1hr[0][1] == undefined || data24hr[0][1] == undefined) {
        //   uiServ.loader0hide();
        //   return 0;
        // }
        $scope.dataPM = mapPmServ.getChart(data1hr, data24hr);
        $scope.dataAQI = mapPmServ.getChartAQI(data24hr);
        $('#chart-data-PM').highcharts($scope.dataPM);
        $('#chart-data-AQI').highcharts($scope.dataAQI);
      }
    }
    $scope.overviewChart = true;
    $('#bems-sensor-monitor').modal('show');
    uiServ.loader0hide();
  };

/**
 * function check and return nameplace(thai)
 * @param {name} use to check condition
 * @returns {string} nameplace
 */
  $scope.nameBox = function (name) {
    switch (name) {
      case 'dorm_witthayanives':
        return 'โรงอาหารหอพักนิสิต จุฬาฯ';
      case 'chulapat14': 
        return 'จุฬาพัฒน์ 14';
      case 'central_library': 
        return 'หอสมุดกลาง (ภายในอาคาร)';
      case 'gate_5': 
        return 'สาธิตจุฬาประถม ประตู 5';
      case 'gate_3': 
        return 'สาธิตจุฬาประถม โรงอาหารฝั่งริมถนน';
      case 'cham4_canteen':
        return 'โรงอาหารรวม ข้างอาคารจามจุรี 4';
      case 'parking': 
        return 'โรงพยาบาลสัตว์เล็ก(ด้านหน้า) ลานจอดรถ คณะสัตวแพทย์';
      case 'hospital': 
        return 'โรงพยาบาลสัตว์เล็ก(อาคารสัตววิทยวิจักษ์) คณะสัตวแพทย์';
      case '60y_bldg': 
        return 'อาคาร 60 ปี ข้างเครื่องถ่ายเอกสาร คณะสัตวแพทย์';
      case '100y_bldg': 
        return 'อาคารวิศว 100 ปี คณะวิศวกรรมศาสตร์';
      case 'ahs': 
        return 'คณะสหเวชศาสตร์';
      case 'spsc': 
        return 'คณะวิทยาศาสตร์การกีฬา';
      case '50y_bldg_walkway': 
        return 'อาคาร 50 ปี เวชระเบียน ช่องทางเดิน คณะสัตวแพทย์';
      case 'arch': 
        return 'คณะสถาปัตยกรรมศาสตร์';
      case 'visid_bldg': 
        return 'อาคารวิศิษฐ์ ประจวบเหมาะ';
      case '3rd_bldg_store_rm': 
        return 'ห้องพัสดุ อาคาร3 คณะวิศวกรรมศาสตร์';
      case 'chulachak_canteen': 
        return 'โรงอาหารจุลจักรพงษ์ ด้านตลาดนัด';
      case 'live_learn_rm': 
        return 'Live&Learn คณะวิศวกรรมศาสตร์';
      case 'pol_sci': 
        return 'คณะรัฐศาสตร์';
      case 'sve': 
        return 'ภาควิชาวิศวกรรมสำรวจ คณะวิศวกรรมศาสตร์';
      default:
        return '-';
    }
  };

  /**
   * function check condition and return style top & right for pin location
   * @param {name} use to check condition
   * @returns style top & right
   */
  $scope.stylePin = function (name) {
    
    switch (name) {
      case 'dorm_witthayanives':
        return 'top: 229px; right: 800px;';
      case 'chulapat14': // chulapat14
        return 'top: 346px; right: 1246px;'; // not current location
      case 'central_library': // central_library
        return 'top: 247px; right: 599;'; // not current location
      case 'gate_5': // gate_5
        return 'top: 371px; right: 435px;';
      case 'gate_3': // gate_3
        return 'top: 286px; right: 498px;';
      case 'cham4_canteen':
        return 'top: 207px; right: 619px;';
      case 'parking':
        return 'top: -83px; right: 813px; z-index: 300;';
      case 'hospital':
        return 'top: -68px; right: 821px;';
      case '60y_bldg':
        return 'top: -13px; right: 849px;';
      case '100y_bldg':
        return 'top: -50px; right: 386px;';
      case 'ahs':
        return 'top: 174px; right: 1007px;';
      case 'spsc':
        return 'top: 274px; right: 1088px;';
      case '50y_bldg_walkway':
        return 'top: -68px; right: 798px;';
      case 'arch':
        return 'top: 94px; right: 660px;';
      case 'visid_bldg':
        return 'top: 34px; right: 198px;';
      case '3rd_bldg_store_rm':
        return 'top: -23px; right: 436px;';
      case 'chulachak_canteen':
        return 'top: 96px; right: 261px;';
      case 'live_learn_rm':
        return 'top: 10px; right: 445px;';
      case 'pol_sci':
        return 'top: 12px;right: 261px;';
      case 'sve':
        return 'top: 28px;right: 306px;';
      default:
        return 'display:none;';
    }
  };

   /**
   * function check condition and return style top & right for nameplace box
   * @param {name} use to check condition
   * @returns style top & right
   */
  $scope.styleNameplace = function (name) {
    // console.log(name);
    switch (name) {
      case 'dorm_witthayanives':
        return 'top: 285px; right: 859px;';
      case 'chulapat14': // chulapat14
        return 'top: 396px; right: 1143px;';
      case 'central_library': // central_library
        return 'top: 361px; right: 535px;';
      case 'gate_5': // gate_5
        return 'top: 423px; right: 274px;';
      case 'gate_3': // gate_3
        return 'top: 338px; right: 264px;';
      case 'cham4_canteen':
        return 'top: 261px; right: 678px;';
      case 'parking':
        return 'top: -44px; right: 525px; max-width: 280px;';
      case 'hospital':
        return 'top: -24px; right: 886px; max-width: 280px;';
      case '60y_bldg':
        return 'top: 107px; right: 764px; max-width: 220px;';
      case '100y_bldg':
        return 'top: 0px; right: 143px;';
      case 'ahs':
        return 'top: 230px; right: 1071px;';
      case 'spsc':
        return 'top: 330px; right: 921px;';
      case '50y_bldg_walkway':
        return 'top: -12px; right: 544px;';
      case 'arch':
        return 'top: 146px; right: 721px;';
      case 'visid_bldg':
        return 'top: 90px; right: 18px;';
      case '3rd_bldg_store_rm':
        return 'top: 23px; right: 497px;';
      case 'chulachak_canteen':
        return 'top: 152px; right: 35px;';
      case 'live_learn_rm':
        return 'top: 64px; right: 504px;';
      case 'pol_sci':
        return 'top: 67px; right: 321px;';
      case 'sve':
        return 'top: 91px; right: 361px; max-width: 170px;';
      default:
        return 'display:none;';
    }
  };

  $scope.chkClassTextBox = function (name) {
    switch (name) {
      case 'dorm_witthayanives':
        return 'bems-map-name-box-right';
      case 'chulapat14': // chulapat14
        return 'bems-map-name-box-left';
      case 'central_library': // central_library
        return 'bems-map-name-box-top';
      case 'gate_5': // gate_5
        return 'bems-map-name-box-left';
      case 'gate_3': // gate_3
        return 'bems-map-name-box-left';
      case 'cham4_canteen':
        return 'bems-map-name-box-right';
      case 'parking':
        return 'bems-map-name-box-left';
      case 'hospital':
        return 'bems-map-name-box-right';
      case '60y_bldg':
        return 'bems-map-name-box-top';
      case '100y_bldg':
        return 'bems-map-name-box-left';
      case 'ahs':
        return 'bems-map-name-box-right';
      case 'spsc':
        return 'bems-map-name-box-left';
      case '50y_bldg_walkway':
        return 'bems-map-name-box-left';
      case 'arch':
        return 'bems-map-name-box-right';
      case 'visid_bldg':
        return 'bems-map-name-box-left';
      case '3rd_bldg_store_rm':
        return 'bems-map-name-box-right';
      case 'chulachak_canteen':
        return 'bems-map-name-box-left';
      case 'live_learn_rm':
        return 'bems-map-name-box-right';
      case 'pol_sci':
        return 'bems-map-name-box-right';
      case 'sve':
        return 'bems-map-name-box-right';
      default:
        return 'display:none;';
    }
  };

  $scope.getImg = function(pm) {
    // console.log(pm);
    if (pm >= 0 && pm <=25) {
      return 'svg/location-blue.svg';
    } else if (pm >= 26 && pm <=37) {
      return 'svg/location-green.svg';
    } else if (pm >= 38 && pm <= 50) {
      return 'svg/location-yellow.svg';
    } else if (pm >= 51 && pm <= 90) {
      return 'svg/location-orange.svg';
    } else if (pm >= 91) {
      return 'svg/location-red.svg';
    } else {
      return 'svg/location-gray.svg';
    }
  };

  $scope.ShowTextBox = function(id, name) {
    // console.log(id, name);
    if (id !== 0) {
      $scope.mousedisplay = id;
      $("#"+name).fadeIn(50);
    } else {
      $scope.mousedisplay = 0;
      $("#"+name).fadeOut(50);
    }
  };

  $scope.reFlowChart = function() {
    if($scope.overviewChart == true) {
      $timeout(function () {
        $('#chart-data-PM').highcharts().reflow();
        $('#chart-data-AQI').highcharts().reflow();
      }, 500);
    }
  };


  $scope.ShowAllName = function(show) {
    // console.log(show);
    $('.all-name').fadeToggle(100);
    $scope.ShowName = !show;
  };

  $scope.getName = function(index) {
      return $scope.pmDataList[index].id;
  };

  /**
  * function displays value pm avg 24 hr(inside pin-location)
  * hide when device is iphone or ipod, portrait, not zoom
  */
  $scope.hidePM24avg = function () {
    if ($scope.zoom && /iPhone|iPod/.test(userAgent) && !window.MSStream && $scope.orientation == 0) {
      return true;
    } else {
      return false;
    }
  };

  $scope.setDefaultMapRes = function () {
    if (window.innerWidth > 1199) {
      return 'bems-map-default-resolution';
    }
  };

  $scope.zoom = true;
  $scope.zoomMapKa = function() {
    if(window.innerWidth < 1200) {
      $scope.mapStyle = {
        'zoom': (window.innerWidth * 100)/1200+'%'
      };
    }
  };

  $scope.zoomMapKa();
  $(window).on("orientationchange", function() {
      $scope.orientation = window.orientation;
      $scope.zoom = true;

      // iOS detection from: http://stackoverflow.com/a/9039885/177710
      if (/iPhone|iPod/.test(userAgent) && !window.MSStream) {
        if ($scope.orientation == 90 || $scope.orientation == -90) {
          $scope.mapStyle = {'zoom': (screen.width * 178)/1200+'%'};
        } else {
          $scope.mapStyle = {'zoom': (screen.width * 100)/1200+'%'};
        }
      } else if (/android/i.test(userAgent)) {
        $scope.mapStyle = {'zoom': (screen.width * 100)/1200+'%'};
      }
      // console.log('orientation', $scope.orientation);
      // console.log('screen.width: ', screen.width);
      // $scope.zoomMapKa();
    }
  );

  $scope.zoomMap = function() {
    // console.log('zoomMap');
    if($scope.zoom) $scope.mapStyle = {'zoom': '100%'};
    else $scope.mapStyle = {'zoom': (window.innerWidth * 100)/1200+'%'};
    // console.log($scope.mapStyle);
    $scope.zoom = !$scope.zoom;
  };
  // $scope.positiveLookingValue = function(values){
  //   return Math.abs(values);
  // };

});