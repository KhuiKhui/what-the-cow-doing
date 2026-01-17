import * as THREE from 'three';
const planeGeometry = new THREE.PlaneGeometry(60, 100);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0x000000,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotateX(-0.5 * Math.PI);
plane.receiveShadow = true;

export { plane };
