import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { camera } from './camera';
import { renderer } from './setup';

export const orbit = new OrbitControls(camera, renderer.domElement);
