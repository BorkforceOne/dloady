import fs from 'fs';
import promisify from 'promisify-node';

const openAsync = promisify(fs.open);
const readAsync = promisify(fs.read);

export const Load = async function() {
  const fd = null;

  try {
    const fd = await openAsync('myfile.txt', 'r');
  }
  catch (err) {
    if (err.code === 'ENOENT') {
      console.error('myfile.txt does not exist');
      return;
    }

    throw err;
  }
  let buffer = new Buffer(1024);
  await readAsync(fd, buffer, 0, 1024, 0);

  console.log(buffer);
};