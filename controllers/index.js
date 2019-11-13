var app = angular.module('app', [
    'ngTouch',
    'angularjs-dropdown-multiselect',
    'treeGrid',
    'ui.bootstrap',
    'ui.select',
    'checklist-model',
    'ui.grid', 
    'ui.grid.treeView',
    'ui.grid.grouping',
    'ui.grid.edit',
    'ui.grid.selection'
]);

app.controller('MainCtrl', ['$scope', '$http', function ($scope, $http) {

    $scope.user = [];
    $scope.checkAll = function (user) {
        console.log(user);

        $scope.group = user;


        console.log(dateFromString);
        console.log(dateToString);
        console.log($scope.statsrez);
        console.log($scope.group);

        var dataObj = {
            "startDate": dateFromString,
            "endDate": dateToString,
            "maxRecNum": $scope.statsrez,
            // "region": 19,
            "groups": $scope.group
        };

        console.log(dataObj);

        $http({
            method: 'POST',
            url: 'http://18.140.232.52:8081/api/v1/slices',
            data: dataObj
        }).then(function (value) {
            console.log(value)
        }, function (reason) {
            console.log(reason)
        })

    };


  //Получить № статсреза
    $scope.getStatSrez = function () {
        $http({
            method: 'GET',
            url: 'http://18.140.232.52:8081/api/v1/slices/max'
        }).then(function (value) {
            $scope.statsrez = value.data.value;
            console.log($scope.statsrez);
        })
    };

    $scope.getStatSrez();
    //Получить № статсреза


    //Дата начала отчета по умолчанию 1 января 2019
    var fromTimestamp = 1546322400;
    $scope.dateFrom = new Date(fromTimestamp * 1000);
    console.log($scope.dateFrom.getTime() / 1000);

    $scope.dateTo = new Date();


    console.log($scope.dateFrom);
    console.log($scope.dateTo);


    var dd = ('0' + $scope.dateFrom.getDate()).slice(-2);
    var mm = ('0' + ($scope.dateFrom.getMonth() + 1)).slice(-2);
    var yy = $scope.dateFrom.getFullYear();

    var dateFromString = dd + '.' + mm + '.' + yy;


    var dd = ('0' + $scope.dateTo.getDate()).slice(-2);
    var mm = ('0' + ($scope.dateTo.getMonth() + 1)).slice(-2);
    var yy = $scope.dateTo.getFullYear();

    var dateToString = dd + '.' + mm + '.' + yy;

    console.log(dateFromString);
    console.log(dateToString);


    //Получение списка групп
    $scope.getGroups = function () {
        $http({
            method: 'GET',
            url: 'http://18.140.232.52:8081/api/v1/slices/groups'
        }).then(function (value) {
            $scope.groups = value.data;
            console.log($scope.groups);
        })
    };


    $scope.getGroups();
    //Получение списка групп




    //Заказать формирование срезов
    $scope.getDatas = function () {


    };


    //Заказать формирование срезов


    $scope.tree_data = [
        {Name:"USA",Area:9826675,Population:318212000,TimeZone:"UTC -5 to -10",
            children:[
                {Name:"California", Area:423970,Population:38340000,TimeZone:"Pacific Time",
                    children:[
                        {Name:"San Francisco", Area:231,Population:837442,TimeZone:"PST"},
                        {Name:"Los Angeles", Area:503,Population:3904657,TimeZone:"PST"}
                    ],
                    icons: {
                        iconLeaf: "fa fa-sun-o"
                    }
                },
                {Name:"Illinois", Area:57914,Population:12882135,TimeZone:"Central Time Zone",
                    children:[
                        {Name:"Chicago", Area:234,Population:2695598,TimeZone:"CST"}
                    ]
                }
            ],
            icons: {
                iconLeaf: "fa fa-flag",
                iconCollapse: "fa fa-folder-open",
                iconExpand: "fa fa-folder"
            }
        },
        {Name:"Texas",Area:268581,Population:26448193,TimeZone:"Mountain"},
        {Name:"Texas",Area:268581,Population:26448193,TimeZone:"Mountain"},
        {Name:"Texas",Area:268581,Population:26448193,TimeZone:"Mountain"},
        {Name:"Texas",Area:268581,Population:26448193,TimeZone:"Mountain"},
        {Name:"Texas",Area:268581,Population:26448193,TimeZone:"Mountain"},
        {Name:"Texas",Area:268581,Population:26448193,TimeZone:"Mountain"},
        {Name:"Texas",Area:268581,Population:26448193,TimeZone:"Mountain"}
    ];


}]);

app.controller('ModalControlCtrl', function($scope, $uibModal) {

  $scope.open = function() {
    var modalInstance =  $uibModal.open({
      templateUrl: "modalContent.html",
      controller: "ModalContentCtrl",
      size: 'lg',
      windowTopClass: 'getReportModal'
    });
    
    modalInstance.result.then(function(response){
      // $scope.result = `${response} button hitted`;
    });
  };
});

app.controller('langDropdownCtrl', function ($scope, $log) {

  $scope.data = {
    langs: [
      {id: '0', name: 'Русский'},
      {id: '1', name: 'Казахский'}
    ],
    selectedOption: {id: '0', name: 'Русский'}
  };

});

app.controller('ModalContentCtrl', function($scope, $uibModalInstance) {

  $scope.ok = function(){
    $uibModalInstance.close("Ok");
  };

  $scope.cancel = function(){
    $uibModalInstance.dismiss();
  } 
  
});

app.controller('requestedReportsCtrl', function($scope) {
  
});

app.controller('requestStatusCtrl', function($scope) {
  
});

app.controller('RegionTreeCtrl', ['$scope', '$http', '$interval', 'uiGridTreeViewConstants', function ($scope, $http, $interval, uiGridTreeViewConstants ) {
  $scope.gridOptions = {
    enableColumnMenus: false,
    enableSorting: false,
    enableFiltering: false,
    showTreeExpandNoChildren: false,
    enableHiding: false,
    columnDefs: [
      { name: 'id', width: '20%',displayName: 'Идентификатор' },
      { name: 'region', width: '60%',displayName: 'Регион/Орган' },
    ],
  };

  var id=0;
  var writeoutNode = function( childArray, currentLevel, dataArray ){
    childArray.forEach( function( childNode ){

    if ( childNode.children.length > 0 ){
        childNode.$$treeLevel = currentLevel;
        id=childNode.categoryId;
       if(childNode.categoryId == childNode.parentCategoryId)
        {
          childNode.parentCategoryName='';
        }
     }
    else
    {
     if((id!=childNode.parentCategoryId) || (childNode.categoryId == childNode.parentCategoryId))
      {
        if(childNode.categoryId == childNode.parentCategoryId)
        {
          childNode.parentCategoryName='';
        }
        childNode.$$treeLevel = currentLevel;
      }
    }
      dataArray.push( childNode );
      writeoutNode( childNode.children, currentLevel + 1, dataArray );
    });
  };

  $http.get('/json/regions.json')
  .then(function(response) {
    var dataSet = response.data;

    $scope.gridOptions.data = [];
    writeoutNode( dataSet, 0, $scope.gridOptions.data );
  });

}]);