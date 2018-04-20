#! /usr/bin/sh

CORE_FILES="js/main.js js/lib/*.js js/lib/three/*.js index.html"
GEOM_FILES="geometries/*.txt"
DATA_FILES="data/*.json"

chmod a+r $CORE_FILES $GEOM_FILES $DATA_FILES
