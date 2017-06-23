import fs from 'fs';
import promisify from 'promisify-node';
import request from 'request-promise';

const openAsync = promisify(fs.open);

const getHead = async function(url) {
  return await request.head(url);
};

const supportsRangesAsync = async function(res) {
  return res['accept-ranges'] === 'bytes';
};

export const Download = async function(uri, fname) {
  await prepareFileDownload(uri, fname);
};

const prepareFileDownload = async function (uri, fname) {
    let head = await getHead(uri);

	if (!supportsRangesAsync(head))
		throw new Error("Download does not support ranges!");

	const fd = await openAsync(fname, 'w');

	let compelted = 0;
	const progressCollector = (chunkSize) => {
		compelted += chunkSize;
		let percentage = Math.round((compelted/contentLength) * 10000)/ 100;
		console.log(`${percentage}%`);
	};

	let contentLength = head['content-length'];
	let concurentDownloads = 12;

	let parts = [];

	let current = 0;
	let next = 0;
	while (contentLength > current) {
	  next = current + Math.min(Math.ceil(contentLength/concurentDownloads), contentLength - current);
	  parts.push(new FileDownloadChunk(uri, current, next, fd, progressCollector));
	  current = next;
    }

    console.log(`Downloading with ${parts.length} concurrent connections`);

	await Promise.all(parts.map((part) => part.run()));
};

class FileDownloadChunk {
  uri = null;
  start = null;
  end = null;
  current = null;
  fd = null;
  progressCollector = null;

  constructor(uri, start, end, fd, progressCollector) {
    this.uri = uri;
    this.start = start;
    this.end = end;
    this.fd = fd;
    this.progressCollector = progressCollector;
  }

  async run() {
    let options = {
        uri: this.uri,
        headers: {
            'Range': `bytes=${this.start}-${this.end}`
        }
    };

    await request.get(options).on('data', (data) => {
        fs.write(this.fd, data, 0, data.length, this.start + this.current, (err) => {
          if (err)
            throw new Error(err);
        });

        this.current += data.length;

	    if (typeof this.progressCollector === 'function')
		    this.progressCollector(data.length);
    });
  }
}