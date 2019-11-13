var app = angular.module('app', [
    'ngTouch',
    'treeGrid',
    'ui.bootstrap',
    'ui.select',
    'checklist-model',
    'ui.grid',
    'ui.grid.treeView',
    'ui.grid.grouping'
]);

app.controller('MainCtrl', ['$scope', '$http', 'uiGridGroupingConstants', function ($scope, $http, uiGridGroupingConstants ) {




    $scope.user = [];
    $scope.orderSrez = function (user) {
        console.log(user);

        $scope.group = user;

        var dataObj = {
            "startDate": dateFromString,
            "endDate": dateToString,
            "maxRecNum": $scope.statsrez,
            // "region": 19,
            "groups": $scope.group
        };

        $scope.gridOptions = {
        enableFiltering: true,
        treeRowHeaderAlwaysVisible: false,
        columnDefs: [
            { name: 'groupName', width: '30%' }
        ],
        onRegisterApi: function( gridApi ) {
            $scope.gridApi = gridApi;
        }
    };

        $http({
            method: 'POST',
            url: 'http://18.140.232.52:8081/api/v1/slices',
            data: dataObj
        }).then(function (response) {
            var data = response.data;
            $scope.gridOptions.data = data;
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

    $scope.dateTo = new Date();


    var dd = ('0' + $scope.dateFrom.getDate()).slice(-2);
    var mm = ('0' + ($scope.dateFrom.getMonth() + 1)).slice(-2);
    var yy = $scope.dateFrom.getFullYear();

    var dateFromString = dd + '.' + mm + '.' + yy;


    var dd = ('0' + $scope.dateTo.getDate()).slice(-2);
    var mm = ('0' + ($scope.dateTo.getMonth() + 1)).slice(-2);
    var yy = $scope.dateTo.getFullYear();

    var dateToString = dd + '.' + mm + '.' + yy;


    //Получение списка групп
    $scope.getGroups = function () {
        $http({
            method: 'GET',
            url: 'http://18.140.232.52:8081/api/v1/slices/groups'
        }).then(function (value) {
            $scope.groups = value.data;
        })
    };
    $scope.getGroups();
    //Получение списка групп


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

app.controller('RegionTreeCtrl', ['$scope', '$http', '$interval','uiGridGroupingConstants', 'uiGridTreeViewConstants', function ($scope, $http, $interval, uiGridTreeViewConstants, uiGridGroupingConstants ) {
  $scope.gridOptions = {
    enableSorting: false,
    enableFiltering: false,
    showTreeExpandNoChildren: false,
    enableHiding: false,
    enableColumnMenus: false,
    columnDefs: [
      { name: 'id', width: '20%',displayName: 'Идентификатор' },
      { name: 'region', width: '60%',displayName: 'Регион/Орган' },
      // { name: 'parent_id', width: '10%',displayName: 'Парент айди', grouping: { groupPriority: 0 }, },
    ],
  };

 $http.get('/json/regions-test.json')
 .then(function(response) {
   var data = response.data,
       subTreeLevel = 0;

    // data[0].$$treeLevel = 0;

   for ( var i = 0; i < data.length; i++ ){

    data[i].id = data[i].id;;
    data[i].region = data[i].region;
    data[i].parentId = data[i].parent_id;

    // if (data[i].children) {

    //   for ( var j = 0; j < data[i].length; j++ ){
    //     data[i].id = data[j].id;;
    //     data[i].region = data[j].region;
    //     data[i].parentId = data[j].parent_id;
    //   }

    //   data[i].$$treeLevel = subTreeLevel;
    //   subTreeLevel++;
    // }
   }
   data[0].$$treeLevel = 0;
   data[1].$$treeLevel = 1;
   data[2].$$treeLevel = 2;
   data[3].$$treeLevel = 2;
   data[4].$$treeLevel = 2;

   data[5].$$treeLevel = 1;
   data[6].$$treeLevel = 1;
   data[7].$$treeLevel = 1;
   data[8].$$treeLevel = 1;


   $scope.gridOptions.data = data;
   console.log('data' + data);
 });

  $scope.expandAll = function(){
    $scope.gridApi.treeBase.expandAllRows();
  };

  $scope.toggleRow = function( rowNum ){
    $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[rowNum]);
  };

  $scope.toggleExpandNoChildren = function(){
    $scope.gridOptions.showTreeExpandNoChildren = !$scope.gridOptions.showTreeExpandNoChildren;
    $scope.gridApi.grid.refresh();
  };
}]);
