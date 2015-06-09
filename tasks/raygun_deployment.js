/*
 * grunt-raygun-deployment
 * https://raygun.io
 *
 * Copyright (c) 2015 Raygun.io
 * Licensed under the MIT license.
 */

'use strict';

var request = require('request');

module.exports = function (grunt) {

  grunt.registerTask('raygun_deployment', 'Grunt plugin for generating Deployment information for Raygun.io', function () {
    var finishedTask = this.async(), end, send, generate;

    var options = this.options({
      raygunApiUri: 'https://app.raygun.io'
    });

    if(!options.raygunApiKey && !process.env.RAYGUN_APIKEY){
      grunt.fatal('Required option raygunApiKey is missing');
      return;
    }
    if(!options.raygunAuthToken && !process.env.RAYGUN_AUTHTOKEN){
      grunt.fatal('Required option raygunAuthToken is missing');
      return;
    }

    if(!options.release || !options.release.version){
      grunt.fatal('Required option release.version is missing.');
      return;
    }

    var apiKey = options.raygunApiKey || process.env.RAYGUN_APIKEY;
    var authToken = options.raygunAuthToken || process.env.RAYGUN_AUTHTOKEN;

    generate = function() {
      var deployment = {
        apiKey: apiKey,
        version: options.release.version,
        ownerName: options.release.ownerName || "",
        emailAddress: options.release.emailAddress || "" ,
        comment: options.release.notes || ""
      };
      send(deployment);
    };

    send = function(data) {
      request.post({
        uri: options.raygunApiUri + '/deployments',
        qs: { authToken: authToken },
        json: true,
        body: data
      }, end);
    };

    end = function(error, res, body) {
      if(error) {
        grunt.fatal(error);
      } else if (res.statusCode === 200) {
        grunt.log.writeln('Sent deployment info to Raygun.io');
        finishedTask();
      } else if(res.statusCode === 403) {
        grunt.fatal('Could not send deployment info to Raygun: your raygunApiKey is either wrong or you don\'t have access to that application');
      } else if(res.statusCode === 401) {
        grunt.fatal('Could not send deployment info to Raygun: your raygunAuthToken is wrong');
      } else {
        grunt.fatal('Could not send deployment info to Raygun: got a ' + res.statusCode + ' response code');
      }
    };

    generate();

  });

};
