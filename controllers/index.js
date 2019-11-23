var app = angular.module('app', [
  'ngTouch',
  'ui.bootstrap',
  'ui.select',
  'checklist-model',
  'ui.grid',
  'ui.grid.treeView',
  'ui.grid.grouping',
  'ui.grid.edit',
  'ui.grid.selection'
]);


app.config(['$qProvider', function ($qProvider) {
  $qProvider.errorOnUnhandledRejections(false);
}]);

app.controller('MainCtrl', ['$scope', '$http', 'uiGridGroupingConstants', 'uiGridTreeViewConstants', '$interval', function ($scope, $http, $rootScope, uiGridTreeBaseService, $interval) {


  //Получение списка статусов
  $scope.getStatus = function () {
    $http({
      method: 'GET',
      url: 'https://Analytic-centre.tk:8081/api/v1/RU/slices/statuses'
    }).then(function (value) {
      $scope.status = value.data;
    })
  };
  $scope.getStatus();
  //Получение списка статусов


  // Получение списка групп
  $scope.getGroups = function () {
    $http({
      method: 'GET',
      url: 'https://Analytic-centre.tk:8081/api/v1/ru/slices/groups'
    }).then(function (value) {
      $scope.groups = value.data;
    })
  };
  $scope.getGroups();
  //Получение списка групп


  //Получить № статсреза
  $scope.getStatSrez = function () {
    $http({
      method: 'GET',
      url: 'https://Analytic-centre.tk:8081/api/v1/ru/slices/max'
    }).then(function (value) {
      $scope.statsrez = value.data.value;
    })
  };

  $scope.getStatSrez();
  //Получить № статсреза


  var operBySrez = '<div  ' +
    'ng-controller="modalOperBySrezCtrl" ' +
    'ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" ' +
    'class="ui-grid-cell-contents"> ' +
    '<button ' +
    'ng-click="grid.appScope.openOperBySrez(row.entity)" ' +
    'ng-hide="row.treeLevel==0 || row.treeLevel == 1" ' +
    'type="button" class="btn btn-success"> Операция со срезами ' +
    '</button> </div>';

  $scope.gridOptions = {
    enableColumnMenus: false,
    showTreeExpandNoChildren: true,
    enableHiding: false,

    enableSorting: false,
    enableFiltering: false,

    enableRowSelection: true,
    enableSelectAll: false,
    selectionRowHeaderWidth: 35,
    rowHeight: 45,
    treeIndent: 10,

    columnDefs: [
      {
        name: 'code',
        width: "*",
        displayName: 'Код группы',
        visible: false
      },
      {
        name: 'name',
        width: '470',
        displayName: 'Группы',
        cellTemplate: "<div class=\"ui-grid-cell-contents ng-binding ng-scope\" ng-style=\"{'padding-left': grid.options.treeIndent * row.treeLevel + 'px'}\">" +
          "<img id='changeImg' " +
          "ng-hide='row.treeLevel == 2' " +
          "ng-click='grid.appScope.toggleFirstRow(rowRenderIndex, row.treeLevel, row)' " +
          "style='width: 24px; margin: 0 10px' " +
          "src='./img/folder.png' " +
          "alt=''>{{COL_FIELD CUSTOM_FILTERS}} - {{row.treeLevel}}</div>"
      },
      {
        name: 'id',
        width: '*',
        displayName: 'Номер среза',
        cellTemplate: '<div class="text-center" ng-controller="ModalControlCtrl"><button style="margin: 5px 0" class="btn btn-primary" ng-hide="row.treeLevel==0 || row.treeLevel == 1" ng-click="grid.appScope.open(row.entity)">{{COL_FIELD CUSTOM_FILTERS}}</button></div>'
      },
      {
        name: 'period',
        width: '*',
        displayName: 'Период'

      },
      {
        name: 'created',
        displayName: 'Сформирован',
        width: '*'
      },

      {
        name: 'maxRecNum',
        displayName: 'На номер',
        width: '*'
      },
      {
        name: 'region',
        displayName: 'По органу',
        width: '*'
      },
      {
        name: 'button',
        displayName: 'Действие',
        cellTemplate: operBySrez
      }
    ]
  };
  $scope.gridOptions.onRegisterApi = function (gridApi) {
    $scope.gridApi = gridApi;
  };

  $scope.gridOptions.multiSelect = true;

  var id = 0;
  var writeoutNode = function (childArray, currentLevel, dataArray) {
    childArray.forEach(function (childNode) {

      if (childNode.children.length > 0) {
        childNode.$$treeLevel = currentLevel;

      } else {
        if ((id !== childNode.parentCategoryId) || (childNode.categoryId === childNode.parentCategoryId)) {

          childNode.$$treeLevel = currentLevel;
        }
      }
      dataArray.push(childNode);
      writeoutNode(childNode.children, currentLevel + 1, dataArray);
    });
  };


  $scope.loader = false;
  $scope.getAllSrez = function () {
    $scope.loader = true;
    var dataSet = [];

    $http({
      method: 'GET',
      url: 'https://Analytic-centre.tk:8081/api/v1/RU/slices/parents?deleted=false'
      // url: './json/regions.json'
    }).then(function (response) {
      $scope.loader = false;
      $scope.showGrid = response.data;
      $scope.showGrid.forEach(function (data, index) {
        dataSet.push(data);
        dataSet[index].children.forEach(function (status) {
          status.groupCode = dataSet[index].code;
        });


        $scope.gridOptions.data = [];
        writeoutNode(dataSet, 0, $scope.gridOptions.data);
      });
      console.log(dataSet);


    });

    // $scope.info = {};
  };


  $scope.getAllSrez();


  $scope.toggleFirstRow = function (index, treeLevel, row) {
    if (treeLevel === 0) {
      $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[index]);
    } else {

      var groupCode = row.entity.groupCode,
        statusCode = row.entity.code,
        year = row.entity.statusYear;
      // подгружает данные http
      $http({
        method: 'GET',
        url: 'https://Analytic-centre.tk:8081/api/v1/RU/slices?deleted=false&groupCode=' + groupCode + '&statusCode=' + statusCode + '&year=' + year + ''
      }).then(function (value) {
        $scope.showGrid = value.data;
      }, function (reason) {
        console.log(reason)
      });


      $scope.gridApi.treeBase.on.rowExpanded($scope, function (row) {

        if (row.entity.isDataLoaded === undefined) {
          $interval(function () {
            var selectedRowHashkey = row.entity.$$hashKey,
                selectedRowIndex = 0;
            $scope.gridOptions.data.forEach(function (value, index) {
              if (selectedRowHashkey === value.$$hashKey) {
                selectedRowIndex = index + 1;
              }
            });
            $scope.showGrid.forEach(function (statusData) {
              $scope.dataByStatus = statusData;
              $scope.gridOptions.data.splice(selectedRowIndex, 0, $scope.dataByStatus);
            });

            row.entity.isDataLoaded = true;
          }, 2000, 1);
        } else {
          console.log('This row already has data')
        }
      });


      $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[index]);


    }


  };


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
      url: 'https://Analytic-centre.tk:8081/api/v1/ru/slices',
      data: dataObj
    }).then(function (response) {

      $scope.user = [];


      var data = response.data;
      $scope.showGrid = response.data;

      console.log(data);

      angular.forEach(data, function (value) {
        console.log(value);
        $scope.gridOptions.data.unshift(value)
      })


    }, function (reason) {
      console.log(reason)
    })

  };


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


}]);


/**
 *  ModalControlCtrl
 */
app.controller('ModalControlCtrl', function ($scope, $uibModal, $rootScope) {

  $rootScope.open = function (value) {
    console.log(value);

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
  $rootScope.openOperBySrez = function (rowEntity) {
    console.log(rowEntity);
    $scope.dataSendByModal = rowEntity;


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
app.controller('ModalContentCtrl', function ($scope, $http, $uibModalInstance, value, $rootScope) {

  $scope.statSliceNum = value['maxRecNum'];
  $scope.statSlicePeriod = value['period'];

  if ($rootScope.test != undefined) {
    console.log('$rootScope.test   ' + $rootScope.test);
  }

  $http.get('./json/reports.json')
    .then(function (response) {
      $scope.reportCodes = response.data;
    });

  $scope.cancel = function () {
    $uibModalInstance.dismiss();
  }

});


app.controller('modalContentOperBySrezCtrl', function ($scope, $http, $uibModalInstance, value) {

  $scope.statuses = [
    {'id': 0, 'name': 'Сформирован с ошибкой'},
    {'id': 1, 'name': 'Удален'}
  ];


  $scope.srezInfo = value;


  $scope.cancel = function () {
    $uibModalInstance.dismiss();
  }

});

app.controller('requestedReportsCtrl', function ($scope, $rootScope) {

});

app.controller('requestStatusCtrl', function ($scope) {

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
    treeIndent: 10,

    columnDefs: [
      // { name: 'code', width: '20%',displayName: 'и/н', cellTemplate : "<div class=\"ui-grid-cell-contents\" title=\"TOOLTIP\"><div style=\"float:left;\" class=\"ui-grid-tree-base-row-header-buttons\" ng-class=\"{'ui-grid-tree-base-header': row.treeLevel > -1 }\" ng-click=\"grid.appScope.toggleRow(row,evt)\"><i ng-class=\"{'ui-grid-icon-minus-squared': ( ( grid.options.showTreeExpandNoChildren && row.treeLevel > -1 ) || ( row.treeNode.children && row.treeNode.children.length > 0 ) ) && row.treeNode.state === 'expanded', 'ui-grid-icon-plus-squared': ( ( grid.options.showTreeExpandNoChildren && row.treeLevel > -1 ) || ( row.treeNode.children && row.treeNode.children.length > 0 ) ) && row.treeNode.state === 'collapsed'}\" ng-style=\"{'padding-left': grid.options.treeIndent * row.treeLevel + 'px'}\"></i>&nbsp;</div>{{COL_FIELD CUSTOM_FILTERS}}</div>" },
      // { name: 'code', width: '20%',displayName: 'и/н', cellTemplate : "<div class=\"ui-grid-cell-contents\" title=\"TOOLTIP\"><div style=\"float:left;\" class=\"ui-grid-tree-base-row-header-buttons\" ng-class=\"{'ui-grid-tree-base-header': row.treeLevel > -1 }\" ng-click=\"grid.appScope.toggleRow(row,evt)\"><i ng-class=\"{'ui-grid-icon-minus-squared': ( ( grid.options.showTreeExpandNoChildren && row.treeLevel > -1 ) || ( row.treeNode.children && row.treeNode.children.length > 0 ) ) && row.treeNode.state === 'expanded', 'ui-grid-icon-plus-squared': ( ( grid.options.showTreeExpandNoChildren && row.treeLevel > -1 ) || ( row.treeNode.children && row.treeNode.children.length > 0 ) ) && row.treeNode.state === 'collapsed'}\" ng-style=\"{'padding-left': grid.options.treeIndent * row.treeLevel + 'px'}\"></i> &nbsp;</div>{{COL_FIELD CUSTOM_FILTERS}}</div>"  },
      {
        name: 'code',
        width: '20%',
        displayName: 'и/н',
        cellTemplate: "<div class=\"ui-grid-cell-contents ng-binding ng-scope\" ng-style=\"{'padding-left': grid.options.treeIndent * row.treeLevel + 'px'}\">{{COL_FIELD CUSTOM_FILTERS}}</div>"
      },
      {
        name: 'name',
        width: '40%',
        displayName: 'Регион/Орган',
        cellTemplate: "<div class=\"ui-grid-cell-contents ng-binding ng-scope\" ng-style=\"{'padding-left': grid.options.treeIndent * row.treeLevel + 'px'}\">{{COL_FIELD CUSTOM_FILTERS}}</div>"
      }
    ]
  };

  $scope.gridOptions.multiSelect = true;

  var writeoutNode = function (childArray, currentLevel, dataArray) {
    childArray.forEach(function (childNode) {
      if (childNode.children.length > 0) {
        childNode.$$treeLevel = currentLevel;
      } else {
        childNode.$$treeLevel = currentLevel;
      }
      dataArray.push(childNode);
      writeoutNode(childNode.children, currentLevel + 1, dataArray);
    });
  };

  var dataSet = [];

  $http({
    method: 'GET',
    url: 'https://Analytic-centre.tk:8081/api/v1/RU/slices/regsTree'
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

app.controller('DepartmentCtrl', ['$scope', '$http', '$log', 'uiGridConstants', '$rootScope', function ($scope, $http, $log, uiGridConstants, $rootScope) {

  $scope.gridOptions = {
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

  $scope.gridOptions.columnDefs = [
    {name: 'id', width: '15%', displayName: 'и/н'},
    {name: 'name', width: '70%', displayName: 'Ведомство'}
  ];

  $http.get('./json/ved.json')
    .then(function (response) {
      $scope.gridOptions.data = response.data;
    });

  $scope.info = {};
  // $rootScope.test = $scope.msg;
  // $rootScope.test = 'test ya';  
  // console.log($rootScope.test);

  $scope.gridOptions.onRegisterApi = function (gridApi) {
    //set gridApi on scope
    $scope.gridApi = gridApi;
    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
      // $scope.msg = row.entity;
      $rootScope.test = row.entity;
      console.log($rootScope.test);
    });
  };
}]);

