var globalCategoryId = "";

angular.module('kingtomato.controllers', [])
//==============================================================================
//==============================================================================
.controller('LayoutController', function(
  $scope, $ionicSideMenuDelegate, $ionicPopup,
  $location, Auth, RecipeCategory,  ConnectionService, Storage,
  OpenFB, $ionicScrollDelegate, $stateParams, $ionicLoading, $http, $ionicModal, $rootScope
) {

  // Active menu on sidemenu
  $scope.menuActive = "";

  $scope.isAuthenticated = Auth.isAuthenticated();  
  // Connection status
  $scope.connection = true;
  // Show recipe categories on sidemenu
  $scope.recipeCategories = Storage.getObject("recipeCategories");

  // Check categoryId
  if($stateParams.categoryId == "all"){
    // Filter category ('' == all)
    $rootScope.category = '';
  }else{
    // Filter category based on categoryId
    $rootScope.category = $stateParams.categoryId;
  }

  // Change active menu on sidemenu
  $scope.changeMenuActive = function(menuActive){
    $scope.menuActive = menuActive;
  }

  // Show or Hide sidemenu
  $scope.toggleSideMenu = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  // Load data from server
  $scope.loadRecipeCategory = function(){

    // Show recipe categories on sidemenu
    RecipeCategory.all().then(function(data) {
      // Change recipe categories from server
      $scope.recipeCategories = data;
      // Save recipe categories to local storage
      Storage.setObject("recipeCategories", data);
    }, function(reason){
      console.log("Failed to load recipe categories data.");
    });

  };

  $scope.onDeviceReady = function(){
    if(ConnectionService.check() != 8){
      $scope.regidDevice();

      // Connection found
      $scope.changeConnectionStatus(true);
      // Trigger loadData() function
      $scope.loadRecipeCategory();

      $scope.getModalTemplate();
    }else{
      // Connection not found
      $scope.changeConnectionStatus(false);
    }

  };

  $scope.logout = function(){
    navigator.notification.confirm(
      'Are you sure?',
      function(buttonIndex){
        if (buttonIndex == 2) {
          Auth.signout();
          $location.path("/signin");
          $scope.$apply();
        }
      },
      'Logout from King Tomato App',
      ['Cancel', 'OK']
    );
    
    //Storage.clearAll();

    /*OpenFB.revokePermissions(
      function() {
          //alert('Permissions revoked');
      },
      function(error) {
        //alert(error.message);
    });*/

    
  };
  
  $scope.onProfile = function(){
    event.preventDefault();
    
    if(Auth.isAuthenticated()){
      $location.path("/layout/profile");
    }else{
      $location.path("/signin");
    }
    
  };
  
  $scope.onMyCashAccount = function(){
    event.preventDefault();
    
    if(Auth.isAuthenticated()){
      $location.path("/layout/myCashAccount");
    }else{
      $location.path("/signin");
    }
    
  };
  
  $scope.onShoppingList = function(){
    event.preventDefault();
    
    if(Auth.isAuthenticated()){
      $location.path("/layout/shoppingList");
    }else{
      $location.path("/signin");
    }
    
  };
  
  $scope.onOrders = function(){
    event.preventDefault();
    
    if(Auth.isAuthenticated()){
      $location.path("/layout/news");
    }else{
      $location.path("/signin");
    }
    
  };
    
  // Change connection status
  $scope.changeConnectionStatus = function(status){
    //$scope.$apply(function(){
      $scope.connection = status;
    //});
  };

  $scope.showAlert = function(title, template) {

    //if(device.platform == "Android"){
      title = title!=""?title+":":title;
      window.plugins.toast.showLongBottom(title +template);
    /*}else{
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: '<p class="text-center">'+template+'</p>'
      });
      alertPopup.then(function(res) {
        //console.log(res);
      });
    }*/
  };

  $scope.getModalTemplate = function(){
    var user = Storage.getObject("user");

    $scope.newsletter = {};
    $scope.newsletter.fullname = user.fullname;
    $scope.newsletter.email = user.email;
    $scope.newsletter.status = true;

    $ionicModal.fromTemplateUrl('templates/newsletter-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;

      var newsletter = Storage.getItem("newsletter");

      if(newsletter != 1){
        $scope.openModal();
      }

    });
  };

  $scope.openModal = function() {
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.subscribe = function(fullname, email){
    $ionicLoading.show({
      template: '<i class="ion-loading-d"></i> Subscribe email...'
    });

    if(fullname === undefined || fullname === "" || email === undefined || email === ""){
      $scope.showAlert("Warning", "Please input fields below.");
      $ionicLoading.hide();
      return;
    }

    var promise = Auth.newsletter(fullname, email);
    promise.then(function(status) {
      $ionicLoading.hide();

      if(status === true) { //success
        $scope.showAlert('', "Success subscribe your email.");
        $scope.closeModal();
      } else { //failed
        $scope.showAlert('Warning', status);
      }
    }, function(reason){
      $ionicLoading.hide();
      $scope.showAlert('Warning', "Failed to subscribe your email.");
    });

  };

  $scope.hideNewsletter = function(){
    Storage.setItem("newsletter", 1);
    $scope.closeModal();
  };

  // Filter change category id
  $scope.changeCategory = function(id){
    $ionicSideMenuDelegate.toggleLeft();
    $rootScope.category = id;
    $ionicScrollDelegate.scrollTop(true);
  };

  $scope.regidDevice = function(){
    var regid = Storage.getItem("regid");
    var token = Storage.getItem("token");

    if(true){//regid == null && token != null){
      var pushNotification = window.plugins.pushNotification;

      if ( device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos" ){

        pushNotification.register(
        successHandler,
        errorHandler,
        {
            "senderID":"763325109020",
            "ecb":"onNotification"
        });

      } else {

        pushNotification.register(
        tokenHandler,
        errorHandler,
        {
            "badge":"true",
            "sound":"true",
            "alert":"true",
            "ecb":"onNotificationAPN"
        });

      }

    }
  };

  document.addEventListener('deviceready', function(){
    $scope.onDeviceReady();
  }, false);

  document.addEventListener('menubutton', function(){
    $ionicSideMenuDelegate.toggleLeft();
  }, false);

  document.addEventListener('offline', function(){
    // Connection not found
    $scope.changeConnectionStatus(false);
  }, false);

  document.addEventListener('online', function(){
    // Connection found
    $scope.changeConnectionStatus(true);
  }, false);

  document.addEventListener('backbutton', function(){
    $ionicLoading.hide();
  }, false);

})

.controller('ResetPasswordController', function(
  $scope, $ionicPopup, $location, $ionicLoading,
  Auth, OpenFB, Storage
) {
  
  $scope.email = "";
  $scope.onReset = function(){
    
  };
  
})

.controller('ProfileController', function(
  $scope, $ionicPopup, $ionicScrollDelegate, $location, $ionicLoading,
  Auth, Storage, Bank
) {
   
  $scope.changeMenuActive("Fresh Klub");
  
  $scope.active = 'Account';
  //$(".sub_title").html("Profile");
  
  $scope.setActive = function(type){
    $scope.active = type;
  };
  
  $scope.isActive = function(type){
    return type==$scope.active;
  };
  
  var user = Storage.getObject("user");
  console.log(user);
  if (user) {
    $scope.userEmail = "Username : " + user.email;
  }else{
    $scope.userEmail = "";
  }

  $scope.newPassword = "";
  $scope.confirmPassword = "";
  
  $scope.onChangePsw = function(newPassword, confirmPassword){
    
    if (newPassword == "" || confirmPassword == "") {
      window.plugins.toast.showLongBottom("Please fill out all fields.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      window.plugins.toast.showLongBottom("Password doesn't match.");
      return;
    }
     
      $ionicLoading.show({
        template: '<i class="ion-loading-d"></i> Loading ...'
      });
      var promise = Auth.changePassword(newPassword);
      promise.then(function(data) {
        $scope.showAlert('Success', data);  
        $ionicLoading.hide();
      }, function(reason){
  
        $ionicLoading.hide();
        $scope.showAlert("Warning", "Please check your connection.");
  
      });
    
  }
  /*
  {"id":"1","username":"admin","fullname":"Administrator","email":"amalia@freshgrowintl.com",
  "role_id":"1","status_id":"1","activation_code":null,
  "registration_id":null,"phone":"123","newsletter":null,
  "title":null,"firstname":null,"lastname":null,"gender":null,
  "address":"sfsdf","cc_type":null,"cc_number":null,"cc_expired":null,
  "cc_holder_name":null,"cvc":null,"bank_id":null,"bank_city":null,
  "bank_branch":null,"bank_account_name":null,"bank_account_number":null,
  "photo_url":null,"point":4434,"is_subscribe":null,"added_date":"2014-03-20 17:09:10",
  "added_by":"0","modified_date":"2015-03-19 18:02:25","modified_by":"0","deleted_date":null,
  "deleted_by":null}
  */
  $scope.genderTypeList = [{text:"Mr", value:"Mr", selected:true},
                           {text:"Mrs", value:"Mrs", selected:false},
                           {text:"Ms", value:"Ms", selected:false}];
  $scope.gender={type:"Mr"};
  
  $scope.onChnagePersonal = function(firstName, lastName, phone, address){
    
    if (firstName == "" || lastName == "" || phone == "" || address == "") {
      window.plugins.toast.showLongBottom("Please fill out all fields.");
      return;
    }
    
      $ionicLoading.show({
        template: '<i class="ion-loading-d"></i> Loading ...'
      });
      var promise = Auth.updateUserInformation($scope.gender.type, firstName,  lastName, phone, address);
      promise.then(function(data) {
        $scope.showAlert('Success', data);  
        $ionicLoading.hide();
      }, function(reason){
  
        $ionicLoading.hide();
        $scope.showAlert("Warning", "Please check your connection.");
  
      });
  };
  
  $scope.cardTypeList = [{text:"Visa", value:"Visa", selected:true},
                           {text:"Mastercard", value:"Mastercard", selected:false},
                           {text:"Amex", value:"Amex", selected:false}];
  $scope.card={type:"Visa"};
  
  $scope.bankList = new Array();
  $scope.selectedBank = {id:""}
  var promise = Bank.getBankList();
  promise.then(function(data) {
        console.log(data);
        if (data) {
          for(var index in data)
          {
            $scope.bankList.push(data[index]);
          }
        }
      }, function(reason){
    
  });
      
  $scope.onFinancial = function(creditCardNumber, cardHolderName, expireDate, cardVerificationCode, accountNumber, ownerName){
    console.log($scope.card.type);
    console.log($scope.selectedBank.id);
    console.log(creditCardNumber);
    console.log(cardHolderName);
    console.log(expireDate);
    console.log(accountNumber);
    console.log(ownerName);
    
    if ($scope.card.type == "" || $scope.selectedBank.id == "" || creditCardNumber == "" || cardVerificationCode == "" || cardHolderName == "" || expireDate == "" || accountNumber == "" || ownerName == "") {
      window.plugins.toast.showLongBottom("Please fill out all fields.");
      return;
    }

    var expiryDate = expireDate.split("-");
    expireDate = expiryDate[1] + "/" + expiryDate[0].substring(2,4);
    
      $ionicLoading.show({
        template: '<i class="ion-loading-d"></i> Loading ...'
      });
      var promise = Bank.addFinancialData($scope.card.type, creditCardNumber, cardHolderName, expireDate, cardVerificationCode, $scope.selectedBank.id, accountNumber, ownerName);
      promise.then(function(data) {
        $scope.showAlert('Success', data);  
        $ionicLoading.hide();
      }, function(reason){
  
        $ionicLoading.hide();
        $scope.showAlert("Warning", "Please check your connection.");
  
      });
  }
})

.controller('MyCashAccountController', function(
  $scope, $ionicPopup, $ionicScrollDelegate, $location, $ionicLoading,
  Auth, Storage, Bank
) {
   
  $scope.changeMenuActive("Fresh Klub");
  
  //$(".sub_title").html("My Cash Account");  
  var user = Storage.getObject("user");
  console.log(user);
  
  $scope.point = "IDR " + user.point;
  $scope.onRedeem = function(redeem_amount){
    if (parseInt(redeem_amount) >= parseInt(user.point)) {
      window.plugins.toast.showLongBottom("Please check redeem amount again.");
      return;
    }
    navigator.notification.confirm(
      'It will be automatically deduct your current balance. Are you sure?',
      function(buttonIndex){
        if(buttonIndex == 2){
          $scope.point = parseInt(user.point)-parseInt(redeem_amount);
          
          user.point = $scope.point;
          
          Storage.setObject("user", user);

          $ionicLoading.show({
            template: '<i class="ion-loading-d"></i> Loading ...'
          });
          var promise = Bank.redeem($scope.point);
          promise.then(function(data) {
            
            $location.path('/layout/redeem/'+data);
            $scope.$apply();
            $scope.showAlert('Success', "User information have been updated.");  
            $ionicLoading.hide();
          }, function(reason){      
            $ionicLoading.hide();
            $scope.showAlert("Warning", "Please check your connection.");
      
          });
          //$location.path('/layout/redeem');
          //$scope.$apply();
        }  
      },
      'Redeem from your current Balance',
      ['Cancel', 'OK']
    );  
  };
})

.controller('RedeemController', function(
  $scope, $ionicPopup, $ionicScrollDelegate, $location, $ionicLoading,
  Auth, Storage, $stateParams
) {
  
  var user = Storage.getObject("user");
  $scope.point = user.point;
  $scope.changeMenuActive("My King Tomato");
  
  $(".sub_title").html("My Cash Account");  
  
  $scope.referenceNumber = $stateParams.amount;
  
})
.controller('NewShoppingListController', function(
  $scope, $ionicPopup, $ionicScrollDelegate, $location, $ionicLoading,$ionicActionSheet,
  Auth, Storage, ShoppingList
) {
   
  $scope.changeMenuActive("Fresh Klub");
  
  $scope.data = {title:"", content:""};
  //$(".sub_title").html("Shopping List");
  $scope.shoppingListArray = new Array();

  $ionicLoading.show({
      template: '<i class="ion-loading-d"></i> Loading ...'
  });
  
  var promise = ShoppingList.getShoppingList();
  promise.then(function(data) {
      for (var index in data) {
        var item = data[index];
        $scope.shoppingListArray.push(item);
      }
      $ionicLoading.hide();
  }, function(reason){
      $ionicLoading.hide();
      $scope.showAlert("Warning", "Please check your connection.");
  });
  
  $scope.addToList = function(id){
    $scope.data.title += " " +$scope.shoppingListArray[id].title;
    $scope.data.content += " " + $scope.shoppingListArray[id].description;
  }
  
  $scope.onSave = function(){
    //console.log($scope.data);
    
    $ionicLoading.show({
      template: '<i class="ion-loading-d"></i> Loading ...'
    });
    
    var promise = ShoppingList.saveNewShoppingList($scope.data);
    promise.then(function(data) {
        console.log(data);
        $scope.showAlert("Success", "New shopping list have been added.");
        $ionicLoading.hide();
    }, function(reason){
        $ionicLoading.hide();
        $scope.showAlert("Warning", "Please check your connection.");
    });
  };
  
  $scope.onSendEmail = function(){
    var user = Storage.getObject("user");
    
    cordova.plugins.email.open({
        to:      '',
        cc:      user.email,
        bcc:     [],
        subject: $scope.data.title,
        body:    $scope.data.content
    });
  };
})
.controller('ShoppingListController', function(
  $scope, $ionicPopup, $ionicScrollDelegate, $location, $ionicLoading,$ionicActionSheet,
  Auth, Storage, ShoppingList
) {
   
  $scope.changeMenuActive("Fresh Klub");
  
  $scope.onNewShoppingList = function(){
    $location.path('/layout/newShoppingList');
  };
  
  //$(".sub_title").html("Shopping List");
  $scope.shoppingListArray = new Array();

  $ionicLoading.show({
      template: '<i class="ion-loading-d"></i> Loading ...'
  });
  
  var promise = ShoppingList.getShoppingList();
  promise.then(function(data) {
      for (var index in data) {
        var item = data[index];
        $scope.shoppingListArray.push(item);
      }
      $ionicLoading.hide();
  }, function(reason){
      $ionicLoading.hide();
      $scope.showAlert("Warning", "Please check your connection.");
  });
  
  $scope.showSelectedImage = false;
  
  $scope.onUpload = function(){
    var hideSheet = $ionicActionSheet.show({
      buttons:[{text:'From Camera'},{text:'From Photo Library'}]  ,
      titleText:'Take a photo',
      cancelText:'Cancel',
      cancel:function(){},
      buttonClicked:function(index){
        if (index == 0) {
          navigator.camera.getPicture(function(imageData){
            $scope.showSelectedImage = true;
            $scope.uploadImage = "data:image/jpeg;base64,"+imageData;
            $scope.$apply();
          }, function(message){
            $scope.showSelectedImage = false;
            }, {quality:50, destinationType:Camera.DestinationType.DATA_URL});
        }else{
          navigator.camera.getPicture(function(ImageURI){
            $scope.showSelectedImage = true;
            $scope.uploadImage = ImageURI;
            $scope.$apply();
          }, function(message){
            $scope.showSelectedImage = false;
            }, {quality:50, destinationType:navigator.camera.DestinationType.FILE_URI, sourceType:navigator.camera.PictureSourceType.PHOTOLIBRARY, allowEdit:false});
        }
        return true;
      }
    });
  };
  
})
//==============================================================================
//==============================================================================
.controller('HomeController', function(
  $scope
) {
  // Active menu on sidemenu
  $scope.changeMenuActive("Home");

  $scope.activeSlideIndex = 0;

  $scope.slides = [
    {'thumb':'img/opening-3.jpg'},
    {'thumb':'img/opening-1.jpg'}
  ];

  $scope.carouselOptions = {
      id: 'myCarousel',
      speed: 1000,
      clickSpeed: 500,
      keySpeed: 500,
      autoPlay: true,
      autoPlayDelay: 6000
  };

})
//==============================================================================
//==============================================================================
.controller('RecipesController', function(
  $scope, $ionicScrollDelegate, $ionicLoading,
  Recipe,  ConnectionService, Storage, Love, $stateParams,$rootScope
) {
  // Active menu on sidemenu
  $scope.changeMenuActive("Recipes");

  // Check categoryId
  if($stateParams.categoryId == "all"){
    // Filter category ('' == all)
    $rootScope.category = '';
  }else{
    // Filter category based on categoryId
    $rootScope.category = $stateParams.categoryId;
  }

  $scope.loadRecipe = function() {

    if($scope.recipes.length == 0){
      $ionicLoading.show({
        template: '<i class="ion-loading-d"></i> Loading recipes data...'
      });
    }

    Recipe.async().then(function(data) {
      for(var i=0; i < $scope.recipes.length; i++){
        var currentRecipe = $scope.recipes[i];
        var exist = false;
        for(var j=0; j < data.length ; j++){
          var currentData = data[j];
          if(currentRecipe.id == currentData.id){
            exist = true;
          }
        }
        if(exist == false){
          $scope.recipes.splice(i,1);
        }
      }

      for(var i=0; i < data.length; i++){
        var currentData = data[i];
        var exist = false;
        for(var j=0; j < $scope.recipes.length ; j++){
          var currentRecipe = $scope.recipes[j];
          if(currentRecipe.id == currentData.id){
            $scope.recipes[j] = currentData;
            exist = true;
          }
        }

        if(exist == false){
          $scope.recipes.push(currentData);
        }
      }

      $ionicLoading.hide();

      $scope.$broadcast('scroll.refreshComplete');
    }, function(reason){
      $ionicLoading.hide();
      $scope.changeConnectionStatus(false);
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.triggerRefresh = function(){
    $ionicScrollDelegate.scrollTop();

    $ionicLoading.show({
      template: '<i class="ion-loading-d"></i> Refresh...'
    });

    $scope.loadRecipe();
  };

  $scope.loadAllData = function(){

    // Function from Layout Controller
    $scope.loadRecipeCategory();

    // Get recipe data
    $scope.loadRecipe();

  };

  $scope.checkRefresh = function(){
    if(ConnectionService.check() != 8){
      // Connection found
      $scope.changeConnectionStatus(true);
      // Trigger loadData() function
      $scope.loadAllData();
    }else{
      // Connection not found
      $scope.changeConnectionStatus(false);
    }
  };

  $scope.toggleLove = function(itemId){
    var promise = Love.toggleLove(itemId);

    promise.then(function(status) {

      if(status === true) { //success

      } else { //failed
        // failed
      }
    });
  };

  $scope.$on('$viewContentLoaded', function() {
    // Show all recipes
    $scope.recipes = Storage.getObject("recipes") != null ? Storage.getObject("recipes") : [];
    
    for(var index in $scope.recipes)
    {
      var recipe = $scope.recipes[index];
      
      recipe.thumb = window.appRootDir.nativeURL + "/" +  recipe.thumb;
    }
    
    if($scope.recipes.length == 0){
      $scope.checkRefresh();
    }

  });

})

.controller('DetailController', function(
  $scope, $stateParams, Recipe, Storage, Love
) {
  // Active menu on sidemenu
  $scope.changeMenuActive("Recipe Detail");

    $scope.$on('$viewContentLoaded', function() {

    $scope.recipe = Recipe.getById($stateParams.itemId);

    $scope.recipe.thumb = window.appRootDir.nativeURL + "/" +  $scope.recipe.thumb;
    
    Recipe.first($stateParams.itemId).then(function(data) {
      $scope.recipe = data;
      
      $scope.recipe.thumb = window.appRootDir.nativeURL + "/" +  $scope.recipe.thumb;
      //console.log($scope.recipe.thumb + "2");
    }, function(reason){
      //$scope.showAlert('Warning', reason.message);
    });

  });

  $scope.share = function(id, title){
    var titleText = title;
    titleText = titleText
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;

    window.plugins.socialsharing.share('Look at this recipe from Kingtomato. Interesting!', null, null, url + 'site/recipedetail/'+id+'/'+titleText);
  };

  $scope.toggleLove = function(itemId){
    var promise = Love.toggleLove(itemId);

    promise.then(function(status) {

      if(status === true) { //success

      } else { //failed
        // failed
      }
    });
  };

})

.controller('CommentsController', function(
  $scope, $stateParams, $ionicLoading, Comment
) {

  // Active menu on sidemenu
  $scope.changeMenuActive("Comments");

  // Status loading
  $scope.loading = true;
  // Default value for description
  $scope.description = "";

  $scope.loadComment = function(){
    $ionicLoading.show({
      template: '<i class="ion-loading-d"></i> Refresh data...'
    });

    Comment.all($stateParams.itemId).then(function(data) {
      $scope.comments = data;
      $scope.loading = false;
      $ionicLoading.hide();
    }, function(reason){
      $ionicLoading.hide();
      $scope.loading = true;
      $scope.showAlert("Warning", "Failed to load all comments");
    });
  };

  $scope.addComment = function(description){
    $ionicLoading.show({
      template: '<i class="ion-loading-d"></i> Sending data...'
    });

    if(description === undefined){
      $scope.showAlert("Warning", "Please input fields below.");
      $ionicLoading.hide();
      return;
    }

    if(description == ""){
      $scope.showAlert("Warning", "Please input fields below.");
      $ionicLoading.hide();
      return;
    }

    var promise = Comment.add($stateParams.itemId, description);
    promise.then(function(status) {
      $ionicLoading.hide();
      if(status === true) { //success
        $scope.description = "";
        $scope.loadComment();
      } else { //failed
        $scope.showAlert('Warning', status);
      }
    }, function(reason){
      $ionicLoading.hide();
      $scope.showAlert('Warning', "Failed to add your comment.");
    });

  };

  $scope.$on('$viewContentLoaded', function() {
    $scope.loadComment();
  });
})

.controller('AuthController', function(
  $scope, $ionicPopup, $location, $ionicLoading,
  Auth, OpenFB, Storage
) {

  $scope.signin = function(user) {
    $ionicLoading.show({
      template: '<i class="ion-loading-d"></i> Sign in...'
    });

    if(user === undefined){
      $scope.showAlert("Warning", "Please input fields below.");
      $ionicLoading.hide();
      return;
    }

    var promise = Auth.signin(user.username, user.password);
    promise.then(function(status) {

      if(status === true) { //success
        var user = Storage.getObject("user");

        if(user.phone == "" || user.phone == null){
          $location.path("/phone");
        }else{
          $location.path('/layout/home');
        }

      } else { //failed
        $scope.showAlert('Warning', status);
      }

      $ionicLoading.hide();
    }, function(reason){

      $ionicLoading.hide();
      $scope.showAlert("Warning", "Please check your connection.");

    });
  };

  $scope.loginWithFacebook = function(){

    navigator.notification.confirm("You will be redirected to Facebook.",
      function(buttonIndex){
        if(buttonIndex == 1){
          OpenFB.login('email,public_profile').then(
          function () {
            $ionicLoading.show({
              template: '<i class="ion-loading-d"></i> Please wait...'
            });

            OpenFB.get('/me').success(function (user) {
                var promise = Auth.signup(user.first_name + " " + user.last_name, user.email, user.id,"", 1);

                promise.then(function(data) {
                  var userDB = data.user;

                  if(data.status == 1 || data.status == 4) { //success
                    $scope.showAlert("", "Sign In with Facebook success.");

                    Storage.setItem("token", user.id);
                    Storage.setObject("user", userDB);

                    if(userDB.phone == "" || userDB.phone == null){
                      $location.path("/phone");
                    }else{
                      $location.path('/layout/home');
                    }

                  } else { //failed
                    $scope.showAlert('Warning', data.message);
                  }

                  $ionicLoading.hide();
                });
            });

          },
          function () {
            $ionicLoading.hide();
            $scope.showAlert('Warning', "Login with facebook failed.");
          });
        }
      },
      "Facebook Login", ['OK','Cancel']);

  }

  $scope.showAlert = function(title, template) {

    //if(device.platform == "Android"){
      title = title!=""?title+" : ":title;
      window.plugins.toast.showLongBottom(title +template);
    /*}else{
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: '<p class="text-center">'+template+'</p>'
      });
      alertPopup.then(function(res) {
        //console.log(res);
      });
    }*/
  };
  
  $scope.onResetPassword = function(){
    $location.path('/resetPassword');
  };
})

.controller('SignUpController', function(
  $scope, $ionicPopup, $ionicLoading, Auth, $location
) {

  // Connection status
  $scope.connection = true;

  // Change connection status
  $scope.changeConnectionStatus = function(status){
    $scope.$apply(function(){
      $scope.connection = status;
    });
  };

  $scope.signup = function(user){
    $ionicLoading.show({
      template: '<i class="ion-loading-d"></i> Sign Up...'
    });

    if(user === undefined){
      $scope.showAlert("Warning", "Please input fields above.");
      $ionicLoading.hide();
      return;
    }

    if(user.fullname == "" || user.email == "" || user.password == "" || user.repassword == "" || user.phone == "" ||
        user.fullname === undefined || user.email === undefined || user.password === undefined || user.repassword === undefined || user.phone === undefined){
      $scope.showAlert("Warning", "Please input fields above.");
      $ionicLoading.hide();
      return;
    }

    if(user.password != user.repassword){
      $scope.showAlert("Warning", "The password didn't match");
      $ionicLoading.hide();
      return;
    }

    var promise = Auth.signup(user.fullname, user.email, user.password, user.phone, 0);
    promise.then(function(data) {

      if(data.status === 1) { //success
        $scope.showAlert("Success", "Please check your email to activate.");
      } else { //failed
        $scope.showAlert('Warning', String(data.message).replace(/<[^>]+>/gm, ''));
      }

      $ionicLoading.hide();
    }, function(reason){
      $ionicLoading.hide();
      $scope.showAlert("Warning", "Please check your connection.");
    });
  };

  $scope.updatePhone = function(user){
    $ionicLoading.show({
      template: '<i class="ion-loading-d"></i> Please wait...'
    });

    if(user === undefined){
      $scope.showAlert("Warning", "Please input fields above.");
      $ionicLoading.hide();
      return;
    }

    if(user.phone === undefined || user.phone === ""){
      $scope.showAlert("Warning", "Please input fields above.");
      $ionicLoading.hide();
      return;
    }

    var promise = Auth.updatePhone(user.phone);
    promise.then(function(data) {
      $ionicLoading.hide();

      if(data) { //success
        $scope.showAlert("Success", "Thanks for registering your phone number.");
        $location.path("/layout/home");
      } else { //failed
        $scope.showAlert('Warning', String(data.message).replace(/<[^>]+>/gm, ''));
      }

    }, function(reason){
      $ionicLoading.hide();
      $scope.showAlert("Warning", "Please check your internet connection.");
    });
  }

  $scope.showAlert = function(title, template) {

    //if(device.platform == "Android"){
      title = title!=""?title+":":title;
      window.plugins.toast.showLongBottom(title +template);
    /*}else{
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: '<p class="text-center">'+template+'</p>'
      });
      alertPopup.then(function(res) {
        //console.log(res);
      });
    }*/
  };

  document.addEventListener('offline', function(){
    // Connection not found
    $scope.changeConnectionStatus(false);
  }, false);

  document.addEventListener('online', function(){
    // Connection found
    $scope.changeConnectionStatus(true);
  }, false);

})

.controller('LocationController', function(
  $scope, $ionicLoading, Store
) {

  // Active menu on sidemenu
  $scope.changeMenuActive("Stores");
  // Get window height value
  $scope.windowHeight = window.innerHeight;

  $ionicLoading.show({
    template: '<i class="ion-loading-d"></i> Find your location....'
  });
/*
  if(typeof(google) === 'undefined'){

    $ionicLoading.hide();
    $scope.showAlert("Warning", "Cannot find your location. Please make sure that Location Service has already activated on your device!");

    return;
  }
*/
  var infowindow = new google.maps.InfoWindow();
  var map;
  var latLong;

  var directionsDisplay;
  var directionsService = new google.maps.DirectionsService();

  $scope.stores = [];

  function createMarker(store) {

    var storeLatLong = new google.maps.LatLng(store.latitude, store.longitude);
    var marker = new google.maps.Marker({
      map: map,
      animation: google.maps.Animation.DROP,
      position: storeLatLong,
      icon: "img/icon-tomat-location.png"
    });

    var distance = google.maps.geometry.spherical.computeDistanceBetween (latLong, storeLatLong);

    store.distance = distance;

    $scope.stores.push(store);

    google.maps.event.addListener(marker, 'mousedown', function() {
      infowindow.setContent(store.title);
      infowindow.open(map, this);
    });
  }

  function renderMap(latitude, longitude){
    var someOptions = {
      suppressMarkers : true
    };

    directionsDisplay = new google.maps.DirectionsRenderer(someOptions);

    latLong = new google.maps.LatLng(latitude, longitude);

    var mapOptions = {
      zoom: 13,
      center: latLong
    };

    map = new google.maps.Map(document.getElementById('canvas-map'), mapOptions);

    directionsDisplay.setMap(map);

    var marker = new google.maps.Marker({
      map:map,
      animation: google.maps.Animation.DROP,
      position: latLong,
      icon: "img/icon-orang-location.png"
    });

    infowindow.setContent("Your location here.");
    infowindow.open(map, marker);

    google.maps.event.addListener(marker, 'mousedown', function() {
      infowindow.setContent("Your location here.");
      infowindow.open(map, this);
    });

    // Show recipe categories on sidemenu
    Store.all(latitude, longitude).then(function(data) {

      for(var i=0; i<data.length; i++){
        var each = data[i];
        createMarker(each);
      }

      if(data.length == 0){
        $scope.stores.push({"title":"There is no store near your location."});
      }

      $ionicLoading.hide();

    }, function(reason){
      $ionicLoading.hide();
      $scope.showAlert("Warning", "Failed to find all stores.");
    });
  }

  $scope.renderDirection = function(latitude, longitude){

    var request = {
      origin: latLong,
      destination: new google.maps.LatLng(latitude, longitude),
      travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      }
    });
  }

  navigator.geolocation.getCurrentPosition(function(position){

    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    
    console.log(latitude+"/"+longitude);
    
    //renderMap(-8.711607, 115.185732);
    renderMap(latitude, longitude);

  }, function(error){
  
    $ionicLoading.hide();
    //$scope.showAlert("", error.message);
    //$scope.showAlert("", "King Tomato can't access your location. Please make sure that Location Service has already activated on your device!");
    renderMap(-8.705764, 115.174473);
    /*var watchId = navigator.geolocation.watchPosition(function(position){

      var latitude = position.coords.latitude;
      var longitude = position.coords.longitude;

      //renderMap(-8.705764, 115.174473);
      renderMap(latitude, longitude);

    }, function(error){

      $ionicLoading.hide();
      $scope.showAlert("", "King Tomato can't access your location.");

    }, { timeout:10000 });*/

  }, { timeout:10000, enableHighAccuracy:true});

})

.controller('EventsController', function(
  $scope, $ionicScrollDelegate, $ionicLoading,
  ConnectionService, Storage, Event
) {
  // Active menu on sidemenu
  $scope.changeMenuActive("Events");

  $scope.loadEvent = function() {

    if($scope.events.length == 0){
      $ionicLoading.show({
        template: '<i class="ion-loading-d"></i> Loading events data...'
      });
    }

    Event.async().then(function(data) {

      for(var i=0; i < $scope.events.length; i++){
        var currentEvent = $scope.events[i];
        var exist = false;
        for(var j=0; j < data.length ; j++){
          var currentData = data[j];
          if(currentEvent.id == currentData.id){
            exist = true;
          }
        }
        if(exist == false){
          $scope.events.splice(i,1);
        }
      }

      for(var i=0; i < data.length; i++){
        var currentData = data[i];
        var exist = false;
        for(var j=0; j < $scope.events.length ; j++){
          var currentEvent = $scope.events[j];
          if(currentEvent.id == currentData.id){
            $scope.events[j] = currentData;
            exist = true;
          }
        }

        if(exist == false){
          $scope.events.push(currentData);
        }
      }

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');

    }, function(reason){

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');

    });
  };

  $scope.triggerRefresh = function(){
    $ionicScrollDelegate.scrollTop();

    $ionicLoading.show({
      template: '<i class="ion-loading-d"></i> Refresh...'
    });

    $scope.loadEvent();
  };

  $scope.loadAllData = function(){

    // Get product data
    $scope.loadEvent();

  };

  $scope.checkRefresh = function(){
    if(ConnectionService.check() != 8){
      // Connection found
      $scope.changeConnectionStatus(true);
      // Trigger loadAllData() function
      $scope.loadAllData();
    }else{
      // Connection not found
      $scope.changeConnectionStatus(false);
    }
  };

  $scope.$on('$viewContentLoaded', function() {

    // Show all products
    $scope.events = Storage.getObject("events") != null ? Storage.getObject("events"):[];
    
    for(var index in $scope.events)
    {
      var event = $scope.events[index];
      
      event.thumb = window.appRootDir.nativeURL + "/" +  event.thumb;
    }
    
    if($scope.events.length == 0){
      $scope.checkRefresh();
    }

  });

})

.controller('DetailEventController', function(
  $scope, $stateParams, Event
) {
  // Active menu on sidemenu
  $scope.changeMenuActive("Event Detail");

  $scope.$on('$viewContentLoaded', function() {

    $scope.event = Event.getById($stateParams.itemId);
    $scope.event.thumb = window.appRootDir.nativeURL + "/" +  $scope.event.thumb;
    
    Event.first($stateParams.itemId).then(function(data) {
      
      $scope.event = data;
      $scope.event.thumb = $scope.event.thumb;

    }, function(reason){
      //$scope.showAlert("Warning", "Failed to load this product.");
    });

  });

  $scope.shareViaFb = function(id, title){
    var titleText = title;
    titleText = titleText
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;

    window.plugins.socialsharing.shareViaFacebook('Look at this events from Kingtomato. Interesting!', null, url + 'site/productdetail/'+id+'/'+titleText);
  };
  
  $scope.shareViaTwitter = function(id, title){
    var titleText = title;
    titleText = titleText
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;

    window.plugins.socialsharing.shareViaTwitter('Look at this events from Kingtomato. Interesting!', null, url + 'site/productdetail/'+id+'/'+titleText);
  };
  
  $scope.shareViaEmail = function(id, title){
    var titleText = title;
    titleText = titleText
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;

    window.plugins.socialsharing.shareViaEmail('Look at this events from Kingtomato. Interesting!   ' + url + 'site/productdetail/'+id+'/'+titleText);
  };

})
.controller('FriendsController', function(
  $scope, $ionicScrollDelegate, $ionicLoading,
  ConnectionService, Storage, Friend
) {
  // Active menu on sidemenu
  $scope.changeMenuActive("Friends of King Tomato");

  $scope.loadFriend = function() {

    if($scope.friends.length == 0){
      $ionicLoading.show({
        template: '<i class="ion-loading-d"></i> Loading friends of king Tomato data...'
      });
    }

    Friend.async().then(function(data) {

      for(var i=0; i < $scope.friends.length; i++){
        var currentFriend = $scope.friends[i];
        var exist = false;
        for(var j=0; j < data.length ; j++){
          var currentData = data[j];
          if(currentFriend.id == currentData.id){
            exist = true;
          }
        }
        if(exist == false){
          $scope.friends.splice(i,1);
        }
      }

      for(var i=0; i < data.length; i++){
        var currentData = data[i];
        var exist = false;
        for(var j=0; j < $scope.friends.length ; j++){
          var currentFriend = $scope.friends[j];
          if(currentFriend.id == currentData.id){
            $scope.friends[j] = currentData;
            exist = true;
          }
        }

        if(exist == false){
          $scope.friends.push(currentData);
        }
      }

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');

    }, function(reason){

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');

    });
  };

  $scope.triggerRefresh = function(){
    $ionicScrollDelegate.scrollTop();

    $ionicLoading.show({
      template: '<i class="ion-loading-d"></i> Refresh...'
    });

    $scope.loadFriend();
  };

  $scope.loadAllData = function(){

    // Get product data
    $scope.loadFriend();

  };

  $scope.checkRefresh = function(){
    if(ConnectionService.check() != 8){
      // Connection found
      $scope.changeConnectionStatus(true);
      // Trigger loadAllData() function
      $scope.loadAllData();
    }else{
      // Connection not found
      $scope.changeConnectionStatus(false);
    }
  };

  $scope.$on('$viewContentLoaded', function() {

    // Show all products
    $scope.friends = Storage.getObject("friends") != null ? Storage.getObject("friends"):[];

    for(var index in $scope.friends)
    {

      var friend = $scope.friends[index];

      friend.thumb = window.appRootDir.nativeURL + "/" +  friend.thumb;

    }
    
    if($scope.friends.length == 0){
      $scope.checkRefresh();
    }

  });

})

.controller('DetailFriendController', function(
  $scope, $stateParams, Friend
) {
  // Active menu on sidemenu
  $scope.changeMenuActive("Friend Detail");

  $scope.$on('$viewContentLoaded', function() {

    $scope.friend = Friend.getById($stateParams.itemId);
    $scope.friend.thumb = window.appRootDir.nativeURL + "/" +  $scope.friend.thumb;
    
    Friend.first($stateParams.itemId).then(function(data) {
      
      $scope.friend = data;
      $scope.friend.thumb = $scope.friend.thumb;

    }, function(reason){
      //$scope.showAlert("Warning", "Failed to load this product.");
    });

  });

  $scope.share = function(id, title){
    var titleText = title;
    titleText = titleText
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;

    window.plugins.socialsharing.share('Look at this friends of King Tomato from Kingtomato. Interesting!', null, null, url + 'site/productdetail/'+id+'/'+titleText);
  };

})
.controller('FactsController', function(
  $scope, $ionicScrollDelegate, $ionicLoading,
  ConnectionService, Storage, Fact
) {
  // Active menu on sidemenu
  $scope.changeMenuActive("Facts Area");

  $scope.loadFact = function() {

    if($scope.facts.length == 0){
      $ionicLoading.show({
        template: '<i class="ion-loading-d"></i> Loading Facts Area data...'
      });
    }

    Fact.async().then(function(data) {

      for(var i=0; i < $scope.facts.length; i++){
        var currentFact = $scope.facts[i];
        var exist = false;
        for(var j=0; j < data.length ; j++){
          var currentData = data[j];
          if(currentFact.id == currentData.id){
            exist = true;
          }
        }
        if(exist == false){
          $scope.facts.splice(i,1);
        }
      }

      for(var i=0; i < data.length; i++){
        var currentData = data[i];
        var exist = false;
        for(var j=0; j < $scope.facts.length ; j++){
          var currentFact = $scope.facts[j];
          if(currentFact.id == currentData.id){
            $scope.facts[j] = currentData;
            exist = true;
          }
        }

        if(exist == false){
          $scope.facts.push(currentData);
        }
      }

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');

    }, function(reason){

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');

    });
  };

  $scope.triggerRefresh = function(){
    $ionicScrollDelegate.scrollTop();

    $ionicLoading.show({
      template: '<i class="ion-loading-d"></i> Refresh...'
    });

    $scope.loadFact();
  };

  $scope.loadAllData = function(){

    // Get product data
    $scope.loadFact();

  };

  $scope.checkRefresh = function(){
    if(ConnectionService.check() != 8){
      // Connection found
      $scope.changeConnectionStatus(true);
      // Trigger loadAllData() function
      $scope.loadAllData();
    }else{
      // Connection not found
      $scope.changeConnectionStatus(false);
    }
  };

  $scope.$on('$viewContentLoaded', function() {

    // Show all products
    $scope.facts = Storage.getObject("facts") != null ? Storage.getObject("facts"):[];
    
    for(var index in $scope.facts)
    {
      var fact = $scope.facts[index];
      
      fact.thumb = window.appRootDir.nativeURL + "/" +  fact.thumb;
    }
    
    if($scope.facts.length == 0){
      $scope.checkRefresh();
    }

  });

})

.controller('DetailFactController', function(
  $scope, $stateParams, Fact
) {
  // Active menu on sidemenu
  $scope.changeMenuActive("Fact Detail");

  $scope.$on('$viewContentLoaded', function() {

    $scope.fact = Fact.getById($stateParams.itemId);
    $scope.fact.thumb = window.appRootDir.nativeURL + "/" +  $scope.fact.thumb;
    
    Fact.first($stateParams.itemId).then(function(data) {
      
      $scope.fact = data;
      $scope.fact.thumb = $scope.fact.thumb;

    }, function(reason){
      //$scope.showAlert("Warning", "Failed to load this product.");
    });

  });

  $scope.shareViaFb = function(id, title){
    var titleText = title;
    titleText = titleText
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;

    window.plugins.socialsharing.shareViaFacebook('Look at this facts area from Kingtomato. Interesting!', null, url + 'site/productdetail/'+id+'/'+titleText);
  };
  
  $scope.shareViaTwitter = function(id, title){
    var titleText = title;
    titleText = titleText
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;

    window.plugins.socialsharing.shareViaTwitter('Look at this facts area from Kingtomato. Interesting!', null, url + 'site/productdetail/'+id+'/'+titleText);
  };
  
  $scope.shareViaEmail = function(id, title){
    var titleText = title;
    titleText = titleText
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;

    window.plugins.socialsharing.shareViaEmail('Look at this facts area from Kingtomato. Interesting!     ' + url + 'site/productdetail/'+id+'/'+titleText);
  };

})
.controller('ProductsController', function(
  $scope, $ionicScrollDelegate, $ionicLoading,
  ConnectionService, Storage, Product
) {
  // Active menu on sidemenu
  $scope.changeMenuActive("Products");

  $scope.loadProduct = function() {

    if($scope.products.length == 0){
      $ionicLoading.show({
        template: '<i class="ion-loading-d"></i> Loading products data...'
      });
    }

    Product.async().then(function(data) {

      for(var i=0; i < $scope.products.length; i++){
        var currentRecipe = $scope.products[i];
        var exist = false;
        for(var j=0; j < data.length ; j++){
          var currentData = data[j];
          if(currentRecipe.id == currentData.id){
            exist = true;
          }
        }
        if(exist == false){
          $scope.products.splice(i,1);
        }
      }

      for(var i=0; i < data.length; i++){
        var currentData = data[i];
        var exist = false;
        for(var j=0; j < $scope.products.length ; j++){
          var currentRecipe = $scope.products[j];
          if(currentRecipe.id == currentData.id){
            $scope.products[j] = currentData;
            exist = true;
          }
        }

        if(exist == false){
          $scope.products.push(currentData);
        }
      }

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');

    }, function(reason){

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');

    });
  };

  $scope.triggerRefresh = function(){
    $ionicScrollDelegate.scrollTop();

    $ionicLoading.show({
      template: '<i class="ion-loading-d"></i> Refresh...'
    });

    $scope.loadProduct();
  };

  $scope.loadAllData = function(){

    // Get product data
    $scope.loadProduct();

  };

  $scope.checkRefresh = function(){
    if(ConnectionService.check() != 8){
      // Connection found
      $scope.changeConnectionStatus(true);
      // Trigger loadAllData() function
      $scope.loadAllData();
    }else{
      // Connection not found
      $scope.changeConnectionStatus(false);
    }
  };

  $scope.$on('$viewContentLoaded', function() {

    // Show all products
    $scope.products = Storage.getObject("products") != null ? Storage.getObject("products"):[];
    
    for(var index in $scope.products)
    {
      var product = $scope.products[index];
      console.log(product);
      product.thumb = window.appRootDir.nativeURL + "/" +  product.thumb;
            
      console.log(product.thumb);
    }
    
    if($scope.products.length == 0){
      $scope.checkRefresh();
    }

  });

})

.controller('DetailProductController', function(
  $scope, $stateParams, Product
) {
  // Active menu on sidemenu
  $scope.changeMenuActive("Product Detail");

  $scope.$on('$viewContentLoaded', function() {

    $scope.product = Product.getById($stateParams.itemId);
    $scope.product.thumb = $scope.product.thumb;
    
    Product.first($stateParams.itemId).then(function(data) {
      
      $scope.product = data;
      $scope.product.thumb = $scope.product.thumb;

    }, function(reason){
      //$scope.showAlert("Warning", "Failed to load this product.");
    });

  });

  $scope.shareViaFb = function(id, title){
    var titleText = title;
    titleText = titleText
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;

    window.plugins.socialsharing.shareViaFacebook('Look at this products from Kingtomato. Interesting!', null, url + 'site/productdetail/'+id+'/'+titleText);
  };
  
  $scope.shareViaTwitter = function(id, title){
    var titleText = title;
    titleText = titleText
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;

    window.plugins.socialsharing.shareViaTwitter('Look at this products from Kingtomato. Interesting!', null, url + 'site/productdetail/'+id+'/'+titleText);
  };
  
  $scope.shareViaEmail = function(id, title){
    var titleText = title;
    titleText = titleText
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;

    window.plugins.socialsharing.shareViaEmail('Look at this products from Kingtomato. Interesting!     '+ url + 'site/productdetail/'+id+'/'+titleText);
  };

})

.controller('NewsController', function(
  $scope, $ionicScrollDelegate, $ionicLoading,
  ConnectionService, Storage, News
) {
  // Active menu on sidemenu
  $scope.changeMenuActive("News");

  $scope.loadNews = function() {

    if($scope.news.length == 0){
      $ionicLoading.show({
        template: '<i class="ion-loading-d"></i> Loading news data...'
      });
    }

    News.async().then(function(data) {

      for(var i=0; i < $scope.news.length; i++){
        var currentRecipe = $scope.news[i];
        var exist = false;
        for(var j=0; j < data.length ; j++){
          var currentData = data[j];
          if(currentRecipe.id == currentData.id){
            exist = true;
          }
        }
        if(exist == false){
          $scope.news.splice(i,1);
        }
      }

      for(var i=0; i < data.length; i++){
        var currentData = data[i];
        var exist = false;
        for(var j=0; j < $scope.news.length ; j++){
          var currentRecipe = $scope.news[j];
          if(currentRecipe.id == currentData.id){
            $scope.news[j] = currentData;
            exist = true;
          }
        }

        if(exist == false){
          $scope.news.push(currentData);
        }
      }

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');

    }, function(reason){

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');

    });
  };

  $scope.triggerRefresh = function(){
    $ionicScrollDelegate.scrollTop();

    $ionicLoading.show({
      template: '<i class="ion-loading-d"></i> Refresh...'
    });

    $scope.loadNews();
  };

  $scope.loadAllData = function(){

    // Get recipe data
    $scope.loadNews();

  };

  $scope.checkRefresh = function(){
    if(ConnectionService.check() != 8){
      // Connection found
      $scope.changeConnectionStatus(true);
      // Trigger loadAllData() function
      $scope.loadAllData();
    }else{
      // Connection not found
      $scope.changeConnectionStatus(false);
    }
  };

  $scope.playVideo = function(url){
    if(device.platform == 'android' || device.platform == 'Android'){
      cordova.plugins.videoPlayer.play(url);
    }else{
      window.plugins.streamingMedia.playVideo(url);
    }
  };

  $scope.$on('$viewContentLoaded', function() {

    // Show all news
    $scope.news = Storage.getObject("news") != null ? Storage.getObject("news"):[];

    for(var index in $scope.news)
    {
      var newsItem = $scope.news[index];
      
      newsItem.thumb = window.appRootDir.nativeURL + "/" +  newsItem.thumb;
    }
    
    
    if($scope.news.length == 0){
      $scope.checkRefresh();
    }

  });

})

.controller('DetailNewsController', function(
  $scope, $stateParams, News
) {
  // Active menu on sidemenu
  $scope.changeMenuActive("News Detail");

  $scope.$on('$viewContentLoaded', function() {

    $scope.news = News.getById($stateParams.itemId);
    $scope.news.thumb = $scope.news.thumb;
    News.first($stateParams.itemId).then(function(data) {

      $scope.news = data;
      $scope.news.thumb = $scope.news.thumb;
    }, function(reason){
      //$scope.showAlert("Warning", "Failed to load this news.");
    });

  });

  $scope.playVideo = function(url){
    if(device.platform == 'android' || device.platform == 'Android'){
      cordova.plugins.videoPlayer.play(url);
    }else{
      window.plugins.streamingMedia.playVideo(url);
    }
  };

  $scope.shareViaFb = function(id, title){
    var titleText = title;
    titleText = titleText
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;

    window.plugins.socialsharing.shareViaFacebook('Look at this news from Kingtomato. Interesting!', null, url + 'site/productdetail/'+id+'/'+titleText);
  };
  
  $scope.shareViaTwitter = function(id, title){
    var titleText = title;
    titleText = titleText
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;

    window.plugins.socialsharing.shareViaTwitter('Look at this news from Kingtomato. Interesting!', null, url + 'site/productdetail/'+id+'/'+titleText);
  };
  
  $scope.shareViaEmail = function(id, title){
    var titleText = title;
    titleText = titleText
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;

    window.plugins.socialsharing.shareViaEmail('Look at this news from Kingtomato. Interesting!   '+ url + 'site/productdetail/'+id+'/'+titleText);
  };

})

.controller('TvcController', function(
  $scope, $ionicScrollDelegate, $ionicLoading,
  ConnectionService, Storage, Tvc
) {
  // Active menu on sidemenu
  $scope.changeMenuActive("Video");

  $scope.getTvc = function() {

    if($scope.tvc.length == 0){
      $ionicLoading.show({
        template: '<i class="ion-loading-d"></i> Loading TVC data...'
      });
    }

    Tvc.async().then(function(data) {

      for(var i=0; i < $scope.tvc.length; i++){
        var currentRecipe = $scope.tvc[i];
        var exist = false;
        for(var j=0; j < data.length ; j++){
          var currentData = data[j];
          if(currentRecipe.id == currentData.id){
            exist = true;
          }
        }
        if(exist == false){
          $scope.tvc.splice(i,1);
        }
      }

      for(var i=0; i < data.length; i++){
        var currentData = data[i];
        var exist = false;
        for(var j=0; j < $scope.tvc.length ; j++){
          var currentRecipe = $scope.tvc[j];
          if(currentRecipe.id == currentData.id){
            $scope.tvc[j] = currentData;
            exist = true;
          }
        }

        if(exist == false){
          $scope.tvc.push(currentData);
        }
      }

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');

    }, function(reason){

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');

    });
  };

  $scope.triggerRefresh = function(){
    $ionicScrollDelegate.scrollTop();

    $ionicLoading.show({
      template: '<i class="ion-loading-d"></i> Refresh...'
    });

    $scope.getTvc();
  };


  $scope.loadAllData = function(){

    // Get recipe data
    $scope.getTvc();

  };

  $scope.checkRefresh = function(){
    if(ConnectionService.check() != 8){
      // Connection found
      $scope.changeConnectionStatus(true);
      // Trigger loadAllData() function
      $scope.loadAllData();
    }else{
      // Connection not found
      $scope.changeConnectionStatus(false);
    }
  };

  $scope.playVideo = function(url){
    if ( device.platform == 'android' || device.platform == 'Android' ){
      cordova.plugins.videoPlayer.play(url);
    }else{
      window.plugins.streamingMedia.playVideo(url);
    }
  };

  $scope.$on('$viewContentLoaded', function() {

    // Show all tvc
    $scope.tvc = Storage.getObject("tvc") != null ? Storage.getObject("tvc"):[];

    for(var index in $scope.tvcs)
    {
      var tvc = $scope.tvcs[index];
      
      tvc.thumb = window.appRootDir.nativeURL + "/" +  tvc.thumb;
    }
    
    if($scope.tvc.length == 0){
      $scope.checkRefresh();
    }

  });

});
