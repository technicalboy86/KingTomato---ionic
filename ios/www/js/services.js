angular.module('kingtomato.services', [])

.factory('Recipe', function($http, Storage, ImageFile) {
  var promise;
  var singlePromise;

  var objService = {
    async: function() {

      promise = $http.get(url+'app/all-recipes/').then(function (response) {
        var result = response.data;

        var newData = ImageFile.async(result, 'recipes');

        return result;
      });
      return promise;
    },
    first: function(itemId){
      var user = Storage.getObject("user");

      singlePromise = $http.get(url+'app/single-recipe/'+itemId+'/'+user.id).then(function (response) {
        return response.data;
      });
      
      return singlePromise;
    },
    getById: function(itemId){
      // Find Recipes by id
      var recipes = Storage.getObject("recipes") != null ? Storage.getObject("recipes") : [];
      var single = {};

      for(var i=0; i<recipes.length; i++){
        var each = recipes[i];
        
        if(each.id == itemId){
          single = each;
          break;
        }
      }

      return single;
    }
  };
  
  return objService;
})

.factory('RecipeCategory', function($http, Storage, ImageFile) {
  var promise;
  
  var objService = {
    all: function(){
      promise = $http.get(url+'app/all-recipe-categories').then(function (response) {
          return response.data;
        });
      
      return promise;
    },
    allHomeImage: function(){
      promise = $http.get(url+'app/all-home-images').then(function (response) {
        //console.log(response);
        var result = response.data;

        var newData = ImageFile.async(result, 'slides');

        return result;
      });
      return promise;
    }
  };
  
  return objService;
})

.factory('Tvc', function($http, Storage, ImageFile) {
  var promise;
  var singlePromise;

  var objService = {
    async: function() {
      promise = $http.get(url+'app/all-tvc/').then(function (response) {
        //console.log(response);
        var result = response.data;

        var newData = ImageFile.async(result, 'tvc');

        return result;
      });
      return promise;
    }
  };
  
  return objService;
})

.factory('Store', function($http) {
  var promise;
  
  var objService = {
    all: function(latitude, longitude){
      if(!promise){
        promise = $http.get(url+'app/all-stores/'+latitude+'/'+longitude).then(function (response) {
            return response.data;
          });
      }
      return promise;
    }
  };
  
  return objService;
})

.factory('ImageFile', function($q, Storage) {
  
  var objService = {
    async: function(result, storagekey){
      var deferred = $q.defer();

      var temp = [];

      window.requestFileSystem(
        LocalFileSystem.PERSISTENT, 0, 
        function(fileSystem){

          for(var i = 0; i<result.length ; i++){
            var fileURL = window.appRootDir.toURL() + "/" + basename(result[i].thumb);
            var baseUrl = dirname(result[i].thumb);

            var object = {};
            
            object = JSON.parse(JSON.stringify(result[i]));
            object.thumb = basename(result[i].thumb);

            temp.push(object);

          //  fileSystem.root.getFile(window.appRootDirName + "/" + basename(result[i].thumb), { create: true, exclusive:true }, 
          //    function(fileEntry){

                var fileTransfer = new FileTransfer();
                var uri = encodeURI(baseUrl + "/" + basename(result[i].thumb));
                //alert("download: "+ fileEntry.name);
                console.log("**********");
                console.log(uri);
                console.log(fileURL);
                console.log("**********");
                fileTransfer.download(
                    uri,
                    window.appRootDir.toURL() + "/" + basename(result[i].thumb),
                    function(entry) {
                      //alert("id : "+ result[i]);
                    },
                    function(error) {
                        console.log("download error source " + error.source);
                        console.log("download error target " + error.target);
                        console.log("upload error code" + error.code);
                    }
                );

          //    }, function(error){
                //alert("error :" + error.code);
          //    });

          }

          Storage.setObject(storagekey, temp);

          deferred.resolve(temp);

      }, function(){
        //alert("error");
      });

      // setTimeout(function(){

      //   for(var i = 0; i<result.length ; i++){
      //     var fileURL = window.appRootDir.toURL() + "/" + basename(result[i].thumb);
      //     var baseUrl = dirname(result[i].thumb);

      //     var object = {};
          
      //     object = JSON.parse(JSON.stringify(result[i]));
      //     object.thumb = fileURL;

      //     temp.push(object);

      //     window.requestFileSystem(
      //       LocalFileSystem.PERSISTENT, 0, 
      //       function(fileSystem){

      //         fileSystem.root.getFile(window.appRootDirName + "/" + basename(result[i].thumb), { create: true, exclusive:true }, 
      //           function(fileEntry){

      //             var fileTransfer = new FileTransfer();
      //             var uri = encodeURI(baseUrl + "/" + fileEntry.name);
      //             //alert("download: "+ fileEntry.name);
      //             fileTransfer.download(
      //                 uri,
      //                 window.appRootDir.toURL() + "/" + fileEntry.name,
      //                 function(entry) {
      //                   //alert("id : "+ result[i]);
      //                 },
      //                 function(error) {
      //                     console.log("download error source " + error.source);
      //                     console.log("download error target " + error.target);
      //                     console.log("upload error code" + error.code);
      //                 }
      //             );

      //           }, function(error){
      //             //alert("error :" + error.code);
      //           });

      //     }, function(){
      //       //alert("error");
      //     });

      //   }

      //   Storage.setObject(storagekey, temp);

      //   deferred.resolve(temp);

      // }, 100);

      return deferred.promise;
    }
  };
  
  return objService;
})

.factory('Product', function($http, Storage, ImageFile) {
  var promise;
  var singlePromise;

  var objService = {
    async: function() {
      promise = $http.get(url+'app/all-products/').then(function (response) {
        //console.log(response);
        var result = response.data;

        var newData = ImageFile.async(result, 'products');

        return result;
      });
      return promise;
    },
    first: function(itemId){
      singlePromise = $http.get(url+'app/single-product/'+itemId).then(function (response) {
        return response.data;
      });
      
      return singlePromise;
    },
    getById: function(itemId){
      // Find by id
      var all = Storage.getObject("products") != null ? Storage.getObject("products"):[];
      var single = {};

      for(var i=0; i<all.length; i++){
        var each = all[i];
        
        if(each.id == itemId){
          single = each;
          break;
        }
      }

      return single;
    }
  };
  
  return objService;
})
.factory('Event', function($http, Storage, ImageFile) {
  var promise;
  var singlePromise;

  var objService = {
    async: function() {
      promise = $http.get(url+'app/all-events/').then(function (response) {
        //console.log(response);
        var result = response.data;

        var newData = ImageFile.async(result, 'events');

        return result;
      });
      return promise;
    },
    first: function(itemId){
      singlePromise = $http.get(url+'app/single-event/'+itemId).then(function (response) {
        return response.data;
      });
      
      return singlePromise;
    },
    getById: function(itemId){
      // Find by id
      var all = Storage.getObject("events") != null ? Storage.getObject("events"):[];
      var single = {};

      for(var i=0; i<all.length; i++){
        var each = all[i];
        
        if(each.id == itemId){
          single = each;
          break;
        }
      }

      return single;
    }
  };
  
  return objService;
})
.factory('Friend', function($http, Storage, ImageFile) {
  var promise;
  var singlePromise;

  var objService = {
    async: function() {
      promise = $http.get(url+'app/all-friends/').then(function (response) {
        console.log(response);
        var result = response.data;

        var newData = ImageFile.async(result, 'friends');

        return result;
      });
      return promise;
    },
    first: function(itemId){
      singlePromise = $http.get(url+'app/single-friend/'+itemId).then(function (response) {
        return response.data;
      });
      
      return singlePromise;
    },
    getById: function(itemId){
      // Find by id
      var all = Storage.getObject("friends") != null ? Storage.getObject("friends"):[];
      var single = {};

      for(var i=0; i<all.length; i++){
        var each = all[i];
        
        if(each.id == itemId){
          single = each;
          break;
        }
      }

      return single;
    }
  };
  
  return objService;
})
.factory('Fact', function($http, Storage, ImageFile) {
  var promise;
  var singlePromise;

  var objService = {
    async: function() {
      promise = $http.get(url+'app/all-facts/').then(function (response) {
        //console.log(response);
        var result = response.data;

        var newData = ImageFile.async(result, 'facts');

        return result;
      });
      return promise;
    },
    first: function(itemId){
      singlePromise = $http.get(url+'app/single-fact/'+itemId).then(function (response) {
        return response.data;
      });
      
      return singlePromise;
    },
    getById: function(itemId){
      // Find by id
      var all = Storage.getObject("facts") != null ? Storage.getObject("facts"):[];
      var single = {};

      for(var i=0; i<all.length; i++){
        var each = all[i];
        
        if(each.id == itemId){
          single = each;
          break;
        }
      }

      return single;
    }
  };
  
  return objService;
})
.factory('News', function($http, Storage, ImageFile) {
  var promise;
  var singlePromise;

  var objService = {
    async: function() {
      promise = $http.get(url+'app/all-news/').then(function (response) {
        //console.log(response);
        var result = response.data;

        var newData = ImageFile.async(result, 'news');

        return result;
      });
      return promise;
    },
    first: function(itemId){
      singlePromise = $http.get(url+'app/single-news/'+itemId).then(function (response) {
        return response.data;
      });
      
      return singlePromise;
    },
    getById: function(itemId){
      // Find by id
      var all = Storage.getObject("news") != null ? Storage.getObject("news"):[];
      var single = {};

      for(var i=0; i<all.length; i++){
        var each = all[i];
        
        if(each.id == itemId){
          single = each;
          break;
        }
      }

      return single;
    }
  };
  
  return objService;
})

.factory('Bank', function($http, Storage) {

  var objService = {
    
    getBankList: function(){
      var promise;
      
      promise = $http({
        method  : 'POST',
        url     : url + 'app/get-banks',
        data    : "",
        // set the headers so angular passing info as form data (not request payload)
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
        var data = response.data;

        return data;
      });
      
      return promise;
    },
    addFinancialData:function(cardType,creditCardNumber, cardHolderName, expireDate, cardVerificationCode, selectedBankId, accountNumber, ownerName){
      var promise;
      var user = Storage.getObject("user");
      promise = $http({
        method  : 'POST',
        url     : url + 'app/add-bankInformation',
        data    : "user_id="+user.id+"&cardType="+cardType
        +"&creditCardNumber="+creditCardNumber
        +"&cardHolderName="+cardHolderName
        +"&expireDate="+expireDate
        +"&cvc="+cardVerificationCode
        +"&selectedBankId="+selectedBankId
        +"&accountNumber="+accountNumber
        +"&ownerName="+ownerName,
        // set the headers so angular passing info as form data (not request payload)
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
        var data = response.data;
        
        return data.message;
      });
      
      return promise;
    },
    redeem:function(amount){
      var promise;
      var user = Storage.getObject("user");
      
      promise = $http({
        method  : 'POST',
        url     : url + 'app/set-redeem',
        data    : "user_id="+user.id+"&amount="+amount,
        // set the headers so angular passing info as form data (not request payload)
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
        var data = response.data;
        
        return data.message;
      });
      
      return promise;
    }
  };
  
  return objService;
})
.factory('ShoppingList', function($http, Storage) {

  var objService = {
    
    getShoppingList: function(){
      var promise;
      
      promise = $http({
        method  : 'POST',
        url     : url + 'app/get-shoppingList',
        data    : "",
        // set the headers so angular passing info as form data (not request payload)
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
        var data = response.data;

        return data;
      });
      
      return promise;
    },
    saveNewShoppingList: function(param){
      var user = Storage.getObject("user");
      
      var promise;
      
      promise = $http({
        method  : 'POST',
        url     : url + 'app/add-newShoppingList',
        data    : "user_id="+user.id+"&email="+user.email+"&title="+param.title+"&description="+param.content,
        // set the headers so angular passing info as form data (not request payload)
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
       
        var data = response.data;

        return data;
      });
      
      return promise;
    },
   };
  
  return objService;
})
.factory('Auth', function($http, Storage) {
  var objService = {
    
    signin: function(username, password){
      var promise;
      
      promise = $http({
        method  : 'POST',
        url     : url + 'app/login',
        data    : "userkey="+username+"&password="+password,
        // set the headers so angular passing info as form data (not request payload)
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
        var data = response.data;
        
        if(data.status == 1){
          var user = data.user;

          Storage.setItem("token", data.token);
          Storage.setObject("user", user);
          
          if(user.newsletter === 1 || user.newsletter === "1"){
            Storage.setItem("newsletter",1);
          }

          return true;
        }
        return data.message;
      });
      
      return promise;
    },
    signup: function(fullname, email, password, phone, isSosmed){
      var promise;
      
      promise = $http({
        method  : 'POST',
        url     : url + 'app/signup',
        data    : "fullname="+fullname+"&email="+email+"&password="+password+"&phone="+phone+"&sosmed="+isSosmed,
        // set the headers so angular passing info as form data (not request payload)
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
        var data = response.data;
        return data;
      });
      
      return promise;
    },
    changePassword:function(newPassword){
      var user = Storage.getObject("user");
      
      promise = $http({
        method  : 'POST',
        url     : url + 'app/update-password',
        data    : "user_id="+user.id+"&password="+newPassword,
        // set the headers so angular passing info as form data (not request payload)
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {

        var data = response.data;

        return data.message;
      });
      
      return promise;
    },
    updateUserInformation:function(gender, firstname, lastname, phone, address){
      var user = Storage.getObject("user");
      
      promise = $http({
        method  : 'POST',
        url     : url + 'app/update-userInformation',
        data    : "user_id="+user.id+"&gender="+gender+"&firstname="+firstname+"&lastname="+lastname+"&phone="+phone+"&address="+address,
        // set the headers so angular passing info as form data (not request payload)
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {

        var data = response.data;

        return data.message;
      });
      
      return promise;
    },
    signout: function(){
      Storage.remove("token");
      Storage.remove("user");
      Storage.remove("regid");
    },
    isAuthenticated: function () {
      return !!Storage.getItem("token");
    },
    newsletter: function(fullname, email){
      var promise;
      var user = Storage.getObject("user");

      promise = $http({
        method  : 'POST',
        url     : url + 'app/subscribe',
        data    : "fullname="+fullname+"&email="+email+"&user_id="+user.id,
        // set the headers so angular passing info as form data (not request payload)
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
        var data = response.data;
        
        if(data.status == "error"){
          return data.error;
        } else {

          Storage.setItem("newsletter", 1);
          Storage.setItem("euid", data.euid);
          Storage.setItem("leid", data.leid);
          
          return true;
        }

      });
      
      return promise;
    },
    updatePhone: function(phone){
      var promise;
      var user = Storage.getObject("user");
      
      promise = $http({
        method  : 'POST',
        url     : url + 'app/update-phone',
        data    : "user_id="+user.id+"&email="+user.email+"&phone="+phone,
        // set the headers so angular passing info as form data (not request payload)
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
        var data = response.data;
        
        if(data.status == 1){
          var user = data.user;
          Storage.setObject("user", user);
          return true;
        }
        return data.message;
      });
      
      return promise;
    }

  };
  
  return objService;
})

.factory('Comment', function($http, Storage, Auth) {
  var objService = {
    
    add: function(recipe_id, description){
      var promise;
      var user = Storage.getObject("user");

      promise = $http({
        method  : 'POST',
        url     : url + 'app/add-comment',
        data    : "user_id="+user.id+"&name="+user.fullname+"&email="+user.email+"&recipe_id="+recipe_id+"&description="+description,
        // set the headers so angular passing info as form data (not request payload)
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
        var data = response.data;
        
        if(data.status == 1){
          return true;
        }else if(data.status == 4){
          Auth.signout();
        }

        return data.message;
      });
      
      return promise;
    },

    all: function(recipe_id){
      var promise;
      
      if(!promise){
        promise = $http.get(url+'app/all-comments/'+recipe_id)
        .then(function (response) {
            return response.data;
        });
      }

      return promise;
    }
  };
  
  return objService;
})

.factory('Love', function($http, Storage, Auth) {
  var objService = {
    
    toggleLove: function(recipe_id){
      var promise;
      var user = Storage.getObject("user");

      promise = $http({
        method  : 'POST',
        url     : url + 'app/toggle-love',
        data    : "user_id="+user.id+"&recipe_id="+recipe_id,
        // set the headers so angular passing info as form data (not request payload)
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
        var data = response.data;
        
        if(data.status == 1){
          return true;
        }

        return data.message;
      });
      
      return promise;
    }

  };
  
  return objService;
})

.factory('ConnectionService', function() {
  var objService = {
    check: function() {
      var networkState = navigator.connection.type;

      var states = {};
      states[Connection.UNKNOWN]  = 1;//'Unknown connection';
      states[Connection.ETHERNET] = 2;//'Ethernet connection';
      states[Connection.WIFI]     = 3;//'WiFi connection';
      states[Connection.CELL_2G]  = 4;//'Cell 2G connection';
      states[Connection.CELL_3G]  = 5;//'Cell 3G connection';
      states[Connection.CELL_4G]  = 6;//'Cell 4G connection';
      states[Connection.CELL]     = 7;//'Cell generic connection';
      states[Connection.NONE]     = 8;//'No network connection';
          
      return states[networkState];
    }
  };
  
  return objService;
})

.factory('Storage', function(){
  return {
    getItem: function (key) {
      return localStorage.getItem(key);
    },

    getObject: function (key) {
      return JSON.parse(localStorage.getItem(key));
    },

    setItem: function (key, data) {
      localStorage.setItem(key, data);
    },

    setObject: function (key, data) {
      localStorage.setItem(key, JSON.stringify(data));
    },

    remove: function (key) {
      localStorage.removeItem(key);
    },

    clearAll : function () {
      localStorage.clear();
    }
  };
})
;
