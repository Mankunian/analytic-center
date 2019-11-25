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


  $scope.getRoles = function () {
    $http({
      method: 'GET',
      url: './json/roles.json'
    }).then(function (response) {
      $scope.userRole = response.data;
    });
  };
  $scope.getRoles();

  //Получение списка статусов
  $scope.getStatus = function () {
    $http({
      method: 'GET',
      url: 'https://analytic-centre.tk:8081/api/v1/RU/slices/statuses'
    }).then(function (value) {
      $scope.status = value.data;
      console.log($scope.status);
    });
  };
  $scope.getStatus();
  //Получение списка статусов


  // Получение списка групп
  $scope.getGroups = function () {
    $http({
      method: 'GET',
      url: 'https://analytic-centre.tk:8081/api/v1/ru/slices/groups'
    }).then(function (value) {
      $scope.groups = value.data;
    });
  };
  $scope.getGroups();
  //Получение списка групп


  //Получить № статсреза
  $scope.getStatSrez = function () {
    $http({
      method: 'GET',
      url: 'https://analytic-centre.tk:8081/api/v1/ru/slices/max'
    }).then(function (value) {
      $scope.statsrez = value.data.value;
    });
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
        width: '450',
        displayName: 'Группы',
        cellTemplate: "<div class=\"ui-grid-cell-contents ng-binding ng-scope\" ng-style=\"{'padding-left': grid.options.treeIndent * row.treeLevel + 'px'}\">" +
          "<img id='{{row.entity.$$hashKey}}' " +
          "ng-hide='row.treeLevel == undefined' " +
          "ng-click='grid.appScope.toggleFirstRow(rowRenderIndex, row.treeLevel, row)' " +
          "style='width: 24px; margin: 0 10px' " +
          "src='./img/folder-cl.png' " +
          "alt=''>{{COL_FIELD CUSTOM_FILTERS}}</div>"
      },
      {
        name: 'id',
        width: '130',
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
        width: '130'
      },
      {
        name: 'button',
        width: '*',
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
      url: 'https://analytic-centre.tk:8081/api/v1/RU/slices/parents?deleted=false',
      headers : {
        sessionKey: 'admin'
      }
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

    //Получение всех срезов

    if (treeLevel === 0) {
      var groupFolderImg = document.getElementById(row.entity.$$hashKey);

      if (groupFolderImg.src.indexOf('folder-cl.png')!=-1){
        groupFolderImg.src = 'img/folder-op.png'
      } else {
        groupFolderImg.src = 'img/folder-cl.png'
      }
      $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[index]);
    } else {

      var statusFolderImg = document.getElementById(row.entity.$$hashKey);
      if (statusFolderImg.src.indexOf('folder-cl.png')!=-1){
        statusFolderImg.src = 'img/folder-op.png'
      } else {
        statusFolderImg.src = 'img/folder-cl.png'
      }



      var groupCode = row.entity.groupCode,
        statusCode = row.entity.code,
        year = row.entity.statusYear;
      // подгружает данные http
      $http({
        method: 'GET',
        url: 'https://analytic-centre.tk:8081/api/v1/RU/slices?deleted=false&groupCode=' + groupCode + '&statusCode=' + statusCode + '&year=' + year + ''
      }).then(function (value) {
        $scope.showGrid = value.data;
      }, function (reason) {
        console.log(reason);
      });


      $scope.gridApi.treeBase.on.rowExpanded($scope, function (row) {

        if (row.entity.isDataLoaded === undefined && row.entity.$$treeLevel !== 0) {
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
          console.log('This row already has data');
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
      url: 'https://analytic-centre.tk:8081/api/v1/ru/slices',
      data: dataObj
    }).then(function (response) {

      $scope.user = [];
      $scope.showGrid = response.data;


    }, function (reason) {
      console.log(reason);
    });

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
app.controller('ModalContentCtrl', function ($scope, $http, $uibModalInstance, value, $rootScope, $sce) {

  $scope.statSliceNum = 541;
  // $scope.statSliceNum = value.id;
  console.log(value);
  $scope.statSlicePeriod = value.period;

  $http({
    method: 'GET',
    url: 'https://analytic-centre.tk:8081/api/v1/ru/slices/reports?sliceId=' + $scope.statSliceNum
  }).then(function (response) {
    $scope.reportTabs = response.data;
  });

  $scope.getReportInfo = function (index) {
    return $scope.reportTabs[index];
  };

  /*=====  Regions grid - get data from backend ======*/
  $http({
    method: 'GET',
    url: 'https://analytic-centre.tk:8081/api/v1/RU/slices/regsTree'
  }).then(function (response) {
    var responseData = [];
    $scope.regionsDataset = [];

    responseData.push(response.data);
    writeoutNodeRegions(responseData, 0, $scope.regionsDataset);

    /*=====  Deps grid - get data from backend ======*/
    $http({
      method: 'GET',
      url: 'https://analytic-centre.tk:8081/api/v1/ru/slices/reports?sliceId=' + $scope.statSliceNum+'&withOrgs=true'
      // url: './json/test.json'
    }).then(function (response) {
      $scope.reports_n_deps = response.data;

      // Each function through reports with orgs
      $scope.reports_n_deps.forEach(function (item, index) {
        $scope.gridOptionsDep = {
          data: item.orgs,
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
          columnDefs: [
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
  });
  /*=====  Regions grid - get data from backend end ======*/

  /*=====  Set datasets and dynamically generate names for grid api ======*/
  $scope.regionsGridApiOptions = [];
  $scope.depsGridApiOptions = [];
  $scope.setGridApiOptions = function (index, gridRegionsDataset, gridApiDepDataset) {
    var gridApiRegionsName,
      gridApiDepsName;

    gridApiDepsName = 'gridApiDeps_' + index;
    gridApiRegionsName = 'gridApiRegions_' + index;
    $scope.depsGridApiOptions[index] = {gridApiDepDataset, gridApiDepsName};
    $scope.regionsGridApiOptions[index] = {gridRegionsDataset, gridApiRegionsName};
  };
  /*=====  Set datasets and dynamically generate names for grid api end ======*/

  /*=====  Initialize onRegisterApi event handler function with dynamic data ======*/
  $scope.onRegisterApiInit = function () {
    $scope.selectedDeps = [];
    $scope.depsGridApiOptions.forEach(function (item, index) {
      item.gridApiDepDataset.onRegisterApi = function (gridApi) {
        item.gridApiDepsName = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.selectedDeps[index] = item.gridApiDepsName.selection.getSelectedRows();
        });
      };
    });

    $scope.selectedRegions = [];
    $scope.regionsGridApiOptions.forEach(function (item, index) {
      item.gridRegionsDataset.onRegisterApi = function (gridApi) {
        item.gridApiRegionsName = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.selectedRegions[index] = item.gridApiRegionsName.selection.getSelectedRows()
        });
      };
    });
  };
  /*=====  Initialize onRegisterApi event handler function with dynamic data end ======*/

  /*=====  Get and save current reports's name, code ======*/
  $scope.getCurrentReportTab = function (name, code) {
    $scope.currentReportTab = {
      'name': name,
      'code': code,
    };
  };
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

  /*=====  Generate and get requested reports ======*/
  $scope.getRequestedReports = function () {
    $scope.requestedReports = [];
    $scope.requestedReportsQuery = [];
    var reportInfo,
      counter = 0;

    if ($scope.selectedRegions != undefined && $scope.selectedDeps != undefined) {

      $scope.selectedRegions.forEach(function (element, index) {
        var regionsTabIndex = index;
        reportInfo = $scope.getReportInfo(regionsTabIndex);

        element.forEach(function (region, index) {
          if ($scope.selectedDeps[regionsTabIndex] != undefined) {
            $scope.selectedDeps[regionsTabIndex].forEach(function (department, index) {

              $scope.department = department;
              $scope.requestedReports[counter] = reportInfo.name + " - " + region.name + "-" + $scope.department.name;
              $scope.requestedReportsQuery[counter] = {
                "sliceId": $scope.statSliceNum,
                "reportCode": reportInfo.code,
                "orgCode": $scope.department.code,
                "regCode": region.code
              };
              counter++;
            });
          }
        });
      });
    }
  };
  /*=====  Generate and get requested reports end ======*/

  /*=====  Get reports ======*/
  $scope.getReports = function () {
    if ($scope.requestedReportsQuery != undefined && $scope.requestedReportsQuery.length > 0) {
      $scope.readyReports = [];
      $http({
        method: 'POST',
        url: 'https://analytic-centre.tk:8081/api/v1/RU/slices/reports/createReports',
        data: $scope.requestedReportsQuery
      }).then(function (response) {
        var reportValues = response.data;
        var counter=0;
        reportValues.forEach(function (element, index) {

          var reportDownloadUrl = "https://analytic-centre.tk:8081/api/v1/{lang}/slices/reports/" + element.value + "/download";
          var readyReportItem = "<a href=" + reportDownloadUrl + " target='_blank'>Скачать отчет ("+ $scope.requestedReports[counter] +")</a>";

          $scope.readyReports.push( $sce.trustAsHtml(readyReportItem));
          counter++;
        });
      }, function (reason) {
        console.log(reason);
      });

    }
  };
  /*=====  Get reports end ======*/
});


app.controller('modalContentOperBySrezCtrl', function ($scope, $http, $uibModalInstance, value) {

  $scope.srezNo = value.id;
  $scope.period = value.period;
  $scope.srezToNum = value.maxRecNum;
  $scope.statusCode = value.statusCode;

  $scope.statuses = [
    {'id': value.statusCode, 'name': value.statusName}
  ];


  if ($scope.statusCode === '2') {
    $scope.getInfoByStatus = function () {
      $http({
        method: 'GET',
        url: './json/preliminary.json'
      }).then(function (response) {
        $scope.preliminaryData = response.data;


      }, function (reason) {
        console.log(reason);
      });


    };
    $scope.getInfoByStatus();
  } else if ($scope.statusCode === '5') {
    $scope.getWithErrorData = function () {
      $http({
        method: 'GET',
        url: './json/withError.json'
      }).then(function (response) {
        $scope.formedWithError = response.data;
      }, function (reason) {

      });
    };
    $scope.getWithErrorData();
  }


  $scope.cancel = function () {
    $uibModalInstance.dismiss();
  };

});
