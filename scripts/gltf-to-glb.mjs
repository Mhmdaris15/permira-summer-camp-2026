// Convert each .gltf + .bin pair in public/kit/ into a self-contained .glb.
//
// GLB binary layout:
//   header   (12 bytes): magic 'glTF', version 2, total length
//   chunk JSON: length, type 'JSON', JSON data (padded to 4 with 0x20 spaces)
//   chunk BIN : length, type 'BIN\0', binary data (padded to 4 with 0x00)
//
// Texture .png URIs remain external — three.js resolves them relative
// to the .glb URL, same as it did relative to the .gltf URL.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KIT = path.resolve(__dirname, "..", "public", "kit");

const names = [
  "Prop_WoodenFence_Single",
  "Prop_WoodenFence_Extension1",
  "Prop_WoodenFence_Extension2",
  "Prop_Wagon",
  "Prop_Crate",
];

const GLB_MAGIC  = 0x46546c67; // 'glTF'
const CHUNK_JSON = 0x4e4f534a; // 'JSON'
const CHUNK_BIN  = 0x004e4942; // 'BIN\0'

function pad4(buf, padByte) {
  const rem = buf.length % 4;
  return rem === 0 ? buf : Buffer.concat([buf, Buffer.alloc(4 - rem, padByte)]);
}

function toGlb(gltfPath, binPath) {
  const gltf = JSON.parse(fs.readFileSync(gltfPath, "utf8"));
  const bin = fs.readFileSync(binPath);
  delete gltf.buffers[0].uri;
  gltf.buffers[0].byteLength = bin.length;

  const jsonChunk = pad4(Buffer.from(JSON.stringify(gltf), "utf8"), 0x20);
  const binChunk  = pad4(bin, 0x00);

  const header = Buffer.alloc(12);
  header.writeUInt32LE(GLB_MAGIC, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonChunk.length + 8 + binChunk.length, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonChunk.length, 0);
  jsonHeader.writeUInt32LE(CHUNK_JSON, 4);

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binChunk.length, 0);
  binHeader.writeUInt32LE(CHUNK_BIN, 4);

  return Buffer.concat([header, jsonHeader, jsonChunk, binHeader, binChunk]);
}

let totalBefore = 0, totalAfter = 0;
for (const n of names) {
  const gltfP = path.join(KIT, `${n}.gltf`);
  const binP  = path.join(KIT, `${n}.bin`);
  const outP  = path.join(KIT, `${n}.glb`);
  const sb = fs.statSync(gltfP).size + fs.statSync(binP).size;
  const glb = toGlb(gltfP, binP);
  fs.writeFileSync(outP, glb);
  totalBefore += sb;
  totalAfter += glb.length;
  console.log(`${n}.glb  ${glb.length.toString().padStart(7)} bytes  (was ${sb})`);
}
console.log(`\ntotal ${totalAfter} bytes (was ${totalBefore})`);
