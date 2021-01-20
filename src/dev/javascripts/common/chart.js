app.factory('chartServ',function(constServ){
  var chartCommon = {
    reflow: true,
    credits: {enabled: false},
    legend: {enabled: true},
    title: {text: ''},
    tooltip: {pointFormat: '<b>{series.name}</b> : {point.y:.2f}'},
    navigator: {enabled: false},
    scrollbar: {enabled: false},
    rangeSelector: {enabled: false},
    exporting: {enabled: false},
    plotOptions: {
      column: {
        pointPlacement: 'between',
        pointPadding: 0,
        groupPadding: 0,
        borderWidth: 0.5
      }
    },
    chart: {
      alignTicks: true,
      pinchType: 'none',
      zoomType: 'none'
    },
    series: [{
      type: 'column',
      zIndex: 1,
      dataGrouping: {enabled: false}
    }]
  };
  var pieCommon = {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 0
    },
    title : {
      userHTML: true,
      text: '',
      align: 'center',
      verticalAlign: 'middle',
      style: {
        fontWeight: 'bold',
        fontSize: '2em',
        textShadow: "rgb(255, 255, 255) 0px 0px 10px"
      },
      y: 0,
      floating: true
    },
    subtitle: {
      userHTML: true,
      align: 'center',
      verticalAlign: 'middle',
      style: {
        fontWeight: 'bold',
        textShadow: "rgb(255, 255, 255) 0px 0px 10px"
      },
      y: 30,
      floating: true
    },
    options: {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        height: 300
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            userHTML: true,
            formatter: function(){
              var temp = '<div style="text-align:center;"><span style="font-size:2.25em;color:'+this.point.color+'">'+
                 Highcharts.numberFormat(this.percentage,1)+'%</span><br>'+
                this.point.name+'<br>'+Highcharts.numberFormat(this.y,2)+' '+this.point.unit+'</div>';
              return temp;
            }
          },
        }
      },
      tooltip: {pointFormat: '<b>{point.y:.2f} {point.unit}</b> ({point.percentage:.1f}%)'}
    },
    tooltip: {pointFormat: '<b>{point.y:.2f} {point.unit}</b> ({point.percentage:.1f}%)'},
    credits: {enabled: false},
    navigator: {enabled: false},
    scrollbar: {enabled: false},
    rangeSelector: {enabled: false},
    exporting: {enabled: false},
    series: [{colorByPoint: true}]
  };

  var pieCommon2 = angular.copy(pieCommon);
  delete pieCommon2.options;
  pieCommon2.chart = {
    height: 250,
    plotBackgroundColor: null,
    plotBorderWidth: 0,
    plotShadow: false,
    type: 'pie'
  };
  pieCommon2.plotOptions = {pie: {
    allowPointSelect: true,
    cursor: 'pointer',
    dataLabels: {
      enabled: true,
      userHTML: true,
      formatter: function(){
        var temp = '<div style="text-align:center;"><span style="font-size:1.5em;color:'+this.point.color+'">'+
           Highcharts.numberFormat(this.percentage,1)+'%</span><br>'+
          this.point.name+'</div>';
        return temp;
      },
      distance: 20
    },
    innerSize: '60%',
  }};


  var pieCommon3 = angular.copy(pieCommon);
  delete pieCommon3.options;
  pieCommon3.chart = {
    height: 250,
    plotBackgroundColor: null,
    plotBorderWidth: 0,
    plotShadow: false,
    type: 'pie'
  };
  pieCommon3.plotOptions = {pie: {
    allowPointSelect: true,
    cursor: 'pointer',
    showInLegend: true,
    dataLabels: {
      enabled: true,
      userHTML: true,
      formatter: function(){
        var temp = '<div style="text-align:center;"><span style="font-size:1.1em;color:'+this.point.color+'">'+
           Highcharts.numberFormat(this.percentage,1)+'%</span><br></div>';
        return temp;
      },
      distance: 30
    },
    innerSize: '60%',
  }};


  var pieCommon4 = {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 0
    },
    title : {
      userHTML: true,
      text: '',
      align: 'center',
      verticalAlign: 'middle',
      style: {
        fontWeight: 'bold',
        fontSize: '2em',
        textShadow: "rgb(255, 255, 255) 0px 0px 10px"
      },
      y: 0,
      floating: true
    },
    subtitle: {
      userHTML: true,
      align: 'center',
      verticalAlign: 'middle',
      style: {
        fontWeight: 'bold',
        textShadow: "rgb(255, 255, 255) 0px 0px 10px"
      },
      y: 30,
      floating: true
    },
    options: {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        height: 450
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            userHTML: true,
            formatter: function(){
              var temp = '<div style="text-align:center;"><span style="font-size:2.25em;color:'+this.point.color+'">'+
                 Highcharts.numberFormat(this.percentage,1)+'%</span><br>'+
                this.point.name+'<br>'+Highcharts.numberFormat(this.y,2)+' '+this.point.unit+'</div>';
              return temp;
            }
          },
        }
      },
      tooltip: {pointFormat: '<b>{point.y:.2f} {point.unit}</b> ({point.percentage:.1f}%)'}
    },
    tooltip: {pointFormat: '<b>{point.y:.2f} {point.unit}</b> ({point.percentage:.1f}%)'},
    credits: {enabled: false},
    legend: {enabled: false},
    navigator: {enabled: false},
    scrollbar: {enabled: false},
    rangeSelector: {enabled: false},
    exporting: {enabled: false},
    series: [{colorByPoint: true}]
  };

  var xAxisPattern = {
    type: 'datetime',
    ordinal: false,
    labels: {style: {fontWeight :'bold'}},
    title: {
      align: 'high',
      text: 'time'
    }
  };

  var yAxisPattern = {
    min: 0,
    title: {text: ''},
    tickPosition: "outside",
    tickAmount: 5
  };

  var dataGrouping = {
    approxmation: 'average',
    enabled: true,
    forced: true,
    units: [['minute']]
  };

  return {
    getGroupping : function(val){
      var temp = angular.copy(dataGrouping);
      temp.units[0].push([val]);
      return temp;
    },
    getYAxis : function(yName,opposite){
      var temp = angular.copy(yAxisPattern);
      switch(yName){
        case 'energy':
          temp.title.text =  'Energy (kWh)';
          break;
        case 'peak':
        case 'power':
          temp.title.text =  'Power (kW)';
          break;
        case 'temperature':
          temp.title.text =  'Temperature(°C)';
          break;
        case 'humidity':
          temp.title.text =  'Humidity (%)';
          break;
        case 'illuminance':
          temp.title.text =  'Illuminance (lux)';
          break;
        case 'pm':
          temp.title.text =  'PM2.5 (µg/m^3)';
          break;
        case 'AQI':
          temp.title.text =  'AQI';
          break;
        default:
          break;
      }
      if(opposite) temp.opposite = true;
      return temp;
    },
    getYAxis2 : function(yName,opposite){
      var temp = angular.copy(yAxisPattern);
      switch(yName){
        case 'energy':
          temp.title.text =  'Energy (kWh)';
          break;
        case 'peak':
        case 'power':
          temp.title.text =  'Power (W)';
          break;
        case 'temperature':
          temp.title.text =  'Temperature(°C)';
          break;
        case 'humidity':
          temp.title.text =  'Humidity (%)';
          break;
        case 'illuminance':
          temp.title.text =  'Illuminance (lux)';
          break;
        default:
          break;
      }
      if(opposite) temp.opposite = true;
      return temp;
    },
    getXAxis :function(xName){
      var temp = angular.copy(xAxisPattern);
      temp.labels.formatter = function(){return (new Date(this.value)).getHours();};
      temp.tickInterval = 2 * 60 * 60 * 1000;
      switch(xName){
        case 'month':
          temp.labels.formatter = function(){return (new Date(this.value)).getDate();};
          temp.tickInterval = 2 * 60 * 60 * 1000 * 24;   
          temp.title.text =  'time (date)';
          break;
        case 'year':
          temp.labels.formatter = function(){return constServ.getMonth((new Date(this.value)).getMonth());};
          temp.tickInterval = 2 * 60 * 60 * 1000 * 12 * (365 / 12);   
          temp.title.text =  'time (month)';
          break;
        default:
          var now = new Date();
          temp.max = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1,0,0,0,0).getTime();
          temp.min = new Date(now.getFullYear(), now.getMonth(), now.getDate(),0,0,0,0).getTime();
          // console.log(temp.max,temp.min);
          delete temp.labels;
          delete temp.tickInterval;
          break;
      }
      return temp;
    },
    getCommon :function(xName,yName){
      var chart = angular.copy(chartCommon);
      chart.xAxis = this.getXAxis(xName);
      chart.yAxis = this.getYAxis(yName);
      return chart;
    },
    getCommon2 :function(xName,yName){
      var chart = angular.copy(chartCommon);
      chart.xAxis = this.getXAxis(xName);
      chart.yAxis = this.getYAxis2(yName);
      return chart;
    },
    getPlotLine: function(name,value,color){return {
      value: value,
      color: color,
      width: 1,
      zIndex: 20,
      dashStyle: 'solid',
      label: {
        text: name,
        style: {color: color}
      }
    };},
    getPie :function(data){
      var pie = angular.copy(pieCommon);
      pie.series[0].data = data;
      return pie;
    },
    getPie2: function(data){
      var pie = angular.copy(pieCommon2);
      pie.series[0].data = data;
      return pie;
    },
    getPie3: function(data){
      var pie = angular.copy(pieCommon3);
      pie.series[0].data = data;
      return pie;
    },
    getPie4: function(data){
      var pie = angular.copy(pieCommon4);
      pie.series[0].data = data;
      return pie;
    },
    getOption :function(){return chartOptions;}
  };
});
