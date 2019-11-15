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
  'angularTreeview',
  'ui.grid.selection'
]);

app.controller('MainCtrl', ['$scope', '$http', 'uiGridGroupingConstants', function ($scope, $http) {

  var detailButton = '<div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents"> <button ng-click="grid.appScope.open(row.entity)" ng-hide="row.treeLevel==0 || row.treeLevel == 1" type="button" class="btn btn-success"> Операции со срезами </button> </div>'


  $scope.roleList1 = [
    {
      "roleName": "User", "roleId": "role1", "children": [
        {"roleName": "subUser1", "roleId": "role11", "children": []},
        {
          "roleName": "subUser2", "roleId": "role12", "children": [
            {
              "roleName": "subUser2-1", "roleId": "role121", "children": [
                {"roleName": "subUser2-1-1", "roleId": "role1211", "children": []},
                {"roleName": "subUser2-1-2", "roleId": "role1212", "children": []}
              ]
            }
          ]
        }
      ]
    },

    {"roleName": "Admin", "roleId": "role2", "children": []},

    {"roleName": "Guest", "roleId": "role3", "children": []}
  ];

  $scope.gridOptions = {
    enableRowSelection: true,
    enableSelectAll: true,
    selectionRowHeaderWidth: 35,
    rowHeight: 35,
    enableFiltering: false,
    treeRowHeaderAlwaysVisible: false,
    columnDefs: [
      {
        name: 'groupName',
        displayName: 'Группы',
        grouping: {groupPriority: 0},
        sort: {priority: 0, direction: 'desc'},
        width: '*',
        cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>'
      },

      {
        name: 'statusName',
        displayName: 'Статус',
        grouping: {groupPriority: 0},
        sort: {priority: 0, direction: 'desc'},
        width: '*',
        cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>'
      },
      {
        name: 'maxRecNum',
        displayName: 'Номер среза',
        width: '*'
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
        cellTemplate: detailButton
      }

    ],
    onRegisterApi: function (gridApi) {
      $scope.gridApi = gridApi;
    }
  };


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


    $http({
      method: 'POST',
      url: 'http://18.140.232.52:8081/api/v1/slices',
      data: dataObj
    }).then(function (response) {


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
          return $scope.dataSendByModal
        }
      }
    });

    modalInstance.result.then(function (response) {
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

app.controller('ModalContentCtrl', function ($scope, $http, $uibModalInstance, value) {

    $scope.statSliceNum = value['maxRecNum'];
    $scope.statSlicePeriod = value['period'];

    $http.get('/json/reports.json')
      .then(function(response) {
        $scope.reportCodes = response.data;
      });

    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    }

});

app.controller('requestedReportsCtrl', function($scope) {
  
});

app.controller('requestStatusCtrl', function($scope) {
  
});

/**
  * Regions tree Controller
 */

app.controller('RegionTreeCtrl', ['$scope', '$http', '$interval', '$log', 'uiGridTreeViewConstants', 'uiGridConstants', function ($scope, $http, $interval, $log, uiGridTreeViewConstants, uiGridGroupingConstants) {
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

    columnDefs: [
      { name: 'code', width: '20%',displayName: 'и/н' },
      { name: 'name', width: '60%',displayName: 'Регион/Орган' },
    ],
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
    // $http.get('./json/response_1573739360481.json')
    $http({
        method: 'GET',
        url: 'http://18.140.232.52:8081/api/v1/slices/regsTree'
    }).then(function (response) {
        dataSet.push(response.data);

        $scope.gridOptions.data = [];
        writeoutNode( dataSet, 0, $scope.gridOptions.data );

    });

  $scope.info = {};
  $scope.gridOptions.onRegisterApi = function (gridApi) {
    //set gridApi on scope
    $scope.gridApi = gridApi;
    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
      var msg = 'row selected ' + row.isSelected;
      $log.log(msg);
    });

    gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {
      var msg = 'rows changed ' + rows.length;
      $log.log(msg);
    });
  };

}]);


/**
 * Department Controller
 */

app.controller('DepartmentCtrl', ['$scope', '$http', '$log', 'uiGridConstants', function ($scope, $http, $log, uiGridConstants) {
  $scope.gridOptions = {
    showGridFooter: false,
    enableColumnMenus: false,
    showTreeExpandNoChildren: false,
    enableHiding: false,

    enableSorting: false,
    enableFiltering: false,

    enableRowSelection: true,
    enableSelectAll: true,
    rowHeight: 35
  };

  $scope.gridOptions.columnDefs = [
    {name: 'id', width: '15%', displayName: 'и/н'},
    {name: 'name', width: '70%', displayName: 'Ведомство'}
  ];

  $scope.gridOptions.multiSelect = true;

  $http.get('./json/ved.json')
    .then(function (response) {
      $scope.gridOptions.data = response.data;
      // $timeout(function() {
      //   if($scope.gridApi.selection.selectRow){
      //     $scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);
      //   }
      // });
    });

  $scope.info = {};

  $scope.gridOptions.onRegisterApi = function (gridApi) {

    //set gridApi on scope
    $scope.gridApi = gridApi;
    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
      var msg = row.entity;
      $log.log(msg);
    });

    gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {
      var msg = 'rows changed ' + rows.length;
      $log.log(msg);
    });
  };
}]);
