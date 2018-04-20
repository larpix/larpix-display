CORE_FILES="js/main.js js/lib/*.js js/lib/three/*.js index.html"
GEOM_FILES="geometries/*.txt"
DATA_FILES="data/*.json"

DIRECTORIES="data geometries js js/lib js/lib/three"

chmod a+r $CORE_FILES $GEOM_FILES $DATA_FILES
chmod a+x $DIRECTORIES
