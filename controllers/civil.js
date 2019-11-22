grid.appScope.$parent.toggleSecRow(rowRenderIndex,row.treeLevel, grid, row);


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
  };



$scope.changeImg = function () {


    var img2 = 'https://www.freeiconspng.com/uploads/orange-folder-full-icon-png-13.png',
      img1 = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNGhpmNOG1joyk_s0v1KH229zGd6CpZ0axtXRT6c6pqW4FlB2b&s';

    var imgElement = document.getElementById('changeImg');
    imgElement.src = (imgElement.src === img1) ? img2 : img1;
};



 $scope.toggleSecRow = function (index, treeLevel, grid, row) {

     $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[index]);

     if (row.entity.$$treeLevel === 1) {
       var params = row.entity;

       var groupCode = params.groupCode,
         statusCode = params.code,
         year = params.statusYear;




       $http({
         method: 'GET',
         url: 'http://18.140.232.52:8081/api/v1/RU/slices?deleted=false&groupCode=' + groupCode + '&statusCode=' + statusCode + '&year=' + year + ''
       }).then(function (value) {

         console.log(value.data);
         value.data.forEach(function (statusData) {
           // $scope.gridOptions.data = [];
           // console.log(statusData);
           $scope.gridOptions.data[0]['children'][0]['children'].push(statusData);



         });







         /*$scope.showBtn = value.data;

         $scope.gridOptions.data = value.data;

         $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[index]);*/


       }, function (reason) {
         console.log(reason)
       });
     }





   };
