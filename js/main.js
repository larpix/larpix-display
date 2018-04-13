var scene = new THREE.Scene();
var perspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var orthographicCamera = new THREE.OrthographicCamera(-window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 0.1, 5000);
var spriteCamera = orthographicCamera.clone();
var spriteScene = new THREE.Scene();
var camera = orthographicCamera;
var cameras = {'orthographic': orthographicCamera, 'perspective': perspectiveCamera};
spriteCamera.position.z = 80;
spriteCamera.zoom = 6;
spriteCamera.updateProjectionMatrix();
var reset_camera = function(cams) {
  ortho = cams['orthographic'];
  ortho.position.set(0, 0, 80);
  ortho.zoom = 5;
  ortho.rotation.set(0, 0, 0);
  ortho.updateProjectionMatrix();
  persp = cams['perspective'];
  persp.position.set(0, 0, 80);
  persp.zoom = 1;
  persp.rotation.set(0, 0, 0);
  persp.updateProjectionMatrix();
};
reset_camera(cameras);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.autoClear = false;

var pixelPadGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1);
var activePixelPadMaterial = new THREE.MeshBasicMaterial({color:0x00ff00});
var inactivePixelPadMaterial = new THREE.MeshBasicMaterial({color:0x005500});

scene.background = new THREE.Color(0xa7a7a7);
perspectiveControls = new THREE.OrbitControls(perspectiveCamera, renderer.domElement);
orthographicControls = new THREE.OrbitControls(orthographicCamera, renderer.domElement);

var pixelOffset = {'x': -100, 'y': -100};

$.get('sensor_plane_28_full.txt', function(rawPixelGeometry) {
  pixelGeometry = jsyaml.load(rawPixelGeometry);
  pixels = pixelGeometry['pixels'];
  chips = pixelGeometry['chips'];
  activePixels = []
  for(var i in chips) {
    activePixels = activePixels.concat(chips[i][1]);
  }
  for(var i = 0; i < pixels.length; i++) {
    pixel = pixels[i];
    x = pixel[1]+pixelOffset.x;
    y = pixel[2]+pixelOffset.y;
    if(activePixels.indexOf(pixel[0]) >= 0) {
      pixelMesh = new THREE.Mesh(pixelPadGeometry, activePixelPadMaterial);
    }
    else {
      pixelMesh = new THREE.Mesh(pixelPadGeometry, inactivePixelPadMaterial);
    }
    pixelMesh.position.z = 0;
    pixelMesh.position.x = x;
    pixelMesh.position.y = y;
    pixelMesh.rotation.x = 3.14159/2;
    scene.add(pixelMesh);
  }
}, 'text');


$.getJSON('bern-2.json', function(data) {
  metadata['data'] = data;
  loadHits(metadata);
  gui.__controllers[0].__max = data.length;
  gui.__controllers[2].__max = data.length;
  gui.__controllers[3].__max = data.length;
});

/**
 * Find the next group of data points (after index <start>) with <n>
 * hits within time window <dt>.
 */
var nextGroup = function(data, start, n, dt) {
  index = start;
  time = 8;
  t0 = data[index][time];
  maxIndex = data.length - n;
  groupSize = 1;
  while(groupSize < n && index < maxIndex) {
    nextEvent = data[index + groupSize];
    if(Math.abs(nextEvent[time] - t0) < dt) {
      // Then look for more events all within dt
      groupSize++;
    }
    else {
      // Then pick the next t0 and start again
      index++;
      groupSize = 1;
      t0 = data[index][time];
    }
  }
  return index;
};

var nextGroupHelp = function() {
  helpText = 'Display the next cluster of hits all within a given time window.';
  helpText += '\n\n';
  helpText += '- dt is the time window in microseconds\n';
  helpText += '- cluster_size is the number of hits required within dt\n';
  helpText += '- nhits is the number of hits to display\n';
  alert(helpText);
};

var gui = new dat.GUI();
var metadata = {
  'index': 0,
  'min_index': 0,
  'max_index': 1000,
  'nhits': 10,
  'cluster_size': 10,
  'dt': 100,
  'data': [[]],
  'next_nhits': function() {
    data = metadata.data;
    index = metadata.index + metadata.cluster_size;
    nhits = metadata.cluster_size;
    dt = metadata.dt * 1000;
    indexController = gui.__controllers[0];
    next_index = nextGroup(data, index, nhits, dt);
    metadata.max_index = next_index + 3*metadata.nhits;
    indexController.__max = metadata.max_index;
    metadata.min_index = next_index - 3*metadata.nhits;
    indexController.__min = metadata.min_index;
    metadata.index = next_index;
    for(var i in gui.__controllers) {
      gui.__controllers[i].updateDisplay();
    }
    clearObjects(hitMeshes);
    loadHits(metadata);
  },
  'camera': 'orthographic',
  'next_nhits_help': nextGroupHelp,
};
var gui_controls = {
  'reset': function() {
    reset_camera(cameras);
  }
};
var gui_colors = {
  'background': '#a7a7a7',
  'active_pixel': '#00ff00',
  'inactive_pixel': '#005500',
  '_background_color': function(x) { scene.background.set(x); },
  '_active_pixel_color': function(x) { activePixelPadMaterial.color.set(x); },
  '_inactive_pixel_color': function(x) { inactivePixelPadMaterial.color.set(x); },
  '_backup': {},
  '_reset': function() {
    for(key in gui_colors._backup) {
      gui_key = key.substr(1);
      gui_colors[gui_key] = gui_colors._backup[key];
      color_key = key + '_color';
      gui_colors[color_key](gui_colors[gui_key]);
    }
  },
  '_night': false
};
for(key in gui_colors) {
  if(key[0] == '_') { continue; }
  gui_colors._backup['_' + key] = gui_colors[key];
}
var hitMeshes = [];
var hitIndex = gui.add(metadata, 'index', 0, 1000000).step(1);
var nHits = gui.add(metadata, 'nhits', 0).step(1);
var clusterSize = gui.add(metadata, 'cluster_size', 0).step(1);
var dt = gui.add(metadata, 'dt').step(1);
var nextNhits = gui.add(metadata, 'next_nhits');
var minIndex = gui.add(metadata, 'min_index', 0, 1000000).step(1);
var maxIndex = gui.add(metadata, 'max_index', 0, 1000000).step(1);
var cameraSelector = gui.add(metadata, 'camera', ['orthographic', 'perspective']);
var cameraReseter = gui.add(gui_controls, 'reset');
var colorsFolder = gui.addFolder('Colors');
var color_background = colorsFolder.addColor(gui_colors, 'background').listen();
var color_active_pixel = colorsFolder.addColor(gui_colors, 'active_pixel').listen();
var color_inactive_pixel = colorsFolder.addColor(gui_colors, 'inactive_pixel').listen();
var isNight = colorsFolder.add(gui_colors, '_night').listen();
var colorReseter = colorsFolder.add(gui_colors, '_reset');
var nextNhitsHelp = gui.add(metadata, 'next_nhits_help');
hitIndex.onChange(function(newIndex) {
  clearObjects(hitMeshes);
  loadHits(metadata);
});
nHits.onChange(function(newNHits) {
  clearObjects(hitMeshes);
  loadHits(metadata);
});
minIndex.onChange(function(newMin) {
  gui.__controllers[0].__min = newMin;
});
maxIndex.onChange(function(newMax) {
  gui.__controllers[0].__max = newMax;
});
cameraSelector.onChange(function(newCamera) {
  camera = cameras[newCamera];
});
color_background.onChange(function(newColor) {
  scene.background = new THREE.Color(newColor);
});
color_active_pixel.onChange(function(newColor) {
  activePixelPadMaterial.color = new THREE.Color(newColor);
});
color_inactive_pixel.onChange(function(newColor) {
  inactivePixelPadMaterial.color = new THREE.Color(newColor);
});
isNight.onChange(function(night) {
  if(night) {
    newColor = '#272727'
  }
  else {
    newColor = '#a7a7a7'
  }
  gui_colors.background = newColor;
  gui_colors['_background_color'](newColor);
});

function clearObjects(objectsToClear) {
  while(objectsToClear.length > 0) {
    scene.remove(objectsToClear.pop());
  }
};

function placeText(text, position, fillColor, strokeColor, fontSize) {
  canvas = document.createElement('canvas');
  canvas.height = 100;
  canvas.width = 350;
  context = canvas.getContext('2d');
  context.font = fontSize + ' Arial';
  context.fillStyle = fillColor;
  context.strokeStyle = strokeColor;
  context.fillText(text, 30, 80);
  context.strokeText(text, 30, 80);
  texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  material = new THREE.MeshBasicMaterial({map: texture, side:THREE.DoubleSide});
  material.transparent = true;
  mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(canvas.width, canvas.height),
      material
      );
  scale = 0.05;
  mesh.scale.set(scale, scale, scale);
  mesh.position.set(position[0] + canvas.width/2 * scale, position[1], position[2]);
  spriteScene.add(mesh);

  return mesh;
};

function loadColorMap(scale, position) {
  nSwatches = 60;
  domain = scale.domain();
  low = domain[0];
  diff = domain[1] - low;
  delta = diff/(nSwatches-1);
  width = 6;
  height = 0.5;
  depth = 0.1;
  inputs = [];
  colors = [];
  materials = [];
  swatches = [];
  for(var i = 0; i < nSwatches; i++) {
    inputs.push(low + i*delta);
    colors.push(scale(inputs[i]).hex());
    materials.push(new THREE.SpriteMaterial({color: colors[i]}));
    swatches.push(new THREE.Sprite(materials[i]));
    swatches[i].position.set(position[0], position[1]+i*height, position[2]);
    swatches[i].scale.set(width, height, 1);
    swatches[i].transparent = false;
    spriteScene.add(swatches[i]);
  }
  mesh = placeText(low,
      [position[0] + width, position[1], position[2]],
      colors[0],
      colors[nSwatches-1],
      '80px'
  );
  mesh = placeText(low+diff,
      [position[0] + width, position[1] + nSwatches * height, position[2]],
      colors[nSwatches-1],
      colors[0],
      '80px'
  );
  mesh = placeText('mV',
      [position[0] - 3, position[1] + nSwatches*height + 5, position[2]],
      colors[Math.floor(nSwatches/2)],
      colors[Math.floor(nSwatches/2)],
      '80px'
  );

};
var adcScale = chroma.cubehelix()
  .lightness([0.1, 0.9])
  .start(300)
  .hue(2)
  .gamma(1)
  .rotations(-1).scale().domain([0, 100]);
loadColorMap(adcScale, [60, 0, 0]);
function loadHits(gui_metadata) {
  data = gui_metadata['data'];
  index = gui_metadata['index'];
  nhits = gui_metadata['nhits'];
  color_values = [];
  times = [];
  // Sort hits
  hits = data.slice(index, index + nhits);
  hits.sort(function(a, b) { return a[8] - b[8]; });
  for(var i = 0; i < hits.length; i++) {
    hit = hits[i];
    x = hit[3]/10.0;
    y = hit[4]/10.0;
    color_value = hit[10] - hit[11];
    time = hit[8] - hits[0][8];
    z = time/1000;
    hitMaterial = new THREE.MeshBasicMaterial({color: adcScale(color_value).hex()});
    hitGeometry = new THREE.CylinderGeometry(1, 1, 1);
    hitMesh = new THREE.Mesh(hitGeometry, hitMaterial);
    hitMesh.position.z = z;
    hitMesh.position.x = x+pixelOffset.x;
    hitMesh.position.y = y+pixelOffset.y;
    hitMesh.rotation.x = 3.14159/2;
    scene.add(hitMesh);
    hitMeshes.push(hitMesh);
    color_values.push(color_value);
    times.push(time);
  }
  console.log(color_values);
  console.log(times);
};

function animate() {
  requestAnimationFrame(animate);
  renderer.clear();
  renderer.render(scene, camera);
  renderer.clearDepth();
  renderer.render(spriteScene, spriteCamera);
};
animate();
