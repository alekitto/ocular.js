#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var RepositoryInspector = require('./src/repository-inspector');
var path = require("path");
var url = require("url");
var http = require("https");

var fn;

program
    .version('0.1.0')
    .arguments('<coverage-file>')
    .option('--access-token <token>')
    .option('--api-url <url>', 'The base URL of the API.', 'https://scrutinizer-ci.com/api')
    .option('--repository', 'The qualified repository name of your repository (GitHub: g/login/username; Bitbucket: b/login/username).')
    .option('--revision', 'The revision that the code coverage information belongs to (defaults to git rev-parse HEAD).')
    .option('--parent', 'The parent revision of the current revision.', [])
    .action(function (coverageFile) {
        fn = coverageFile;
    })
    .parse(process.argv);

if (!fn) {
    console.error('No file specified');
    process.exit(1);
}

var getBasePath = function () {
    var dir = process.cwd();
    while (dir) {
        if (fs.existsSync(dir+'/.git')) {
            return dir;
        }

        dir = path.dirname(dir);
    }

    throw new Error('Cannot determine base path');
};

var getCoverageData = function (filename) {
    var outString = fs.readFileSync(filename).toString();

    outString = outString.replace(new RegExp(getBasePath(), 'g'), '{scrutinizer_project_base_path}');
    return new Buffer(outString).toString('base64');
};

var inspector = new RepositoryInspector(process.cwd());
var baseUrl = program.apiUrl;

var repositoryName = program.repository || inspector.getQualifiedName();

var data = {
    'revision': program.revision || inspector.getCurrentRevision(),
    'parents': program.parent || inspector.getCurrentParents(),
    'coverage': {
        'format': 'clover',
        'data': getCoverageData(fn)
    }
};

var urlObj = url.parse(baseUrl+'/repositories/'+repositoryName+'/data/code-coverage');
var req = http.request({
    protocol: urlObj.protocol,
    host: urlObj.host,
    hostname: urlObj.hostname,
    port: urlObj.port,
    method: 'POST',
    path: urlObj.path+(program.accessToken ? '?access_token='+program.accessToken : ''),
    headers: {
        'Content-Type': 'application/json'
    }
}, function (res) {
  if (200 === res.statusCode) {
    console.log('Upload went fine.')
  } else {
    console.log('Upload failed.')
  }
});

req.write(JSON.stringify(data));
req.end();
