//var hostURL='https://ugaoserver.herokuapp.com/api/';
var hostURL='http://localhost:3000/api/';
var headers = {"Authorization": "Basic dXNlcjoxMjM0NTY="};
angular.module('app.services', [])

.factory("UserService", function($http,$q){ // Service cho user
    
  var self = { 
    'curUser' : {},
    'getCurUser': function(){ // Hàm lấy user hiện tại
        return self.curUser;
    },
    'getUser': function(login){  // Hàm lấy user
        var d = $q.defer();
        $http.get( hostURL +"users/"+login.UserName,{headers: headers})
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
        $http.post( hostURL +"users/",user,{headers: headers})
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
        console.log(newUser);
        $http.put( hostURL +"users/"+newUser._id,newUser,{headers: headers})
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
        $http.get( hostURL +"items/"+itemId,{headers: headers})
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
        $http.get( hostURL +"items",{headers: headers})
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
    'getCurCart': function(){ 
        return self.cart;
    },
    'setCurCart': function(cart){ 
        self.cart=cart;
    },
    'addItemCurCart': function(item, kilogramType,numOfBag){ 
        var isExist = false;
        if(self.cart.OrderDetails!=null){
            self.cart.OrderDetails.forEach(function(detail, index){
                if (detail.Item._id == item._id && detail.kilogramType==kilogramType ){
                    isExist = true;
                    detail.numOfKilogramType=detail.numOfKilogramType+numOfBag;
                }
            });
        }
        if (!isExist){
            var detailTemp = {};
            detailTemp.Item = item;
            detailTemp.numOfKilogramType = numOfBag;
            detailTemp.kilogramType=kilogramType;
            self.cart.OrderDetails.push(detailTemp);
        }
        var temp =0;
        self.cart.OrderDetails.forEach(function(detail,index){
          //temp += detail.Item.price*detail.NumGas + detail.Item.priceFull*detail.NumGasAndCylinder;
          temp+=detail.Item.price*detail.kilogramType*detail.numOfKilogramType;
        });
        self.cart.Total = temp;
    },
    'emptyCurCart': function(){ // Hàm lấy user hiện tại
        self.cart.OrderDetails= [];
        self.cart.Total = 0;
    },
    'removeDetailFromCart': function(detail){ // Hàm lấy user hiện tại
        var index = self.cart.OrderDetails.indexOf(detail);
        self.cart.OrderDetails.splice(index,1);
        var temp =0;
        self.cart.OrderDetails.forEach(function(detail,index){
          temp += detail.Item.price*detail.kilogramType*detail.numOfKilogramType;
        });
        self.cart.Total = temp;
    },
    'cartOrdered': function(){ 
        
        var temp =0;
        self.cart.OrderDetails.forEach(function(detail,index){
          temp += detail.Item.price*detail.kilogramType*detail.numOfKilogramType;
        });
        self.cart.Total = temp;
    },
    'updateCart': function(){ // Hàm cập nhật thông tin user
        var d = $q.defer();
        $http.put(hostURL +"carts/"+self.cart._id,self.cart,{headers: headers})
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
        $http.get( hostURL +"carts/"+userId,{headers: headers})
        .success(function(data){
          self.cart = data;
          //console.log("Đã lay cart:"+ JSON.stringify(data));
          //console.log("self cart:"+ JSON.stringify(self.cart));
          d.resolve(data);
        })
        .error(function(msg){
            d.reject("error");
        });
        return d.promise;
    },
    'addCart': function(userId){ // Hàm thêm user
        var d = $q.defer();
        var tempCart = {};
        tempCart.OwnerId = userId;
        if(userId===undefined){
            d.reject("error");
            return d.promise;
        }
        tempCart.OrderDetails = [];
        tempCart.Total = 0;
        tempCart.ItemChange=false; 
        $http.post( hostURL +"carts",tempCart,{headers: headers})
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
        $http.get( hostURL +"orders/1/"+userId,{headers: headers})
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
        $http.get( hostURL +"orders/"+itemId,{headers: headers})
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
        $http.post( hostURL +"orders/",newOrder,{headers: headers}) 
        .success(function(data){
          d.resolve(data);
        })
        .error(function(msg){
            console.log(msg);
            d.reject(msg);
        });
        return d.promise;
    }
  };
  return self;
  });

