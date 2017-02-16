'use strict';

var _ = require('lodash');
var angular = require('angular');

SwaggerEditor.controller('GitlabImportCtrl', function FileImportCtrl($scope,
  $uibModalInstance, $localStorage, $rootScope, $state, FileLoader, Storage) {
  var results;

  $scope.baseurl = null;
  $scope.token = null;
  $scope.projectid = null;
  $scope.sha = null;
  $scope.filepath = null;
  $scope.error = null;
  $scope.opts = {
    useProxy: false
  };

  var fetch = function(baseurl, token, projectid, sha, filepath) {
    $scope.error = null;
    $scope.canImport = false;

    if (_.startsWith(baseurl, 'http')) {
      $scope.fetching = true;
      var url = baseurl + "/api/projects/" + projectid + "/repository/blobs/" + sha + "?filepath=" + filepath;
      FileLoader.loadFromUrl(url, !$scope.opts.useProxy).then(function(data) {
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

  $scope.cancel = $uibModalInstance.close;
});
