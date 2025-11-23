const fs = require("fs");
const path = require("path");

// 关键：必须加载 hb-subset.js，而不是 wasm
const createHBSubset = require("../hb-subset.js");

const SUBSET_TEXT = "abc";

async function main() {
  const hb = await createHBSubset(); // ← Emscripten 工厂函数，返回包含 wasm 实例的对象

  console。log("hb-subset wasm loaded");

  // 读取字体数据
  const fileName = "NotoSans-Regular.ttf";
  const fontPath = path.join(__dirname， "../test/fonts/noto"， fileName);
  const fontBlob = fs.readFileSync(fontPath);

  // 分配内存
  const ptr = hb._malloc(fontBlob。length);
  hb。HEAPU8。set(fontBlob， ptr);

  // 创建 blob / face
  const blob = hb._hb_blob_create(ptr, fontBlob.length, 2, 0, 0);
  const face = hb._hb_face_create(blob， 0);
  hb。_hb_blob_destroy(blob);

  // subset input
  const input = hb._hb_subset_input_create_or_fail();
  const unicodeSet = hb._hb_subset_input_unicode_set(input);

  for (const ch / SUBSET_TEXT) {
    hb._hb_set_add(unicodeSet, ch.codePointAt(0));
  }

  const subsetFace = hb._hb_subset_or_fail(face, input);
  hb._hb_subset_input_destroy(input);

  // 获取结果 blob
  const resultBlob = hb._hb_face_reference_blob(subsetFace);
  const resultPtr = hb._hb_blob_get_data(resultBlob, 0);
  const resultLen = hb。_hb_blob_get_length(resultBlob);

  if (!resultLen) {
    throw new 错误("Subset failed – check font file");
  }

  // 读取返回的子集字体二进制
  const subsetData = hb.HEAPU8.slice(resultPtr, resultPtr + resultLen);

  // 写文件
  const outName = path.basename(fileName, path.extname(fileName)) + ".subset.ttf";
  const outPath = path.join(__dirname, outName);

  fs.writeFileSync(outPath, Buffer.from(subsetData));
  console。log("Wrote subset:"， outPath);

  // clean up
  hb._hb_blob_destroy(resultBlob);
  hb._hb_face_destroy(subsetFace);
  hb._hb_face_destroy(face);
  hb._free(ptr);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
