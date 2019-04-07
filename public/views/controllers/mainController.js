var MainController  = angular.module('MainController',['ApiFactory','ui.bootstrap','chart.js','ngFileUpload']);

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


    $scope.readCSV = function() {
        // http get request to read CSV file content
        $http({method:'GET',
        url:'data/users.csv'}).then($scope.processData);
    };

    $scope.processData = function(allText) {
        // split content based on new line
        console.log(allText);
        var allTextLines = allText.data.split(/\r\n|\n/);
        var headers = allTextLines[0].split(',');
        var lines = [];

        for ( var i = 0; i < allTextLines.length; i++) {
            // split content based on comma
            var data = allTextLines[i].split(',');
            if (data.length == headers.length) {
                var tarr = [];
                for ( var j = 0; j < headers.length; j++) {
                    tarr.push(data[j]);
                }
                lines.push(tarr);
            }
        }
        $scope.data = lines;
        console.log($scope.data);
    };
    
    $scope.SelectFile = function(data){
        console.log(data);
        $scope.SelectedFile = data;

    }

    $scope.Upload = function () {
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
        if (regex.test($scope.SelectedFile.name.toLowerCase())) {
            if (typeof (FileReader) != "undefined") {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var customers = new Array();
                    var rows = e.target.result.split(/\r\n|\n/);
                    var allTextLines = e.target.result.split(/\r\n|\n/);
                    var headers = allTextLines[0].split(',');
                    var lines = [];
                    var lines2 = [];
                    var lines3  = [];
                    var line4   = [];
                    var line5   = []; 
            
                    for ( var i = 1; i < allTextLines.length; i++) {
                        // split content based on comma
                        var data = allTextLines[i].split(',');
                        // console.log(data);
                        if (data.length == headers.length) {
                            var tarr = [];
                            var tarr2 = [];
                            var tarr3 = [];
                            var tarr4 = [];
                            var tarr5 = [];
                            for ( var j = 0; j < headers.length; j++) {
                                if(j<18){
                                    tarr.push(data[j].replace(/"/g,""));
                                    if(j>=4){
                                        tarr3.push(data[j].replace(/"/g,""));
                                         
                                    }
                                    if(j>=7 && j<=10){
                                        tarr4.push(data[j].replace(/"/g,""));
                                        tarr5.push(data[j].replace(/"/g,""));
                                    }
                                }
                                else if(j>=18 && j<32){
                                    tarr2.push(data[j].replace(/"/g,""));
                                }
                                else if(j>=32 && j<36){
                                    tarr3.push(data[j].replace(/"/g,""));
                                }
                                else if(j>=36 && j<53){
                                    tarr4.push(data[j].replace(/"/g,""));
                                }
                                else if(j>=53){
                                    tarr5.push(data[j].replace(/"/g,""));
                                }
                                
                            }
                            lines.push(tarr);
                            lines2.push(tarr2);
                            lines3.push(tarr3);
                            line4.push(tarr4);
                            line5.push(tarr5)
                        }
                    }

                    var x = {};
                    x['user'] = lines;
                    x['graudian'] = lines2
                    x['student_user']  = lines3
                    x['student'] = line4;
                    x['enroll'] = line5;
                    console.log(x);

                    ApiFactory.save('POST','/csv/insert',x)
                    .then((res)=>{
                        console.log(res);
                        alert("successfully inserted data in the database")
                    }).catch((e)=>{
                        console.log(e);
                        alert("something went wrong")
                    })


                }
                reader.readAsText($scope.SelectedFile);
            } else {
                $window.alert("This browser does not support HTML5.");
            }
        } else {
            $window.alert("Please upload a valid CSV file.");
        }
    }



    $scope.init = function(){
       // $scope.fetchData();
       if($location.path()=="/dashboard"){
           $scope.initProfile();
       }

    //    if($location.path()=="/file"){
    //        $scope.readCSV();
    //    }
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
