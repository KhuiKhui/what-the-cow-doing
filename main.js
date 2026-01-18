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
import { moo1, moo2, moo3, moo4, teleport, crack } from './js/sounds';
import { DragControls } from 'three/examples/jsm/Addons.js';

//SETUP
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const historyArr = [];

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
let cow = await loadGLTF();
scene.add(cow);
cow.name = 'cow';
cow.userData.draggable = true;

const cowCubeUrl = new URL('./public/cow-cube.glb', import.meta.url);
async function loadCubeGLTF() {
  let gltf = await assetLoader.loadAsync(cowCubeUrl.href);
  return gltf.scene;
}
let cowCube = await loadCubeGLTF();

const cowBallUrl = new URL('./public/cow-ball.glb', import.meta.url);
async function loadBallGLTF() {
  let gltf = await assetLoader.loadAsync(cowBallUrl.href);
  return gltf.scene;
}
let cowBall = await loadBallGLTF();
let currentScale = { ...cow.scale };
let settingsScaleTween = changeScale(2, 2, 2, Easing.Elastic.Out, 1000);
let scaleTween1 = changeScale(1.1, 1.1, 1.1, Easing.Elastic.out, 150);
let scaleTween2 = changeScale(1, 1, 1, Easing.Elastic.out, 150);

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
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
    moo4.play();
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
      teleport.play();
    }),
  );
  removeTween1.start();
  idleTween1.stop();
  cow.position.set(0, 0, 0);
}

let mixer;

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
    historyArr.unshift('x2');
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
    historyArr.unshift('x0.5');
  },

  stretchX: 1,
  stretchY: 1,
  stretchZ: 1,

  horizontal: () => {
    settingsScaleTween = changeScale(
      currentScale.x,
      currentScale.y,
      currentScale.z * 0.1,
      Easing.Exponential.Out,
      50,
    );
    settingsScaleTween.start();
    moo1.play();
    historyArr.unshift('horizontal squish');
  },

  vertical: () => {
    settingsScaleTween = changeScale(
      currentScale.x,
      currentScale.y * 0.1,
      currentScale.z,
      Easing.Exponential.Out,
      50,
    );
    settingsScaleTween.start();
    moo2.play();
    historyArr.unshift('vertical squish');
  },

  reset: async () => {
    scene.remove(cow);
    scene.remove(cowCube);
    scene.remove(cowBall);
    scene.add(cow);

    clickCnt = 0;

    settingsScaleTween = changeScale(1, 1, 1, Easing.Elastic.Out, 1000);
    settingsScaleTween.start();
    moo3.play();
    historyArr.unshift('reset');
  },

  cowball: async () => {
    if (scene.getObjectByName('cow')) {
      const cowToSphereUrl = new URL(
        './public/cow-to-ball.glb',
        import.meta.url,
      );
      async function loadAnimatedGLTF() {
        let gltf = await assetLoader.loadAsync(cowToSphereUrl.href);
        return gltf;
      }
      const cowToCubeGltf = await loadAnimatedGLTF();
      const cowToCube = cowToCubeGltf.scene;

      scene.add(cowToCube);
      mixer = new THREE.AnimationMixer(cowToCube);
      const clips = cowToCubeGltf.animations;

      const clip = clips[0];
      const action = mixer.clipAction(clip);

      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.play();

      crack.play();

      scene.remove(cow);
      mixer.addEventListener('finished', () => {
        scene.add(cowBall);
        scene.remove(cowToCube);
      });
      historyArr.unshift('cowball');
    }
  },

  'prison realm': async () => {
    if (scene.getObjectByName('cow')) {
      const cowToCubeUrl = new URL('./public/cow-to-cube.glb', import.meta.url);
      async function loadAnimatedGLTF() {
        let gltf = await assetLoader.loadAsync(cowToCubeUrl.href);
        return gltf;
      }
      const cowToCubeGltf = await loadAnimatedGLTF();
      const cowToCube = cowToCubeGltf.scene;

      scene.add(cowToCube);
      mixer = new THREE.AnimationMixer(cowToCube);
      const clips = cowToCubeGltf.animations;

      const clip = clips[0];
      const action = mixer.clipAction(clip);

      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.play();

      crack.play();

      scene.remove(cow);
      mixer.addEventListener('finished', () => {
        scene.add(cowCube);
        scene.remove(cowToCube);
      });
      historyArr.unshift('prison realm');
    }
  },
  idle: false,
};

const idleTween1 = changePos(
  cow.position.x,
  cow.position.y + 3,
  cow.position.z,
  Easing.Cubic.InOut,
  1500,
);
idleTween1.repeat(Infinity);
idleTween1.yoyo(true);
idleTween1.delay(20);
// const removeTween2 = changeScale(0, 0, 0, Easing.Exponential.In, 100);
function idleCow() {
  idleTween1.start();
}
const general = gui.addFolder('General');
general.add(options, 'idle').onChange((e) => {
  if (e) idleCow();
  else {
    idleTween1.yoyo(false);
    idleTween1.repeat(0);
  }
});

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

function changePos(x, y, z, ease, duration) {
  return new Tween({ ...cow.position })
    .to({ x: x, y: y, z: z }, duration)
    .easing(ease)
    .onUpdate((pos) => {
      cow.position.set(pos.x, pos.y, pos.z);
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

const squishing = gui.addFolder('Squishing');
squishing.add(options, 'horizontal');
squishing.add(options, 'vertical');

const morph = gui.addFolder('Morphing');
morph.add(options, 'cowball');
morph.add(options, 'prison realm');
gui.add(options, 'reset');

function updateHtml() {
  document.getElementsByName('clicks')[0].innerHTML =
    `clicks until destruction: ${10 - clickCnt}`;
  document.getElementsByName('position')[0].innerHTML =
    `current position: (${cow.position.x}, ${cow.position.y}, ${cow.position.z})`;
  document.getElementsByName('scale')[0].innerHTML =
    `current scale: (${cow.scale.x}, ${cow.scale.y}, ${cow.scale.z})`;
  document.getElementsByName('rotation')[0].innerHTML =
    `current rotation: (${cow.rotation.x}, ${cow.rotation.y}, ${cow.rotation.z})`;
  document.getElementsByName('history')[0].innerHTML =
    `history: ${historyArr.map((history) => ' ' + history)}`;
}

const clock = new THREE.Clock();
function animate(time) {
  updateHtml();
  if (mixer) mixer.update(clock.getDelta());
  if (historyArr.length >= 4) historyArr.pop();
  settingsScaleTween.update(time);
  scaleTween1.update(time);
  scaleTween2.update(time);
  removeTween1.update(time);
  removeTween2.update(time);
  idleTween1.update(time);
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
