function sendRequest(verb, url, data, cb){
    var http = new XMLHttpRequest();
    var result = {};  
    try
    {
      http.onreadystatechange = function() {
          if(http.readyState == 4 && http.status != 0) {
            result.code = http.status;
            if(http.getResponseHeader('content-type') == "application/json; charset=utf-8")
              result.body = JSON.parse(http.response);
            else
              result.body = http.response;
            return cb(result); 
          }
          if(http.readyState == 4 && http.status == 0) {
            result.code = 500;
            result.body = { "details" : "Connection error." };
            return cb(result); 
          }
      };
      if(verb == "POST") {
        var params = JSON.stringify(data); 
        http.open(verb, url, true);
        http.setRequestHeader('Content-type', 'application/json');
        http.send(params);
      }
      else if (verb == "GET") {
        var params = formatParams(data);
        http.open(verb, url + params, true); 
        http.setRequestHeader('Content-type', 'application/json');
        http.send(null);
      }
    }
    catch(e){
        result.code = http.status;
        result.error = e;
        result.body = JSON.parse(http.response);
        return cb(result); 
    }
}

function formatParams( params ){
  return "?" + Object
        .keys(params)
        .map(function(key){
          return key+"="+encodeURIComponent(params[key])
        })
        .join("&")
}