import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

function createPNG(width, height, r, g, b) {
	// Simple uncompressed or deflate PNG generator
	const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

	function createChunk(type, data) {
		const len = Buffer.alloc(4);
		len.writeUInt32BE(data.length, 0);
		const typeBuf = Buffer.from(type, 'ascii');
		const body = Buffer.concat([typeBuf, data]);
		const crcVal = crc32(body);
		const crcBuf = Buffer.alloc(4);
		crcBuf.writeUInt32BE(crcVal >>> 0, 0);
		return Buffer.concat([len, body, crcBuf]);
	}

	function crc32(buf) {
		let c;
		const table = [];
		for (let n = 0; n < 256; n++) {
			c = n;
			for (let k = 0; k < 8; k++) {
				if (c & 1) c = 0xedb88320 ^ (c >>> 1);
				else c = c >>> 1;
			}
			table[n] = c;
		}
		let crc = 0 ^ -1;
		for (let i = 0; i < buf.length; i++) {
			crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
		}
		return (crc ^ -1) >>> 0;
	}

	// IHDR
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(width, 0);
	ihdr.writeUInt32BE(height, 4);
	ihdr.writeUInt8(8, 8); // bit depth
	ihdr.writeUInt8(2, 9); // color type 2 (RGB)
	ihdr.writeUInt8(0, 10); // compression
	ihdr.writeUInt8(0, 11); // filter
	ihdr.writeUInt8(0, 12); // interlace

	const ihdrChunk = createChunk('IHDR', ihdr);

	// Raw image data: filter byte (0) + RGB per pixel
	const rowSize = 1 + width * 3;
	const raw = Buffer.alloc(rowSize * height);
	for (let y = 0; y < height; y++) {
		const rowOffset = y * rowSize;
		raw[rowOffset] = 0; // Filter none
		for (let x = 0; x < width; x++) {
			const pxOffset = rowOffset + 1 + x * 3;
			raw[pxOffset] = r;
			raw[pxOffset + 1] = g;
			raw[pxOffset + 2] = b;
		}
	}

	const compressed = zlib.deflateSync(raw);
	const idatChunk = createChunk('IDAT', compressed);
	const iendChunk = createChunk('IEND', Buffer.alloc(0));

	return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.resolve('static/icons');
if (!fs.existsSync(iconsDir)) {
	fs.mkdirSync(iconsDir, { recursive: true });
}

// Green RT color: #16a34a -> (22, 163, 74)
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPNG(192, 192, 22, 163, 74));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPNG(512, 512, 22, 163, 74));
fs.writeFileSync(path.join(iconsDir, 'icon-512-maskable.png'), createPNG(512, 512, 22, 163, 74));
console.log('✅ Generated placeholder icons in static/icons/');
