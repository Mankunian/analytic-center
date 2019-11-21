var app = angular.module('app', [
  'ngTouch',
  // 'treeGrid',
  'ui.bootstrap',
  'ui.select',
  'checklist-model',
  'ui.grid',
  'ui.grid.treeView',
  'ui.grid.grouping',
  'ui.grid.edit',
  'ui.grid.selection'
]);

app.controller('MainCtrl', ['$scope', '$http', 'uiGridGroupingConstants', 'uiGridTreeViewConstants', 'uiGridTreeBaseService', function ($scope, $http, $rootScope, uiGridTreeBaseService) {


  //Получение списка групп
  $scope.getGroups = function () {
    $http({
      method: 'GET',
      url: 'http://18.140.232.52:8081/api/v1/ru/slices/groups'
    }).then(function (value) {
      $scope.groups = value.data;
    })
  };
  $scope.getGroups();
  //Получение списка групп


  // var detailButton = '<div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents"> <button ng-click="grid.appScope.open(row.entity)" ng-hide="row.treeLevel==0 || row.treeLevel == 1" type="button" class="btn btn-success"> Операции со срезами </button> </div>'

  var operBySrez = '<div  ng-controller="modalOperBySrezCtrl" ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents"> <button ng-click="grid.appScope.openOperBySrez(row.entity)" ng-hide="row.treeLevel==0 || row.treeLevel == 1" type="button" class="btn btn-success"> Операция со срезами </button> </div>'


  $scope.gridOptions = {
    showTreeExpandNoChildren: false,
    enableRowSelection: true,
    enableSelectAll: true,
    selectionRowHeaderWidth: 35,
    rowHeight: 45,
    enableFiltering: false,
    treeRowHeaderAlwaysVisible: false,
    columnDefs: [

      {
        name: 'groupCode',
        displayName: 'Код группы',
        visible: false,
        sort: {priority: 0, direction: 'asc'}
      },
      {
        name: 'groupName',
        displayName: 'Группы',
        grouping: {groupPriority: 0},
        sort: {priority: 0, direction: 'asc'},
        width: '500',
        cellTemplate: '<div><div ' +
          'ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" ' +
          'class="ui-grid-cell-contents" ' +
          'title="TOOLTIP">' +
          '<button class="btn btn-primary" ng-click="grid.appScope.toggleFirstRow(rowRenderIndex, row.entity)"><i class="fa fa-folder"></i></button> {{COL_FIELD CUSTOM_FILTERS}}</div></div>'
      },
      {
        name: 'statusCode',
        displayName: 'Код статуса',
        visible: false
      },

      {
        name: 'year',
        displayName: 'Год',
        visible: false
      },


      {
        name: 'statusName',
        displayName: 'Статус',
        grouping: {groupPriority: 0},
        sort: {priority: 0, direction: 'desc'},
        width: '250',
        cellTemplate:
          '<div>' + '<div  ' +
          'ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" ' +
          'class="ui-grid-cell-contents" ' +
          'title="TOOLTIP">' +
          '<button class="btn btn-primary" ng-click="grid.appScope.$parent.toggleSecRow(rowRenderIndex, COL_FIELD, row.treeNode.children)"> ' +
          '<i class="fa fa-folder"></i>' +
          '</button> {{COL_FIELD CUSTOM_FILTERS}}' +
          '</div>' +
          '</div>'
      },


      {
        name: 'maxRecNum',
        displayName: 'Номер среза',
        width: '*',
        cellTemplate: '<div  ng-controller="ModalControlCtrl" ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents"> <button ng-click="grid.appScope.open(row.entity)" ng-hide="row.treeLevel==0 || row.treeLevel == 1" type="button" class="btn btn-primary"> {{COL_FIELD CUSTOM_FILTERS}} </button> </div>'
      },
      {
        name: 'period',
        displayName: 'Период',
        width: '*'
      },
      {
        name: 'created',
        displayName: 'Сформирован',
        width: '*'
      },
      {
        name: 'button',
        displayName: 'Действие',
        cellTemplate: operBySrez
      }

    ],

    onRegisterApi: function (gridApi) {
      $scope.gridApi = gridApi;
    }
  };

  //Получение всех срезов


  $scope.toggleFirstRow = function (index) {
    $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[index]);
  };

  $scope.toggleSecRow = function (index, col, rowEntity) {
    var params = rowEntity[0].row.entity;
    var groupCode = params.groupCode;
    var statusCode = params.statusCode;
    var year = params.year;


    $http({
      method: 'GET',
      url: 'http://18.140.232.52:8081/api/v1/RU/slices?deleted=false&groupCode=' + groupCode + '&statusCode=' + statusCode + '&year=' + year + ''
    }).then(function (value) {
      console.log(value);
      $scope.gridOptions.data = value.data;
      $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[index]);
    }, function (reason) {
      console.log(reason)
    });


  };


  $scope.loader = false;
  $scope.getAllSrez = function () {
    $scope.loader = true;
    $http({
      method: 'GET',
      // url: 'http://18.140.232.52:8081/api/v1/ru/slices'
      url: 'http://18.140.232.52:8081/api/v1/RU/slices/parents'
    }).then(function (response) {
      $scope.loader = false;
      $scope.allSrez = response.data;
      var data = response.data;
      console.log(data);
      angular.forEach(data, function (value, index) {
        $scope.indexSrez = index;
        $scope.valueSrez = value;
      });

      $scope.showGrid = response.data;
      $scope.gridOptions.data = data;
    })
  };

  $scope.getAllSrez();
  //Получение всех срезов


  $scope.user = [];
  $scope.orderSrez = function (user) {


    var changeTab = function () {
      $('.nav-tabs a[href="#home"]').tab('show');
      $scope.vChecked = false;
    };


    changeTab();

    $scope.group = user;

    var dataObj = {
      "startDate": dateFromString,
      "endDate": dateToString,
      "maxRecNum": $scope.statsrez,
      // "region": 19,
      "groups": $scope.group
    };


    $http({
      method: 'POST',
      url: 'http://18.140.232.52:8081/api/v1/ru/slices',
      data: dataObj
    }).then(function (response) {

      $scope.user = [];


      var data = response.data;
      $scope.showGrid = response.data;

      $scope.gridOptions.data = data;


    }, function (reason) {
      console.log(reason)
    })

  };


  //Получить № статсреза
  $scope.getStatSrez = function () {
    $http({
      method: 'GET',
      url: 'http://18.140.232.52:8081/api/v1/ru/slices/max'
    }).then(function (value) {
      $scope.statsrez = value.data.value;
      // console.log($scope.statsrez);
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
      url: 'http://18.140.232.52:8081/api/v1/ru/slices/groups'
    }).then(function (value) {
      $scope.groups = value.data;
    })
  };
  $scope.getGroups();
  //Получение списка групп


}]);

/**
 *  ModalControlCtrl
 */
app.controller('ModalControlCtrl', function ($scope, $uibModal, $rootScope) {

  $rootScope.open = function (value) {

    $scope.dataSendByModal = value;

    var modalInstance = $uibModal.open({
      templateUrl: "modalContent.html",
      controller: "ModalContentCtrl",
      size: 'lg',
      windowTopClass: 'getReportModal',
      resolve: {
        value: function () {
          return $scope.dataSendByModal;
        }
      }
    });

    modalInstance.result.then(function (response) {
      // $scope.result = `${response} button hitted`;
    });
  };
});


/**
 *  ModalOperBySrezCtrl
 */
app.controller('modalOperBySrezCtrl', function ($scope, $uibModal, $rootScope) {
  $rootScope.openOperBySrez = function (value) {
    $scope.dataSendByModal = value;


    var modalInstance = $uibModal.open({
      templateUrl: 'modalOperBySrez.html',
      controller: 'modalContentOperBySrezCtrl',
      size: 'lg',
      windowTopClass: 'getReportModal',
      resolve: {
        value: function () {
          return $scope.dataSendByModal;
        }
      }
    });
    modalInstance.result.then(function (response) {
      // $scope.result = `${response} button hitted`;
    });

  }
});


/**
 *  LangDropdownCtrl
 */
app.controller('langDropdownCtrl', function ($scope, $log) {

  $scope.data = {
    langs: [
      {id: '0', name: 'Русский'},
      {id: '1', name: 'Казахский'}
    ],
    selectedOption: {id: '0', name: 'Русский'}
  };

});

/**
 *  ModalContentCtrl
 */
app.controller('ModalContentCtrl', function ($scope, $http, $uibModalInstance,  value, $rootScope) {
      
  // $scope.statSliceNum = value['maxRecNum'];
  $scope.statSliceNum = 542;
  $scope.statSlicePeriod = value['period'];
  
  $http.get('http://18.140.232.52:8081/api/v1/ru/slices/reports?sliceId=' + $scope.statSliceNum)
    .then(function (response) {
      $scope.reportCodes = response.data;
    });

  $scope.obj = {};
  $scope.showRequestedReports = function() {
    var counter=0;
    $scope.requestedReports = [];

    if ($rootScope.selectedDepartmentsArray != undefined && $rootScope.selectedRegionsArray != undefined) {
      angular.forEach($rootScope.selectedRegionsArray, function (value, index) {
        val1 = value.name;
        angular.forEach($rootScope.selectedDepartmentsArray, function (value, index) {
          $scope.requestedReports[counter] = val1 + value.name;
          counter++;
        });
      });
    }
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss();
  }

  $scope.gridOptionsDep = {
    showGridFooter: false,
    enableColumnMenus: false,
    showTreeExpandNoChildren: false,
    enableHiding: false,

    enableSorting: false,
    enableFiltering: false,

    enableRowSelection: true,
    enableSelectAll: true,
    rowHeight: 35,
    multiSelect: true
  };

  $scope.gridOptionsDep.columnDefs = [
    {name: 'code', width: '15%', displayName: 'и/н'},
    {name: 'name', width: '70%', displayName: 'Ведомство'}
  ];

  // $scope.gridOptionsDep.data = [];

  $scope.info = {};
  
  $scope.gridOptionsDep.onRegisterApi = function (gridApi) {
    //set gridApi on scope
    $scope.gridApiDep = gridApi;
    $rootScope.selectedDepartmentsArray = [];
    gridApi.selection.on.rowSelectionChanged($scope, function (row) {

      if ($rootScope.selectedDepartmentsArray.indexOf(row.entity) === -1) {
        $rootScope.selectedDepartmentsArray.push(row.entity);
      } else {
        var index = $rootScope.selectedDepartmentsArray.indexOf(row.entity);
        $rootScope.selectedDepartmentsArray.splice(index, 1);
      }

    });
  };

  $scope.getDepartmentsList = function(reportName, reportCode) {
    $scope.currentReportTab = {
      'name' : reportName,
      'code' : reportCode,
    };
    $scope.isTab = true;

    $http.get('http://18.140.232.52:8081/api/v1/RU/slices/orgs?reportCode=' + $scope.currentReportTab.code)
      .then(function (response) {
        if ($scope.gridOptionsDep.data.length == 0) {
          $scope.gridOptionsDep.data = response.data;
        }
      });
  };

  $scope.getReports = function () {
    var postData = {
      "sliceId": 542,
      "reportCode": $scope.currentReportTab.code,
      "orgCode": "00",
      "regCode": 19
    };

    $http({
      method: 'POST',
      url: 'http://18.140.232.52:8081/api/v1/RU/slices/reports/createReport',
      data: postData
    }).then(function (response) {
      $scope.reportData = response.data;
      return $scope.reportData;
      console.log(response);
    }, function (reason) {
      console.log(reason)
    })
  }

});

// app.factory('ReportFact', function($http) {

//   var data = {},
//       departments = [];

//   return {
//     getCode: function () {
//       return data;
//     },
//     setCode: function (code) {
//       data = code;
//     },
//     setDepartments: function (code) {    
//       $http.get('http://18.140.232.52:8081/api/v1/RU/slices/orgs?reportCode=' + code)
//         .then(function (response) {
//           departments = response.data;
//         });
//     },
//     getDepartments: function () {
//       return departments;
//     },
//   };

// });

app.controller('requestStatusCtrl', function ($scope) {

});

/**
  * Regions tree Controller
  */

app.controller('RegionTreeCtrl', ['$scope','$rootScope', '$http', '$interval', '$log', 'uiGridTreeViewConstants', 'uiGridConstants', function ($scope,$rootScope, $http, $interval, $log, uiGridTreeViewConstants, uiGridGroupingConstants) {
  
  $scope.gridOptions = {
    enableColumnMenus: false,
    showTreeExpandNoChildren: false,
    enableHiding: false,

    enableSorting: false,
    enableFiltering: false,

    enableRowSelection: true,
    enableSelectAll: false,
    selectionRowHeaderWidth: 35,
    rowHeight: 35,
    treeIndent: 10,

    columnDefs: [
    { name: 'code', width: '20%',displayName: 'и/н', cellTemplate: "<div class=\"ui-grid-cell-contents ng-binding ng-scope\" ng-style=\"{'padding-left': grid.options.treeIndent * row.treeLevel + 'px'}\">{{COL_FIELD CUSTOM_FILTERS}}</div>" },
    { name: 'name', width: '40%',displayName: 'Регион/Орган' , cellTemplate: "<div class=\"ui-grid-cell-contents ng-binding ng-scope\" ng-style=\"{'padding-left': grid.options.treeIndent * row.treeLevel + 'px'}\">{{COL_FIELD CUSTOM_FILTERS}}</div>" }
    ]
  };

  $scope.gridOptions.multiSelect = true;

  var id = 0;
  var writeoutNode = function (childArray, currentLevel, dataArray) {
    childArray.forEach(function (childNode) {

      if (childNode.children.length > 0) {
        childNode.$$treeLevel = currentLevel;
        id = childNode.categoryId;
        if (childNode.categoryId == childNode.parentCategoryId) {
          childNode.parentCategoryName = '';
        }
      } else {
        if ((id != childNode.parentCategoryId) || (childNode.categoryId == childNode.parentCategoryId)) {
          if (childNode.categoryId == childNode.parentCategoryId) {
            childNode.parentCategoryName = '';
          }
          childNode.$$treeLevel = currentLevel;
        }
      }
      dataArray.push(childNode);
      writeoutNode(childNode.children, currentLevel + 1, dataArray);
    });
  };

  var dataSet = [];

  $http({
    method: 'GET',
    url: 'http://18.140.232.52:8081/api/v1/RU/slices/regsTree'
  }).then(function (response) {
    dataSet.push(response.data);

    $scope.gridOptions.data = [];
    writeoutNode(dataSet, 0, $scope.gridOptions.data);
  });

  $scope.info = {};
  $scope.gridOptions.onRegisterApi = function (gridApi) {
    //set gridApi on scope
    $scope.gridApi = gridApi;

    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
      $rootScope.selectedRegionsArray = $scope.gridApi.selection.getSelectedRows();
      console.log($rootScope.selectedRegionsArray);
    });
  };

}]);


/**
 * Department Controller
 */

// app.controller('DepartmentCtrl', function ($scope, $http, $log, uiGridConstants, $rootScope, ReportFact) {

//   $scope.gridOptions = {
//     showGridFooter: false,
//     enableColumnMenus: false,
//     showTreeExpandNoChildren: false,
//     enableHiding: false,

//     enableSorting: false,
//     enableFiltering: false,

//     enableRowSelection: true,
//     enableSelectAll: true,
//     rowHeight: 35,
//     multiSelect: true
//   };

//   $scope.gridOptions.columnDefs = [
//     {name: 'code', width: '15%', displayName: 'и/н'},
//     {name: 'name', width: '70%', displayName: 'Ведомство'}
//   ];

//   var refresh = function() {
//      $scope.refresh = true;
//      $timeout(function() {
//        $scope.refresh = false;
//      }, 0);
//    };

//   if (ReportFact.getCode().length > 0 ) {
//     $scope.gridOptions.data = ReportFact.getDepartments();
//     console.log(ReportFact.getCode());
//   } else {
//     $scope.gridOptions.data = [];
//     console.log(ReportFact.getCode());
//   }
//   // console.log(ReportFact.getCode());
  
//   // $http.get('http://18.140.232.52:8081/api/v1/RU/slices/orgs?reportCode=' + ReportFact.getCode())
//   //   .then(function (response) {
//   //     $scope.gridOptions.data = response.data;
//   //   });


//   $scope.info = {};
 
//   $scope.gridOptions.onRegisterApi = function (gridApi) {
//     //set gridApi on scope
//     $scope.gridApi = gridApi;

//     gridApi.selection.on.rowSelectionChanged($scope, function (row) {
//       $rootScope.selectedDepartmentsArray2 = $scope.gridApi.selection.getSelectedRows();
//     });
//   };
// });

app.controller('requestedReportsCtrl', function ($scope, $rootScope) {
  
});