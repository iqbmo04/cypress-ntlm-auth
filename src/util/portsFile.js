'use strict';

const fs = require('fs');
const path = require('path');
const url = require('url');
const debug = require('debug')('cypress:ntlm-auth-plugin');

const appDataPath = require('appdata-path');
const portsFileName = 'cypress-ntlm-auth.port';
const portsFileWithPath = path.join(appDataPath('cypress-ntlm-auth'), portsFileName);

module.exports = {
  delete: function (callback) {
    fs.unlink(portsFileWithPath, function (err) {
      if (err) {
        debug(err);
        return callback(new Error('Cannot delete ' + portsFileWithPath));
      }
      return callback(null);
    });
  },

  save: function (ports, callback) {
    fs.writeFile(portsFileWithPath, JSON.stringify(ports),
      function (err) {
        if (err) {
          debug(err);
          return callback(new Error('Cannot create ' + portsFileWithPath));
        } else {
          debug('wrote ' + portsFileWithPath);
        }
        return callback(null);
      });
  },

  exists: function () {
    return fs.existsSync(portsFileWithPath);
  },

  parse: function (callback) {
    if (fs.existsSync(portsFileWithPath)) {
      let data = fs.readFileSync(portsFileWithPath);
      let ports;
      try {
        ports = JSON.parse(data);
      } catch (err) {
        return callback(null, err);
      }
      if (validatePortsFile(ports)) {
        return callback(ports, null);
      }
      return callback(null, new Error('Cannot parse ' + portsFileWithPath));
    } else {
      return callback(null,
        new Error('cypress-ntlm-auth proxy does not seem to be running. '+
        'It must be started before cypress. Please see the docs.' + portsFileWithPath));
    }
  }
};

function validatePortsFile(ports) {
  if (!ports) {
    return false;
  }
  if (!ports.configApiUrl || !ports.ntlmProxyUrl) {
    return false;
  }
  let urlTest = url.parse(ports.configApiUrl);
  if (!urlTest.protocol || !urlTest.hostname || !urlTest.port) {
    return false;
  }
  urlTest = url.parse(ports.ntlmProxyUrl);
  if (!urlTest.protocol || !urlTest.hostname || !urlTest.port) {
    return false;
  }
  return true;
}
