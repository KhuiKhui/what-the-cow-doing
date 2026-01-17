import * as THREE from 'three';

const ambient = new THREE.AmbientLight(0xffffff);

const spot = new THREE.SpotLight(0xffffff);
spot.position.set(0, 30, 0);
spot.castShadow = true;
spot.intensity = 1.5;
spot.decay = 0;
spot.angle = 0.75;
spot.penumbra = 0.2;

export { ambient, spot };
