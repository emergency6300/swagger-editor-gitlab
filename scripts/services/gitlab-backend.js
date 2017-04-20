'use strict';

// var _ = require('lodash');
var angular = require('angular');

SwaggerEditor.service('GLBackend', function GLBackend($http, $q, defaults,
  $rootScope, Builder, ExternalHooks, YAML) {
  var changeListeners = {};
  /* eslint no-useless-escape: "off"*/

  /**
   * @param {object} url - url
   * @param {object} data - data
  */
  function commitNow(url) {
    // save('progress', 'progress-saving');
    console.log('commiting');

    var httpConfig = {
      headers: {
        'content-type': 'application/yaml; charset=utf-8'
      }
    };

    $http.put(url, null, httpConfig)
      .then(function success() {
        ExternalHooks.trigger('put-success', [].slice.call(arguments));
        $rootScope.progressStatus = 'success-saved';
      }, function failure() {
        ExternalHooks.trigger('put-failure', [].slice.call(arguments));
        $rootScope.progressStatus = 'error-connection';
      });
  }

  /**
   * @param {string} key - key
   * @param {function} fn - function
  */
  function addChangeListener(key, fn) {
    if (angular.isFunction(fn)) {
      if (!changeListeners[key]) {
        changeListeners[key] = [];
      }
      changeListeners[key].push(fn);
    }
  }

  /** */
  function noop() {}

  // this.save = save;
  this.reset = noop;
  this.commitNow = commitNow;
  this.addChangeListener = addChangeListener;
});
