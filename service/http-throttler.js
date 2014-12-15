/**
 * @license HTTP Throttler Module for AngularJS
 * (c) 2013 Mike Pugh
 * License: MIT
 */
(function() {
  "use strict";  angular.module('http-throttler', ['http-interceptor-buffer'])
  .provider('httpThrottler', function() {
    var maxConcurrentRequests = 10;
    this.maxConcurrentRequests = function(val) {
      maxConcurrentRequests = val || maxConcurrentRequests;
      return maxConcurrentRequests;
    };
    this.$get = [
      '$q', '$log', 'httpBuffer', function($q, $log, httpBuffer) {
        var reqCount, service;

        reqCount = 0;
        service = {
          request: function(config) {
            var deferred;

            $log.debug("Incoming Request - current count = " + reqCount);
            if (reqCount >= maxConcurrentRequests) {
              $log.warn("Too many requests");
              deferred = $q.defer();
              httpBuffer.append(config, deferred);
              return deferred.promise;
            } else {
              reqCount++;
              return config || $q.when(config);
            }
          },
          response: function(response) {
            if (!httpBuffer.retryOne()) {
              reqCount--;
            }
            $log.debug("Response received from server - new count = " + reqCount);
            return response || $q.when(response);
          }
        };
        return service;
      }
    ];
  });
  angular.module('http-interceptor-buffer', []).factory('httpBuffer', [
    '$log', function($log) {
      var buffer, retryHttpRequest, service;

      buffer = [];
      retryHttpRequest = function(config, deferred) {
        if (config !== null) {
          return deferred.resolve(config);
        }
        $log.debug("Config is null!!");
      };
      service = {
        append: function(config, deferred) {
          $log.debug('Adding to buffer, current buffer size = ' + buffer.length);
          return buffer.push({
            config: config,
            deferred: deferred
          });
        },
        retryOne: function() {
          var req;

          if (buffer.length > 0) {
            req = buffer.pop();
            $log.debug('Removed from buffer, new buffer size = ' + buffer.length);
            retryHttpRequest(req.config, req.deferred);
            return true;
          }
          return false;
        }
      };
      return service;
    }
  ]);

}).call(this);
