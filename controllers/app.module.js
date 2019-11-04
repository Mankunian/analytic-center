angular.module('app', [
    // 'ngAnimate',
    'ui.bootstrap',
    'ngRoute',
    // 'ngSanitize',
    'ui.select',
    'zingchart-angularjs',
    'angular.factories'
]);


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
