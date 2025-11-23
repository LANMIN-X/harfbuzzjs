const fs = require("fs");
const path = require("path");

const SUBSET_TEXT = "abc";

async function main() {
  // 🚀 正确加载 Emscripten 模块（非常重要）
  const createHBSubset = require("../hb-subset.js");
  const hb = await createHBSubset();

  console.log("hb-subset wasm loaded");

  const fileName = "NotoSans-Regular.ttf";
  const fontPath = path.join(__dirname, "../test/fonts/noto", fileName);
  const fontBlob = fs.readFileSync(fontPath);

  // ---- memory copy ----
  const ptr = hb._malloc(fontBlob.length);
  hb.HEAPU8.set(fontBlob, ptr);   // <== 这里不会再 undefined
  // -----------------------

  const blob = hb._hb_blob_create(ptr, fontBlob.length, 2, 0, 0);
  const face = hb._hb_face_create(blob, 0);
  hb._hb_blob_destroy(blob);

  const input = hb._hb_subset_input_create_or_fail();
  const unicodeSet = hb._hb_subset_input_unicode_set(input);

  for (const ch of SUBSET_TEXT) {
    hb._hb_set_add(unicodeSet, ch.codePointAt(0));
  }

  const subsetFace = hb._hb_subset_or_fail(face, input);
  hb._hb_subset_input_destroy(input);

  const resultBlob = hb._hb_face_reference_blob(subsetFace);
  const resultPtr = hb._hb_blob_get_data(resultBlob, 0);
  const resultLen = hb._hb_blob_get_length(resultBlob);

  if (!resultLen) throw new Error("Subset failed");

  const subsetData = hb.HEAPU8.slice(resultPtr, resultPtr + resultLen);

  const out = path.join(__dirname, "subset.ttf");
  fs.writeFileSync(out, Buffer.from(subsetData));

  console.log("Wrote subset:", out);

  hb._hb_blob_destroy(resultBlob);
  hb._hb_face_destroy(subsetFace);
  hb._hb_face_destroy(face);
  hb._free(ptr);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
