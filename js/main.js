var scene = new THREE.Scene();
var perspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var orthographicCamera = new THREE.OrthographicCamera(-window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 0.1, 1000);
var camera = orthographicCamera;
var cameras = {'orthographic': orthographicCamera, 'perspective': perspectiveCamera};
perspectiveCamera.position.z = 80;
orthographicCamera.position.z = 80;
orthographicCamera.zoom = 5;
orthographicCamera.updateProjectionMatrix();

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var pixelPadGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1);
var activePixelPadMaterial = new THREE.MeshBasicMaterial({color:0x00ff00});
var inactivePixelPadMaterial = new THREE.MeshBasicMaterial({color:0x005500});

scene.background = new THREE.Color(0xa7a7a7);
perspectiveControls = new THREE.OrbitControls(perspectiveCamera, renderer.domElement);
orthographicControls = new THREE.OrbitControls(orthographicCamera, renderer.domElement);

var pixelOffset = {'x': -100, 'y': -100};

$.get('sensor_plane_28_simple.txt', function(rawPixelGeometry) {
  pixelGeometry = jsyaml.load(rawPixelGeometry);
  pixels = pixelGeometry['pixels'];
  chips = pixelGeometry['chips'];
  activePixels = [].concat(chips[0][1], chips[1][1], chips[2][1], chips[3][1]);
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


$.getJSON('test.json', function(data) {
  metadata['data'] = data;
  loadHits(metadata);
  gui.__controllers[0].__max = data.length;
  gui.__controllers[2].__max = data.length;
  gui.__controllers[3].__max = data.length;
});

var gui = new dat.GUI();
var metadata = {
  'index': 0,
  'min_index': 0,
  'max_index': 1000,
  'nhits': 10,
  'data': [[]],
  'camera': 'orthographic'
};
var hitMeshes = [];
var hitIndex = gui.add(metadata, 'index', 0, 1000).step(1);
var nHits = gui.add(metadata, 'nhits', 0, 1000).step(1);
var minIndex = gui.add(metadata, 'min_index', 0, 1000).step(1);
var maxIndex = gui.add(metadata, 'max_index', 0, 1000).step(1);
var cameraSelector = gui.add(metadata, 'camera', ['orthographic', 'perspective']);
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
  mesh.position.set(position[0] + canvas.width*scale/2, position[1], position[2]);
  scene.add(mesh);
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
  swatchGeometry = new THREE.BoxGeometry(width, height, depth);
  inputs = [];
  colors = [];
  materials = [];
  swatches = [];
  for(var i = 0; i < nSwatches; i++) {
    inputs.push(low + i*delta);
    colors.push(scale(inputs[i]).hex());
    materials.push(new THREE.MeshBasicMaterial({color: colors[i]}));
    swatches.push(new THREE.Mesh(swatchGeometry, materials[i]));
    swatches[i].position.set(position[0], position[1]+i*height, position[2]);
    scene.add(swatches[i]);
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
  mesh = placeText('ADCs',
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
  .rotations(-1).scale().domain([30, 64]);
loadColorMap(adcScale, [60, 0, 0]);
function loadHits(gui_metadata) {
  data = gui_metadata['data'];
  index = gui_metadata['index'];
  nhits = gui_metadata['nhits'];
  adcs = [];
  times = [];
  for(var i = 0; i < nhits && i + index < data.length; i++) {
    hit = data[index + i];
    x = hit[3]/10.0;
    y = hit[4]/10.0;
    adc = hit[7];
    time = hit[8] - data[index][8];
    z = time/1000;
    hitMaterial = new THREE.MeshBasicMaterial({color: adcScale(adc).hex()});
    hitGeometry = new THREE.CylinderGeometry(1, 1, 1);
    hitMesh = new THREE.Mesh(hitGeometry, hitMaterial);
    hitMesh.position.z = z;
    hitMesh.position.x = x+pixelOffset.x;
    hitMesh.position.y = y+pixelOffset.y;
    hitMesh.rotation.x = 3.14159/2;
    scene.add(hitMesh);
    hitMeshes.push(hitMesh);
    adcs.push(adc);
    times.push(time);
  }
  console.log(adcs);
  console.log(times);
};

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};
animate();
