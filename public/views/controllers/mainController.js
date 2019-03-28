var MainController  = angular.module('MainController',['ApiFactory','ui.bootstrap','chart.js']);

MainController.controller('MainController',['$scope','$http','$location','ipCookie','ApiFactory',"$window",function($scope,$http,$location,ipCookie,ApiFactory,$window){
    console.log('In main controller');
    var vm  =  this;

    var RESOURCE_URL      = ApiFactory.RESOURCE_URL() 
    vm.sign_form          = {};
    vm.form               = {};
    $scope.bg_disable = false;
    $scope.loaded     = true;
    $scope.search = [
        {query: "data", value: 'data'},
        {query: "reactjs", value: 'reactjs'},
        {query: "nodejs", value: 'nodejs'}        
    ];
    $scope.tags = [
        {tags: "story", value: 'story'},
        {tags: "comment", value: 'comment'} ,
        {tags: "poll", value: 'poll'},
        {tags: "show_hn", value: 'show_hn'}      
    ];
    // $scope.all = [
    //     {dateRange: "created_at_i", value: 'created_at_i'}, 
    //     {dateRange: "points", value: 'points'}, 
    //     {dateRange: "num_comments", value: 'num_comments'},      
    // ];


    $scope.signSubmit  = function(data){
        console.log(data);
        $scope.bg_disable = true;
        $scope.loaded     = false;
        ApiFactory.save('POST',RESOURCE_URL+'/accounts/cr_acc',data)
        .then((res)=>{
            var aid = res.data['_id']
            ipCookie('aid',aid);    
            $scope.bg_disable = false;
            $scope.loaded     = true;
            alert("please check your mail for verify your account")
            $location.path('/verify');
            return;

        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded     = true;
            console.log("err",e);
            return;
        })   
    }

    $scope.loginSubmit  = function(data){
        console.log(data);
        $scope.bg_disable = true;
        $scope.loaded     = false;
        ApiFactory.save('POST',RESOURCE_URL+'/accounts/login',data)
        .then((res)=>{
            var aid = res.data['profile_data']['_id'];
            var token = res.data['token']
            ipCookie('aid',aid);    
            ipCookie('token',token);
            $scope.bg_disable = false;
            $scope.loaded     = true;
            $location.path('/');
            return;

        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded     = true;
            console.log("err",e);
            return;
        })   
    }


    $scope.verifyEmail  = function(data){
        console.log(data);
        data['aid'] = ipCookie('aid');
        $scope.bg_disable = true;
        $scope.loaded     = false;
        ApiFactory.save('POST',RESOURCE_URL+'/accounts/verify_email',data)
        .then((res)=>{
            
            console.log(res);
            var aid = res.data['account']['_id'];
            var token = res.data['token']
            ipCookie('aid',aid); 
            ipCookie('token',token);  
            alert("successfully created your account");
            $scope.bg_disable = false;
            $scope.loaded     = true;
            $location.path('/');
            return;

        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded     = true;
            console.log("err",e);
            return;
        })   
    }

    $scope.initProfile  = function(){
        var data = {};
        data['aid'] = ipCookie('aid');
        console.log(data);
        $scope.bg_disable = true;
        $scope.loaded     = false;
        ApiFactory.save('POST',RESOURCE_URL+'/accounts/init_pro',data)
        .then((res)=>{
            
            console.log(res);
            var profile = res.data;  
            $scope.profile = profile; 
            $scope.bg_disable = false;
            $scope.loaded     = true;
            return;

        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded     = true;
            console.log("err",e);
            return;
        })   
    }

    $scope.redirectPage = function(url){
        console.log(url);
        $window.open(url, '_blank');
    }



    $scope.searchData = "";
    $scope.page = 1;
    $scope.check = function(page){
        console.log($scope.searchData1);
        var data = $scope.searchData1;
        var data2 = $scope.searchData2;
        var data3 = $scope.searchData3;
        if(page){
            var data4 = page;
        }
        else{
            var data4 = 1;
        }

        console.log($scope.page);
        var url = "/?query=" +( data || "") + "&tags=" +(data2 || "")+"&page="+(data4 || "");
        $location.url(url);
        // $location.search({'query':data.id});
    }


    // $scope.hits = [];
    // $scope.collect = {};
    // $scope.fetchData = function(){
    //     $scope.bg_disable = true;
    //     $scope.loaded     = false;
    //     var data = {};
    //     data['query'] = "foo";
    //     data["tags"]="story"; 
    //     data["page"] = 2;

    //     ApiFactory.get('GET','http://hn.algolia.com/api/v1/search',data,{})
    //     .then((res)=>{
    //         console.log(res);
    //         $scope.hits = res.hits;
    //         $scope.collect = res;
    //         $scope.bg_disable = false;
    //         $scope.loaded = true;
    //     })
    //     .catch((e)=>{
    //         alert(e);
    //         $scope.bg_disable = false;
    //         $scope.loaded = true;
    //         console.log("err",e);
    //     }) 
    // }
  



    $scope.init = function(){
       // $scope.fetchData();
       if($location.path()=="/dashboard"){
           $scope.initProfile();
       }
    }


    $scope.init()    
}])


MainController.directive("compareTo", function () {
	return {
		require: "ngModel",
		scope: {
			confirmPassword: "=compareTo"
		},
		link: function (scope, element, attributes, modelVal) {

			modelVal.$validators.compareTo = function (val) {
				return val == scope.confirmPassword;
			};

			scope.$watch("confirmPassword", function () {
				modelVal.$validate();
			});
		}
	};
});
