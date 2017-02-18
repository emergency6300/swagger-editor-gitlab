'use strict';

var _ = require('lodash');
var angular = require('angular');

SwaggerEditor.controller('GitlabUpdateCtrl', function GitlabUpdateCtrl($scope,
  $uibModalInstance, $localStorage,
  $rootScope, $state, GLBackend, Storage, Preferences) {
  var results;

  $scope.baseurl = null;
  $scope.token = null;
  $scope.projectid = null;
  $scope.ref = null;
  $scope.filepath = null;
  $scope.error = null;

  var update = function(commitMessage) {
    $scope.error = null;
    $scope.canImport = false;
    const baseurl = Preferences.get('gitlabBaseUrl');
    const token = Preferences.get('gitlabToken');
    // needs content-metadata in localstorage
    const filepath = $localStorage['content-metadata'].filepath;
    const projectid = $localStorage['content-metadata'].projectid;
    const branchName = $localStorage['content-metadata'].branch_name;
    var content = 'foo';

    if (_.startsWith(baseurl, 'http')) {
      // $scope.fetching = true;

      var url = baseurl + "/api/v3/projects/" + projectid +
      "/repository/files?file_path=" + filepath +
      "&branch_name=" + branchName +
      "&content=" + content +
      "&commit_message" + commitMessage +
      "&private_token=" + token;

      GLBackend.commitNow(url).then(function(data) {
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
