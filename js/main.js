var scene = new THREE.Scene();
var perspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var orthographicCamera = new THREE.OrthographicCamera(-window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 0.1, 1000);
var camera = perspectiveCamera;
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
var hitIndex = gui.add(metadata, 'index', 0, 1000).step(1);
var nHits = gui.add(metadata, 'nhits', 0, 1000).step(1);
var minIndex = gui.add(metadata, 'min_index', 0, 1000).step(1);
var maxIndex = gui.add(metadata, 'max_index', 0, 1000).step(1);
var cameraSelector = gui.add(metadata, 'camera', ['orthographic', 'perspective']);
hitIndex.onChange(function(newIndex) {
  loadHits(metadata);
});
nHits.onChange(function(newNHits) {
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

function loadHits(gui_metadata) {
  data = gui_metadata['data'];
  index = gui_metadata['index'];
  nhits = gui_metadata['nhits'];
  hitMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff});
  for(var i = 0; i < nhits && i + index < data.length; i++) {
    hit = data[index + i];
    x = hit[3]/10.0;
    y = hit[4]/10.0;
    adc = hit[7];
    time = hit[8] - data[index][8];
    hitMesh = new THREE.Mesh(pixelPadGeometry, hitMaterial);
    hitMesh.position.z = 10;
    hitMesh.position.x = x+pixelOffset.x;
    hitMesh.position.y = y+pixelOffset.y;
    hitMesh.rotation.x = 3.14159/2;
    scene.add(hitMesh);
  }
};

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};
animate();
