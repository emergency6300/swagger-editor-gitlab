'use strict';

var _ = require('lodash');
var angular = require('angular');

SwaggerEditor.controller('GitlabImportCtrl', function FileImportCtrl($scope,
  $uibModalInstance, $localStorage, $rootScope, $state, FileLoader, Storage, Preferences) {
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

  var fetch = function(projectid, sha, filepath) {
    $scope.error = null;
    $scope.canImport = false;
    const baseurl = Preferences.get('gitlabBaseUrl');
    const token = Preferences.get('gitlabToken');

    if (_.startsWith(baseurl, 'http')) {
      $scope.fetching = true;
      var url = baseurl + "/api/v3/projects/" + projectid + "/repository/blobs/" + sha + "?filepath=" + filepath + "&private_token=" + token;
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
