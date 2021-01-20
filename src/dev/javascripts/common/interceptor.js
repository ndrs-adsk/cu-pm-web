app.factory('sessionRecoverer',function($location){
  return {
    response: function(response){
      if(typeof response.data == 'object'){ if(response.data.hasOwnProperty('token_valid')){ if(!response.data.token_valid){
        //window.chkAlertBox = true;
        localStorage.clear();
      	sessionStorage.clear();
        $location.path('/');
      }}}
      return response;
    }
  };
});

app.config(function($httpProvider){$httpProvider.interceptors.push('sessionRecoverer');});
