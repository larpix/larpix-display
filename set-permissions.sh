#! /usr/bin/sh

CORE_FILES="js/main.js js/lib/*.js js/lib/three/*.js index.html"
GEOM_FILES="sensor_plane_28_full.txt sensor_plane_28_simple.txt"
DATA_FILES="bern-1.json data/*.json"

chmod a+r $CORE_FILES $GEOM_FILES $DATA_FILES
