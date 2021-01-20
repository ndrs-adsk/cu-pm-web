app.factory('profileGetAdminServ',function(restServ){return restServ.getCrud('/profile/profiles','a');});
app.factory('profileCrudAdminServ',function(restServ){return restServ.getCrud('/profile/profile/:id','crud');});
app.factory('profilSubGetAdminServ',function(restServ){return restServ.getCrud('/setting/profiles_subscribe','a');});
app.factory('profileSubCrudAdminServ',function(restServ){return restServ.getCrud('/setting/profile_subscribe/:id','wv');});

app.factory('profileAdminServ',function(profileSubAdminServ,profileGetAdminServ,profileCrudAdminServ,structureAdminServ,overviewServ,overviewGetServ){
  var profiles = {};
  var icons = [
    {name: "building 1", dir: "demand-profile"},
    {name: "house", dir: "house-profile"},
    {name: "factory", dir: "factory-profile"},
    {name: "wind turbine", dir: "supply-profile"},
    {name: "solar cell", dir: "solar-profile"},
    {name: "battery", dir: "battery-profile"}
  ];
  var newProfile = {
    id: -1,
    name: '',
    display_name: "new profile",
    display_status: true,
    img: "demand-profile",
    is_supply: false,
    map_node: []
  };
  var demo = {};

  return {
    setDemo: function(){
      var self = this;
      demo = overviewGetServ.get(function(){
        $('#bems-admin-demo-graph').highcharts(overviewServ.getChart(demo.graph,demo.quota.pw));
      });
    },
    getDemo: function(){return demo;},
    set: function(){
      window.dirtyProfile = true;
      profiles = profileGetAdminServ.getAll();
    },
    check: function(profileIndex,nodeId){
      for(var run in profiles[profileIndex].map_node) if(profiles[profileIndex].map_node[run] == nodeId) return true;
      return false;
    },
    apply: function(profileIndex,nodeId){
      if(this.check(profileIndex,nodeId)) profiles[profileIndex].map_node.splice(profiles[profileIndex].map_node.indexOf(nodeId),1);
      else profiles[profileIndex].map_node.push(nodeId);
    },
    get: function(){return profiles;},
    getNew: function(){return newProfile;},
    getIcon: function(){return icons;},
    update: function(fixId,index){profileCrudAdminServ.update({id: fixId},profiles[index],function(){$('#bems-admin-profile-modal-success').modal('show');});},
    create: function(profile){
      var self = this;
      var temp = angular.copy(profile);
      delete temp.id;

      profileCrudAdminServ.create(temp,function(){
        self.set();
        profileSubAdminServ.set();
      });
    },
    delete: function(fixId){
      var self = this;
      profileCrudAdminServ.delete({id: fixId},function(){
        self.set();
        profileSubAdminServ.set();
      });
    },
    confirm: function(){$('#bems-admin-profile-modal-delete').modal('show');}
  };
});
app.factory('profileSubAdminServ',function(profilSubGetAdminServ,profileSubCrudAdminServ,userAdminServ,uiServ){
  var loads = {};
  var load = {};
  var loadId = 0;
  var users = {};

  return {
    set: function(){
      window.dirtySubProfile =  true;
      loads = profilSubGetAdminServ.getAll(function(){uiServ.loader0hide();});
    },
    check: function(fixId){
      for(var key in load) if(load[key].id == fixId) return true;
      return false;
    },
    setSub: function(fixId){
      var self = this;
      loadId = fixId;
      load = profileSubCrudAdminServ.getWith({id: fixId});
      users = userAdminServ.get();
      setTimeout(function(){for(var run in users){
        if(users[run].hasOwnProperty('id') && self.check(users[run].id)) users[run].chk = true;
        else if(users[run].hasOwnProperty('id')) users[run].chk = false;
      }},500);
    },
    get: function(){return loads;},
    getSub: function(){return users;},
    update: function(){
      var upLoad = [];

      for(var run in users){
        if(users[run].hasOwnProperty('id') && users[run].chk) {
          upLoad.push({
            id: users[run].id,
            name: users[run].name
          });
        }
      }
      profileSubCrudAdminServ.updateAll({id: loadId},upLoad,this.set);
    }
  };
});

app.controller('profileAdminCtrl',function(
  $scope,$route,$timeout,$interval,userAdminServ,structureAdminServ,
  profileAdminServ,profileSubAdminServ
){
  window.dirtyProfile = false;
  window.dirtySubProfile = false;
  $scope.tab = true;
  $scope.modalTab = 1;
  $scope.tabbing = function(bool){$scope.tab = bool;};

  userAdminServ.set();
  $scope.users = userAdminServ.get();

  profileSubAdminServ.set();
  $scope.loads = profileSubAdminServ.get();
  $scope.loadsSub = profileSubAdminServ.getSub();

  $scope.profileSubVisibility = function(bool){
    var profileModal = "#bems-admin-profile-subscribe-modal";
    if(bool) $(profileModal).show();
    else $(profileModal).hide();
  };
  $scope.profileSub = function(fixId,name){
    $scope.loadName = name;
    profileSubAdminServ.setSub(fixId);
    $timeout(function(){
      $scope.loadsSub = profileSubAdminServ.getSub();
      $scope.profileSubVisibility(1);
    },750);
  };
  var intervalSubProfile = $interval(function(){ if(window.dirtySubProfile) {
    $scope.loads = profileSubAdminServ.get();
    window.dirtySubProfile = false;
  }},500);
  $scope.$on('$destroy',function(){if(intervalSubProfile) $interval.cancel(intervalSubProfile);});
  $scope.profileUpdateSub = function(){
    profileSubAdminServ.update();
    $scope.profileSubVisibility(0);
  };

  // // //

  profileAdminServ.set();
  $scope.profiles = profileAdminServ.get();
  $scope.icons = profileAdminServ.getIcon();
  $scope.updateProfile = function(id,index){
    if($scope.profiles[index].display_name.length === 0) $('#bems-admin-profile-modal-alert').modal('show');
    else profileAdminServ.update(id,index);
  };

  $scope.modalTitle = '';
  $scope.demoName = '';
  $scope.demoIcon = 'demand-profile';
  $scope.iconIndex = {id: 0, index: 0};
  $scope.delId = 0;
  $scope.delProfile = '';

  structureAdminServ.set();
  $scope.data = structureAdminServ.get();

  var intervalProfile = $interval(function(){ if(window.dirtyProfile){
    $scope.profiles = profileAdminServ.get();
    $scope.loads = profileSubAdminServ.get();
    window.dirtyProfile = false;
  }},500);
  $scope.$on('$destroy',function(){if(intervalProfile) $interval.cancel(intervalProfile);});
  $scope.preAdminCreateProfile = function(){
    $scope.profiles.push(profileAdminServ.getNew());
  };
  $scope.adminCreateProfile = function(profile){
    profileAdminServ.create(profile);
  };
  $scope.adminConfirmDelProfile = function(fixId,name){
    $scope.delId = fixId;
    $scope.delProfile = name;
    profileAdminServ.confirm();
  };
  $scope.adminDelProfile = function(fixId){
    profileAdminServ.delete(fixId);
  };
  $scope.adminPopProfile = function(){
    $scope.profiles.pop();
  };
  function chooseIndex(tab,name,fixId,index){
    $scope.modalTab = tab;
    $scope.iconIndex.index = index;
    $scope.iconIndex.id = fixId;
    $scope.modalTitle = name+" : "+$scope.profiles[index].display_name;
  }
  $scope.updateChoose = function(){$scope.profileEditVisibility(0);};
  $scope.chooseIcon = function(fixId,index){
    chooseIndex(1,'Select Icon',fixId,index);
    $scope.profileEditVisibility(1);
  };
  $scope.chooseNode = function(fixId,index){
    chooseIndex(2,'Select Node',fixId,index);
    $scope.profileEditVisibility(1);
  };
  $scope.checkNode = function(index,fixId){return profileAdminServ.check(index,fixId);};
  $scope.applyNode = function(index,fixId){profileAdminServ.apply(index,fixId);};
  $scope.tOps = {nodeChildren: 'nodes'};
  $scope.profileEditVisibility = function(bool){
    var profileModal = '#bems-admin-profile-popup';
    if(bool) $(profileModal).modal('show');
    else $(profileModal).modal('hide');
  };
  $scope.showProfileDemo = function(name,icon){
    $scope.demoName = name;
    $scope.demoIcon = icon;
    $scope.modalTab = 3;
    $scope.modalTitle = 'Preview Profile';
    $('#bems-admin-profile-popup-dialog').css("width","1200px");
    $scope.profileEditVisibility(1);
  };
  Highcharts.setOptions({global: {useUTC: false}});
  profileAdminServ.setDemo();
  $scope.demo = profileAdminServ.getDemo();
  $(window).resize();

  $scope.getNodeClass = function(node){
    if(node.ctrl_node) return 'glyphicon-record';
    else if(!node.nodes.length) return 'glyphicon-list';
    else return 'glyphicon-unchecked';
  };
});
