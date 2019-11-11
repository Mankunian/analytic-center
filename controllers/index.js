var app = angular.module('app', ['ngAnimate', 'ngTouch', 'ui.grid', 'ui.grid.grouping', 'angularjs-dropdown-multiselect', 'treeGrid']);

app.controller('MainCtrl', ['$scope', '$http', '$interval', 'uiGridGroupingConstants', function ($scope, $http, $interval, uiGridGroupingConstants) {


    var fromTimestamp = 1546322400;
    $scope.dateFrom = new Date(fromTimestamp * 1000);
    console.log($scope.dateFrom);

    $scope.dateTo = new Date();

    $scope.getGroups = function () {
        $http({
            method: 'GET',
            url: 'http://18.140.232.52:8081/api/v1/slices/groups'
        }).then(function (value) {
            $scope.groups = value.data;
            console.log($scope.groups);
        })
    };


    $scope.getGroups();


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


    $scope.getDatas = function (dateFrom, dateTo, statsrez, item) {
        console.log(dateFrom);
        console.log(dateTo);
        console.log(statsrez);
        console.log(item)
    };


    $scope.tree_data = [
        {
            Name: "Группа о преступности/правонарушениях", Area: 268581, Population: 26448193, TimeZone: "Mountain",
            children: [
                {
                    Name: "California",
                    children: [
                        {Name: "San Francisco", Area: 231, Population: 837442, TimeZone: "PST"},
                        {Name: "Los Angeles", Area: 503, Population: 3904657, TimeZone: "PST"}
                    ]
                },
                {
                    Name: "Illinois", Area: 57914, Population: 12882135, TimeZone: "Central Time Zone",
                    children: [
                        {Name: "Chicago", Area: 234, Population: 2695598, TimeZone: "CST"}
                    ]
                }
            ]
        }
        // {Name:"Texas",Area:268581,Population:26448193,TimeZone:"Mountain"}
    ];


}]);

