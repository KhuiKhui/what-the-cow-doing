import * as THREE from 'three';
import { spot } from './lights';

const axesHelper = new THREE.AxesHelper(10);
const sLightHelper = new THREE.SpotLightHelper(spot);

export { axesHelper, sLightHelper };
