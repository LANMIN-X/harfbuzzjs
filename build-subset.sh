#!/bin/bash
set -e

# 1. 确保使用 dlmalloc (默认)，不要用 emmalloc (虽然小但容易碎片化)
# 2. 移除 -DHB_TINY，如果是做工具，最好保留完整功能以兼容各种怪异字体
# 3. 增加栈空间，防止深层递归爆栈

em++ \
    -std=c++11 \
    -O3 \
    -flto \
    -fno-exceptions \
    -fno-rtti \
    -fno-threadsafe-statics \
    -fvisibility-inlines-hidden \
    -I. \
    -DHB_USE_INTERNAL_QSORT \
    -DHB_CONFIG_OVERRIDE_H=\"config-override-subset.h\" \
    -DHB_EXPERIMENTAL_API \
    --no-entry \
    -s EXPORTED_FUNCTIONS=@hb-subset.symbols \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s INITIAL_MEMORY=64MB \
    -s MAXIMUM_MEMORY=2GB \
    -s STACK_SIZE=5MB \
    -s ABORTING_MALLOC=0 \
    -s MALLOC="dlmalloc" \
    -o hb-subset.wasm \
    harfbuzz/src/harfbuzz-subset.cc
