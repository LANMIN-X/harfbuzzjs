#!/bin/bash
set -e

em++ \
    -std=c++11 \
    -fno-exceptions \
    -fno-rtti \
    -fno-threadsafe-statics \
    -fvisibility-inlines-hidden \
    -O2 \
    -I. \
    -DHB_TINY \
    -DHB_USE_INTERNAL_QSORT \
    -DHB_CONFIG_OVERRIDE_H=\"config-override-subset.h\" \
    -DHB_EXPERIMENTAL_API \
    --no-entry \
    -s EXPORTED_FUNCTIONS=@hb-subset.symbols \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s INITIAL_MEMORY=256MB \
    -s MAXIMUM_MEMORY=1GB \
    -s MODULARIZE=1 \
    -s EXPORT_ES6=0 \
    -o hb-subset.js \
    harfbuzz/src/harfbuzz-subset.cc
