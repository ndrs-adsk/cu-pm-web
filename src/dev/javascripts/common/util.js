app.factory('constServ',function(){
  // var url = 'http://161.200.194.82/web/cham5-api/api/v1';
  // var url = 'https://www.bems.chula.ac.th/web/cu-pm-prm-api/v1';
  var url = 'https://www.bems.chula.ac.th/web/cu-pm-api/v1';
  // var url = 'https://172.16.1.6:8080/cham5/api/v1';
  var storageUrl = 'http://161.200.194.82/sto/axis2/services/FIAPStorage';
  var mode = [{mode: 'manual', name: 'manual'}, {mode: '3m_avg', name: 'Last 3 months usage average'}, {mode: 'last_year', name: 'This month of last year usage'}];
  var month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN","JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  var fullMonth = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
  var colors = ['#bc250c','#f5c922','#9edf48','#f44336','#ffc107','#03a9f4','#59b75c'];
  var sColors = ['#984ea3','#ff7f00','#a65628','#f781bf','#999999','#a6cee3','#1f78b4','#b2df8a','#fb9a99','#fdbf6f','#ff7f00','#cab2d6','#e41a1c','#ffff33','#377eb8','#4daf4a'];

  return {
    getUrl: function(){return url;},
    getStorageUrl: function(){return storageUrl;},
    getMonths: function(){return month;},
    getMonth: function(num){return month[num];},
    getFullMonths: function(){return fullMonth;},
    getFullMonth: function(num){return fullMonth[num];},
    getMode: function(){return mode;},
    getColor: function(color){switch(color){
      case 'red': return colors[0];
      case 'yellow': return colors[1];
      case 'green': return colors[2];
      case 'm-red': return colors[3];
      case 'm-orange': return colors[4];
      case 'm-blue': return colors[5];
      case 'm-green': return colors[6];
      default: return '#000';
    }},
    getSColor:function(num){return sColors[num];}
  };
});

app.factory('timeServ',function(){
  return {
    monthDay: function(mnum){
      switch(mnum){
        case 0: case 2: case 4: case 6: case 7: case 9: case 11: return 31;
        case 3: case 5: case 8: case 10: return 30;
        case 1:
          var year = (new Date()).getFullYear();
          if((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) return 29;
          else return 28;
          break;
        default: return 0;
      }
    },
    getArray: function(num){return new Array(num);},
    get: function(type,mnum,holiday){
      var year = (new Date()).getFullYear();
      var weekday = 20;
      var saturn = 4;
      var sund = 4;
      function getDay(year,mth,day){
        var date = (new Date(year,mth,day)).getDay();
        switch(date){
          case 0: return 2;
          case 6: return 1;
          default: return 0;
        }
      }
      function maniDay(year,mnum,day,plus){switch(getDay(year,mnum,day)){
        case 0:
          if(plus) weekday++;
          else weekday--;
          break;
        case 1:
          if(plus) saturn++;
          else saturn--;
          break;
        case 2:
          if(plus) sund++;
          else sund--;
          break;
        default: break;
      }}
      switch(this.monthDay(mnum,year)){
        case 31:
          maniDay(year,mnum,31,true);
          /* falls through */
        case 30:
          maniDay(year,mnum,30,true);
          /* falls through */
        case 29:
          maniDay(year,mnum,29,true);
          break;
        default: break;
      }
      var stop = 0;
      for(var key in holiday) {
        maniDay(year,mnum,holiday[key],false);
        stop++;
      }
      switch(type){
        case 'weekday': return weekday;
        case 'saturday': return saturn;
        case 'sunday': return sund;
        default: return {
          weekday: weekday,
          saturday: saturn,
          sunday: sund,
          holiday: stop
        };
      }
    }
  };
});

app.factory('uiServ',function($timeout){
  return {
    footerInit: function(msg1,msg2,number,float,fspace,lspace){
      $(".bems-footer-navigation").css("bottom",float+"px");
      $(".bems-header-text").append("<span>"+msg1+"</span>&emsp;<span>"+msg2+"</span>");
      // $(".bems-footer-navigation-point-wrapper:nth-child("+number+") .bems-footer-navigation-point:first-child").addClass("bems-footer-navigation-active");
      if(lspace !== undefined) $(".bems-header-text span:last-child").css("letter-spacing",lspace+"px");
      if(fspace !== undefined) $(".bems-header-text span:first-child").css("letter-spacing",fspace+"px");
    },
    adjustHeightLogin: function(){
      if( $(window).height() > 600 ){
        var basicGap = 449;
        if ( $(window).width() > 1185 ) basicGap += 10;
        var loginGap = ( $(window).height() - basicGap ) / 2;
        $(".bems-wrapper").css("padding",loginGap+"px 0");
      }
    },
    adjustHeightOverview: function(){
      if( $(window).height() > 800 ){
        var loginGap = ( window.innerHeight - 710 ) / 2;
        console.log(loginGap);
        // if(loginGap > 82.5) {
        //   $(".bems-wrapper").css("padding-top",(loginGap)+"px");
        //   $(".bems-wrapper").css("padding-bottom",loginGap+"px");
        // }
      }
    },
    loader0show: function(){$('#bems-loader-wrapper').show();},
    loader0hide: function(){var t = $timeout(function(){$('#bems-loader-wrapper').hide();},1000);},
  };
});
