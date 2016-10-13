var execSync = require('child_process').execSync;
var expect = require('chai').expect;
var fse = require('fs-extra');
var tmp = require("tmp");
var RepositoryInspector = require('../src/repository-inspector');

tmp.setGracefulCleanup();

describe('RepositoryInspector', function () {
    it('getQualifiedName works', function () {
        var tmpDir = tmp.dirSync({ unsafeCleanup: true });
        execSync('git clone https://github.com/schmittjoh/metadata.git '+tmpDir.name);

        var inspector = new RepositoryInspector(tmpDir.name);
        var ret = expect(inspector.getQualifiedName()).to.be.equal('g/schmittjoh/metadata');

        tmpDir.removeCallback();
        return ret;
    });

    it('getCurrentParents works', function () {
        var tmpDir = tmp.dirSync({ unsafeCleanup: true });

        execSync('git init', { cwd: tmpDir.name });
        fse.outputFileSync(tmpDir.name+'/foo', 'foo');
        execSync('git add . && git commit -m "adds foo"', { cwd: tmpDir.name });

        var inspector = new RepositoryInspector(tmpDir.name);
        var headRev = inspector.getCurrentRevision();

        fse.outputFileSync(tmpDir.name+'/bar', 'bar');
        execSync('git add . && git commit -m "adds bar"', { cwd: tmpDir.name });
        var ret = expect(inspector.getCurrentParents()).to.deep.equal([headRev]);

        tmpDir.removeCallback();
        return ret;
    })
});
