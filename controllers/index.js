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
  var detailButton = '<div  ng-controller="ModalControlCtrl" ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents"> <button ng-click="grid.appScope.open(row.entity)" ng-hide="row.treeLevel==0 || row.treeLevel == 1" type="button" class="btn btn-success"> Операции со срезами </button> </div>'


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
        visible: true
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
          '<button class="btn btn-primary" ng-click="grid.appScope.toggleFirstRow(rowRenderIndex)"><i class="fa fa-folder"></i></button> {{COL_FIELD CUSTOM_FILTERS}}</div></div>'
      },
      {
        name: 'statusCode',
        displayName: 'Код статуса',
        visible: true
      },

      {
        name: 'year',
        displayName: 'Год',
        visible: true
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
          '<button class="btn btn-primary" ng-click="grid.appScope.toggleSecRow(rowRenderIndex, row, \'copy\')"> ' +
          '<i class="fa fa-folder"></i>' +
          '</button> {{COL_FIELD CUSTOM_FILTERS}}' +
          '</div>' +
          '</div>'
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

  //Получение всех срезов


  $scope.toggleFirstRow = function (index) {
    console.log(index);
    $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[index]);
  };

  $scope.toggleSecRow = function (index, rowEntity) {
    console.log(rowEntity);

    /*$http({
      method: 'GET',
      url: 'http://18.140.232.52:8081/api/v1/RU/slices?deleted=false&groupCode=001&statusCode=0&year=2019'
    })*/



    $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[index]);

  };


  $scope.loader = false;
  $scope.getAllSrez = function () {
    $scope.loader = true;
    $http({
      method: 'GET',
      // url: 'http://18.140.232.52:8081/api/v1/ru/slices'
      url: 'http://18.140.232.52:8081/api/v1/RU/slices/groupsAndStatuses?deleted=false'
    }).then(function (response) {
      $scope.loader = false;
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
app.controller('ModalContentCtrl', function ($scope, $http, $uibModalInstance, value) {

  // var statSliceNum,
  //     statSlicePeriod;
      
  // $scope.statSliceNum = value['maxRecNum'];
  // console.log(statSliceNum);
  // $scope.statSlicePeriod = value['period'];
  
  $http.get('./json/reports.json')
    .then(function (response) {
      $scope.reportCodes = response.data;
    });

  $scope.cancel = function () {
    $uibModalInstance.dismiss();
  }

});

app.controller('requestedReportsCtrl', function ($scope, $rootScope) {
  console.log('$rootScope.test' + $rootScope.test);
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

app.controller('DepartmentCtrl', ['$scope', '$http', '$log', 'uiGridConstants','$rootScope', function ($scope, $http, $log, uiGridConstants, $rootScope) {

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
 
  $scope.gridOptions.onRegisterApi = function (gridApi) {
    //set gridApi on scope
    $scope.gridApi = gridApi;
    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
      // $scope.msg = row.entity;
      $rootScope.test = row.entity;
    });
  };
}]);

// app.factory('getRequestedReportsFctr', function(departmentEntity) {
  
//   var thisIsPrivate = "Private";

//   function getPrivate() {
//     return thisIsPrivate;
//   }

//   return {
//     variable: "This is public",
//     getPrivate: getPrivate
//   };
// });
