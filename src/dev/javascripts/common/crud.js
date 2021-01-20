app.factory('restServ',function($resource,constServ){
  var justElem = {method: 'GET'};
  var readAllElem = {method: 'GET', isArray: true};
  var readAllWithElem = {method: 'GET', isArray: true, params: {id: '@id'}};
  var readElem = {method: 'GET', params: {id: '@id'}};
  var updateElem = {method: 'PUT', params: {id: '@id'}};
  var updateAllElem = {method: 'PUT', isArray: true, params: {id: '@id'}};
  var deleteElem = {method: 'DELETE', params: {id: '@id'}};
  var createElem = {method: 'POST'};

  return {
    get: function(crud){
      var rtn = {};
      if((typeof crud === 'object') && (crud !== null)){rtn = crud;}
      else {
        var length = crud.length;

        for(var i = 0;i < length;i++){
          switch(crud.charAt(i)){
            case 'x':
              rtn.just = justElem;
              break;
            case 'c':
              rtn.create = createElem;
              break;
            case 'r':
              rtn.get = readElem;
              break;
            case 'u':
              rtn.update = updateElem;
              break;
            case 'd':
              rtn.delete = deleteElem;
              break;
            case 'a':
              rtn.getAll = readAllElem;
              break;
            case 'w':
              rtn.getWith = readAllWithElem;
              break;
            case 'v':
              rtn.updateAll = updateAllElem;
              break;
            default:
              rtn = crud;
          }
        }
      }
      return rtn;
    },
    getCrud: function(url,crud,bool){
      var useUrl = constServ.getUrl()+url;
      if(bool) useUrl = url;
      return $resource(useUrl,{},this.get(crud));
    }
  };
});
