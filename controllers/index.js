var app = angular.module("app", [
	"ngTouch",
	"ui.bootstrap",
	"ui.select",
	"checklist-model",
	"ui.grid",
	"ui.grid.treeView",
	"ui.grid.grouping",
	"ui.grid.edit",
	"ui.grid.selection",
	"ui.grid.resizeColumns",
	"ui.grid.treeView",
]);

app
	.constant("CONFIGS", {
		// URL: 'http://192.168.210.10:8081/api/v1/RU/',
		URL: "https://analytic-centre.tk:8081/api/v1/RU/", // DEV URL
		INTERFACE_LANG: "ru",
		AUTH_PAGE_URL: "/",
	})
	.constant("STATUS_CODES", {
		IN_PROCESSING: "0", // В обработке
		APPROVED: "1", // Утвержден
		PRELIMINARY: "2", // Предварительный
		DELETED: "3", // Удален
		CANCELED_BY_USER: "4", // Отменен пользователем
		FORMED_WITH_ERROR: "5", // Сформирован с ошибкой
		WAITING_FOR_PROCESSING: "6", // В ожидании обработки
		IN_AGREEMENT: "7", // На согласовании
	})
	.constant("USER_ROLES", { ONE: "19000090", ZERO: "0" })
	.constant("BUTTONS", {
		APPROVE: "0", // Согласовать
		CONFIRM: "1", // Утвердить/ Окончательный
		DELETE: "2", // Удалить
		PRELIMINARY: "3", // Перевести в предварительный
		SEND: "4", // На согласование
	})
	.run(function ($rootScope, STATUS_CODES, USER_ROLES, BUTTONS, CONFIGS, $window) {
		// localStorage.clear();
		window.onmessage = function (event) {
			var data = JSON.parse(event.data);
			console.log(data);
			window.localStorage[data.key] = data.data;
		}

		if (!localStorage.length) {
			localStorage.setItem('username', 'admin');
		}

		function redirectToAuthPage() {
			console.log('redirect to auth page');
			// $window.location.hssrefss = CONFIGS.AUTH_PAGE_URL;
		}

		if (localStorage.getItem('username') != null) {
			console.log(localStorage.getItem('username'));
			$rootScope.authUser = localStorage.getItem('username');
		} else {
			console.log('null value');
			redirectToAuthPage();
		}
		$rootScope.STATUS_CODES = STATUS_CODES;
		$rootScope.USER_ROLES = USER_ROLES;
		$rootScope.BUTTONS = BUTTONS;
		$rootScope.CONFIGS = CONFIGS;

		$rootScope.serverErr = function (reason) {
			if (reason.status === 401) {
				redirectToAuthPage();
				return false;
			}
			reason.data.errMsg != undefined ? alert(reason.data.errMsg) : alert("Произошла ошибка на сервере.");
		};
	});


app.config([
	"$qProvider",
	function ($qProvider) {
		$qProvider.errorOnUnhandledRejections(false);
	},
]);

app.controller("userCtrl", function ($scope, $http, $rootScope, CONFIGS) {
	$scope.userRole = "19000090";
	$rootScope.userRole = $scope.userRole;

	$scope.roleSelected = function (role) {
		$rootScope.userRole = role;
	};

	$http({
		method: "GET",
		url: CONFIGS.URL + "slices/territories",
		headers: {
			sessionKey: $rootScope.authUser,
		},
	}).then(
		function (response) {
			$scope.roleList = response.data;
		},
		function (reason) {
			console.log(reason);
			$scope.loader = false;
			if (reason.data) $rootScope.serverErr(reason);
			console.log(reason);
		}
	);
});

app.controller("MainCtrl", [
	"$scope",
	"$http",
	"uiGridGroupingConstants",
	"uiGridTreeViewConstants",
	"$interval",
	"CONFIGS",
	function (
		$scope,
		$http,
		$rootScope,
		uiGridTreeBaseService,
		$interval,
		CONFIGS
	) {
		//Получение списка статусов
		$scope.getStatus = function () {
			$http({
				method: "GET",
				url: CONFIGS.URL + "slices/statuses",
				headers: {
					sessionKey: $rootScope.authUser,
				},
			}).then(
				function (value) {
					$scope.status = value.data;
				},
				function (reason) {
					if (reason.data) $rootScope.serverErr(reason);
					console.log(reason);
				}
			);
		};
		$scope.getStatus();
		//Получение списка статусов

		// Получение списка групп
		$scope.getGroups = function () {
			$http({
				method: "GET",
				url: CONFIGS.URL + "slices/groups",
				headers: {
					sessionKey: $rootScope.authUser,
				},
			}).then(
				function (value) {
					$scope.groups = value.data;
					angular.forEach($scope.groups, function (v) {
						if (v.status === 2) {
							v.disabled = true;
						}
					});
				},
				function (reason) {
					if (reason.data) $rootScope.serverErr(reason);
					console.log(reason);
				}
			);
		};
		$scope.getGroups();
		//Получение списка групп

		//Получить № статсреза
		$scope.getStatSrez = function () {
			$http({
				method: "GET",
				url: CONFIGS.URL + "slices/max",
				headers: {
					sessionKey: $rootScope.authUser,
				},
			}).then(
				function (value) {
					$scope.statsrez = value.data.value;
				},
				function (reason) {
					if (reason.data) $rootScope.serverErr(reason);
					console.log(reason);
				}
			);
		};

		$scope.getStatSrez();

		//Получить № статсреза
		var operBySrez =
			"<div " +
			'ng-controller="modalOperBySrezCtrl" ' +
			'ng-if="!col.grouping || col.grouping.groupPriority === undefined || col.grouping.groupPriority === null || ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )" ' +
			'class="ui-grid-cell-contents"> ' +
			"<button " +
			'ng-click="grid.appScope.openOperBySrez(row.entity)" ' +
			'ng-hide="row.treeLevel==0 || row.treeLevel == 1 || row.entity.statusCode == 0 || row.entity.statusCode == 6" ' +
			'type="button" class="btn btn-primary"> Операция со срезами ' +
			"</button> </div>";

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
			treeIndent: 15,
			multiSelect: true,

			columnDefs: [
				{
					name: "code",
					width: "*",
					displayName: "Код группы",
					visible: false,
				},
				{
					name: "name",
					width: "450",
					displayName: "Группы",
					cellTemplate:
						'<div style="margin: 0 10px;" class="ui-grid-cell-contents ng-binding ng-scope {{row.treeNode.state}}-row-{{row.treeLevel}}" ng-style="{\'padding-left\': grid.options.treeIndent * row.treeLevel + \'px\'}">' +
						"<span></span>{{COL_FIELD CUSTOM_FILTERS}} <button style='border: none;\n" +
						"    background: transparent;\n" +
						"    margin: 5px 60px;\n" +
						'    font-weight: 600;\' ng-click=\'grid.appScope.open(row.entity)\' ng-controller="ModalControlCtrl" ng-hide="row.treeLevel==0 || row.treeLevel == 1"><a>{{row.entity.id_period}}</a></button></div>',
				},
				{
					name: "maxRecNum",
					displayName: "На номер",
					width: "150",
					cellTemplate:
						'<div class="indentInline">{{row.entity.maxRecNum}}</div>',
				},

				{
					name: "completed",
					displayName: "Сформирован",
					width: "200",
					cellTemplate:
						'<div class="indentInline">{{row.entity.completed}}</div>',
				},
				{
					name: "button",
					width: "175",
					displayName: "Действие",
					cellTemplate: operBySrez,
				},
				{
					name: "region",
					displayName: "По органу",
					width: "*",
					cellTemplate: '<div class="indentInline">{{row.entity.region}}</div>',
				},
			],
		};
		$scope.gridOptions.onRegisterApi = function (gridApi) {
			$scope.gridApi = gridApi;

			$scope.gridApi.treeBase.on.rowExpanded($scope, function (row) {
				if (row.entity.$$treeLevel !== 0 && !row.isSlicesLoaded) {
					$scope.preloaderByStatus = true;
					var groupCode = row.entity.groupCode,
						statusCode = row.entity.code,
						year = row.entity.statusYear;

					var checkDeleted = "";
					if ($scope.checkboxModel.value === true) {
						checkDeleted = true;
					} else checkDeleted = false;

					$http({
						method: "GET",
						url:
							CONFIGS.URL +
							"slices?deleted=" +
							checkDeleted +
							"&groupCode=" +
							groupCode +
							"&statusCode=" +
							statusCode +
							"&year=" +
							year +
							"",
						headers: {
							sessionKey: $rootScope.authUser,
						},
					}).then(
						function (value) {
							$scope.showGrid = value.data;
							var expandedRowStatusIndex = $scope.gridOptions.data.findIndex(
								x => x.$$hashKey === row.entity.$$hashKey
							);

							$scope.showGrid.forEach(function (element, index) {
								element.id_period =
									"№" + element.id + " период " + element.period;
								//todo here need to equal two object for expandRow
								$scope.gridOptions.data.splice(
									expandedRowStatusIndex + 1 + index,
									0,
									element
								);
							});
							row.isSlicesLoaded = true;
							$scope.preloaderByStatus = false;
						},
						function (reason) {
							if (reason.data) {
								$scope.preloaderByStatus = false;
								$rootScope.serverErr(reason);
							}
						}
					);
				}
			});
		};

		var id = 0;
		var writeoutNode = function (childArray, currentLevel, dataArray) {
			childArray.forEach(function (childNode) {
				if (childNode.children.length > 0) {
					childNode.$$treeLevel = currentLevel;
				} else {
					if (
						id !== childNode.parentCategoryId ||
						childNode.categoryId === childNode.parentCategoryId
					) {
						childNode.$$treeLevel = currentLevel;
					}
				}
				dataArray.push(childNode);
				writeoutNode(childNode.children, currentLevel + 1, dataArray);
			});
		};

		$scope.checkboxModel = {
			value: false,
		};

		var url = "";
		$scope.loader = false;
		$scope.getSliceGroups = function (check) {
			$scope.loader = true;
			if (check) {
				url = CONFIGS.URL + "slices/parents?deleted=true";
			} else {
				url = CONFIGS.URL + "slices/parents?deleted=false";
			}

			var dataSet = [];

			$http({
				method: "GET",
				url: url,
				headers: {
					sessionKey: $rootScope.authUser,
				},
			}).then(
				function (response) {
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
				},
				function (reason) {
					if (reason.data) {
						$scope.loader = false;
						$rootScope.serverErr(reason);
						console.log("dada");
					}
				}
			);
		};

		$scope.getSliceGroups();

		$scope.user = [];
		$scope.orderSrez = function (user) {
			var changeTab = function () {
				$('.nav-tabs a[href="#home"]').tab("show");
				$scope.vChecked = false;
			};

			changeTab();

			$scope.group = user;

			var dataObj = {
				startDate: dateFromString,
				endDate: dateToString,
				maxRecNum: $scope.statsrez,
				groups: $scope.group,
			};

			$http({
				method: "POST",
				url: CONFIGS.URL + "slices",
				headers: {
					sessionKey: $rootScope.authUser,
				},
				data: dataObj,
			}).then(
				function (response) {
					$scope.user.length = 0;
					$scope.showGrid = response.data;

					$scope.objectByOrderSrez = response.data;
					angular.forEach($scope.objectByOrderSrez, function (value) {
						$scope.sliceNumber = value.id;
						//todo передать в getSliceGroups(), там проверять на наличие этого rowEntity и по его index открывать групприровку
					});
					$scope.getSliceGroups();
					alert(
						"Будет сформирован срез №" +
						$scope.sliceNumber +
						" период " +
						dateFromString +
						" по " +
						dateToString
					);
				},
				function (reason) {
					if (reason.data) $rootScope.serverErr(reason);
					console.log(reason);
				}
			);
		};

		//Дата начала отчета по умолчанию 1 января 2019
		var fromTimestamp = 1546322400;
		$scope.dateFrom = new Date(fromTimestamp * 1000);

		$scope.dateTo = new Date();

		var dd = ("0" + $scope.dateFrom.getDate()).slice(-2);
		var mm = ("0" + ($scope.dateFrom.getMonth() + 1)).slice(-2);
		var yy = $scope.dateFrom.getFullYear();

		var dateFromString = dd + "." + mm + "." + yy;

		var ddTo = ("0" + $scope.dateTo.getDate()).slice(-2);
		var mmTo = ("0" + ($scope.dateTo.getMonth() + 1)).slice(-2);
		var yyTo = $scope.dateTo.getFullYear();

		var dateToString = ddTo + "." + mmTo + "." + yyTo;
	},
]);

app.controller("ModalControlCtrl", function (
	$scope,
	$uibModal,
	$rootScope,
	STATUS_CODES,
	CONFIGS
) {
	$rootScope.open = function (value) {
		if (
			value.statusCode == STATUS_CODES.IN_PROCESSING ||
			value.statusCode == STATUS_CODES.WAITING_FOR_PROCESSING ||
			value.statusCode == STATUS_CODES.FORMED_WITH_ERROR
		) {
			alert("По данному статусу невозможно получить отчет!");
		} else {
			$scope.dataSendByModal = value;

			var modalInstance = $uibModal.open({
				templateUrl: "modalContent.html",
				controller: "ModalContentCtrl",
				size: "xlg",
				backdrop: "static",
				keyboard: false,
				windowTopClass: "getReportModal",
				resolve: {
					value: function () {
						return $scope.dataSendByModal;
					},
				},
			});

			modalInstance.result.then(function (response) {
				console.log(response);
			});
		}
	};
});

app.controller("modalOperBySrezCtrl", function (
	$scope,
	$uibModal,
	$rootScope,
	CONFIGS
) {
	$rootScope.openOperBySrez = function (rowEntity) {
		$scope.dataSendByModal = rowEntity;

		var modalInstance = $uibModal.open({
			templateUrl: "modalOperBySrez.html",
			controller: "modalContentOperBySrezCtrl",
			size: "xlg",
			keyboard: false,
			backdrop: "static",
			windowTopClass: "getReportModal",
			resolve: {
				value: function () {
					return $scope.dataSendByModal;
				},
			},
		});
		modalInstance.result.finally(function () {
			// do your work here
			//update getSliceReport() here to update first table ui-grid
		});
	};
});

/**
 *  ModalContentCtrl
 */
app.controller("ModalContentCtrl", [
	"$scope",
	"$http",
	"$uibModalInstance",
	"value",
	"$rootScope",
	"$timeout",
	"CONFIGS",
	function (
		$scope,
		$http,
		$uibModalInstance,
		value,
		$rootScope,
		$timeout,
		CONFIGS
	) {
		$scope.statSliceNum = value.id;
		$scope.statSlicePeriod = value.period;
		$scope.isTabsLoaded = false;
		$scope.isReportsSelected = false;
		$scope.isReadyReportsLoaded = true;
		$scope.isGroup100 = false;

		if (value.groupCode == 100) $scope.isGroup100 = true;

		$scope.reportLangs = {
			ru: { name: "Русский", langCode: "ru", isSelected: false, isInterfaceLang: false, },
			kz: { name: "Казахский", langCode: "kz", isSelected: false, isInterfaceLang: false, },
		};

		if (CONFIGS.INTERFACE_LANG === "ru") {
			$scope.reportLangs.ru.isInterfaceLang = true;
			$scope.reportLangs.ru.isSelected = true;
		} else {
			$scope.reportLangs.kz.isInterfaceLang = true;
			$scope.reportLangs.kz.isSelected = true;
		}

		var refresh = function () {
			$scope.refresh = true;
			$timeout(function () {
				$scope.refresh = false;
			}, 0);
		};

		/*=====  Получение списка отчетов для формирования вкладок ======*/
		$http({
			method: "GET",
			url: CONFIGS.URL + "slices/reports?sliceId=" + $scope.statSliceNum,
			headers: {
				sessionKey: $rootScope.authUser,
			},
		}).then(
			function (response) {
				$scope.reportTabs = response.data;
			},
			function (reason) {
				if (reason.data) {
					$scope.isTabsLoaded = false;
					$rootScope.serverErr(reason);
				}
				console.log(reason);
			}
		);

		$scope.getReportInfo = function (index) {
			return $scope.reportTabs[index];
		};
		/*=====  Получение списка отчетов для формирования вкладок end ======*/

		if ($scope.isGroup100) {
			$scope.reportCorpusDataLoaded = false;

			/*=====  Sets correct $$treeLevel ======*/
			var writeoutNodeReportCorpus = function (childArray, currentLevel, dataArray) {
				childArray.forEach(function (childNode) {
					if (childNode.children) {
						childNode.$$treeLevel = currentLevel;
					} else {
						childNode.$$treeLevel = "last";
					}
					dataArray.push(childNode);
					writeoutNodeReportCorpus(childNode.children, currentLevel + 1, dataArray);
				});
			};
			/*=====  Sets correct $$treeLevel END ======*/
			$http({
				method: "GET",
				url: CONFIGS.URL + "slices/governments/parents",
				headers: {
					sessionKey: $rootScope.authUser,
				},
			}).then(
				function (response) {
					$scope.reportCorpusData = [];
					var responseDataset = response.data;
					writeoutNodeReportCorpus(responseDataset, 0, $scope.reportCorpusData);

					$scope.reportCorpus = {
						data: $scope.reportCorpusData,
						showGridFooter: false,
						enableColumnMenus: false,
						showTreeExpandNoChildren: true,
						enableHiding: false,
						enableSorting: false,
						enableFiltering: true,
						enableRowSelection: true,
						enableSelectAll: true,
						multiSelect: true,
						columnDefs: [
							{
								name: "searchPattern",
								width: "13%",
								displayName: "Код органа",
								cellTemplate:
									"<div class=\"ui-grid-cell-contents ng-binding ng-scope\" ng-style=\"{'padding-left': (row.treeLevel == 'last') ? grid.options.treeIndent * 3 + 'px' : grid.options.treeIndent * (row.treeLevel + 1) + 'px'}\">{{COL_FIELD CUSTOM_FILTERS}}</div>",
							},
							{
								name: "name",
								width: "83%",
								displayName: "Наименование",
								cellTemplate:
									"<div class=\"ui-grid-cell-contents ng-binding ng-scope\" ng-style=\"{'padding-left': (row.treeLevel == 'last') ? grid.options.treeIndent * 3 + 'px' : grid.options.treeIndent * (row.treeLevel + 1) + 'px'}\">{{COL_FIELD CUSTOM_FILTERS}}</div>",
							},
						],
						onRegisterApi: function (gridApi) {
							$scope.gridApi = gridApi;

							$scope.gridApi.treeBase.on.rowExpanded($scope, function (row) {
								if (
									(row.entity.$$treeLevel == 1 &&
										!row.reportCorpusNodeLoaded) ||
									(row.entity.$$treeLevel == 0 &&
										row.entity.children.length == 0 &&
										!row.reportCorpusNodeLoaded)
								) {
									$scope.reportCorpusDataLoaded = true;
									$http({
										method: "GET",
										url:
											CONFIGS.URL +
											"slices/governments/children?searchPattern=" +
											row.entity.searchPattern,
										headers: {
											sessionKey: $rootScope.authUser,
										},
									}).then(function (response) {
										var expandedRowIndex = $scope.reportCorpus.data.findIndex(
											x => x.$$hashKey === row.entity.$$hashKey
										);
										$scope.reportCorpusChildren = response.data;

										$scope.reportCorpusChildren.forEach(function (item) {
											item.$$treeLevel = row.entity.$$treeLevel + 1;
										});
										$scope.reportCorpusChildren.forEach(function (element, index) {
											$scope.reportCorpus.data.splice(expandedRowIndex + 1 + index, 0, element);
										});
										row.reportCorpusNodeLoaded = true;
										$scope.reportCorpusDataLoaded = false;
									});
								}
							});
							$scope.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
								$scope.selectedReportCorpuses = $scope.gridApi.selection.getSelectedRows();
							});
						},
					};

					$scope.isTabsLoaded = true;
					$scope.reportCorpus.tabInfo = { name: "1-П", code: "801" };
				},
				function (reason) {
					if (reason.data) $rootScope.serverErr(reason);
					console.log(reason);
				}
			);
		}

		/*=====  Regions grid - get data from backend ======*/
		$http({
			method: "GET",
			url: CONFIGS.URL + "slices/regsTree",
			headers: {
				sessionKey: $rootScope.authUser,
			},
		}).then(
			function (response) {
				var responseData = [];
				$scope.regionsDataset = [];

				responseData.push(response.data);
				writeoutNodeRegions(responseData, 0, $scope.regionsDataset);

				/*=====  Deps grid - get data from backend ======*/
				$http({
					method: "GET",
					url:
						CONFIGS.URL +
						"slices/reports?sliceId=" +
						$scope.statSliceNum +
						"&withOrgs=true",
					headers: {
						sessionKey: $rootScope.authUser,
					},
				}).then(
					function (response) {
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
								multiSelect: true,
								columnDefs: [
									{ name: "code", width: "20%", displayName: "и/н" },
									{ name: "name", width: "70%", displayName: "Ведомство" },
								],
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
									{
										name: "code",
										width: "20%",
										displayName: "и/н",
										cellTemplate:
											"<div class=\"ui-grid-cell-contents ng-binding ng-scope\" ng-style=\"{'padding-left': (row.treeLevel == 'last') ? grid.options.treeIndent * 3 + 'px' : grid.options.treeIndent * (row.treeLevel + 1) + 'px'}\">{{COL_FIELD CUSTOM_FILTERS}}</div>",
									},
									{
										name: "name",
										width: "80%",
										displayName: "Регион/Орган",
										cellTemplate:
											"<div class=\"ui-grid-cell-contents ng-binding ng-scope\" ng-style=\"{'padding-left': (row.treeLevel == 'last') ? grid.options.treeIndent * 3 + 'px' : grid.options.treeIndent * (row.treeLevel + 1) + 'px'}\">{{COL_FIELD CUSTOM_FILTERS}}</div>",
									},
								],
							};
							// Запись отчетов и ведомств в правильную структуру для Grid
							item.gridRegionsDataset = $scope.gridOptionsRegion;
							$scope.setGridApiOptions(index, item.gridRegionsDataset, item.gridDataset);
						});
						// END Each function for reports with orgs
						$scope.onRegisterApiInit();

						// Скрыть индикатор загрузки и показать данные формы
						if (!$scope.isGroup100) $scope.isTabsLoaded = true;
					},
					function (reason) {
						if (reason.data) $rootScope.serverErr(reason);
						console.log(reason);
					}
				);
				/*=====  Deps grid - get data from backend ======*/
			},
			function (reason) {
				if (reason.data) $rootScope.serverErr(reason);
				console.log(reason);
			}
		);
		/*=====  Regions grid - get data from backend end ======*/

		/*=====  Set datasets and dynamically generate names for grid api ======*/
		$scope.regionsGridApiOptions = [];
		$scope.depsGridApiOptions = [];
		$scope.setGridApiOptions = function (index, gridRegionsDataset, gridApiDepDataset) {
			var gridApiRegionsName, gridApiDepsName;

			gridApiDepsName = "gridApiDeps_" + index;
			gridApiRegionsName = "gridApiRegions_" + index;
			$scope.depsGridApiOptions[index] = { gridApiDepDataset, gridApiDepsName };
			$scope.regionsGridApiOptions[index] = { gridRegionsDataset, gridApiRegionsName, };
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
					gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {
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

		/*=====  Get and save current reports's name, code ======*/
		$scope.getCurrentReportTab = function (name, code) {
			$scope.isCatalogTab = false;
			$scope.isReportsSelected = false;
			$scope.currentReportTab = {
				name: name,
				code: code,
			};
			refresh();
		};
		/*=====  Get and save current reports's name, code end ======*/

		/*=====  Sets correct $$treeLevel ======*/
		var writeoutNodeRegions = function (childArray, currentLevel, dataArray) {
			childArray.forEach(function (childNode) {
				if (childNode.children.length > 0) {
					childNode.$$treeLevel = currentLevel;
				} else {
					childNode.$$treeLevel = "last";
				}
				dataArray.push(childNode);
				writeoutNodeRegions(childNode.children, currentLevel + 1, dataArray);
			});
		};
		/*=====  Sets correct $$treeLevel end ======*/

		/*=====  Generate and get requested reports ======*/
		$scope.getRequestedReports = function () {
			$scope.isCatalogTab = true;
			$scope.requestedReports = [];
			$scope.requestedReportsQuery = [];
			var reportInfo,
				counter = 0;

			if ($scope.selectedReportCorpuses != undefined && $scope.selectedReportCorpuses.length > 0) {
				$scope.selectedReportCorpuses.forEach(function (element, index) {
					$scope.requestedReports[index] =
						$scope.reportCorpus.tabInfo.name + "-" + element.name;
					$scope.requestedReportsQuery[index] = {
						sliceId: $scope.statSliceNum,
						reportCode: $scope.reportCorpus.tabInfo.code,
						govCode: element.searchPattern,
					};
				});
			}

			if (
				$scope.selectedRegions != undefined &&
				$scope.selectedRegions.length > 0 &&
				$scope.selectedDeps != undefined &&
				$scope.selectedDeps.length > 0
			) {
				$scope.selectedRegions.forEach(function (element, index) {
					var regionsTabIndex = index;
					reportInfo = $scope.getReportInfo(regionsTabIndex);
					element.forEach(function (region) {
						if ($scope.selectedDeps[regionsTabIndex] != undefined) {
							$scope.selectedDeps[regionsTabIndex].forEach(function (department) {
								$scope.requestedReports[counter] = reportInfo.name + "-" + region.name + "-" + department.name;
								$scope.requestedReportsQuery[counter] = {
									sliceId: $scope.statSliceNum,
									reportCode: reportInfo.code,
									orgCode: department.code,
									regCode: region.code,
								};
								counter++;
							});
						}
					});
				});
			}
			if ($scope.requestedReports.length > 0) $scope.isReportsSelected = true;
		};

		$scope.removeSelectedReport = function (key) {
			var removedDepIndex,
				removedDepValue,
				removedRegValue,
				removedRegIndex,
				removedTabValue,
				removedTabIndex;

			removedDepValue = $scope.requestedReportsQuery[key].orgCode;
			removedRegValue = $scope.requestedReportsQuery[key].regCode;
			removedTabValue = $scope.requestedReportsQuery[key].reportCode;

			$scope.requestedReports.splice(key, 1);
			$scope.requestedReportsQuery.splice(key, 1);
			removedTabIndex = $scope.reportTabs.findIndex(
				x => x.code === removedTabValue
			);

			if (
				$scope.requestedReportsQuery.findIndex(
					x => x.orgCode === removedDepValue
				) === -1
			) {
				removedDepIndex = $scope.depsGridApiOptions[removedTabIndex].gridApiDepDataset.data.findIndex(x => x.code === removedDepValue);
				$scope.depsGridApiOptions[removedTabIndex].gridApiDepsName.selection.toggleRowSelection(
					$scope.depsGridApiOptions[removedTabIndex].gridApiDepDataset.data[removedDepIndex]
				);
			}

			if (
				$scope.requestedReportsQuery.findIndex(
					x => x.regCode === removedRegValue
				) === -1
			) {
				removedRegIndex = $scope.regionsGridApiOptions[removedTabIndex].gridRegionsDataset.data.findIndex(x => x.code === removedRegValue);
				$scope.regionsGridApiOptions[removedTabIndex].gridApiRegionsName.selection.toggleRowSelection(
					$scope.regionsGridApiOptions[removedTabIndex].gridRegionsDataset.data[removedRegIndex]
				);
			}
		};
		/*=====  Generate and get requested reports end ======*/

		/*=====  Get reports ======*/
		$scope.getReports = function () {
			var selectedLang = "";

			if (
				$scope.reportLangs.ru.isSelected === false &&
				$scope.reportLangs.kz.isSelected === false
			) {
				alert("Выберите язык отчета");
				return false;
			}
			$scope.isReadyReportsLoaded = false;

			if (
				$scope.reportLangs.ru.isSelected === true &&
				$scope.reportLangs.kz.isSelected === true
			) {
				selectedLang = "all";
			} else if ($scope.reportLangs.kz.isSelected === true) {
				selectedLang = "kz";
			} else if ($scope.reportLangs.ru.isSelected === true) {
				selectedLang = "ru";
			}

			if (
				$scope.requestedReportsQuery != undefined &&
				$scope.requestedReportsQuery.length > 0
			) {
				$scope.readyReports = [];
				$http({
					method: "POST",
					url:
						CONFIGS.URL +
						"slices/reports/createReports?repLang=" +
						selectedLang,
					headers: {
						sessionKey: $rootScope.authUser,
					},
					data: $scope.requestedReportsQuery,
				}).then(
					function (response) {
						$scope.isReadyReportsLoaded = true;
						var reportValues = response.data,
							counter = 0,
							counterKz = 0,
							reportDownloadUrl = "",
							reportDownloadName = "",
							reportErrMsgMissing = "Отсутствует шаблон отчета",
							reportErrMsg = "Ошибка при формировании данного отчета";

						reportValues.forEach(function (element) {
							if (element.value == -1) {
								reportDownloadUrl = "#";
								reportDownloadName = reportErrMsgMissing;
							} else if (element.value == -2) {
								console.error(element.errMsg);
								reportDownloadUrl = "#";
								reportDownloadName = reportErrMsg;
							} else {
								if (element.lang === "RU") {
									reportDownloadUrl =
										CONFIGS.URL +
										"slices/reports/" +
										element.value +
										"/download";
									reportDownloadName = $scope.requestedReports[counter];
									counter++;
								} else if (element.lang === "KZ") {
									reportDownloadUrl =
										CONFIGS.URL +
										"slices/reports/" +
										element.value +
										"/download";
									reportDownloadName =
										$scope.requestedReports[counterKz] + " - [kaz]";
									counterKz++;
								}
							}

							var readyReportItem = {
								url: reportDownloadUrl,
								name: reportDownloadName,
							};
							$scope.readyReports.push(readyReportItem);
						});
					},
					function (reason) {
						if (reason.data) {
							$scope.isReadyReportsLoaded = true;
							$rootScope.serverErr(reason);
						}
						console.log(reason);
					}
				);
			}
		};
		/*=====  Get reports end ======*/

		/*=====  Close modal ======*/
		$scope.cancel = function () {
			$uibModalInstance.dismiss();
		};
		/*=====  Close modal end ======*/
	},
]);

app.controller("modalContentOperBySrezCtrl", function (
	$scope,
	$http,
	$uibModalInstance,
	value,
	STATUS_CODES,
	USER_ROLES,
	BUTTONS,
	$uibModal,
	$timeout,
	$rootScope,
	CONFIGS
) {
	/*=====  Получение данных ======*/
	$scope.statusInfoData = [];
	$scope.srezNo = value.id;
	$scope.period = value.period;
	$scope.srezToNum = value.maxRecNum;
	$scope.isHistoryTreeLoaded = false;
	$scope.rowEntityStatusCode = value.statusCode; // Получаем код статуса со строки - row.entity
	$scope.statusCode = value.statusCode;

	if ($rootScope.userRole === "19000090") {
		$scope.userRole = USER_ROLES.ONE;
	} else {
		$scope.userRole = USER_ROLES.ZERO;
	}
	/*=====  Получение данных end ======*/

	$scope.activeTabIndex = 0;
	/*Получаем дерево статусов в зависимости от Номера среза*/
	$scope.getStatusTree = function () {
		$scope.isHistoryTreeLoaded = false;
		$http({
			method: "GET",
			url: CONFIGS.URL + "slices/" + $scope.srezNo + "/history",
			headers: {
				sessionKey: $rootScope.authUser,
			},
		}).then(
			function (response) {
				$scope.history = response.data;
				$scope.activeTabIndex = $scope.history.length - 1; //get last index of array history
				$scope.lastElementOfHistory = $scope.history[0]; // try to get first element of array history
				$scope.isHistoryTreeLoaded = true;
				$scope.historyObj = $scope.history[$scope.activeTabIndex];
				$scope.rowEntityStatusCode = $scope.historyObj.statusCode;

				$scope.getStatusInfo($scope.historyObj);
			},
			function (reason) {
				if (reason.data) {
					$scope.isHistoryTreeLoaded = false;
					$rootScope.serverErr(reason);
				}
			}
		);
	};
	$scope.getStatusTree();
	/*Получаем дерево статусов в зависимости от Номера среза END*/

  /*=====  Получаем код статуса после клика на статус
  в дереве статусов и перезаписываем полученный из row.entity ======*/
  var section = '';
	$scope.getStatusInfo = function (selectedStatus) {
		console.log(selectedStatus);
		section = selectedStatus.id;

		$rootScope.historyId = selectedStatus.id;
		$scope.statusCode = selectedStatus.statusCode;

		if (selectedStatus.statusCode === STATUS_CODES.IN_AGREEMENT) {
		  //todo here need to show ui-grid

      $scope.showUiGridInAgreement = true;



			$scope.updateApprovingTable = function () {
				$http({
					method: "GET",
					url:
						CONFIGS.URL +
						"slices/" +
						selectedStatus.sliceId +
						"/history/" +
						selectedStatus.id +
						"/approving",
					headers: {
						sessionKey: $rootScope.authUser,
					},
				}).then(
					function (response) {
						$scope.statusInfoData = response.data;

						// var index = $scope.statusInfoData.findIndex( item => item.territoryCode == $rootScope.userRole );
						// if ($scope.statusInfoData[index].approveCode != null) {
						//   $rootScope.isApproved = true;
						// } else {
						//   $rootScope.isApproved = false;
						// }

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
								{
									name: "territoryName",
									width: "250",
									displayName: "Терр.управление",
								},
								{
									name: "approveDate",
									width: "170",
									displayName: "Дата-время",
								},
								{
									name: "approveName",
									width: "150",
									displayName: "Статус",
									cellTemplate:
										"<div style=\"margin: 5px 0; text-align: center\"><a ng-click=\"grid.appScope.modalRejectionReason(row.entity)\" ng-style= \"{ color: row.entity.approveCode == '2' ? 'red' : '' }\">{{COL_FIELD CUSTOM_FILTERS}}</a></div>",
								},
								{ name: "personName", width: "170", displayName: "ФИО" },
							],
						};
					},
					function (reason) {
						if (reason.data) $rootScope.serverErr(reason);
						console.log(reason);
					}
				);
			};
			$scope.updateApprovingTable();

			// $interval( function(){$scope.updateApprovingTable(); }, 10000);
		}

		/*=====  Сравниваем полученный код статуса и меняем URL HTTP запроса ======*/
		switch ($scope.statusCode) {
			case STATUS_CODES.FORMED_WITH_ERROR: // Сформирован с ошибкой
				selectedStatus.created = value.created;
				selectedStatus.completed = value.completed;
				$scope.statusInfo = selectedStatus;
				break;

			case STATUS_CODES.APPROVED: // Окончательный
				$scope.statusInfo = selectedStatus;
				break;

			case STATUS_CODES.PRELIMINARY:
				if (selectedStatus === $scope.lastElementOfHistory) {
					selectedStatus.created = value.created;
					selectedStatus.completed = value.completed;
				}
				$scope.statusInfo = selectedStatus;
				break;

			case STATUS_CODES.IN_AGREEMENT: // На согласовании
				$scope.statusInfo = selectedStatus;
				break;

			case STATUS_CODES.DELETED: // Удален
				$scope.statusInfo = selectedStatus;
				break;

			default:
				// statements_def
				break;
		}
		/*=====  Сравниваем полученный код статуса и меняем URL HTTP запроса end ======*/
	};

	$scope.is = function(id){
		return section === id;
	};

	$scope.statusAction = function (btnNum, approveCode) {
		var btnActionUrl = "";
		switch (btnNum) {
			case (btnNum = BUTTONS.SEND):
				btnActionUrl = "send"; // На согласование
				break;
			case (btnNum = BUTTONS.PRELIMINARY):
				btnActionUrl = "preliminary"; // Перевести в предварительный
				break;
			case (btnNum = BUTTONS.CONFIRM):
				btnActionUrl = "confirm"; // Утвердить
				break;
			case (btnNum = BUTTONS.APPROVE):
				btnActionUrl = "approve";
				if (approveCode === 1) {
					var msg = "";
					var approveObj = {
						historyId: $scope.historyObj.id,
						approveCode: approveCode,
						territoryCode: $rootScope.userRole * 1,
						msg: msg,
					};
					$http({
						method: "PUT",
						url: CONFIGS.URL + "slices/" + $scope.srezNo + "/" + btnActionUrl,
						data: approveObj,
						headers: {
							sessionKey: $rootScope.authUser,
						},
					}).then(
						function (response) {
							$scope.approveBtnDisabled = true;
							$timeout(alert("Операция успешно совершена"), 2000);
							$scope.getStatusTree();
						},
						function (reason) {
							var errMsg = "Вы уже провели процедуру согласования";
							if (reason.data) $rootScope.serverErr(errMsg);
							console.log(reason);
						}
					);
				} else {
					$scope.isApproveFormVisible = true;

          /*$(document).ready(function(){
            $("#rejectionReasonBtn").click(function(){
              $("#rejectionReasonModal").modal();
            });
          });*/
					// $scope.openRejectionReasonModal = true;
					$scope.sendReason = function (msg) {
						var rejectObj = {
							historyId: $scope.historyObj.id,
							approveCode: approveCode,
							territoryCode: $rootScope.userRole * 1,
							msg: msg,
						};

						$http({
							method: "PUT",
							url: CONFIGS.URL + "slices/" + $scope.srezNo + "/" + btnActionUrl,
							data: rejectObj,
							headers: {
								sessionKey: $rootScope.authUser,
							},
						}).then(
							function (response) {
								console.log(response);
								$scope.approveBtnDisabled = true;
								$timeout(alert("Операция успешно совершена"), 2000);
                /*$("#rejectionReasonModal").modal("hide");
              $("#rejectionReasonModal").on('hidden.bs.modal', function (e) {
                $('body').addClass('modal-open');
              });*/
								$scope.isApproveFormVisible = false;

								$scope.getStatusTree();
							},
							function (reason) {
								var errMsg = "Вы уже провели процедуру согласования";
								if (reason.data) $rootScope.serverErr(errMsg);
								console.log(reason);
								$scope.isApproveFormVisible = false;
							}
						);
					};

					$scope.cancelReasonModal = function () {
            /*$("#rejectionReasonModal").modal("hide");
            $("#rejectionReasonModal").on('hidden.bs.modal', function (e) {
              $('body').addClass('modal-open');
            });*/
						$scope.isApproveFormVisible = false;
					};
				}
				break;
			case (btnNum = BUTTONS.DELETE):
				btnActionUrl = "delete"; // Удалить
				break;
		}

		if (btnNum != BUTTONS.APPROVE) {
			$http({
				method: "PUT",
				url: CONFIGS.URL + "slices/" + $scope.srezNo + "/" + btnActionUrl,
				headers: {
					sessionKey: $rootScope.authUser,
				},
			}).then(
				function (response) {
					console.log(response);
					$scope.approveBtnDisabled = true;
					$timeout(alert("Операция успешно совершена"), 2000);
					$scope.getStatusTree();
				},
				function (reason) {
					if (reason.data) $rootScope.serverErr(reason);
					console.log(reason);
				}
			);
		}
	};

	$scope.modalRejectionReason = function (rowEntity) {
		if (rowEntity.approveCode === "2") {
			$uibModal.open({
				templateUrl: "rejectionReason.html",
				controller: function ($scope, $uibModalInstance) {
					$scope.userRole = USER_ROLES.ONE;
					$scope.rejectionMsg = rowEntity.msg;
					$scope.ok = function () {
						$uibModalInstance.close();
					};
					$scope.cancel = function () {
						$uibModalInstance.dismiss("cancel");
					};
				},
			});
		}
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss();
	};
});
