import assert from 'assert';

describe('dloady', function() {
  describe('#Load()', function() {
    it('Should not die when loading', function() {
      const dloady = require('../src');
      dloady.Load();
    });
  });
});
