var app = angular.module('app', [
    'ngTouch',
    'treeGrid',
    'ui.bootstrap',
    'ui.select',
    'checklist-model',
    'ui.grid',
    'ui.grid.grouping'
]);

app.controller('MainCtrl', ['$scope', '$http', 'uiGridGroupingConstants', function ($scope, $http, uiGridGroupingConstants ) {


    $scope.gridOptions = {
        enableFiltering: true,
        treeRowHeaderAlwaysVisible: false,
        columnDefs: [
            { name: 'groupName', width: '30%' },
            { name: 'groupId', grouping: { groupPriority: 1 }, sort: { priority: 1, direction: 'asc' }, width: '20%' }
            /*{ name: 'age', treeAggregationType: uiGridGroupingConstants.aggregation.MAX, width: '20%' },
            { name: 'company', width: '25%' },
            { name: 'registered', width: '40%', cellFilter: 'date', type: 'date' },
            { name: 'state', grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'desc' }, width: '35%', cellTemplate: '<div><div ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>' },
            { name: 'balance', width: '25%', cellFilter: 'currency', treeAggregationType: uiGridGroupingConstants.aggregation.AVG, customTreeAggregationFinalizerFn: function( aggregation ) {
                    aggregation.rendered = aggregation.value;
                } }*/
        ],
        onRegisterApi: function( gridApi ) {
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

        console.log(dataObj);

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


   /* $scope.tree_data = [
        {
            Name: "USA",
            Area: 9826675,
            Population: 318212000,
            TimeZone: "UTC -5 to -10",
            children: [
                {
                    Name: "California", Area: 423970, Population: 38340000, TimeZone: "Pacific Time",
                    children: [
                        {Name: "San Francisco", Area: 231, Population: 837442, TimeZone: "PST"},
                        {Name: "Los Angeles", Area: 503, Population: 3904657, TimeZone: "PST"}
                    ],
                    icons: {
                        iconLeaf: "fa fa-sun-o"
                    }
                },
                {
                    Name: "Illinois", Area: 57914, Population: 12882135, TimeZone: "Central Time Zone",
                    children: [
                        {Name: "Chicago", Area: 234, Population: 2695598, TimeZone: "CST"}
                    ]
                }
            ],
            icons: {
                iconLeaf: "fa fa-flag",
                iconCollapse: "fa fa-folder-open",
                iconExpand: "fa fa-folder"
            }
        },
        {Name: "Texas", Area: 268581, Population: 26448193, TimeZone: "Mountain"},
        {Name: "Texas", Area: 268581, Population: 26448193, TimeZone: "Mountain"},
        {Name: "Texas", Area: 268581, Population: 26448193, TimeZone: "Mountain"},
        {Name: "Texas", Area: 268581, Population: 26448193, TimeZone: "Mountain"},
        {Name: "Texas", Area: 268581, Population: 26448193, TimeZone: "Mountain"},
        {Name: "Texas", Area: 268581, Population: 26448193, TimeZone: "Mountain"},
        {Name: "Texas", Area: 268581, Population: 26448193, TimeZone: "Mountain"}
    ];*/


//Получить № статсреза
    $scope.getStatSrez = function () {
        $http({
            method: 'GET',
            url: 'http://18.140.232.52:8081/api/v1/slices/max'
        }).then(function (value) {
            $scope.statsrez = value.data.value;
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

app.controller('ModalCtrl', function ($scope, $uibModal) {

    $scope.open = function () {
        var modalInstance = $uibModal.open({
            templateUrl: "modalContent.html",
            controller: "ModalContentCtrl",
            size: 'lg',
            windowTopClass: 'getReportModal'
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

app.controller('ModalContentCtrl', function ($scope, $uibModalInstance) {

    $scope.ok = function () {
        $uibModalInstance.close("Ok");
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    }

});

app.controller('requestedReportsCtrl', function ($scope) {

});

app.controller('requestStatusCtrl', function ($scope) {

});
