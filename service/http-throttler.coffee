/**
 * @license HTTP Throttler Module for AngularJS
 * (c) 2013 Mike Pugh
 * License: MIT
 */

"use strict"

angular.module('http-throttler', ['http-interceptor-buffer'])
	.factory "httpThrottler", ['$q', '$log', 'httpBuffer', ($q, $log, httpBuffer) -> 			
		reqCount = 0
		service = {
			request: (config) ->
				$log.info "Incoming Request - current count = " + reqCount				
				if reqCount >= 10		
					$log.warn "Too many requests"							
					deferred = $q.defer()
					httpBuffer.append(config, deferred)			
					return deferred.promise					
				else
					reqCount++
					return config || $q.when(config)							
			response: (response) ->
				$log.info "Response received from server"							
				reqCount--
				httpBuffer.retryOne()
				return response || $q.when(response)
		}			
		return service									
	]


angular.module('http-interceptor-buffer', [])
	.factory 'httpBuffer', ['$log', ($log) ->
		buffer = []		
		retryHttpRequest = (config, deferred) ->
			if config?
				$log.info "Resolving config promise"
				deferred.resolve(config)				
		service =
			append: (config, deferred) ->
				buffer.push(
					config: config
					deferred: deferred
				)
			retryOne: () ->
				if buffer.length > 0
					req = buffer.pop()
					retryHttpRequest(req.config, req.deferred)				
		return service
	]
