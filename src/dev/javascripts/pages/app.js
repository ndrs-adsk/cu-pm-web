var app = angular.module('bemsApp',[
  'ngRoute','ngResource','ngSanitize','ngAnimate',
  'highcharts-ng','ui.sortable','treeControl','ngFileUpload'
]);

app.config(function($routeProvider,$locationProvider){
  $routeProvider
    .when('/',{
      templateUrl: 'map.html',
      controller: 'mapInit',
      resolve: {resolvePlz: function(authenServ){return authenServ.checkAuthen();}}
    })
    .otherwise({redirectTo: '/'});

    $locationProvider.html5Mode(false);
    $locationProvider.hashPrefix('');
});

/******************************************************************************

  MAIN APP

******************************************************************************/
app.factory('initServ',function(uiServ,$location){
  return {
    init: function(){
      uiServ.loader0show();
      $.material.init();
      Highcharts.setOptions({
        global: {useUTC: false},
        chart: {style: {fontFamily: 'Roboto'}},
        lang:{thousandsSep: ',' },
        colors: ['#377eb8','#4daf4a','#ff7f00','#a65628','#f781bf','#999999','#a6cee3','#984ea3','#1f78b4','#b2df8a','#fb9a99','#fdbf6f','#c894f0','#ffff33','#cab2d6','#e41a1c']
      });
    },
    chkRoute: function(name,val){
      if(angular.isUndefined(val)) $location.path('/');
      else sessionStorage.setItem(name,val);
    },
    map: function(){uiServ.footerInit("MAIN MAP","",1,30);},
  };
});

app.controller('mapInit',function(initServ){
  initServ.init();
  initServ.map();
});