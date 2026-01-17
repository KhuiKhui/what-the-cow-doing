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
// scene.add(axesHelper);
// scene.add(sLightHelper);

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
let settingsScaleTween = changeScale(2, 2, 2, Easing.Elastic.Out, 1000);
let scaleTween1 = changeScale(1.1, 1.1, 1.1, Easing.Elastic.out, 150);
let scaleTween2 = changeScale(1, 1, 1, Easing.Elastic.out, 150);

let clickCnt = 0;
function onCowClick(e) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObject(scene.getObjectByName('cow'));

  if (intersects.length > 0) {
    scaleTween1 = changeScale(
      currentScale.x * 1.1,
      currentScale.y * 1.1,
      currentScale.z * 1.1,
      Easing.Elastic.out,
      50,
    ); // why is it 50 wtf?????????????
    scaleTween2 = changeScale(
      currentScale.x,
      currentScale.y,
      currentScale.z,
      Easing.Elastic.out,
      50,
    );
    scaleTween1.chain(scaleTween2);
    scaleTween1.start();

    clickCnt++;
  }
}

const removeTween1 = changeScale(
  currentScale.x * 1.5,
  currentScale.y * 1.5,
  currentScale.z * 1.5,
  Easing.Exponential.Out,
  400,
);
const removeTween2 = changeScale(0, 0, 0, Easing.Exponential.In, 100);
function removeCow() {
  removeTween1.chain(
    removeTween2.onComplete(() => {
      scene.remove(cow);
    }),
  );
  removeTween1.start();
}

const gui = new GUI();
const options = {
  scale: 1,
  x2: () => {
    settingsScaleTween = changeScale(
      Math.min(currentScale.x * 2, 2),
      Math.min(currentScale.y * 2, 2),
      Math.min(currentScale.z * 2, 2),
      Easing.Elastic.Out,
      1000,
    );
    settingsScaleTween.start();
  },
  'x0.5': () => {
    settingsScaleTween = changeScale(
      currentScale.x * 0.5,
      currentScale.y * 0.5,
      currentScale.z * 0.5,
      Easing.Elastic.Out,
      1000,
    );
    settingsScaleTween.start();
  },

  stretchX: 1,
  stretchY: 1,
  stretchZ: 1,

  reset: () => {
    if (cow) scene.remove(cow);
    scene.add(cow);
    settingsScaleTween = changeScale(1, 1, 1, Easing.Elastic.Out, 1000);
    settingsScaleTween.start();
  },
};

const scaling = gui.addFolder('Scaling');
scaling.add(options, 'scale', 0, 2).onChange((e) => {
  cow.scale.set(e, e, e);
});
scaling.add(options, 'x2');
scaling.add(options, 'x0.5');

function changeScale(x, y, z, ease, duration) {
  return new Tween(currentScale)
    .to({ x: x, y: y, z: z }, duration)
    .easing(ease)
    .onUpdate((scale) => {
      cow.scale.set(scale.x, scale.y, scale.z);
    });
}

const stretching = gui.addFolder('Stretching');
stretching.add(options, 'stretchX', 0, 2).onChange((e) => {
  cow.scale.set(e, currentScale.y, currentScale.z);
});
stretching.add(options, 'stretchY', 0, 2).onChange((e) => {
  cow.scale.set(currentScale.x, e, currentScale.z);
});
stretching.add(options, 'stretchZ', 0, 2).onChange((e) => {
  cow.scale.set(currentScale.x, currentScale.y, e);
});

gui.add(options, 'reset');

function animate(time) {
  settingsScaleTween.update(time);
  scaleTween1.update(time);
  scaleTween2.update(time);
  removeTween1.update(time);
  removeTween2.update(time);
  currentScale = { ...cow.scale };

  if (clickCnt >= 10) {
    removeCow();
    clickCnt = 0;
  }

  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('click', onCowClick);
