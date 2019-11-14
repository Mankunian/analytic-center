angular.module('app').config(function ($routeProvider) {
    $routeProvider
        .when("/controllers/index", {
            templateUrl: "index.html"
        })
        .when("/controllers/civil", {
            templateUrl: "civil.html"
        })

        .otherwise({redirectTo: '/'});
});


angular.module('app')
    .service('ModalService', ['$log', '$scope', '$http', function ($log, $scope, $http) {
        return {
            getStatSrez: function () {
                $http({
                    method: 'GET',
                    url: 'http://18.140.232.52:8081/api/v1/slices/max'
                }).then(function (value) {
                    $scope.statsrez = value.data.value;
                    console.log($scope.statsrez);
                })
            }
        }
    }]);
