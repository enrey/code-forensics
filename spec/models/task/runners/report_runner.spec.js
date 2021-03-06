/*global require_src*/
var stream   = require('stream'),
    Bluebird = require('bluebird');

var ReportRunner = require_src('models/task/runners/report_runner'),
    reporting    = require_src('reporting');

describe('ReportRunner', function() {
  var mockPublisher, doneCallback;
  beforeEach(function() {
    mockPublisher = jasmine.createSpyObj('Publisher', ['createManifest']);
    spyOn(reporting, 'Publisher').and.returnValue(mockPublisher);
    doneCallback = jasmine.createSpy('done');
  });

  it('executes the task function passing the report publisher', function() {
    var task = {
      run: jasmine.createSpy('taskFunction')
    };
    new ReportRunner(task).run(doneCallback);

    expect(task.run).toHaveBeenCalledWith(mockPublisher);
  });

  describe('when the output of the task function is a stream', function() {
    it('creates the manifest after the stream is ended', function(done) {
      var output = new stream.PassThrough();

      new ReportRunner({
        run: function() { return output; }
      }).run(doneCallback)
        .then(function() {
          expect(mockPublisher.createManifest).toHaveBeenCalledWith(undefined);
          done();
        })
        .catch(done.fail);

      output.push('123');
      output.end();
    });
  });

  describe('when the output of the task function is a simple value', function() {
    it('creates the manifest after the task function is completed', function(done) {
      new ReportRunner({
        run: function() { return 123; }
      }).run(doneCallback)
        .then(function() {
          expect(mockPublisher.createManifest).toHaveBeenCalledWith(123);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('when the output of the task function is a promise', function() {
    it('creates the manifest after the task promise is fulfilled', function(done) {
      new ReportRunner({
        run: function() { return Bluebird.resolve('promise result'); }
      }).run(doneCallback)
        .then(function() {
          expect(mockPublisher.createManifest).toHaveBeenCalledWith('promise result');
          done();
        })
        .catch(done.fail);
    });

    it('does not create the manifest if the task promise is rejected', function(done) {
      new ReportRunner({
        run: function() { return Bluebird.reject(new Error()); }
      }).run(doneCallback)
        .then(function() {
          expect(mockPublisher.createManifest).not.toHaveBeenCalledWith();
          done();
        })
        .catch(done.fail);
    });
  });

  describe('when a task function is not defined', function() {
    it('returns without creating a manifest and executes the callback', function() {
      var output = new ReportRunner({}).run(doneCallback);

      expect(output).toBeUndefined();
      expect(mockPublisher.createManifest).not.toHaveBeenCalledWith();
      expect(doneCallback).toHaveBeenCalledWith();
    });
  });

  describe('when the task function throws an error', function() {
    it('returns without creating a manifest executing the callback', function() {
      var output = new ReportRunner({
        run: function() { throw new Error('something is wrong'); }
      }).run(doneCallback);

      expect(output).toBeUndefined();
      expect(mockPublisher.createManifest).not.toHaveBeenCalledWith();
      expect(doneCallback).toHaveBeenCalledWith();
    });
  });
});
