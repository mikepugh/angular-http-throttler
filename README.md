angular-http-throttler
======================

AngularJS service for throttling $http requests

Requires AngularJS >= 1.1.5

# Usage

Add the http-throttler module as a dependency to your application module:
    
    var myAppModule = angular.module('MyApp', ['http-throttler'])
    
Add the httpThrottler service into the $httpProvider.interceptors array

    myAppModule.config(['$httpProvider', function($httpProvider) {
      $httpProvider.interceptors.push('httpThrottler');
    });

Modify the httpThrottler service code, setting the max # of requests.

    if reqCount >= 10 // Change this to some # you're interested in
    
Both coffeescript and js files are included.
