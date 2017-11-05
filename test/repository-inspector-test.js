var execSync = require('child_process').execSync;
var expect = require('chai').expect;
var fse = require('fs-extra');
var tmp = require("tmp");
var RepositoryInspector = require('../src/repository-inspector');

tmp.setGracefulCleanup();

describe('RepositoryInspector', function () {
    this.timeout(Infinity);
    beforeEach(function () {
        this._tmpDir = tmp.dirSync({ unsafeCleanup: true });
    });

    afterEach(function () {
        this._tmpDir.removeCallback();
    });

    it('getQualifiedName works', function () {
        execSync('git clone https://github.com/schmittjoh/metadata.git ' + this._tmpDir.name);

        var inspector = new RepositoryInspector(this._tmpDir.name);
        expect(inspector.getQualifiedName()).to.be.equal('g/schmittjoh/metadata');
    });

    it('getCurrentParents works', function () {
        execSync('git init', { cwd: this._tmpDir.name });
        fse.outputFileSync(this._tmpDir.name+'/foo', 'foo');
        execSync('git add . && git commit -m "adds foo"', { cwd: this._tmpDir.name });

        var inspector = new RepositoryInspector(this._tmpDir.name);
        var headRev = inspector.getCurrentRevision();

        fse.outputFileSync(this._tmpDir.name+'/bar', 'bar');
        execSync('git add . && git commit -m "adds bar"', { cwd: this._tmpDir.name });
        expect(inspector.getCurrentParents()).to.deep.equal([headRev]);
    });
});
