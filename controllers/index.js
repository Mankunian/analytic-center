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

app.constant('STATUS_CODES', {
  IN_PROCESSING: '0', // В обработке
  APPROVED: '1', // Утвержден
  PRELIMINARY: '2', // Предварительный
  DELETED: '3', // Удален
  CANCELED_BY_USER: '4', // Отменен пользователем
  FORMED_WITH_ERROR: '5', // Сформирован с ошибкой
  WAITING_FOR_PROCESSING: '6', // В ожидании обработки
  IN_AGREEMENT: '7' // На согласовании
}).constant('USER_ROLES', {
  ONE: '1',
  ZERO: '0'
}).constant('BUTTONS', {
  APPROVE: '0', // Согласовать
  CONFIRM: '1', // Утвердить/ Окончательный
  DELETE: '2', // Удалить
  PRELIMINARY: '3', // Перевести в предварительный
  SEND: '4' // На согласование


}).run(function ($rootScope, STATUS_CODES, USER_ROLES, BUTTONS) {
  $rootScope.STATUS_CODES = STATUS_CODES;
  $rootScope.USER_ROLES = USER_ROLES;
  $rootScope.BUTTONS = BUTTONS;
});

app.config(['$qProvider', function ($qProvider) {
  $qProvider.errorOnUnhandledRejections(false);
}]);

app.controller('MainCtrl', ['$scope', '$http', 'uiGridGroupingConstants', 'uiGridTreeViewConstants', '$interval', function ($scope, $http, $rootScope, uiGridTreeBaseService, $interval) {

  //Получение списка статусов
  $scope.getStatus = function () {
    $http({
      method: 'GET',
      url: 'https://analytic-centre.tk:8081/api/v1/RU/slices/statuses',
      headers: {
        sessionKey: 'admin'
      }
    }).then(function (value) {
      $scope.status = value.data;
    });
  };
  $scope.getStatus();
  //Получение списка статусов


  // Получение списка групп
  $scope.getGroups = function () {
    $http({
      method: 'GET',
      url: 'https://analytic-centre.tk:8081/api/v1/ru/slices/groups',
      headers: {
        sessionKey: 'admin'
      }
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
      url: 'https://analytic-centre.tk:8081/api/v1/ru/slices/max',
      headers: {
        sessionKey: 'admin'
      }
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
    'ng-hide="row.treeLevel==0 || row.treeLevel == 1 || row.entity.statusCode == 0 || row.entity.statusCode == 6" ' +
    'type="button" class="btn btn-primary"> Операция со срезами ' +
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
    treeIndent: 30,

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
          "style='width: 24px; margin: 0 10px; cursor: pointer' " +
          "src='./img/folder-cl.png' " +
          "alt=''>{{COL_FIELD CUSTOM_FILTERS}}</div>"
      },
      {
        name: 'id',
        width: '20%',
        sort: 'asc',
        displayName: 'Номер среза / Период',
        cellTemplate: '<div ng-hide="row.treeLevel==0 || row.treeLevel == 1" class="text-center" ng-controller="ModalControlCtrl"><button style="margin: 5px 0; font-weight: 600; border: none; background: transparent" class="btn btn-default"  ng-click="grid.appScope.open(row.entity)"><a>№{{row.entity.id}}</a></button>период {{row.entity.period}}</div>'
      },
      /*{
        name: 'period',
        width: '*',
        displayName: 'Период'

      },*/


      {
        name: 'maxRecNum',
        displayName: 'На номер',
        width: '9%',
        cellTemplate: '<div class="indentInline">{{row.entity.maxRecNum}}</div>'
      },
      {
        name: 'region',
        displayName: 'По органу',
        width: '8%',
        cellTemplate: '<div class="indentInline">{{row.entity.region}}</div>'
      },
      {
        name: 'created',
        displayName: 'Сформирован',
        width: '13%',
        cellTemplate: '<div class="indentInline">{{row.entity.created}}</div>'
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


  $scope.checkboxModel = {
    value: false
  };


  var url = '';
  $scope.loader = false;
  $scope.showDeletedReports = function (check) {
    $scope.loader = true;
    if (check) {
      url = 'https://analytic-centre.tk:8081/api/v1/RU/slices/parents?deleted=true'
    } else {
      url = 'https://analytic-centre.tk:8081/api/v1/RU/slices/parents?deleted=false'
    }

    var dataSet = [];

    $http({
      method: 'GET',
      url: url,
      headers: {
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
  };


  $scope.showDeletedReports();


  $scope.toggleFirstRow = function (index, treeLevel, row) {

    //Получение всех срезов

    if (treeLevel === 0) {
      console.log(row.entity);
      var groupFolderImg = document.getElementById(row.entity.$$hashKey);

      if (groupFolderImg.src.indexOf('folder-cl.png') !== -1) {
        groupFolderImg.src = 'img/folder-op.png'
      } else {
        groupFolderImg.src = 'img/folder-cl.png'
      }
      $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[index]);
    } else {


      console.log(row.entity);

      var statusFolderImg = document.getElementById(row.entity.$$hashKey);
      if (statusFolderImg.src.indexOf('folder-cl.png') != -1) {
        statusFolderImg.src = 'img/folder-op.png'
      } else {
        statusFolderImg.src = 'img/folder-cl.png'
      }


      $scope.preloaderByStatus = true;

      var urlStatus = '';
      var check = $scope.checkboxModel.value;
      $scope.getDataOnclickStatus = function () {

        var groupCode = row.entity.groupCode,
          statusCode = row.entity.code,
          year = row.entity.statusYear;

        if (check) {
          urlStatus = 'https://analytic-centre.tk:8081/api/v1/RU/slices?deleted=true&groupCode=' + groupCode + '&statusCode=' + statusCode + '&year=' + year + ''

        } else {
          urlStatus = 'https://analytic-centre.tk:8081/api/v1/RU/slices?deleted=false&groupCode=' + groupCode + '&statusCode=' + statusCode + '&year=' + year + ''
        }

        // подгружает данные http
        $http({
          method: 'GET',
          url: urlStatus,
          headers: {
            sessionKey: 'admin'
          }
        }).then(function (value) {
          $scope.showGrid = value.data;
          $scope.preloaderByStatus = false;
        }, function (reason) {
          console.log(reason);
        });
      };
      $scope.getDataOnclickStatus();


      // Тут данные добавляются
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
              // $scope.dataByStatus = statusData;
              $scope.gridOptions.data.splice(selectedRowIndex, 0, statusData);
              console.log(statusData)
            });

            console.log($scope.showGrid);
            //Тут дублирует записи

            $scope.showGrid = [];
            $scope.showGrid.length = 0;

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
      headers: {
        sessionKey: 'admin'
      },
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
      size: 'xlg',
      backdrop : 'static',
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
app.controller('modalOperBySrezCtrl', function ($scope, $uibModal, $rootScope, $http, STATUS_CODES) {

  $rootScope.openOperBySrez = function (rowEntity) {
    $scope.dataSendByModal = rowEntity;

    var modalInstance = $uibModal.open({
      templateUrl: 'modalOperBySrez.html',
      controller: 'modalContentOperBySrezCtrl',
      size: 'xlg',
      backdrop: 'static',
      windowTopClass: 'getReportModal',
      resolve: {
        value: function () {
          return $scope.dataSendByModal;
        },
      }
    });
    modalInstance.result.then(function (response) {
      console.log('response');
    });

  };
});

/**
 *  ModalContentCtrl
 */
app.controller('ModalContentCtrl', function ($scope, $http, $uibModalInstance, value, $rootScope, $sce, $timeout) {

  $scope.statSliceNum = value.id;
  $scope.statSlicePeriod      = value.period;
  $scope.isTabsLoaded         = false;
  $scope.isReportsSelected    = false;
  $scope.tabsIsRefreshed      = false;
  $scope.isReadyReportsLoaded = true;

  $scope.langData = {
    langs: [
      {id: '0', name: 'Русский'},
      {id: '1', name: 'Казахский'}
    ],
    selectedRepLang: {id: '0', name: 'Русский'}
  };


  var refresh = function() {
    $scope.refresh = true;
    $timeout(function() {
      $scope.refresh = false;
    }, 0);
  };

  /*=====  Получение списка отчетов для формирования вкладок ======*/
  $http({
    method: 'GET',
    url: 'https://analytic-centre.tk:8081/api/v1/ru/slices/reports?sliceId=' + $scope.statSliceNum,
    headers: {
      sessionKey: 'admin'
    }
  }).then(function (response) {
    $scope.reportTabs = response.data;
  });

  $scope.getReportInfo = function (index) {
    return $scope.reportTabs[index];
  };
  /*=====  Получение списка отчетов для формирования вкладок end ======*/

  /*=====  Regions grid - get data from backend ======*/
  $http({
    method: 'GET',
    url: 'https://analytic-centre.tk:8081/api/v1/RU/slices/regsTree',
    headers: {
      sessionKey: 'admin'
    }
  }).then(function (response) {
    var responseData = [];
    $scope.regionsDataset = [];

    responseData.push(response.data);
    writeoutNodeRegions(responseData, 0, $scope.regionsDataset);

    /*=====  Deps grid - get data from backend ======*/
    $http({
      method: 'GET',
      url: 'https://analytic-centre.tk:8081/api/v1/ru/slices/reports?sliceId=' + $scope.statSliceNum + '&withOrgs=true',
      headers: {
        sessionKey: 'admin'
      }
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
          enableSelectAll: true,
          rowHeight: 35,
          multiSelect: true,
          columnDefs: [
            {name: 'code', width: '*', displayName: 'и/н'},
            {name: 'name', width: '*', displayName: 'Ведомство'}
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
          treeIndent: 7,
          multiSelect: true,
          columnDefs: [
            {name: 'code', width: '20%', displayName: 'и/н', cellTemplate: "<div class=\"ui-grid-cell-contents ng-binding ng-scope\" ng-style=\"{'padding-left': (row.treeLevel == 'last') ? grid.options.treeIndent * 3 + 'px' : grid.options.treeIndent * (row.treeLevel + 1) + 'px'}\">{{COL_FIELD CUSTOM_FILTERS}}</div>"},
            {name: 'name', width: '80%', displayName: 'Регион/Орган', cellTemplate: "<div class=\"ui-grid-cell-contents ng-binding ng-scope\" ng-style=\"{'padding-left': (row.treeLevel == 'last') ? grid.options.treeIndent * 3 + 'px' : grid.options.treeIndent * (row.treeLevel + 1) + 'px'}\">{{COL_FIELD CUSTOM_FILTERS}}</div>"}
          ]
        };
        // Запись отчетов и ведомств в правильную структуру для Grid 
        item.gridRegionsDataset = $scope.gridOptionsRegion;
        $scope.setGridApiOptions(index, item.gridRegionsDataset, item.gridDataset);
      });
      // END Each function for reports with orgs
      $scope.onRegisterApiInit();

      // Скрыть индикатор загрузки и показать данные формы
      $scope.isTabsLoaded = true;
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
          $scope.selectedRegions[index] = item.gridApiRegionsName.selection.getSelectedRows();
        });
      };
    });
  };
  /*=====  Initialize onRegisterApi event handler function with dynamic data end ======*/
  // $scope.regionsGridApiOptions[0].gridApiRegionsName.treeBase.toggleRowTreeState($scope.regionsGridApiOptions[0].grid.renderContainers.body.visibleRowCache[0]);

  // $scope.regionsGridApiOptions[0].gridApiRegionsName.selection.toggleRowSelection($scope.regionsGridApiOptions[0].gridRegionsDataset.data[removedRegIndex]);
  /*=====  Get and save current reports's name, code ======*/
  $scope.getCurrentReportTab = function (name, code) {
    $scope.currentReportTab = {
      'name': name,
      'code': code,
    };
    // refreshTabs(code);
    refresh();
  };
  /*=====  Get and save current reports's name, code end ======*/

  /*=====  Sets correct $$treeLevel ======*/
  var writeoutNodeRegions = function (childArray, currentLevel, dataArray) {
    childArray.forEach(function (childNode) {
      if (childNode.children.length > 0) {
        childNode.$$treeLevel = currentLevel;
      } else {
        childNode.$$treeLevel = 'last';
      }
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

    if ($scope.selectedRegions != undefined && $scope.selectedRegions.length > 0 && $scope.selectedDeps != undefined && $scope.selectedDeps.length > 0) {
      $scope.selectedRegions.forEach(function (element, index) {
        var regionsTabIndex = index;
        reportInfo = $scope.getReportInfo(regionsTabIndex);
        console.log($scope.selectedRegions[regionsTabIndex]);
        element.forEach(function (region, index) {
          if ($scope.selectedDeps[regionsTabIndex] != undefined) {
            $scope.isReportsSelected = true;

            $scope.selectedDeps[regionsTabIndex].forEach(function (department, index) {
              console.log($scope.selectedDeps[regionsTabIndex]);
              console.log('im here');
              $scope.requestedReports[counter] = reportInfo.name + '-' + region.name + '-' + department.name;
              $scope.requestedReportsQuery[counter] = {
                "sliceId": $scope.statSliceNum,
                "reportCode": reportInfo.code,
                "orgCode": department.code,
                "regCode": region.code
              };
              counter++;
            });
          }
        });
      });
    }
  };

  $scope.removeSelectedReport = function(key){
    var removedDepIndex,
        removedDepValue,
        removedRegIndex,
        removedTabIndex;

    removedDepValue = $scope.requestedReportsQuery[key].orgCode;
    removedRegValue = $scope.requestedReportsQuery[key].regCode;


    $scope.requestedReports.splice(key, 1);
    $scope.requestedReportsQuery.splice(key, 1);
    // $scope.selectedDeps.splice($scope.selectedDeps[0].findIndex(x => x.code === removedDepValue), 1);


    console.log('такой деп еще есть',$scope.requestedReportsQuery.findIndex(x => x.orgCode === removedDepValue) !== -1);
    console.log('такой регион еще есть',$scope.requestedReportsQuery.findIndex(x => x.regCode === removedRegValue) !== -1);

    // if ($scope.requestedReportsQuery.findIndex(x => x.orgCode === removedDepValue) !== -1 && $scope.requestedReportsQuery.findIndex(x => x.regCode === removedRegValue) !== -1) {

      if ($scope.requestedReportsQuery.findIndex(x => x.orgCode === removedDepValue) === -1) {
        console.log('bolwe net deps');
        removedDepIndex = $scope.depsGridApiOptions[0].gridApiDepDataset.data.findIndex(x => x.code === removedDepValue);
        $scope.depsGridApiOptions[0].gridApiDepsName.selection.toggleRowSelection($scope.depsGridApiOptions[0].gridApiDepDataset.data[removedDepIndex]);
      }

      if ($scope.requestedReportsQuery.findIndex(x => x.regCode === removedRegValue) === -1) {
        console.log('bolwe net regs');
        removedRegIndex = $scope.regionsGridApiOptions[0].gridRegionsDataset.data.findIndex(x => x.code === removedRegValue);
        $scope.regionsGridApiOptions[0].gridApiRegionsName.selection.toggleRowSelection($scope.regionsGridApiOptions[0].gridRegionsDataset.data[removedRegIndex]);
      }

    // }
    console.log($scope.requestedReportsQuery);
  };
  /*=====  Generate and get requested reports end ======*/

  /*=====  Get reports ======*/
  $scope.getReports = function () {
    $scope.isReadyReportsLoaded = false;

    var selectedLang = 'ru';
    if ($scope.langData.selectedRepLang.id === '1') selectedLang = 'kz';

    if ($scope.requestedReportsQuery != undefined && $scope.requestedReportsQuery.length > 0) {
      $scope.readyReports = [];
      $http({
        method: 'POST',
        url: 'https://analytic-centre.tk:8081/api/v1/RU/slices/reports/createReports?repLang='+selectedLang,
        headers: {
          sessionKey: 'admin'
        },
        data: $scope.requestedReportsQuery
      }).then(function (response) {
        $scope.isReadyReportsLoaded = true;
        var reportValues = response.data;
        var counter = 0;
        reportValues.forEach(function (element, index) {

          var reportDownloadUrl = "https://analytic-centre.tk:8081/api/v1/RU/slices/reports/" + element.value + "/download";
          var readyReportItem = "<a href=" + reportDownloadUrl + " target='_blank'>Скачать (" + $scope.requestedReports[counter] + ")</a>";

          $scope.readyReports.push($sce.trustAsHtml(readyReportItem));
          counter++;
        });
      }, function (reason) {
        console.log(reason);
      });

    }
  };
  /*=====  Get reports end ======*/

  /*=====  Close modal ======*/
  $scope.cancel = function () {
    $uibModalInstance.dismiss();
  };
  /*=====  Close modal end ======*/

});


app.controller('modalContentOperBySrezCtrl', function ($scope, $http, $uibModalInstance, value, STATUS_CODES, USER_ROLES, BUTTONS, $uibModal, $timeout) {
  /*=====  Получение данных ======*/
  $scope.statusInfoData = [];
  var url = '';
  $scope.srezNo = value.id;
  $scope.period = value.period;
  $scope.srezToNum = value.maxRecNum;
  // Получаем код статуса со строки - row.entity

  $scope.rowEntityStatusCode = value.statusCode;
  console.log($scope.rowEntityStatusCode);
  $scope.statusCode = value.statusCode;
  // $scope.statusCode = STATUS_CODES.FORMED_WITH_ERROR;


  // Определяем роль пользователя
  $scope.userRole = USER_ROLES.ONE;
  // $scope.userRole = USER_ROLES.ZERO;
  /*=====  Получение данных end ======*/


  $scope.activeTabIndex = 0;
  /*Получаем дерево статусов в зависимости от Номера среза*/
  $scope.getStatusTree = function () {
    $http({
      method: 'GET',
      url: 'https://analytic-centre.tk:8081/api/v1/RU/slices/' + $scope.srezNo + '/history',
      headers: {
        sessionKey: 'admin'
      }
    }).then(function (response) {
      $scope.history = response.data;
      //Make tab active depends on last index of status
      $scope.activeTabIndex = $scope.history.length - 1;


        $scope.history.forEach(function (historyObj) {
        $scope.historyObj = historyObj
      });
      $scope.getStatusCode($scope.historyObj);
    });
  };
  $scope.getStatusTree();
  /*Получаем дерево статусов в зависимости от Номера среза*/


  /*=====  Получаем код статуса после клика на статус
  в дереве статусов и перезаписываем полученный из row.entity ======*/
  $scope.getStatusCode = function (selectedStatus) {
    console.log(selectedStatus);
    $scope.statusCode = selectedStatus.statusCode;


    if (selectedStatus.statusCode === STATUS_CODES.IN_AGREEMENT) {
      console.log('На согласовании');

      $http({
        method: 'GET',
        url: 'https://analytic-centre.tk:8081/api/v1/RU/slices/' + selectedStatus.sliceId + '/history/' + selectedStatus.id + '/approving',
        headers: {
          sessionKey: 'admin'
        }
      }).then(function (response) {
        $scope.statusInfoData = response.data;

        $scope.gridOptionsAgreement = {
          data: response.data,
          showGridFooter: false,
          enableColumnMenus: false,
          showTreeExpandNoChildren: false,
          enableHiding: false,
          enableSorting: false,
          enableFiltering: false,
          enableRowSelection: true,
          enableSelectAll: false,
          rowHeight: 35,
          columnDefs: [
            {name: 'territoryName', width: '*', displayName: 'Терр.управление'},
            {name: 'approveDate', width: '*', displayName: 'Дата-время согласования'},
            {
              name: 'approveName',
              width: '*',
              displayName: 'Статус',
              cellTemplate: '<div style="margin: 5px 0; text-align: center"><a ng-click="grid.appScope.modalRejectionReason(row.entity)" ng-style= "{ color: row.entity.approveCode == \'2\' ? \'red\' : \'\' }">{{COL_FIELD CUSTOM_FILTERS}}</a></div>'
            },
            {name: 'personName', width: '*', displayName: 'ФИО'}
          ]
        };
        // $scope.getStatusTree();
      }, function (reason) {
        console.log(reason)
      })
    }


    /*=====  Сравниваем полученный код статуса и меняем URL HTTP запроса ======*/
    switch ($scope.statusCode) {
      case STATUS_CODES.FORMED_WITH_ERROR: // Сформирован с ошибкой
        $scope.statusName = selectedStatus.statusName;
        $scope.personName = selectedStatus.personName;
        $scope.statusDate = selectedStatus.statusDate;
        $scope.created = value.created;
        $scope.completed = value.completed;
        $scope.errorMsg = selectedStatus.msg;
        break;
      case STATUS_CODES.APPROVED: // Окончательный
        $scope.statusName = selectedStatus.statusName;
        $scope.personName = selectedStatus.personName;
        $scope.statusDate = selectedStatus.statusDate;
        break;
      case STATUS_CODES.PRELIMINARY: // Предварительный
        $scope.statusName = selectedStatus.statusName;
        $scope.personName = selectedStatus.personName;
        $scope.statusDate = selectedStatus.statusDate;
        $scope.created = value.created;
        $scope.completed = value.completed;
        break;
      case STATUS_CODES.IN_AGREEMENT: // На согласовании
        $scope.statusName = selectedStatus.statusName;
        $scope.personName = selectedStatus.personName;
        $scope.statusDate = selectedStatus.statusDate;
        break;


      case STATUS_CODES.DELETED: // Удален
        $scope.statusName = selectedStatus.statusName;
        $scope.personName = selectedStatus.personName;
        $scope.statusDate = selectedStatus.statusDate;
        break;


      case STATUS_CODES.IN_PROCESSING: // В обработке
        url = 'preliminary.json';
        break;
      case STATUS_CODES.CANCELED_BY_USER: // Отменен пользователем
        url = 'canceledByUser.json';
        break;
      default:
        // statements_def
        break;
    }
    /*=====  Сравниваем полученный код статуса и меняем URL HTTP запроса end ======*/
  };


  $scope.statusAction = function (btnNum) {
    console.log(btnNum);

    var btnActionUrl = '';
    switch (btnNum) {
      case btnNum = BUTTONS.SEND:
        btnActionUrl = 'send'; // На согласование
        break;
      case btnNum = BUTTONS.PRELIMINARY:
        btnActionUrl = 'preliminary'; // Перевести в предварительный
        break;
      case btnNum = BUTTONS.CONFIRM:
        btnActionUrl = 'confirm'; // Утвердить
        break;
      case btnNum = BUTTONS.APPROVE:
        btnActionUrl = 'approve'; // Согласовать
        break;
      case btnNum = BUTTONS.DELETE:
        btnActionUrl = 'delete'; // Удалить
        break;
    }


    $http({
      method: 'PUT',
      url: 'https://analytic-centre.tk:8081/api/v1/RU/slices/' + $scope.srezNo + '/' + btnActionUrl,
      headers: {
        sessionKey: 'admin'
      }
    }).then(function (response) {
      console.log(response);
      $timeout(alert('Операция успешно совершена'), 2000);
      $scope.getStatusTree();
    }, function (reason) {
      console.log(reason);

    })

  };


  $scope.modalRejectionReason = function (rowEntity) {
    if (rowEntity.approveCode === '2') {
      $uibModal.open({
        templateUrl: 'rejectionReason.html',
        controller: function ($scope, $uibModalInstance) {
          // $scope.userRole = USER_ROLES.ZERO;
          $scope.userRole = USER_ROLES.ONE;

          $scope.rejectionMsg = rowEntity.msg;


          $scope.ok = function () {
            $uibModalInstance.close();
          };

          $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
          };
        }
      })
    }
  };


  $scope.cancel = function () {
    $uibModalInstance.dismiss();
  };

});
