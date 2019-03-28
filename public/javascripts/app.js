var app = angular.module('app',['ngRoute','ipCookie','ui.router','ui.bootstrap','MainController','chart.js']);


app.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider){
    $urlRouterProvider.otherwise('/');

    $stateProvider
    .state('app',{
        url:'/',
        templateUrl:'views/home.html',
        controller:'MainController'
    })
    .state('login',{
        url:'/login',
        templateUrl:'views/auth/login.html',
        controller:'MainController',
        controllerAs: 'vm'

    })
    .state('signup',{
        url:'/signup',
        templateUrl:'views/auth/signup.html',
        controller:'MainController',
        controllerAs: 'vm'
    })
    .state('verify',{
        url:'/verify',
        templateUrl:'views/verify.html',
        controller:'MainController',
        controllerAs: 'vm'
    })
    .state('dashboard',{
        url:'/dashboard',
        templateUrl:'views/dashboard.html',
        controller:'MainController'
    })
}]);    


app.run(['$rootScope','$location','ipCookie','$state','$window','ApiFactory',function($rootScope,$location,ipCookie,$state,$window,ApiFactory){
    $rootScope.$on('$locationChangeSuccess',function(event,next,current){
 
         $rootScope.loc = $location.path();

        $rootScope.fetchData = function(){
            $rootScope.loaded1     = false;
            console.log($location.search());
            var data = {};
            data['query'] = "foo";
            data["tags"]="story"; 
            data["page"] = 2;
    
            ApiFactory.get('GET','http://hn.algolia.com/api/v1/search',$location.search(),{})
            .then((res)=>{
                console.log(res);
                $rootScope.hits = res.hits;
                $rootScope.collect = res;
                $rootScope.loaded1 = true;
            })
            .catch((e)=>{
                $rootScope.bg_disable = false;
                $rootScope.loaded = true;
                console.log("err",e);
            }) 
        }

         $rootScope.hits = [];
         $rootScope.collect = {};

        $rootScope.fetchData();
     
        
        if(!ipCookie('token')){      
           if($location.path()=='/customer_login'){
             $location.path('/login');
           }
         }
         if(ipCookie('token')){           
            $rootScope.profile_data = ipCookie('profile')
            console.log($rootScope.profile_data)          
         } 
         

         console.log(ipCookie('token'));
         $rootScope.isLogged = function() {
             if(!ipCookie('token')){
                 return false;
             }
             else{
                 return true;
             }
         };
 
         $rootScope.logout1 = function() {
            ipCookie.remove('token');
            ipCookie.remove('aid');
            ipCookie.remove('role');
            $location.path('/')
         };

    })
}])

