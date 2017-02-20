'use strict';

var angular = require('angular');
var _ = require('lodash');
var metadata = {};

/*
 * File loader service to load file from a URL or string
*/
SwaggerEditor.service('FileLoader', function FileLoader($http, defaults, YAML, Storage) {
  /**
   * Load a file from URL
   *
   * @param {string} url - the URL to load from
   * @param {boolean} disableProxy - disables cors-it proxy
   * @return {Promise} - resolves to content of the file
  */
  function loadFromUrl(url, disableProxy) {
    return new Promise(function(resolve, reject) {
      if (disableProxy === undefined) {
        disableProxy = false;
      }

      // Temporarily use this service to get around non-CORSable URLs
      if (_.startsWith(url, 'http') && !disableProxy) {
        url = defaults.importProxyUrl + url;
      }

      $http({
        method: 'GET',
        url: url,
        headers: {
          accept: 'application/x-yaml,text/yaml,application/json,*/*'
        }
      }).then(function(resp) {
        if (angular.isObject(resp.data)) {
          YAML.dump(resp.data, function(error, yamlString) {
            if (error) {
              return reject(error);
            }

            resolve(yamlString);
          });
        } else {
          load(resp.data).then(resolve, reject);
        }
      }, reject);
    });
  }

  /**
  * Load a file from Gitlab
  *
  * @param {string} url - the URL to load from
  @param {string} projectid - the project identifier
  * @return {Promise} - resolves to content of the file
 */
  function loadFromGitlab(url, projectid) {
    metadata.projectid = projectid;
    return new Promise(function(resolve, reject) {
      $http({
        method: 'GET',
        url: url,
        headers: {
          accept: 'application/x-yaml,text/yaml,application/json,*/*'
        }
      }).then(function(resp) {
        if (angular.isObject(resp.data)) {
          loadGithub(resp.data).then(resolve, reject);
        }
      }, reject);
    });
  }

  /**
   * takes a JSON or YAML string, returns YAML string
   *
   * @param {string} string - the JSON or YAML raw string
   * @return {Promise} YAML string
   * @throws {TypeError} - resolves to a YAML string
  */
  function load(string) {
    return new Promise(function(resolve, reject) {
      if (!_.isString(string)) {
        throw new TypeError('load function only accepts a string');
      }

      try {
        JSON.parse(string);
      } catch (error) {
        // Do not change to JSON if it is YAML, and
        // just resolve it
        resolve(string);
        return;
      }

      YAML.load(string, function(error, json) {
        if (error) {
          return reject(error);
        }

        YAML.dump(json, function(error, yamlString) {
          if (error) {
            return reject(error);
          }

          resolve(yamlString);
        });
      });
    });
  }

    /**
   * takes a JSON or YAML string, returns YAML string
   *
   * @param {string} data - the Gitlab file object
   * @return {Promise} YAML string and metadata
   * @throws {TypeError} - resolves to a YAML string
  */
  function loadGithub(data) {
    const string = window.atob(data.content);
    return new Promise(function(resolve, reject) {
      if (!_.isString(string)) {
        throw new TypeError('load function only accepts a string');
      }
      metadata.filepath = data.file_path;
      metadata.ref = data.ref;
      console.log('loadGithub Value is ' + JSON.stringify(metadata) + 'saving...');
      Storage.saveMeta('metadata', metadata);

      try {
        JSON.parse(string);
      } catch (error) {
        // Do not change to JSON if it is YAML, and
        // just resolve it
        resolve(string);
        return;
      }

      YAML.load(string, function(error, json) {
        if (error) {
          return reject(error);
        }

        YAML.dump(json, function(error, yamlString) {
          if (error) {
            return reject(error);
          }
          resolve(yamlString);
        });
      });
    });
  }

  // Load from Local file content (string)
  this.load = load;
  this.loadFromUrl = loadFromUrl;
  this.loadFromGitlab = loadFromGitlab;
});
