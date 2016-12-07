angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider



  .state('tabLogin', {
    url: '/tabLogin',
    templateUrl: 'templates/tabLogin.html',
    abstract:true
  })

  .state('tabLogin.login', {
    url: '/login',
    views: {
      'tab1': {
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl'
      }
    }
  })

  .state('tabLogin.signup', {
    url: '/signup',
    views: {
      'tab3': {
        templateUrl: 'templates/signup.html',
        controller: 'signupCtrl'
      }
    }
  })

  .state('home', {
      url: '/home',
      templateUrl: 'templates/home.html',
      controller: 'homeCtrl'
    })
  .state('myCart', {
    url: '/cart',
    templateUrl: 'templates/myCart.html',
    controller: 'myCartCtrl'
  })

  .state('orders', {
    url: '/orders',
    templateUrl: 'templates/orders.html',
    controller: 'ordersCtrl'
  })

  .state('nortify', {
    url: '/nortify',
    templateUrl: 'templates/nortify.html',
    controller: 'nortifyCtrl'
  })
  .state('orderDetail', {
    url: '/orderDetail/:id',
    templateUrl: 'templates/orderDetail.html',
    controller: 'orderDetailCtrl'
  })
  .state('settings', {
    url: '/settings',
    templateUrl: 'templates/settings.html',
    controller: 'settingsCtrl'
  })

  .state('support', {
    url: '/support',
    templateUrl: 'templates/support.html',
    controller: 'supportCtrl'
  })

  .state('tabLogin.forgotPassword', {
    url: '/tabLogin5',
    views: {
      'tab1': {
        templateUrl: 'templates/forgotPassword.html',
        controller: 'forgotPasswordCtrl'
      }
    }
  })
 .state('reminder', {
    url: '/reminder',
    templateUrl: 'templates/reminder.html',
    controller: 'reminderCtrl'
  })

$urlRouterProvider.otherwise('/tabLogin/login');




});
