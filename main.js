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

const gui = new GUI();
const options = {
  scale: 1,
  x2: () => {
    changeScale(2, Easing.Elastic.Out);
  },
  'x0.5': () => {
    changeScale(0.5, Easing.Elastic.Out);
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

let currentScale = { ...cow.scale };
const scaleTween = new Tween(currentScale);

function changeScale(target, ease) {
  scaleTween
    .to({ x: target, y: target, z: target }, 1000)
    .easing(ease)
    .onUpdate((scale) => {
      if (cow) cow.scale.set(scale.x, scale.y, scale.z);
    })
    .start();
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
  scaleTween.update(time);
  currentScale = { ...cow.scale };
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
