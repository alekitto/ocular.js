var execSync = require('child_process').execSync;

const TYPE_GITHUB = 'g';
const TYPE_BITBUCKET = 'b';

var Inspector = function (repositoryDir) {
    this._dir = repositoryDir;
};

Inspector.prototype._execGit = function (command) {
    var output = execSync('git '+command, {
        cwd: this._dir
    });

    return output.toString().trim();
};

Inspector.prototype.getCurrentRevision = function () {
    return this._execGit('rev-parse HEAD');
};

Inspector.prototype.getCurrentParents = function () {
    return this._execGit('log --pretty="%P" -n1 HEAD').split(' ');
};

Inspector.prototype.getQualifiedName = function () {
    var output = this._execGit('remote -v');

    var patterns = [
        new RegExp('^origin\\s+(?:git@|(?:git|https?)://)([^:/]+)(?:/|:)([^/]+)/([^/\\s]+?)(?:\\.git)?(?:\\s|\\n)', 'm'),
        new RegExp('^[^\\s]+\\s+(?:git@|(?:git|https?)://)([^:/]+)(?:/|:)([^/]+)/([^/\\s]+?)(?:\\.git)?(?:\\s|\\n)', 'm')
    ];

    for (var i in patterns) {
        var rx = patterns[i];

        var result = rx.exec(output);
        if (result) {
            return this._getRepositoryType(result[1])+'/'+result[2]+'/'+result[3];
        }
    }

    throw new Error("Could not extract repository name from:\n"+output);
};


Inspector.prototype._getRepositoryType = function (host) {
    switch (host) {
        case 'github.com':
            return TYPE_GITHUB;
        case 'bitbucket.org':
            return TYPE_BITBUCKET;
        default:
            throw new Error('Unknown host "'+host+'".');
    }
};

module.exports = Inspector;
