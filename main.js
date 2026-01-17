import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { camera } from './js/camera';
import { axesHelper, sLightHelper } from './js/helpers';
import { ambient, spot } from './js/lights';
import { plane } from './js/environment';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

scene.add(ambient);
scene.add(spot);
scene.add(plane);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

scene.add(axesHelper);
scene.add(sLightHelper);

const cowUrl = new URL('./public/cow.glb', import.meta.url);
const assetLoader = new GLTFLoader();
assetLoader.load(
  cowUrl.href,
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);
    model.castShadow = true;
    model.receiveShadow = true;
    model.scale.set(0.5, 0.5, 0.5);
  },
  undefined,
  (error) => {
    console.error(error);
  },
);
function animate() {
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
