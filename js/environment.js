import * as THREE from 'three';
const planeGeometry = new THREE.PlaneGeometry(30, 50);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotateX(-0.5 * Math.PI);
plane.receiveShadow = true;

export { plane };
