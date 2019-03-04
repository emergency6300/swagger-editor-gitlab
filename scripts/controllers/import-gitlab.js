'use strict';

var _ = require('lodash');
var angular = require('angular');

SwaggerEditor.controller('GitlabImportCtrl', function FileImportCtrl($scope,
  $uibModalInstance, $localStorage,
  $rootScope, $state, FileLoader, Storage, Preferences, $http) {
  const baseurl = Preferences.get('gitlabBaseUrl');
  const token = Preferences.get('gitlabToken');
  const projectsUrl = baseurl + "/api/v4/projects?private_token=" + token;
  var results;
  $scope.projectSelected = false;
  $scope.branchSelected = false;
  $scope.projectid = null;
  $scope.ref = null;
  $scope.filepath = null;
  $scope.error = null;
  // $scope.opts = {
  //   useProxy: false
  // };

  // $scope.treeOptions = {
  //   nodeChildren: "children",
  //   dirSelectable: true,
  //   injectClasses: {
  //     ul: "a1",
  //     li: "a2",
  //     liSelected: "a7",
  //     iExpanded: "a3",
  //     iCollapsed: "a4",
  //     iLeaf: "a5",
  //     label: "a6",
  //     labelSelected: "a8"
  //   }
  // };

  // $scope.dataForTheTree =
  // [
  //   {name: "Joe", age: "21", children: [
  //       {name: "Smith", age: "42", children: []},
  //       {name: "Gary", age: "21", children: [
  //           {name: "Jenifer", age: "23", children: [
  //               {name: "Dani", age: "32", children: []},
  //               {name: "Max", age: "34", children: []}
  //           ]}
  //       ]}
  //   ]},
  //   {name: "Albert", age: 33, children: []},
  //   {name: "Ron", age: "29", children: []}
  // ];

  var fetchBranches = function() {
    var branchesUrl = baseurl +
    "/api/v4/projects/" +
    $scope.selectedProject.id +
    "/repository/branches?private_token=" +
    token;
    $http({
      method: 'GET',
      url: branchesUrl
    }).then(function successCallback(response) {
      $scope.projectSelected = true;
      $scope.branches = _.map(response.data, function(branch) {
        return {name: branch.name};
      });
    }, function errorCallback(response) {
      console.error('Error retrieving projects ', response);
    });
  };

  var fetchFiletree = function() {
    $scope.branchSelected = true;
    var filesUrl = baseurl +
    "/api/v4/projects/" +
    $scope.selectedProject.id +
    "/repository/tree?recursive=true&ref_name=" +
    $scope.selectedBranch.name +
    "&private_token=" +
    token;
    $http({
      method: 'GET',
      url: filesUrl
    }).then(function successCallback(response) {
      $scope.filetree = _.filter(response.data, function(file) {
        return (file.path.endsWith(".json") || file.path.endsWith(".yaml"));
      });
      console.log($scope.filetree);
    }, function errorCallback(response) {
      console.error('Error retrieving file tree ', response);
    });
  };

  $http({
    method: 'GET',
    url: projectsUrl
  }).then(function successCallback(response) {
    $scope.items = _.map(response.data, function(project) {
      return {name: project.name, id: project.id};
    });
    // console.log($scope.items);
  }, function errorCallback(response) {
    console.log(response);
  });

  var fetch = function(projectid, filepath, ref) {
    $scope.error = null;
    $scope.canImport = false;
    if (_.startsWith(baseurl, 'http')) {
      $scope.fetching = true;
      var url = baseurl + "/api/v4/projects/" +
      projectid + "/repository/files/" + filepath +
      "?ref=" + ref + "&private_token=" + token;
      FileLoader.loadFromGitlab(url, projectid).then(function(data) {
        $scope.$apply(function() {
          results = data;
          $scope.canImport = true;
          $scope.fetching = false;
        });
      }).catch(function(error) {
        $scope.$apply(function() {
          $scope.error = error;
          $scope.canImport = false;
          $scope.fetching = false;
        });
      });
    } else {
      $scope.error = 'Invalid URL';
    }
  };

  $scope.fetch = _.throttle(fetch, 200);

  $scope.ok = function() {
    if (angular.isString(results)) {
      Storage.save('yaml', results);
      $rootScope.editorValue = results;
      $state.go('home', {tags: null});
    }
    $uibModalInstance.close();
  };
  $scope.fetchFiletree = fetchFiletree;
  $scope.fetchBranches = fetchBranches;
  $scope.cancel = $uibModalInstance.close;
});
