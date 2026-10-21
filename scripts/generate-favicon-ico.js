const sharp = require('sharp');
const fs = require('fs');

const sizes = [16, 32, 48];

async function generateFavicon() {
  const images = await Promise.all(
    sizes.map(async (size) => ({
      size,
      data: await sharp('public/gymlogix-mark.svg').resize(size, size).png().toBuffer(),
    }))
  );

  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = header.length;
  images.forEach(({ size, data }, index) => {
    const entryOffset = 6 + index * 16;
    header.writeUInt8(size === 256 ? 0 : size, entryOffset);
    header.writeUInt8(size === 256 ? 0 : size, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2);
    header.writeUInt8(0, entryOffset + 3);
    header.writeUInt16LE(1, entryOffset + 4);
    header.writeUInt16LE(32, entryOffset + 6);
    header.writeUInt32LE(data.length, entryOffset + 8);
    header.writeUInt32LE(offset, entryOffset + 12);
    offset += data.length;
  });

  await fs.promises.writeFile('app/favicon.ico', Buffer.concat([header, ...images.map(({ data }) => data)]));
  console.log('Generated app/favicon.ico (16, 32, 48 px)');
}

generateFavicon().catch((error) => {
  console.error('Failed to generate favicon:', error);
  process.exitCode = 1;
});
