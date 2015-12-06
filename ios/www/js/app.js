//-------------------------------------------PHONEGAP-------------------------------------------------------//
//var url = "http://www.kingtomatoindonesia.com/";
var url = 'http://www.erickwellem.com/demo/kingtomato/';
var nglocation = null;
var http = null;

var first = true;

var myService = null;

function basename(path) {
    return path.replace(/\\/g,'/').replace( /.*\//, '' );
}

function dirname(path) {
    return path.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');;
}

function urlExists(url){
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    console.log(http.status);
    return http.status!=404;
}

function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyC__Qie56m7wZwDBAob72F-CFHiN98o2RM&sensor=false&libraries=places,geometry&callback=initial';
  document.body.appendChild(script);
}

function initial(){
  console.log("Success Loading Google Maps");
}

var phonegap = {
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  onDeviceReady: function() {
    navigator.splashscreen.hide();
    window.appRootDirName = "kingtomato_app";
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);

    nglocation = angular.element(document).injector().get('$location');
    http = angular.element(document).injector().get('$http');

    loadScript();

    // startService();
    // getStatus();

    //tracker();


  }
};

phonegap.initialize();

function fail() {
  console.log("Failed to get filesystem");
}

function gotFS(fileSystem) {
  window.fileSystem = fileSystem;
  fileSystem.root.getDirectory(window.appRootDirName, {
      create: true,
      exclusive: false
  }, dirReady, fail);
}

function dirReady(entry) {
  window.appRootDir = entry;
}

// result contains any message sent from the plugin call
function successHandler (result) {
    //window.plugins.toast.showLongBottom(result);
    //alert(result);
}

// result contains any error description text returned from the plugin call
function errorHandler (error) {
    //window.plugins.toast.showLongBottom(error);
    console.log(error);
}

function tokenHandler (result) {
  // Your iOS push server needs to know the token before it can push to this device
  // here is where you might want to send it the token for later use.
  //window.plugins.toast.showLongBottom(result);

  sendRegid(result).then(function(data) {
    //window.plugins.toast.showLongBottom(e.msg);
  });
}

// iOS
function onNotificationAPN (event) {
  if ( event.alert )
  {
    window.plugins.toast.showLongBottom(event.alert);
    window.location.href = event.path;
  }

  if ( event.sound )
  {
      var snd = new Media(event.sound);
      snd.play();
  }

  if ( event.badge )
  {
      pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
      window.location.href = event.path;
  }
}

// Android and Amazon Fire OS
function onNotification(e) {

  switch( e.event )
  {
    case 'registered':
        if ( e.regid.length > 0 )
        {

          localStorage.setItem("regid", e.regid);

          sendRegid(e.regid).then(function(data) {
            //window.plugins.toast.showLongBottom("Get Registration ID for this device.");
          }, function(error){
            window.plugins.toast.showLongBottom(error);
          });

        }
    break;

    case 'message':
        var data = e.payload;

        if ( e.foreground )
        {
            // INLINE NOTIFICATION
            window.plugins.toast.showLongBottom(data.message);
        }
        else
        {  // otherwise we were launched because the user touched a notification in the notification tray.
            if ( e.coldstart )
            {
                // COLDSTART NOTIFICATION
                //if(data.path != null || data.path != ""){
                  //window.location.href="#"+data.path;
                  nglocation.path(data.path);
                //}
            }
            else
            {
                //if(data.path != null || data.path != ""){
                  //window.location.href="#"+data.path;
                  nglocation.path(data.path);
                //}
            }
        }

    break;

    case 'error':
        // ERROR
        window.plugins.toast.showLongBottom(e.msg);
    break;

    default:
        // UNKNOWN EVENT
        window.plugins.toast.showLongBottom("Unknown, an event was received and we do not know what it is");
    break;
  }
}

function sendRegid(regid){
  var promise;

  var user = JSON.parse(localStorage.getItem("user"));

  promise = http({
    method  : 'POST',
    url     : url + 'app/update-regid',
    data    : "user_id="+user.id+"&regid="+regid,
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

function tracker(){
  gps.init();
}

var gps = {
  GPSWatchId : null,
  gpsErrorCount : 0,

  init : function() {
    // gps.initToggleListener();
    gps.start();
  },
  initToggleListener : function() {
    // $('#locationToggle').bind("change", function(event, ui) {
    //   if (this.value == "true") {
    //     gps.start();
    //   } else {
    //     gps.stop();
    //   }
    // });
  },
  start : function() {

    var gpsOptions = {
      enableHighAccuracy : true,
      timeout : 10000,//1000 * 60 * 4,
      maximumAge : 1 * 1000
    };
    gps.GPSWatchId = navigator.geolocation.watchPosition(gps.onSuccess,
        gps.onError, gpsOptions);
  },
  stop : function() {

    navigator.geolocation.clearWatch(gps.GPSWatchId);
  },
  onSuccess : function(position) {
    // reset error counter
    gpsErrorCount = 0;

    if (position.coords.latitude == '') { position.coords.latitude = -8.7331413; }
    if (position.coords.longitude == '') { position.coords.longitude = 115.1772651; }

    var promise = http.get(url+'app/all-stores/'+position.coords.latitude+'/'+position.coords.longitude+'/0.005').then(function (response) {
      var data = response.data;

      if(response.data.length > 0){

        for(var i=0; i<data.length; i++){
          var each = data[i];
          window.plugin.notification.local.add({ message: each.title+' | '+each.description });
        }

      }
      //return response.data;
    });

    // app.position = position;
    // app.submitToServer();

    // elem = document.getElementById('locationInfo');
    // this.successElement(elem);

    // elem.innerHTML = ('Latitude: ' + position.coords.latitude.toFixed(3)
    //     + '<br/>' + 'Longitude: '
    //     + position.coords.longitude.toFixed(3) + '<br/>'
    //     + 'Last Update: ' + app.getReadableTime(position.timestamp));

    // window.plugins.toast.showLongBottom('Latitude: ' + position.coords.latitude.toFixed(3)
    //     + '<br/>' + 'Longitude: '
    //     + position.coords.longitude.toFixed(3) + '<br/>'
    //     + 'Last Update: ' + position.timestamp);
  },
  onError : function(error) {
    gps.gpsErrorCount++;

    //alert("On Error");

    if (gps.gpsErrorCount > 3) {
      // elem = document.getElementById('locationInfo');
      // $(elem).removeClass("success");
      // $(elem).addClass("fail");
      // elem.innerHTML = ('There is an error, restarting GPS. '
      //     + app.getReadableTime(new Date()) + "<br/> message:" + error.message);
      // console.log('error with GPS: error.code: ' + error.code
      //     + ' Message: ' + error.message);

       window.plugins.toast.showLongBottom('There is an error, restarting GPS. '
           +" Message:" + error.message);

      // Restart GPS listener, fixes most issues.
      gps.stop();
      gps.start();
    }
  }
};

//-------------------------------------------ANGULAR------------------------------------------------------//

angular.module('kingtomato',
  ['ionic','kingtomato.controllers','kingtomato.services',
  'kingtomato.filters','openfb','angular-carousel2']
)

.run(function($ionicPlatform, $location, $rootScope, Auth, OpenFB, Storage){

  OpenFB.init('489311351168352');

  $rootScope.url = url;
  $rootScope.title = '<img src="img/logo-header.png" height="38">';

  $ionicPlatform.ready(function(){
    if(window.StatusBar){
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl){
      var currentPath = $location.path();
      if(currentPath == "/signin" || currentPath == "/signup" || currentPath == "/phone" || currentPath == "/resetPassword"){
        $rootScope.classTitle = "bar-assertive";
      }else{
        $rootScope.classTitle = "gradient-background";
      }
  });


  $rootScope.$on('$stateChangeStart', function (event, next) {
    //window.plugins.toast.showLongBottom("Loading...");

    var authorizedRoles = next.data.authorizedRoles;
    var currentPath = $location.path();
    var nextPath = next.url;
    
    if(first){
      first = false;
      var user = Storage.getObject("user");

      if(user.phone == "" || user.phone == null){
        $location.path("/phone");
      }
    }
/*
    if(authorizedRoles !== "*"){

      if(!Auth.isAuthenticated()){
        event.preventDefault();

        if(currentPath == "/signin" && nextPath != "/signin"){
          navigator.app.exitApp();
        }else{
          $location.path("/signin");
        }
      }else{
        if(first){
          first = false;
          var user = Storage.getObject("user");

          if(user.phone == "" || user.phone == null){
            $location.path("/phone");
          }
        }
      }

    }else{

      if(((currentPath != "/signin" && currentPath != "/signup") && nextPath == "/signin")
          ||(currentPath == "/layout/home" && nextPath == "/phone")){
        navigator.app.exitApp();
      }else if(nextPath == "/signin"){
        if(Auth.isAuthenticated()){
          event.preventDefault();

          $location.path("/layout/home");

        }
      }

    }
*/
  });

})

.constant('USER_ROLES', {
  all: '*',
  admin: 1,
  member: 2
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider,USER_ROLES){

  $stateProvider
  //===========================================================
  .state('signin', {
    url: '/signin',
    views: {
      'container': {
        templateUrl: 'templates/signin.html',
        controller: 'AuthController'
      }
    },
    data: {
      authorizedRoles: USER_ROLES.all
    }
  })
  .state('signup', {
    url: '/signup',
    views: {
      'container': {
        templateUrl: 'templates/signup.html',
        controller: 'SignUpController'
      }
    },
    data: {
      authorizedRoles: USER_ROLES.all
    }
  })
  .state('resetPassword', {
    url: '/resetPassword',
    views: {
      'container': {
        templateUrl: 'templates/resetPassword.html',
        controller: 'ResetPasswordController'
      }
    },
    data: {
      authorizedRoles: USER_ROLES.all
    }
  })
  .state('phone', {
    url: '/phone',
    views: {
      'container': {
        templateUrl: 'templates/phone.html',
        controller: 'SignUpController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  //===========================================================
  .state('layout', {
    url: '/layout',
    views: {
      'container': {
        templateUrl: 'templates/layout.html',
        controller: 'LayoutController'
      }
    },
    data: {
      authorizedRoles: USER_ROLES.all
    },
  })
  //===========================================================
  .state('layout.home', {
    url: '/home',
    views: {
      'layout': {
        templateUrl: 'templates/home.html',
        controller: 'HomeController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.recipes', {
    url: '/recipes/:categoryId',
    views: {
      'layout': {
        templateUrl: 'templates/recipes.html',
        controller: 'RecipesController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.recipe-detail', {
    url: '/recipe-detail/:itemId',
    views: {
      'layout': {
        templateUrl: 'templates/detail.html',
        controller: 'DetailController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.comments', {
    url: '/comments/:itemId',
    views: {
      'layout': {
        templateUrl: 'templates/comments.html',
        controller: 'CommentsController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.profile', {
    url: '/profile',
    views: {
      'layout': {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.myCashAccount', {
    url: '/myCashAccount',
    views: {
      'layout': {
        templateUrl: 'templates/myCashAccount.html',
        controller: 'MyCashAccountController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.redeem', {
    url: '/redeem/:amount',
    views: {
      'layout': {
        templateUrl: 'templates/redeem.html',
        controller: 'RedeemController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.shoppingList', {
    url: '/shoppingList',
    views: {
      'layout': {
        templateUrl: 'templates/shoppingList.html',
        controller: 'ShoppingListController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.newShoppingList', {
    url: '/newShoppingList',
    views: {
      'layout': {
        templateUrl: 'templates/newShoppingList.html',
        controller: 'NewShoppingListController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  }) 
  //===========================================================
  .state('layout.products', {
    url: '/products',
    views: {
      'layout': {
        templateUrl: 'templates/products.html',
        controller: 'ProductsController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.product-detail', {
    url: '/products/:itemId',
    views: {
      'layout': {
        templateUrl: 'templates/detail-product.html',
        controller: 'DetailProductController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.events', {
    url: '/events',
    views: {
      'layout': {
        templateUrl: 'templates/events.html',
        controller: 'EventsController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.event-detail', {
    url: '/events/:itemId',
    views: {
      'layout': {
        templateUrl: 'templates/detail-event.html',
        controller: 'DetailEventController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.friends', {
    url: '/friends',
    views: {
      'layout': {
        templateUrl: 'templates/friends.html',
        controller: 'FriendsController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.friend-detail', {
    url: '/friends/:itemId',
    views: {
      'layout': {
        templateUrl: 'templates/detail-friend.html',
        controller: 'DetailFriendController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.facts', {
    url: '/facts',
    views: {
      'layout': {
        templateUrl: 'templates/facts.html',
        controller: 'FactsController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.fact-detail', {
    url: '/facts/:itemId',
    views: {
      'layout': {
        templateUrl: 'templates/detail-fact.html',
        controller: 'DetailFactController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.news', {
    url: '/news',
    views: {
      'layout': {
        templateUrl: 'templates/news.html',
        controller: 'NewsController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.news-detail', {
    url: '/news/:itemId',
    views: {
      'layout': {
        templateUrl: 'templates/detail-news.html',
        controller: 'DetailNewsController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.location', {
    url: '/location',
    views: {
      'layout': {
        templateUrl: 'templates/location.html',
        controller: 'LocationController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  })
  .state('layout.video', {
    url: '/video',
    views: {
      'layout': {
        templateUrl: 'templates/video.html',
        controller: 'TvcController'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.member]
    }
  });

  $urlRouterProvider.otherwise('/layout/home');
});
