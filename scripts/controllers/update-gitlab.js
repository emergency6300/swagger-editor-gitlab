'use strict';

var _ = require('lodash');

SwaggerEditor.controller('GitlabUpdateCtrl', function GitlabUpdateCtrl($scope,
  $uibModalInstance, $localStorage,
  $rootScope, $state, GLBackend, Storage, Preferences) {
  $scope.error = null;
  $scope.commitMessage = null;

  var update = function(commitMessage) {
    $scope.error = null;
    const baseurl = Preferences.get('gitlabBaseUrl');
    const token = Preferences.get('gitlabToken');
    const filepath = $localStorage.Gitlab.metadata.filepath;
    const projectid = $localStorage.Gitlab.metadata.projectid;
    const branchName = $localStorage.Gitlab.metadata.ref;
    var content = window.btoa($localStorage.SwaggerEditorCache.yaml);

    if (_.startsWith(baseurl, 'http')) {
      // $scope.fetching = true;

      var url = baseurl + "/api/v3/projects/" + projectid +
      "/repository/files?file_path=" + filepath +
      "&branch_name=" + branchName +
      "&content=" + content +
      "&encoding=base64" +
      "&commit_message=" + commitMessage +
      "&private_token=" + token;
      GLBackend.commitNow(url);
      $state.go('home', {tags: null});
      $uibModalInstance.close();
    } else {
      $scope.error = 'Invalid URL';
    }
  };

  $scope.update = _.throttle(update, 200);

  $scope.cancel = $uibModalInstance.close;
});
