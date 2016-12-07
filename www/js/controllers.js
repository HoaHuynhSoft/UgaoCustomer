angular.module('app.controllers', [])

.controller('loginCtrl', function($scope,UserService,CartService,$rootScope,$ionicHistory,sharedUtils,$state,$ionicSideMenuDelegate) {
    $rootScope.extras = false; // Ẩn thanh slide menu
    $rootScope.userName = "";
    $rootScope.numCartItems = 0;
    $scope.user = {};
    /// Khi logout thì xóa hết dữ liệu tạm
    $scope.$on('$ionicView.enter', function(ev) {
      if(ev.targetScope !== $scope){
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
      }
    });
    $scope.getCart = function(){
      CartService.getCartByUserId( UserService.getCurUser()._id)
          .then(function success(data){
              if (data===null){
                CartService.addCart(UserService.getCurUser()._id)
                .then(function success(data){
                }, function error(msg){
                  sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");;
                });
              }
              $rootScope.numCartItems = CartService.getCurCart().Items.length;
          }, function error(msg){
            sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
          });
    }

    $scope.login = function(user) {
      if (!(user.UserName)||!(user.Pass)){
        sharedUtils.showAlert("Please note","Entered data is not valid");
        //toaster.pop({ type: 'warning', body: 'Please enter username and password !', timeout: 2000 });
        return;
      }
      UserService.getUser({UserName:user.UserName}) // lấy user bằng user name
        .then(function success(data){
            if((user.UserName.toLowerCase() == data.UserName.toLowerCase()) && (user.Pass.toLowerCase() == data.Pass.toLowerCase())){
              $scope.getCart();
              $rootScope.userName =data.FullName;
              //$rootScope.numCartItems = CartService.cart.Items.length;
              $ionicHistory.nextViewOptions({
                historyRoot: true
              });
              $ionicSideMenuDelegate.canDragContent(true);  // Sets up the sideMenu dragable
              $rootScope.extras = true;
              sharedUtils.hideLoading();
              $state.go('home', {}, {location: "replace"});
              $scope.user = {};
            }
              else{
                sharedUtils.showAlert("Please note","Entered data is not validd");
              }
        }, function error(msg){
          sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
        });  
    };



})
.controller('signupCtrl', function($scope,$rootScope,sharedUtils,$ionicSideMenuDelegate,$state,$ionicHistory) {
    $rootScope.extras = false; // For hiding the side bar and nav icon

    $scope.signupEmail = function (formName, cred) {
    }

  })
.controller('homeCtrl', function($scope,ItemService,CartService,$rootScope,$ionicSideMenuDelegate,$state,$ionicHistory,sharedUtils,$ionicPopup) {
    $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
  };
  // On Loggin in to menu page, the sideMenu drag state is set to true
  $ionicSideMenuDelegate.canDragContent(true);
  $rootScope.extras=true;
  $scope.search={};
  $scope.Products=[];
  $scope.curItemClick= {}
  // When user visits A-> B -> C -> A and clicks back, he will close the app instead of back linking
  $scope.$on('$ionicView.enter', function(ev) {
    $ionicSideMenuDelegate.canDragContent(true);
    $rootScope.extras=true;
    if(ev.targetScope !== $scope){
      $ionicHistory.clearHistory();
      $ionicHistory.clearCache();
    }
  });
  $scope.searchChange = function(){
    console.log($scope.search.filterOrder);
    $scope.items=$filter('filter')(  $scope.Products,$scope.search.filterOrder);
  }
 $scope.loadItems = function() {
    sharedUtils.showLoading();
    ItemService.getAllItems()
    .then(function success(data){
        $scope.Products=data;
        $scope.items=data;
        sharedUtils.hideLoading();
    }, function error(msg){
      sharedUtils.hideLoading();
      console.log(msg);
    });
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
          $scope.addToCart(item);
          $state.go('myCart');
        }
      }
      ]
    });
  };
  $scope.addToCart=function(item){
      CartService.addItemCurCart(item);
      CartService.updateCart()
      .then(function success(data){
          $rootScope.numCartItems = CartService.getCurCart().Items.length;
          sharedUtils.showAlert("success","Đã bỏ vào giỏ hàng");
      }, function error(msg){
        CartService.removeItemCurCart(item);
        sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
      });
  };
  $scope.addToCartNow=function(item){
    $scope.addToCart(item);
    $state.go('myCart');
  }

})

.controller('reminderCtrl', function($scope,$rootScope,UserService,sharedUtils,CartService,OrderService,$state,$ionicSideMenuDelegate) {
    $rootScope.extras=true;
    $ionicSideMenuDelegate.canDragContent(true);
    $scope.estimateLevel = '';
    $scope.curUser = {};
    $scope.monthNo = 0;
    $scope.dayNo = 0;
    $scope.curUser = {};
    $scope.curCart = {};
     $scope.$on('$ionicView.enter', function(ev) {
        $rootScope.extras=true;
        $ionicSideMenuDelegate.canDragContent(true);
        $scope.curUser = UserService.getCurUser();
        if ($scope.curUser.DayRemain <10) $scope.estimateLevel = 'estimateLevel2';
        else if ($scope.curUser.DayRemain <3) $scope.estimateLevel = 'estimateLevel3';
        $scope.monthNo = $scope.curUser.DayRemain / 30;
        $scope.dayNo =  $scope.curUser.DayRemain % 30;
        $scope.curUser = UserService.getCurUser();
        $scope.curCart = CartService.getCurCart();
        console.log(JSON.stringify( $scope.curCart));
    });
    $scope.order=function(){
        if ($scope.curCart.Items.length <1)  {
           sharedUtils.showAlert("Bạn chưa chọn sản phẩm nào cả, vui lòng chọn một sản phẩm ở màn hình chính");
           return;
        }
        var order ={};
        order.OwnerId=$scope.curUser._id;
        order.Items=$scope.curCart.Items;
		    order.Total=$scope.curCart.Total;
        order.Status=1;
		    order.Name=$scope.curUser.FullName;
        order.PhoneNumber=$scope.curUser.Phone;
		    order.Address=$scope.curUser.Address;
		    order.OrderDate = new Date();
        OrderService.addOrder(order)
        .then(function success(data){
            sharedUtils.showAlert("success","Đặt hàng thành công");
            // Navigation to Order details
            $state.go('orderDetail',{id: data._id});
        }, function error(msg){
             sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
        });
    };
})

.controller('indexCtrl', function($scope,UserService,$rootScope,sharedUtils,$ionicHistory,$state,$ionicSideMenuDelegate) {
    $scope.logout=function(){
      $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
        $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space
        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $rootScope.extras = false;
        sharedUtils.hideLoading();
      $state.go('tabLogin.login', {}, {location: "replace"});
    }

  })

.controller('myCartCtrl', function($scope,$rootScope,$state,CartService,UserService,$ionicPopup,OrderService,sharedUtils ) {
    $scope.curUser = {};
    $scope.rootNote = {};
    $scope.headerInfo = true;
    $scope.headerCoupon = true;
    $rootScope.extras=true;
    $scope.curCart = {};
    $scope.headerInfoClick = function(){ // Hàm xử lí sự kiện click vào dòng info
     if ( $scope.headerInfo == false)
       $scope.headerInfo = true;
    else  $scope.headerInfo = false;
    }
   $scope.headerCouponClick = function(){ // Hàm xử lí sự kiện click vào dòng info
     if ( $scope.headerCoupon == false)
       $scope.headerCoupon = true;
    else  $scope.headerCoupon = false;
    }
    $scope.$on('$ionicView.enter', function(ev) {
         $scope.curUser = UserService.getCurUser();
        $scope.curCart = CartService.getCurCart();
        $rootScope.numCartItems = $scope.curCart.Items.length;
        if ( $rootScope.numCartItems ==0){
            sharedUtils.showAlert("warning","Giỏ hàng rỗng, chọn ít nhất một sản phẩm để đặt hàng");
            $state.go('home');
        }
    });
    $scope.removeFromCart=function(item){
      CartService.removeItemCurCart(item);
      CartService.updateCart()
      .then(function success(data){
          $rootScope.numCartItems = CartService.getCurCart().Items.length;
          sharedUtils.showAlert("success","Đã xóa sản phẩm "+ item.name);
      }, function error(msg){
        CartService.addItemCurCart(item);
        sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
      });
    };
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
    $scope.inc=function(item){
      CartService.addItemCurCart(item);
      CartService.updateCart()
      .then(function success(data){
          $rootScope.numCartItems = CartService.getCurCart().Items.length;
          sharedUtils.showAlert("success","Đã thêm sản phẩm: "+ item.name);
      }, function error(msg){
        
        CartService.removeItemCurCart(item);
        sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
      });
    };

    $scope.order=function(){
        if ($scope.curCart.Items.length <1)  {
           sharedUtils.showAlert("Bạn chưa chọn sản phẩm nào cả, vui lòng chọn một sản phẩm ở màn hình chính");
           return;
        }
        var order ={};
        order.OwnerId=$scope.curUser._id;
        order.Items=$scope.curCart.Items;
		    order.Total=$scope.curCart.Total;
        order.Status=1;
		    order.Name=$scope.curUser.FullName;
        order.PhoneNumber=$scope.curUser.Phone;
		    order.Address=$scope.curUser.Address;
		    order.Note= $scope.rootNote.Note
		    order.OrderDate = new Date();
        OrderService.addOrder(order)
        .then(function success(data){
            sharedUtils.showAlert("Đặt hàng thành công");
            // Navigation to Order details
            $state.go('orderDetail',{id: data._id});
        }, function error(msg){
             sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
        });
    };
})

.controller('ordersCtrl', function($scope,$state,$filter,$rootScope,sharedUtils,OrderService,UserService) {
    $scope.orders = [];
    $scope.filterOrder="";
    $rootScope.extras = true;
    $scope.$on('$ionicView.enter', function(ev) {
        console.log(UserService.getCurUser()._id);
       OrderService.getOrderByUserId(UserService.getCurUser()._id) //
        .then(function success(data){
           data.forEach(function(item, index){
             item.OrderDate = $filter('date')(item.OrderDate, "dd/MM/yyyy");
             if (item.Status === 0)
                item.Status = "Đã hủy";
             else if (item.Status === 1)
                item.Status = "Đang đặt hàng";
             else if (item.Status === 2)
                item.Status = "Đã xác nhận";
             else if (item.Status === 3)
                item.Status = "Đã chuyển đi";
             else if (item.Status === 3)
                item.Status = "Thành công";
           });
           $scope.orders = data;
        }, function error(msg){
          sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
        });
    });
    $scope.orderClick = function(_id){
      $state.go('orderDetail',{id: _id});
    }

})

.controller('nortifyCtrl', function($scope,$rootScope) {
    $rootScope.extras=true;
    $scope.nors = [1,2,3,4];

})
.controller('orderDetailCtrl', function($scope,$rootScope,$stateParams,OrderService,$ionicSideMenuDelegate) {
  
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
    var orderId = $stateParams.id;
    OrderService.getOrderById(orderId)
    .then(function success(data){
      $scope.curOrder = data;
    }, function error(msg){
          sharedUtils.showAlert("warning","Đã có lỗi xảy ra, liên hệ: 01649051057 để được hỗ trợ");
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
      template: '<label class="item item-input"><input type="text" ng-model="passData.passOld" placeholder="Nhập mật khẩu cũ" > </label><label class="item item-input"><input type="text" ng-model="data.passNew" placeholder="Nhập mật khẩu mới"> </label>',
      title: 'Đổi mật khẩu',
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
  $scope.estimateClick = function(){
    $scope.estimateData = {};
    var myPopup = $ionicPopup.show({
      template: '<label class="item item-input"><input type="number" ng-model="estimateData.Estimate" placeholder="1 bình xài khoảng ? ngày" > </label><label class="item item-input"><input type="number" ng-model="data.passNew" placeholder="Khoảng ? ngày nữa hết Gas"> </label>',
      title: 'Chỉnh ước tính số ngày xài Gas',
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
            if (!$scope.data.FullName && !$scope.data.Birthday) {
              e.preventDefault();
            } else {
              $scope.curUser.FullName = $scope.data.FullName;
              $scope.curUser.Address = $scope.data.Address;
              $scope.curUser.Phone = $scope.data.Phone;
              $scope.curUser.Email = $scope.data.Email;
              return;
            }
          }
        }
        ]
      });
  };

})

.controller('supportCtrl', function($scope,$rootScope) {
    $rootScope.extras=true;
})

.controller('forgotPasswordCtrl', function($scope,$rootScope) {
    $rootScope.extras=false;
});