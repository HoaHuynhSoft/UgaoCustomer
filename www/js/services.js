angular.module('app.services', [])

.factory("UserService", function($http,$q){ // Service cho user
  var self = { 
    'curUser' : {},
    'getCurUser': function(){ // Hàm lấy user hiện tại
        return self.curUser;
    },
    'getUser': function(login){  // Hàm lấy user
        var d = $q.defer();
        $http.get("http://192.168.1.7:3000/api/users/"+login.UserName)
        .success(function(data){
          self.curUser = data;
          d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'addUser': function(user){ // Hàm thêm user
        var d = $q.defer();
        $http.post("http://192.168.1.7:3000/api/users/",user)
        .success(function(data){
          self.curUser = data;
          d.resolve("success");
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'updateUser': function(newUser){ // Hàm cập nhật thông tin user
        var d = $q.defer();
        console.log(JSON.stringify(newUser));
        $http.put("http://192.168.1.7:3000/api/users/"+newUser._id,newUser)
        .success(function(data){
          d.resolve("success");
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    }
  };
  return self;
})
.factory("ItemService", function($http,$q){ // Service cho post
  var self = {  // tạo một đối tượng service, chứa các hàm và biến
    'items' : [], // chứa posts lấy về
    'getItemById': function(itemId){ // Hàm lấy tất cả bài của một userId
        var d = $q.defer();
        $http.get("http://192.168.1.7:3000/api/items/"+itemId)
        .success(function(data){
          d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'getAllItems': function(){ // Hàm lấy tất cả các bài post hiện tại
        var d = $q.defer();
        $http.get("http://192.168.1.7:3000/api/items")
        .success(function(data){
          d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    }
  };
  return self;
})
.factory("CartService", function($http,$q){ // Service cho post
  var self = {  // tạo một đối tượng service, chứa các hàm và biến
    'cart' : {}, // chứa posts lấy về
    'getCurCart': function(){ // Hàm lấy user hiện tại
        return self.cart;
    },
    'addItemCurCart': function(item){ // Hàm lấy user hiện tại
        self.cart.Items.push(item);
        var temp = 0;
        self.cart.Items.forEach(function(item, index){
            temp+=item.price;
        })
        self.cart.Total = temp;
    },
    'emptyCurCart': function(){ // Hàm lấy user hiện tại
        self.cart.Items= [];
        self.cart.Total = 0;
    },
    'removeItemCurCart': function(item){ // Hàm lấy user hiện tại
        var index = self.cart.Items.indexOf(item);
        self.cart.Items.splice(index,1);
        var temp = 0;
        self.cart.Items.forEach(function(item, index){
            temp+=item.price;
        })
        self.cart.Total = temp;
    },
    'updateCart': function(){ // Hàm cập nhật thông tin user
        var d = $q.defer();
        $http.put("http://192.168.1.7:3000/api/carts/"+self.cart._id,self.cart)
        .success(function(data){
          d.resolve("success");
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'getCartByUserId': function(userId){ // Hàm lấy tất cả bài của một userId
        var d = $q.defer();
        $http.get("http://192.168.1.7:3000/api/carts/"+userId)
        .success(function(data){
          self.cart = data;
          console.log("Đã lay cart:"+ JSON.stringify(data));
          console.log("self cart:"+ JSON.stringify(self.cart));
          d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'addCart': function(userId){ // Hàm thêm user
        var tempCart = {};
        tempCart.OwnerId = userId;
        tempCart.Items = [];
        tempCart.Total = 0;
        var d = $q.defer();
        $http.post("http://192.168.1.7:3000/api/carts",tempCart)
        .success(function(data){
          self.cart = data;
          console.log("User k có cart nên tạo cart mới" + userId);
          d.resolve("success");
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
  };
  return self;
})
.factory('sharedUtils',function($ionicLoading,toaster){
    var functionObj={};
    functionObj.showLoading=function(){ 
      $ionicLoading.show({
        content: '<i class=" ion-loading-c"></i> ', // The text to display in the loading indicator
        animation: 'fade-in', // The animation to use
        showBackdrop: true, // Will a dark overlay or backdrop cover the entire view
        maxWidth: 200, // The maximum width of the loading indicator. Text will be wrapped if longer than maxWidth
        showDelay: 0 // The delay in showing the indicator
      });
    };
    functionObj.hideLoading=function(){
      $ionicLoading.hide();
    };
    functionObj.showAlert = function(type,message) {
        toaster.pop({ type: type, body: message, timeout: 2000 });
    };

    return functionObj;

})
.factory('OrderService', function($http,$q){
    var self = {  // tạo một đối tượng service, chứa các hàm và biến
    'getOrderByUserId': function(userId){ // Hàm lấy tất cả bài của một userId
        var d = $q.defer();
        $http.get("http://192.168.1.7:3000/api/orders/1/"+userId)
        .success(function(data){
          d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'getOrderById': function(itemId){ // Hàm lấy tất cả bài của một userId
        var d = $q.defer();
        $http.get("http://192.168.1.7:3000/api/orders/"+itemId)
        .success(function(data){
          d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'addOrder': function(newOrder){ // Hàm thêm một order mới
        var d = $q.defer();
        $http.post("http://192.168.1.7:3000/api/orders/",newOrder) 
        .success(function(data){
          d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    }
  };
  return self;
  });

