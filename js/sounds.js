import * as THREE from 'three';
import { camera } from './camera';

const listener = new THREE.AudioListener();
camera.add(listener);
const audioLoader = new THREE.AudioLoader();

const moo1 = new THREE.Audio(listener);
audioLoader.load('moo.mp3', function (buffer) {
  moo1.setBuffer(buffer);
  moo1.setVolume(0.5);
});

const moo2 = new THREE.Audio(listener);
audioLoader.load('moo2.mp3', function (buffer) {
  moo2.setBuffer(buffer);
  moo2.setVolume(0.5);
});

const moo3 = new THREE.Audio(listener);
audioLoader.load('moo3.wav', function (buffer) {
  moo3.setBuffer(buffer);
  moo3.setVolume(0.5);
});

const moo4 = new THREE.Audio(listener);
audioLoader.load('moo4.wav', function (buffer) {
  moo4.setBuffer(buffer);
  moo4.setVolume(0.5);
});

const teleport = new THREE.Audio(listener);
audioLoader.load('teleport.mp3', function (buffer) {
  teleport.setBuffer(buffer);
  teleport.setVolume(0.4);
});

const crack = new THREE.Audio(listener);
audioLoader.load('crack.mp3', function (buffer) {
  crack.setBuffer(buffer);
  crack.setVolume(0.5);
});
export { moo1, moo2, moo3, moo4, teleport, crack };
