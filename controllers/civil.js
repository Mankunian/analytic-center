angular.module("app").controller("civilCtrl", function ($scope, $http, $timeout, $uibModal, $log) {

    $scope.sendBtn = function (item) {
        console.log(item);

        var fd = new FormData();
        fd.append('file', item.file);
        $http.post(fd, {
            transformRequest: angular.identity,
            headers: {'Content-type': undefined}
        })
            .success(function (data) {

            })
            .error(function (error) {

            })

        /*var formData = new FormData();
        var fileSelect = document.getElementById("fileSelect");

        if(fileSelect.files && fileSelect.files.length === 1){
            var file = fileSelect.files[0];
            formData.set("file", file , file.name);
        }

        console.log(fileSelect);

        var input1 = document.getElementById("input1");
        formData.set("input1", input1.value);

        var request = new XMLHttpRequest();
        request.open('POST', "http://localhost:8080/testMultipart");
        request.send(formData);*/
    }
});
