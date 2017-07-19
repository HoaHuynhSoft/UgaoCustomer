// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'ngCordova','toaster'])
.config(function($ionicConfigProvider) {
    //Added config
    //$ionicConfigProvider.views.maxCache(5);
    $ionicConfigProvider.scrolling.jsScrolling(false);
    $ionicConfigProvider.tabs.position('bottom'); // other values: top
})
.run(function($state,$ionicPlatform,$rootScope,$ionicPopup) {
  $rootScope.extras = false;
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    FCMPlugin.getToken(
      function(token){
        $rootScope.PushToken = token;
        console.log(' retrieving token: ' + token);
      },
      function(err){
        console.log('error retrieving token: ' + err);
      }
    );
    FCMPlugin.subscribeToTopic('client');
    FCMPlugin.onNotification(
      function(data){
        if(data.wasTapped){
          if(data.type =="1")
            $state.go('orderDetail',{id: data.id});
          else if(data.type =="2")  // reminder nor
            $state.go('reminder');
          else
            $state.go('orders');
        }else{
           //$state.go('reminder');
            var alertPopup = $ionicPopup.alert({
              title: 'Thông báo',
              template: data.body
            });
            alertPopup.then(function(res) {
               if(data.type =="1")
                  $state.go('orderDetail',{id: data.id});
                else if(data.type =="2")  // reminder nor
                  $state.go('reminder');
                else
                  $state.go('orders');
            });

          // var myPopup = $ionicPopup.show({
          //   template: data.body,
          //   title: 'Thông báo',
          //   scope: $scope,
          //   buttons: [
          //     { text: 'Đóng' },

          //     ]
          //   });
        }
      },
      function(msg){
        console.log('onNotification callback successfully registered: ' + msg);
      },
      function(err){
        console.log('Error registering onNotification callback: ' + err);
      }
    );
  });
})
