CORE_FILES="static/js/main.js static/js/lib/*.js static/js/lib/three/*.js templates/index.html"
GEOM_FILES="static/geometries/*.txt"
DATA_FILES="static/data/*.json"

DIRECTORIES="static static/data static/geometries static/js static/js/lib static/js/lib/three"

chmod a+r $CORE_FILES $GEOM_FILES $DATA_FILES
chmod a+x $DIRECTORIES
