import exifr from 'exifr';
import fs from 'fs';

async function test() {
  const file = fs.readFileSync('scratch/sample.jpg');
  const data = await exifr.parse(file, ['Make', 'Model', 'FocalLength', 'FNumber', 'ISO', 'ExposureTime', 'LensModel', 'DateTimeOriginal']);
  console.log(data);
}
test();
