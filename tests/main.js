import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

// Then either:
const expect = chai.expect;

describe('dloady', () => {
  describe('Loading', () => {
    it('Should not die when loading', () => {
      const dloady = require('../src');
      expect(dloady).not.to.be.null;
    });
  });
  describe('#Download()', () => {
    it('Should download a remote file successfully', () => {
      const dloady = require('../src');

      return dloady.Download("http://ipv4.download.thinkbroadband.com/50MB.zip", "50MB.zip");
    })
  });
});
