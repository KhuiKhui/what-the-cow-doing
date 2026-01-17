import * as THREE from 'three';
import { Tween, Easing } from '@tweenjs/tween.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import GUI from 'lil-gui';
import { camera } from './js/camera';
import { axesHelper, sLightHelper } from './js/helpers';
import { ambient, spot } from './js/lights';
import { plane } from './js/environment';
import { scene, renderer } from './js/setup';
import { orbit } from './js/orbit';

//SETUP
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//SCENE ADD
scene.add(ambient);
scene.add(spot);
scene.add(plane);
scene.add(axesHelper);
scene.add(sLightHelper);

orbit.update();

const cowUrl = new URL('./public/cow.glb', import.meta.url);
const assetLoader = new GLTFLoader();
async function loadGLTF() {
  let gltf = await assetLoader.loadAsync(cowUrl.href);
  return gltf.scene;
}
const cow = await loadGLTF();
scene.add(cow);
cow.name = 'cow';

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

let currentScale = { ...cow.scale };
let settingsScaleTween = changeScale(2, Easing.Elastic.Out, 1000);
let scaleTween1 = changeScale(1.1, Easing.Elastic.out, 150);
let scaleTween2 = changeScale(1, Easing.Elastic.out, 150);

function onCowClick(e) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObject(scene.getObjectByName('cow'));

  if (intersects.length > 0) {
    scaleTween1 = changeScale(1.1, Easing.Elastic.out, 50); // why is it 50 wtf?????????????
    scaleTween2 = changeScale(1, Easing.Elastic.out, 50);
    scaleTween1.chain(scaleTween2);
    scaleTween1.start();
  }
}

const gui = new GUI();
const options = {
  scale: 1,
  x2: () => {
    settingsScaleTween = changeScale(2, Easing.Elastic.Out, 1000);
    settingsScaleTween.start();
  },
  'x0.5': () => {
    settingsScaleTween = changeScale(0.5, Easing.Elastic.Out, 1000);
    settingsScaleTween.start();
  },

  stretchX: 1,
  stretchY: 1,
  stretchZ: 1,
};

const scaling = gui.addFolder('Scaling');
scaling.add(options, 'scale', 0, 2).onChange((e) => {
  cow.scale.set(e, e, e);
});
scaling.add(options, 'x2');
scaling.add(options, 'x0.5');

function changeScale(target, ease, duration) {
  return new Tween(currentScale)
    .to({ x: target, y: target, z: target }, duration)
    .easing(ease)
    .onUpdate((scale) => {
      if (cow) cow.scale.set(scale.x, scale.y, scale.z);
    });
}

const stretching = gui.addFolder('Stretching');
stretching.add(options, 'stretchX', 0, 2).onChange((e) => {
  cow.scale.set(e, cow.scale.y, cow.scale.z);
});
stretching.add(options, 'stretchY', 0, 2).onChange((e) => {
  cow.scale.set(cow.scale.z, e, cow.scale.z);
});
stretching.add(options, 'stretchZ', 0, 2).onChange((e) => {
  cow.scale.set(cow.scale.x, cow.scale.y, e);
});

function animate(time) {
  settingsScaleTween.update(time);
  scaleTween1.update(time);
  scaleTween2.update(time);
  currentScale = { ...cow.scale };
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('click', onCowClick);
