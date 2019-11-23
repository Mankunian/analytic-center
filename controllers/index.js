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

app.controller('MainCtrl', ['$scope', '$http', 'uiGridGroupingConstants', 'uiGridTreeViewConstants', function ($scope, $http, $rootScope, uiGridTreeBaseService) {


  var operBySrez = '<div  ' +
    /* 'ng-hide="row.entity.statusCode == 0 || row.entity.statusCode == 6" ' +*/
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
    showTreeExpandNoChildren: false,
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
        name: 'name',
        width: '*',
        displayName: 'Группы',
        cellTemplate: "<div class=\"ui-grid-cell-contents ng-binding ng-scope\" ng-style=\"{'padding-left': grid.options.treeIndent * row.treeLevel + 'px'}\"><img ng-hide='row.treeLevel == 2' ng-click='grid.appScope.toggleFirstRow(rowRenderIndex)' style='width: 24px; margin: 0 10px' src='./img/folder.png' alt=''>{{COL_FIELD CUSTOM_FILTERS}}</div>"
      },
      {
        name: 'id',
        width: '*',
        displayName: 'Номер среза',
        cellTemplate: '<div ng-controller="ModalControlCtrl"><button ng-click="grid.appScope.open(row.entity)">{{COL_FIELD CUSTOM_FILTERS}}</button></div>'
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
        name: 'button',
        displayName: 'Действие',
        cellTemplate: operBySrez
      }
    ]
  };


  /*$scope.gridOptions = {

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
        width: '450',
        cellTemplate: '<div><div ' +
          'ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" ' +
          'class="ui-grid-cell-contents" ' +
          'title="TOOLTIP">' +
          '<button class="btn btn-primary" ' +
          'ng-click="grid.appScope.toggleFirstRow(rowRenderIndex, row.entity)">' +
          '<i class="fa fa-folder"></i></button> {{COL_FIELD CUSTOM_FILTERS}}</div></div>'
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
          '<button class="btn btn-primary" ' +
          'ng-click="grid.appScope.$parent.toggleSecRow(rowRenderIndex, COL_FIELD, row.treeNode.children)"> ' +
          '<i class="fa fa-folder"></i>' +
          '</button> {{COL_FIELD CUSTOM_FILTERS}}' +
          '</div>' +
          '</div>'
      },


      {
        name: 'id',
        sort: {priority: 0, direction: 'asc'},
        displayName: 'Номер среза',
        width: '*',
        cellTemplate: '<div ' +
          ' ' +
          'ng-controller="ModalControlCtrl" ' +
          'ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" ' +
          'class="ui-grid-cell-contents text-center"> <button ng-click="grid.appScope.open(row.entity)" ng-hide="row.treeLevel==0 || row.treeLevel == 1" type="button" class="btn btn-primary"> {{COL_FIELD CUSTOM_FILTERS}} </button> </div>'
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
  };*/

  $scope.gridOptions.multiSelect = true;

  var id = 0;
  var writeoutNode = function (childArray, currentLevel, dataArray) {
    childArray.forEach(function (childNode) {

      if (childNode.children.length > 0) {
        childNode.$$treeLevel = currentLevel;

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
    // url: 'https://18.140.232.52:8081/api/v1/RU/slices/regsTree'
    url: './json/regions.json'
  }).then(function (response) {
    $scope.showGrid = response.data;
    dataSet.push(response.data);

    $scope.gridOptions.data = [];
    writeoutNode(dataSet, 0, $scope.gridOptions.data);
  });

  $scope.info = {};
  $scope.gridOptions.onRegisterApi = function (gridApi) {
    //set gridApi on scope
    $scope.gridApi = gridApi;

  };

  //Получение списка статусов
  $scope.getStatus = function () {
    $http({
      method: 'GET',
      url: 'https://18.140.232.52:8081/api/v1/RU/slices/statuses'
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
      url: 'https://18.140.232.52:8081/api/v1/ru/slices/groups'
    }).then(function (value) {
      $scope.groups = value.data;
    })
  };
  $scope.getGroups();
  //Получение списка групп

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
      url: 'https://18.140.232.52:8081/api/v1/RU/slices?deleted=false&groupCode=' + groupCode + '&statusCode=' + statusCode + '&year=' + year + ''
    }).then(function (value) {
      console.log(value.data) ;

      $scope.showBtn = value.data;

      $scope.gridOptions.data = value.data;

      $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[index]);


    }, function (reason) {
      console.log(reason)
    });


  };


  $scope.loader = false;
  $scope.getAllSrez = function () {
    $scope.loader = true;
    $scope.showGrid = false;
    $http({
      method: 'GET',
      url: 'https://18.140.232.52:8081/api/v1/RU/slices/parents?deleted=false'
      // url: './json/allSrez.json'
    }).then(function (response) {
      $scope.loader = false;
      $scope.allSrez = response.data;
      var data = response.data;
      console.log(data);
      angular.forEach(data, function (value, index) {
        $scope.indexSrez = index;
        $scope.valueSrez = value;
      });

      $scope.showGrid = true;
      $scope.gridOptions.data = response.data;
    })
  };



  // $scope.getAllSrez();
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
      url: 'https://18.140.232.52:8081/api/v1/ru/slices',
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


  //Получить № статсреза
  $scope.getStatSrez = function () {
    $http({
      method: 'GET',
      url: 'https://18.140.232.52:8081/api/v1/ru/slices/max'
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
      url: 'https://18.140.232.52:8081/api/v1/ru/slices/groups'
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
app.controller('ModalContentCtrl', function ($scope, $http, $uibModalInstance,  value, $rootScope) {

  $scope.statSliceNum = 541;
  // $scope.statSliceNum = value['maxRecNum'];
  $scope.statSlicePeriod = value['period'];

  /*=====  Regions grid - get data from backend ======*/
  $http({
    method: 'GET',
    url: 'https://18.140.232.52:8081/api/v1/RU/slices/regsTree'
    // url: './json/regsTree.json'
  }).then(function (response) {
    var responseData = [];
    $scope.regionsDataset = [];

    responseData.push(response.data);
    writeoutNodeRegions(responseData, 0, $scope.regionsDataset);

    /*=====  Deps grid - get data from backend ======*/
    $http({
      method: 'GET',
      // url: 'https://18.140.232.52:8081/api/v1/ru/slices/reports?sliceId=' + $scope.statSliceNum+'&withOrgs=true'
      url: './json/test.json'
    }).then(function (response) {
      $scope.reports_n_deps = response.data;

      // Each function through reports with orgs
      $scope.reports_n_deps.forEach( function(item, index) {
        $scope.gridOptionsDep = {
          data : item.orgs,
          showGridFooter: false,
          enableColumnMenus: false,
          showTreeExpandNoChildren: false,
          enableHiding: false,
          enableSorting: false,
          enableFiltering: false,
          enableRowSelection: true,
          enableSelectAll: false,
          rowHeight: 35,
          multiSelect: true,
          columnDefs : [
            {name: 'code', width: '15%', displayName: 'и/н'},
            {name: 'name', width: '70%', displayName: 'Ведомство'}
          ]    
        };
        // Запись отчетов и ведомств в правильную структуру для Grid 
        item.gridDataset = $scope.gridOptionsDep;
        // Инициализация onRegisterApi для обработки событий grid Departments
        $scope.gridOptionsRegion = {
          data: $scope.regionsDataset,
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
          multiSelect: true,
          columnDefs: [
            { name: 'code', width: '20%',displayName: 'и/н', cellTemplate: "<div class=\"ui-grid-cell-contents ng-binding ng-scope\" ng-style=\"{'padding-left': grid.options.treeIndent * row.treeLevel + 'px'}\">{{COL_FIELD CUSTOM_FILTERS}}</div>" },
            { name: 'name', width: '40%',displayName: 'Регион/Орган' , cellTemplate: "<div class=\"ui-grid-cell-contents ng-binding ng-scope\" ng-style=\"{'padding-left': grid.options.treeIndent * row.treeLevel + 'px'}\">{{COL_FIELD CUSTOM_FILTERS}}</div>" }
          ]
        };
        // Запись отчетов и ведомств в правильную структуру для Grid 
        item.gridRegionsDataset = $scope.gridOptionsRegion;
        $scope.setGridApiOptions(index, item.gridRegionsDataset, item.gridDataset);
      }); 
      // END Each function for reports with orgs
      $scope.onRegisterApiInit(); 
    }, function (reason) {
      console.log(reason);
    });
    /*=====  Deps grid - get data from backend ======*/
  })
  /*=====  Regions grid - get data from backend end ======*/
  
  /*=====  Set datasets and dynamically generate names for grid api ======*/
  $scope.regionsGridApiOptions = [];
  $scope.depsGridApiOptions = [];
  $scope.setGridApiOptions = function (index, gridRegionsDataset, gridApiDepDataset) {
    var gridApiRegionsName,
        gridApiDepsName;
  
    gridApiDepsName = 'gridApiDeps_'+index;
    gridApiRegionsName = 'gridApiRegions_'+index;
    $scope.depsGridApiOptions[index] = {gridApiDepDataset, gridApiDepsName};
    $scope.regionsGridApiOptions[index] = {gridRegionsDataset, gridApiRegionsName};
  }
  /*=====  Set datasets and dynamically generate names for grid api end ======*/

  /*=====  Initialize onRegisterApi event handler function with dynamic data ======*/
  $scope.onRegisterApiInit = function() {
    $scope.selectedDeps = [];  
    $scope.depsGridApiOptions.forEach(function (item) {
      item.gridApiDepDataset.onRegisterApi = function (gridApi) {
        item.gridApiDepsName = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.selectedDeps[$scope.currentReportTab.name] = item.gridApiDepsName.selection.getSelectedRows();
          console.log('selectedDeps', $scope.selectedDeps);
        });    
      };
    })

    $scope.selectedRegions = [];
    $scope.regionsGridApiOptions.forEach(function (item) {
      item.gridRegionsDataset.onRegisterApi = function (gridApi) {
        item.gridApiRegionsName = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.selectedRegions[$scope.currentReportTab.name] = item.gridApiRegionsName.selection.getSelectedRows()
          console.log('selectedRegions',$scope.selectedRegions);
        });    
      };
    })
  }
  /*=====  Initialize onRegisterApi event handler function with dynamic data end ======*/
  
  /*=====  Get and save current reports's name, code ======*/
  $scope.getCurrentReportTab = function(name, code) {
    $scope.currentReportTab = {
      'name' : name,
      'code' : code,
    };
  }
  /*=====  Get and save current reports's name, code end ======*/
  
  /*=====  Sets correct $$treeLevel ======*/
  var writeoutNodeRegions = function (childArray, currentLevel, dataArray) {
    childArray.forEach(function (childNode) {
      if (childNode.children.length > 0) childNode.$$treeLevel = currentLevel;
      dataArray.push(childNode);
      writeoutNodeRegions(childNode.children, currentLevel + 1, dataArray);
    });
  };
  /*=====  Sets correct $$treeLevel end ======*/

  /*=====  Generate requested reports array ======*/
  $scope.getRequestedReports = function(){
    $reqReports = [];
    $scope.selectedRegions.forEach(function(item) {
      console.log(item);
    })
  }
  /*=====  Generate requested reports array end ======*/

  /*=====  get reqquested reports ======*/
  $scope.requestedReports = function() {
    $scope.getRequestedReports();
    $scope.isShow = true;

    $scope.gridOptionsReports = {
      showGridFooter: false,
      enableColumnMenus: false,
      showTreeExpandNoChildren: false,
      enableHiding: false,
      enableSorting: false,
      enableFiltering: false,
      enableRowSelection: true,
      enableSelectAll: false,
      rowHeight: 35,
      multiSelect: true,
      columnDefs : [
        {name: 'requestedReport', width: '15%', displayName: 'Отчет'},
      ]
    };

    $scope.gridOptionsReports.data = $scope.selectedRegions;


  };
  /*=====  get reqquested reports end ======*/


  // $scope.showRequestedReports = function() {
  //   var counter=0;
  //   $scope.requestedReports = [];

  //   if ($rootScope.selectedDepartmentsArray != undefined && $rootScope.selectedRegionsArray != undefined) {
  //     angular.forEach($rootScope.selectedRegionsArray, function (value, index) {
  //       val1 = value.name;
  //       angular.forEach($rootScope.selectedDepartmentsArray, function (value, index) {
  //         $scope.requestedReports[counter] = val1 + " - " + value.name + " - " + $scope.currentReportTab.name;
  //         counter++;
  //       });
  //     });
  //   }
  // };

  $scope.getReports = function () {
    var postData = {
      "sliceId": 542,
      "reportCode": $scope.currentReportTab.code,
      "orgCode": "00",
      "regCode": 19
    };

    $http({
      method: 'POST',
      url: 'https://18.140.232.52:8081/api/v1/RU/slices/reports/createReport',
      data: postData
    }).then(function (response) {
      var downloadFileId = response.data.value;
      $scope.readyReports = [];
      var reportDownloadUrl = "https://18.140.232.52:8081/api/v1/{lang}/slices/reports/"+ downloadFileId +"/download";
      $scope.readyReports.push(reportDownloadUrl);
    }, function (reason) {
      console.log(reason)
    })
  }

});