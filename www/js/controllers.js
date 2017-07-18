angular.module('app.controllers', [])

.controller('loginCtrl', function($scope,UserService,CartService,$window,$rootScope,$ionicHistory,sharedUtils,$state,$ionicSideMenuDelegate) {
    $rootScope.extras = false; // Ẩn thanh slide menu
    $rootScope.userName = "";
    $rootScope.numCartItems = 0;
    $rootScope.num = 0;
    $scope.user = {};
    /// Khi logout thì xóa hết dữ liệu tạm
    $scope.$on('$ionicView.enter', function(ev) {
      sharedUtils.showLoading();
      if(ev.targetScope !== $scope){
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
      }
      var un = $window.localStorage['username'];
      var pass = $window.localStorage['pass'];
      sharedUtils.hideLoading();
      if (un != "" && pass != ""){
        var user = {};
        user.UserName = un;
        user.Pass = pass;
        $scope.login(user);
      }
    });
    $scope.getCart = function(){
      CartService.getCartByUserId( UserService.getCurUser()._id)
          .then(function success(data){
            console.log("cur cart"+ JSON.stringify(data));
            if (data===null){
              CartService.addCart(UserService.getCurUser()._id)
              .then(function success(data){
              }, function error(msg){
                sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: Vui lòng liên hệ đại lý để được hỗ trợ");;
              });
            }
            $rootScope.numCartItems = CartService.getCurCart().OrderDetails.length;
          }, function error(msg){
            sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: Vui lòng liên hệ đại lý để được hỗ trợ");
          });
    }

    $scope.login = function(user) {
      if (!(user.UserName)||!(user.Pass)){
        sharedUtils.showAlert("warning","Vui lòng nhập tài khoản và mật khẩu!");
        return;
      }
      console.log($rootScope.PushToken);
      sharedUtils.showLoading();
      //Get user to check
      UserService.getUser({UserName:user.UserName}) 
        .then(function success(data){
          //If get success
            sharedUtils.hideLoading();
            if(data==null){
              sharedUtils.showAlert("warning","Tài khoản không tồn tại!");
              return;
            }
            // Then check info input
            if(data!=null && (user.UserName.toLowerCase() == data.UserName.toLowerCase()) && (user.Pass == data.Pass)){
                  // If correct then 
                $window.localStorage['username'] = user.UserName;
                $window.localStorage['pass'] = user.Pass;
                $rootScope.userName =data.FullName;
                // Update device token 
                if ($rootScope.PushToken != null){
                  data.PushToken = $rootScope.PushToken;
                  UserService.updateUser(data);
                }
                // Get user's cart
                CartService.getCartByUserId( UserService.getCurUser()._id)
                .then(function success(cart){
                    console.log("cur cart"+ JSON.stringify(cart));
                    if (cart===null){
                      CartService.addCart(UserService.getCurUser()._id)
                      .then(function success(newcart){
                        $rootScope.numCartItems = 0;
                      }, function error(msg){
                        sharedUtils.showAlert("warning","Gặp lỗi khi lấy thông tin giỏ hàng!");
                      });
                    }
                    $rootScope.numCartItems=cart===null? 0 : cart.OrderDetails.length;
                    $ionicHistory.nextViewOptions({
                      historyRoot: true
                    });
                    $ionicSideMenuDelegate.canDragContent(true);  // Sets up the sideMenu dragable
                    $rootScope.extras = true;
                    if(data.isActive){
                      $state.go('reminder', {}, {location: "replace"});
                    }
                    else{
                      $state.go('home', {}, {location: "replace"});
                    }
                    $scope.user = {};
                }, function error(msg){
                  sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: Vui lòng liên hệ đại lý để được hỗ trợ");
                });
                //$rootScope.numCartItems = CartService.cart.OrderDetails.length;
            }
            else{
              sharedUtils.showAlert("warning","Mật khẩu tài khoản không đúng");
            }
        }, function error(msg){
          sharedUtils.showAlert("warning","Đã có lỗi xảy ra, kiểm tra thông tin username hoặc mạng và thử lại");
          sharedUtils.hideLoading();
        });
    };
})
.controller('signupCtrl', function($timeout,$scope,$rootScope,sharedUtils,$ionicSideMenuDelegate,$state, UserService) {
    $rootScope.extras = false; // For hiding the side bar and nav icon
    $scope.user = {};
    $scope.signupEmail = function () {
      UserService.getUser({UserName:$scope.user.UserName}) // lấy user bằng user name
        .then(function success(data){
          console.log("dang ki " + data);
          if (data === null)
          {
            UserService.addUser($scope.user)
            .then(function success(data){
              sharedUtils.showAlert("success","Tạo thành công, vui lòng đăng nhập để tiếp tục");
               $timeout(function () {
                  $state.go('tabLogin.login');
              }, 2000);
            }, function error(msg){
               sharedUtils.showAlert("warning","Đã có lỗi xảy ra, kiểm tra mạng và thử lại");
            });
          }
          else
          sharedUtils.showAlert("warning","Tên đăng nhập đã tồn tại.");
        }, function error(msg){
          sharedUtils.showAlert("warning","Đã có lỗi xảy ra, kiểm tra mạng và thử lại");
        });

    }

  })
.controller('homeCtrl', function($scope,ItemService,$filter,CartService,$rootScope,$ionicSideMenuDelegate,$state,$ionicHistory,sharedUtils,$ionicPopup) {
  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
  };
  $scope.weight=10;
  $scope.data={};
  $scope.data.numOfBag =1;
  $scope.clientSideList = [
    { text: "10 kg", value: 10 },
    { text: "20 kg", value: 20 },
    { text: "50 kg", value: 50 },
    { text: "100 kg", value: 100 }
  ];

  $ionicSideMenuDelegate.canDragContent(true);
  $rootScope.extras=true;
  $scope.search={};
  $scope.Products=[];
  $scope.curItemClick= {};
  $scope.$on('$ionicView.enter', function(ev) {
    $ionicSideMenuDelegate.canDragContent(true);
    $rootScope.extras=true;
    if(ev.targetScope !== $scope){
      $ionicHistory.clearHistory();
      $ionicHistory.clearCache();
    }
    $scope.Init();
  });
  $scope.Init=function(){
    console.log("init");
    sharedUtils.showLoading();
    ItemService.getAllItems()
    .then(function success(data){
      $scope.Products=ItemService.checkItemInCard(data);
      console.log($scope.Products);
      $scope.items= $scope.Products
      sharedUtils.hideLoading();
    }, function error(msg){
      sharedUtils.hideLoading();
      console.log(msg);
    });
  }
  $scope.searchChange = function(){
    console.log($scope.search.filterOrder);
    $scope.items=$filter('filter')(  $scope.Products,$scope.search.filterOrder);
  }
  $scope.decreaseNumofBag=function(){
    if($scope.data.numOfBag>1){
      $scope.data.numOfBag--;
    }
  }
  $scope.increaseNumofBag=function(){
    if($scope.data.numOfBag<10){
      $scope.data.numOfBag++;
    }
  }
  $scope.itemClick=function (item) {
    $scope.curItemClick=item;
    var myPopup = $ionicPopup.show({
      templateUrl: 'templates/itemDetail.html',
      scope: $scope,
      title: 'Thông tin chi tiết',
      buttons: [
      { text: 'Đóng' },
      {
        text: '<b>Đặt</b>',
        type: 'button-positive',
        onTap: function(e) {
          $scope.orderNow(item);
          //$state.go('myCart');
        }
      }
      ]
    });
  };
  $scope.addToCart=function(item,kilogramType,numofbag){
    CartService.addItemCurCart(item,kilogramType,numofbag);
    CartService.updateCart()
      .then(function success(data){
        $rootScope.numCartItems = CartService.getCurCart().OrderDetails.length;
        sharedUtils.showAlert("success","Đã bỏ vào giỏ hàng");
        $scope.Init();
      }, function error(msg){
        //CartService.removeDetailFromCartByItem(item);
        sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: Vui lòng liên hệ đại lý để được hỗ trợ");
    });
  };
  $scope.orderNow=function(item){
    var myPopup = $ionicPopup.show({
      scope: $scope,
      title: "Bạn muốn mua bao nhiêu Kg "+ item.name+"?",
      templateUrl:'templates/buyDetail.html',
      //template:'<ion-radio ng-repeat="item in clientSideList" ng-value="item.value" ng-click="getKilo(item)" ng-model="data"> {{ item.text }} </ion-radio>',
      buttons: [
        { text: 'Đóng' },
        {
          text: '<b>Đặt</b>',
          type: 'button-positive',
          onTap: function(e) {
            $scope.addToCart(item,$scope.weight,parseInt($scope.data.numOfBag));
            $state.go('myCart');
          }
        }
      ]
    });
  };
  $scope.getKilo=function(item){
    $scope.weight=item.value;
  };
  $scope.pushToCart=function(item){
    var myPopup = $ionicPopup.alert({
      scope: $scope,
      title: "Bạn muốn mua bao nhiêu Kg "+ item.name+"?",
      templateUrl:'templates/buyDetail.html',
      //template:'<ion-radio ng-repeat="item in clientSideList" ng-value="item.value" ng-click="getKilo(item)" ng-model="data"> {{ item.text }} </ion-radio>',
      buttons: [
        { text: 'Đóng' },
        {
          text: '<b>Thêm</b>',
          type: 'button-positive',
          onTap: function(e) {
            $scope.addToCart(item,$scope.weight,parseInt($scope.data.numOfBag));
          }
        }
      ]
    });
  };

})

.controller('reminderCtrl', function($scope,$rootScope,UserService,sharedUtils,CartService,OrderService,$state,$ionicSideMenuDelegate) {
    $rootScope.extras=true;
    $ionicSideMenuDelegate.canDragContent(true);
    $scope.estimateLevel = '';
    $scope.outOfStockNor='inUsing';
    $scope.curUser = {};
    $scope.monthNo = 0;
    $scope.dayNo = 0;
    $scope.curUser = {};
    $scope.curCart = {};
     $scope.$on('$ionicView.enter', function(ev) {
       $scope.Init();
    });
    $scope.Init=function(){
      sharedUtils.showLoading();
      $rootScope.extras=true;
      $ionicSideMenuDelegate.canDragContent(true);
      $scope.curUser = UserService.getCurUser();
      if ($scope.curUser.DayRemain >10){
        $scope.estimateLevel = 'estimateLevel2';
        $scope.outOfStockNor='inUsing';
      }
      else //if ($scope.curUser.DayRemain <5)
      {
        $scope.estimateLevel = 'estimateLevel3';
        $scope.outOfStockNor='emergency';
      }
      $scope.monthNo = Math.floor($scope.curUser.DayRemain / 30);
      $scope.dayNo =  $scope.curUser.DayRemain % 30;
      $scope.curUser = UserService.getCurUser();
      CartService.getCartByUserId( UserService.getCurUser()._id)
        .then(function success(data){
          $scope.curCart = data;
          sharedUtils.hideLoading();
        }, function error(msg){
          sharedUtils.hideLoading();
          sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: Vui lòng liên hệ đại lý để được hỗ trợ");
        });
    };
    $scope.order=function(){
      console.log(JSON.stringify($scope.curCart));
      if ($scope.curCart.OrderDetails.length <1 || $scope.curCart.OrderDetails===undefined)  {
          sharedUtils.showAlert("warning","Bạn chưa chọn sản phẩm nào cả, vui lòng chọn một sản phẩm ở màn hình chính");
          $state.go('home');
          //return;
      };
      if (!$scope.curUser.Phone){
          sharedUtils.showAlert("warning","Cung cấp tối thiểu là sđt để đặt hàng");
          return;
      };
      $state.go('myCart');
      /*var order ={};
      order.OwnerId=$scope.curUser._id;
      order.OrderDetails=$scope.curCart.OrderDetails;
      order.Total=$scope.curCart.Total;
      order.Status=1;
      order.Name=$scope.curUser.FullName;
      order.PhoneNumber=$scope.curUser.Phone;
      order.Address=$scope.curUser.Address;
      order.OrderDate = new Date();
      OrderService.addOrder(order)
      .then(function success(data){
          sharedUtils.showAlert("success","Cảm ơn bạn đã mua hàng, nhân viên của Ugas sẽ gọi trong ít phút tới để xác nhận đơn hàng!");
          $scope.curUser.DayRemain =  $scope.curUser.DayUse;
          UserService.updateUser($scope.curUser);
          // Navigation to Order details
          $state.go('orderDetail',{id: data._id});
      }, function error(msg){
          sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: Vui lòng liên hệ đại lý để được hỗ trợ");
      });*/
    };
})

.controller('indexCtrl', function($window,$scope,UserService,$rootScope,sharedUtils,$ionicHistory,$state,$ionicSideMenuDelegate) {
    $scope.logout=function(){
      $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
        $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space
        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $rootScope.extras = false;
        sharedUtils.hideLoading();
        $window.localStorage['username']="";
        $window.localStorage['pass']="";
      $state.go('tabLogin.login', {}, {location: "replace"});
    }

  })

.controller('myCartCtrl', function($filter,$scope,$rootScope,$state,CartService,ItemService,UserService,$ionicPopup,OrderService,sharedUtils ) {
  $scope.curUser = {};
  $scope.rootNote = {};
  $scope.headerInfo = true;
  $scope.headerAddProduct = true;
  $rootScope.extras=true;
  $scope.showProducts=false;
  $scope.curCart = {};
  $scope.weight=10;
  $scope.data={};
  $scope.data.numOfBag=1;
  $scope.clientSideList = [
    { text: "10 kg", value: 10 },
    { text: "20 kg", value: 20 },
    { text: "50 kg", value: 50 },
    { text: "100 kg", value: 100 }
  ];
  $scope.headerInfoClick = function(){ // Hàm xử lí sự kiện click vào dòng info
      if ( $scope.headerInfo == false){
          $scope.headerInfo = true;
      }
      else {
          $scope.headerInfo = false;
      }
  };
  $scope.headerAddProductClick = function(){ // Hàm xử lí sự kiện click vào dòng info
    if ( $scope.headerAddProduct == false){
      $scope.headerAddProduct = true;
    }

    else {
      $scope.headerAddProduct = false;
    }
    sharedUtils.showLoading();
    ItemService.getAllItems()
      .then(function success(data){
          $scope.items=data;
          $scope.Products=data;
          sharedUtils.hideLoading();
      }, function error(msg){
        sharedUtils.hideLoading();
        console.log(msg);
      });
  }
  $scope.$on('$ionicView.enter', function(ev) {
      $scope.Init();
  });
  $scope.Init=function(){
    sharedUtils.showLoading();

    $scope.curUser = UserService.getCurUser();
    CartService.getCartByUserId($scope.curUser._id)
    .then(function success(data){
          $scope.curCart =data;
          sharedUtils.hideLoading();
        }, function error(msg){
          sharedUtils.hideLoading();
          sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: Vui lòng liên hệ đại lý để được hỗ trợ");
        });
    //$scope.curItems =

    if ( $rootScope.numCartItems ==0){
        sharedUtils.showAlert("warning","Giỏ hàng rỗng, chọn ít nhất một sản phẩm để đặt hàng");
        $state.go('home');
    }
  };
  $scope.removeFromCart=function(detail){
    CartService.removeDetailFromCart(detail);
     if(CartService.getCurCart().OrderDetails.length==0){
        $scope.showProducts=true;
      }
    $scope.updateCart();
  };
  $scope.updateCart = function(){
    sharedUtils.showLoading();
    CartService.updateCart()
      .then(function success(data){
        $rootScope.numCartItems = CartService.getCurCart().OrderDetails.length;
        sharedUtils.hideLoading();
      }, function error(msg){
        sharedUtils.hideLoading();
        sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: Vui lòng liên hệ đại lý để được hỗ trợ");
      });
    }
  $scope.editInfo = function(){
    $scope.data = {};
    $scope.data.FullName = $scope.curUser.FullName;
    $scope.data.Phone = $scope.curUser.Phone;
    $scope.data.Address = $scope.curUser.Address;
    var myPopup = $ionicPopup.show({
    template: '<label class="item item-input"><input type="text" ng-model="data.FullName" placeholder="Full Name" > </label><label class="item item-input"><input type="text" ng-model="data.Phone" placeholder="Phone"> </label><label class="item item-input"><input type="text" ng-model="data.Address" placeholder="Địa chỉ"> </label>',
    title: 'Edit your infomation',
    scope: $scope,
    buttons: [
      { text: 'Hủy' },
      {
        text: '<b>Lưu</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.data.FullName && !$scope.data.Birthday) {
            e.preventDefault();
          } else {
            $scope.curUser.FullName = $scope.data.FullName;
            $scope.curUser.Address = $scope.data.Address;
            $scope.curUser.Phone = $scope.data.Phone;
            return;
          }
        }
      }
      ]
    });
  };
  $scope.numBagChange=function(detail){

    if (detail.numOfKilogramType <=0) {
      sharedUtils.showAlert("warning","Số bao không hợp lệ");
      detail.numOfKilogramType=1;
    }
    else{
      var temp =0;
      $scope.curCart.OrderDetails.forEach(function(detail,index){
        temp += detail.Item.price*detail.kilogramType*detail.numOfKilogramType;
      });
      $scope.curCart.Total = temp;
      CartService.setCurCart($scope.curCart);
      $scope.updateCart();
    }
  };

  $scope.order=function(){
      if ($scope.curCart.OrderDetails.length <1)  {
        sharedUtils.showAlert("warning","Bạn chưa chọn sản phẩm nào cả, vui lòng chọn một sản phẩm ở màn hình chính");
        return;
      }
      if (!$scope.curUser.Phone){
        sharedUtils.showAlert("warning","Cung cấp tối thiểu là số điện thoại để đặt hàng");
        return;
      };
    CartService.getCartByUserId($scope.curUser._id)
      .then(function success(data){
          if(data.ItemChange){
            var myPopup = $ionicPopup.show({
              scope: $scope,
              title: 'Nhắc Nhở',
              template: 'Một số sản phẩm trong giỏ hàng đã thay đổi thông tin, bạn vui lòng kiểm tra lại trước khi đặt hàng nhé. Xin cảm ơn',
              buttons: [
              {
                text: '<b>Đóng</b>',
                type: 'button-positive',
                onTap: function(e) {
                  sharedUtils.showLoading();
                   data.ItemChange=false;
                   CartService.setCurCart(data);
                   CartService.updateCart();
                   sharedUtils.hideLoading();
                   $scope.Init();

                }
              }
              ]
            });
          }
          else{
            sharedUtils.showLoading();
            var order ={};
            order.OwnerId=$scope.curUser._id;
            order.OrderDetails=$scope.curCart.OrderDetails;
            order.Total=$scope.curCart.Total;
            order.Status=1;
            order.Name=$scope.curUser.FullName;
            order.PhoneNumber=$scope.curUser.Phone;
            order.Address=$scope.curUser.Address;
            order.Note= $scope.rootNote.Note
            order.OrderDate = new Date();
            order.ItemChange=false;
            OrderService.addOrder(order)
            .then(function success(data){
                sharedUtils.showAlert("success","Cảm ơn bạn đã mua hàng, nhân viên của Ugao sẽ gọi trong ít phút tới để xác nhận đơn hàng!");
                CartService.cartOrdered();
                CartService.updateCart();
                $scope.curUser.DayRemain = $scope.curUser.DayUse;
                UserService.updateUser($scope.curUser);
                sharedUtils.hideLoading();
                // Navigation to Order details
                $state.go('orderDetail',{id: data._id});
            }, function error(msg){
                sharedUtils.hideLoading();
                sharedUtils.showAlert("warning",msg.error);
            });
          }

        }, function error(msg){
          sharedUtils.hideLoading();
          sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: Vui lòng liên hệ đại lý để được hỗ trợ");
        });

  };

  $scope.ShowProductsInCart=function(){
    if ( $scope.showProducts == false){
            $scope.showProducts = true;
    }
    else {
          $scope.showProducts = false;
    }
  }

})

.controller('ordersCtrl', function($scope,$state,$filter,$rootScope,sharedUtils,OrderService,UserService) {
    $scope.orders = [];
    $scope.filterOrder="";
    $rootScope.extras = true;
    $scope.$on('$ionicView.enter', function(ev) {
      $scope.Init();
    });
    $scope.orderClick = function(_id){
      $state.go('orderDetail',{id: _id});
    }
    $scope.Init=function(){
      sharedUtils.showLoading();
      console.log(UserService.getCurUser()._id);
      OrderService.getOrderByUserId(UserService.getCurUser()._id) //
      .then(function success(data){
          data.forEach(function(item, index){
            if (item.Status === 0)
              item.Status = "Đã hủy";
            else if (item.Status === 1)
              item.Status = "Đang đặt hàng";
            else if (item.Status === 2)
              item.Status = "Đã xác nhận";
            else if (item.Status === 3)
              item.Status = "Đã chuyển đi";
            else if (item.Status === 4)
              item.Status = "Thành công";
          });
          $scope.orders = data;
          sharedUtils.hideLoading();
      }, function error(msg){
        sharedUtils.hideLoading();
        sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: Vui lòng liên hệ đại lý để được hỗ trợ");
      });
    }

})

.controller('nortifyCtrl', function($scope,$rootScope) {
    $rootScope.extras=true;
    $scope.nors = [1,2,3,4];

})
.controller('orderDetailCtrl', function($scope,sharedUtils, $ionicPopup,$rootScope,$stateParams,OrderService,$ionicSideMenuDelegate,UserService) {

  $rootScope.extras=true;
  $ionicSideMenuDelegate.canDragContent(true);
  $scope.curOrder = {};
  $scope.headerInfo = false;
  $scope.headerInfoClick = function(){ // Hàm xử lí sự kiện click vào dòng info
     if ( $scope.headerInfo == false)
       $scope.headerInfo = true;
    else  $scope.headerInfo = false;
   }
  $scope.$on('$ionicView.enter', function(ev) {
    $ionicSideMenuDelegate.canDragContent(true);
    $rootScope.extras=true;
    $scope.Data = {}
    $scope.Data.DayUse = 60;
    var orderId = $stateParams.id;
    OrderService.getOrderById(orderId)
    .then(function success(data){
      $scope.curOrder = data;
      $scope.curUser = UserService.getCurUser();
      if (!$scope.curUser.isActive){

      var myPopup = $ionicPopup.show({
        scope: $scope,
        title: 'Bạn sẽ dùng hết gạo trong khoảng bao nhiêu ngày nhỉ ? 60 ngày hả ?',
        template: '<label class="item item-input"><input type="number" ng-model="Data.DayUse"> </label>',
        buttons: [
        {
          text: '<b>Lưu</b>',
          onTap: function(e) {
              if($scope.Data.DayUse>0)
              {
                console.log($scope.Data.DayUse);
                $scope.curUser.DayUse = $scope.Data.DayUse;
                $scope.curUser.DayRemain = $scope.Data.DayUse;
                $scope.curUser.isActive = true;
                UserService.updateUser($scope.curUser)
                .then(function success(data){
                  sharedUtils.showAlert("success","Cảm ơn bạn.");
                }, function error(msg){
                });
              }
          }
        }
        ]
      });
    }
    }, function error(msg){
          sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: Vui lòng liên hệ đại lý để được hỗ trợ");
    });
  });
})

.controller('settingsCtrl', function($scope,$rootScope,
                                     $ionicPopup,$state,$window,
                                     sharedUtils,UserService) {
  $scope.$on('$ionicView.enter', function(ev) {
    $scope.curUser = UserService.getCurUser();
  });
  $rootScope.extras=true;
  $scope.curPostSourceName = "All";
  $scope.languageClick = function(){ // Hàm xử lí sự kiện click vào item General Setting
    var myPopup = $ionicPopup.show({
      template: '<ion-list class = "list"> <a class="item "> Tiếng việt </a> <a class="item "> English </a><a class="item "> France </a> <a class="item "> Korea </a><a class="item "> Japanese </a> <a class="item "> India </a><a class="item "> Chinese </a> <a class="item "> English </a> </ion-list>',
      title: 'Chọn ngôn ngữ',
      scope: $scope,
      buttons: [
        { text: 'Hủy' },
        {
          text: '<b>Lưu</b>',
          type: 'button-positive',
          onTap: function(e) {
          }
        }
        ]
      });
  }
  $scope.passClick = function(){
    $scope.passData = {};
    var myPopup = $ionicPopup.show({
      template: '<label class="item item-input"><input type="password" ng-model="passData.passOld" placeholder="Nhập mật khẩu cũ" > </label><label class="item item-input"><input type="password" ng-model="passData.passNew" placeholder="Nhập mật khẩu mới"> </label>',
      title: 'Đổi mật khẩu',
      scope: $scope,
      buttons: [
        { text: 'Hủy' },
        {
          text: '<b>Lưu</b>',
          type: 'button-positive',
          onTap: function(e) {
            if ($scope.curUser.Pass == $scope.passData.passOld && !$scope.passData.passNew){
              $scope.curUser.Pass = $scope.passData.passNew;
              UserService.updateUser($scope.curUser)
              .then(function success(data){
                sharedUtils.showAlert("success","Đổi pass thành công");
              }, function error(msg){
                sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: Vui lòng liên hệ đại lý để được hỗ trợ");
              });
            }
            else{
              sharedUtils.showAlert("warning","Bạn đã nhập sai pass cũ, hoặc chưa nhập pass mới");
            }
          }
        }
        ]
      });
  }
  $scope.estimateClick = function(){
    $scope.estimateData = {};
    var myPopup = $ionicPopup.show({
      template: '<label class="item item-input"><input type="number" ng-model="estimateData.DayUse" placeholder="Ước tính số ngày dùng hết gạo" > </label><label class="item item-input"><input type="number" ng-model="estimateData.DayRemain" placeholder="Khoảng ? ngày nữa hết gạo"> </label>',
      title: 'Chỉnh ước tính số ngày dùng hết gạo',
      scope: $scope,
      buttons: [
        { text: 'Hủy' },
        {
          text: '<b>Lưu</b>',
          type: 'button-positive',
          onTap: function(e) {
            if(!$scope.estimateData.DayUse && !$scope.estimateData.DayRemain){
              e.preventDefault();
            }
            else{
              $scope.curUser.DayUse = $scope.estimateData.DayUse;
              $scope.curUser.DayRemain = $scope.estimateData.DayRemain;
                UserService.updateUser($scope.curUser)
                .then(function success(data){
                  sharedUtils.showAlert("success","Đổi thành công");
                }, function error(msg){
                  sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: Vui lòng liên hệ đại lý để được hỗ trợ");
                });
            }

          }
        }
        ]
      });
  }
  $scope.infoClick = function(){
    $scope.data =  $scope.curUser;
    var myPopup = $ionicPopup.show({
      template: '<label class="item item-input"><input type="text" ng-model="data.FullName" placeholder="Tên đầy đủ" > </label><label class="item item-input"><input type="text" ng-model="data.Phone" placeholder="Sđt"> </label><label class="item item-input"><input type="text" ng-model="data.Address" placeholder="Địa chỉ"> </label><label class="item item-input"><input type="text" ng-model="data.Email" placeholder="Email"> </label>',
      title: 'Cập nhật thông tin tài khoản',
      scope: $scope,
      buttons: [
        { text: 'Hủy' },
        {
          text: '<b>Lưu</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.FullName && !$scope.data.Phone) {
              e.preventDefault();
              sharedUtils.showAlert("warning","Bạn chưa nhập đầy đủ thông tin");
            } else {
              $scope.curUser.FullName = $scope.data.FullName;
              $scope.curUser.Address = $scope.data.Address;
              $scope.curUser.Phone = $scope.data.Phone;
              $scope.curUser.Email = $scope.data.Email;
              UserService.updateUser($scope.curUser)
                .then(function success(data){
                  sharedUtils.showAlert("success","Thay đổi thông tin hoàn tất");
                  $state.go('tabLogin.login');
                }, function error(msg){
                  sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: Vui lòng liên hệ đại lý để được hỗ trợ");
                });
              return;
            }
          }
        }
        ]
      });
  };

})

.controller('supportCtrl', function($scope,$rootScope, UserService,sharedUtils) {
    $rootScope.extras=true;
    $scope.feedback = {
      catalogue: 4,
      contain: "",
      dateCreate:  new Date(),
      isDeleteFlag: false,
      isRead: false
    }
    $scope.sendFeedback = function(){

      if($scope.feedback.contain == "")
         sharedUtils.showAlert("warning","Bạn chưa nhập nội dung kìa");
      else
      {
        $scope.feedback.userId = UserService.curUser._id;
        $scope.feedback.userName = UserService.curUser.UserName;
        console.log(  $scope.feedback);
        UserService.addFeedback($scope.feedback)
        sharedUtils.showAlert("success","Gửi phản hồi thành công, cảm ơn bạn");
        $scope.feedback = {
        catalogue: 1,
        contain: ""
      }

    }
    }
})

.controller('forgotPasswordCtrl', function($scope,$rootScope) {
    $rootScope.extras=false;
});
