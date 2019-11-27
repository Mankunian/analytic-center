$scope.pushStatusData = row.entity.children;
      var groupCode = row.entity.groupCode,
        statusCode = row.entity.code,
        year = row.entity.statusYear;

      $http({
        method: 'GET',
        url: 'https://analytic-centre.tk:8081/api/v1/RU/slices?deleted=false&groupCode=' + groupCode + '&statusCode=' + statusCode + '&year=' + year + '',
        headers: {
          sessionKey: 'admin'
        }
      }).then(function (value) {
        $scope.statusData = value.data;
        $scope.statusData.forEach(function (data) {
          $scope.pushStatusData.push(data)
        });


        console.log($scope.showGrid)

      }, function (reason) {
        console.log(reason);
      });
