import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { FilmPass } from 'three/examples/jsm/Addons.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BloomPass } from 'three/examples/jsm/Addons.js';
import { renderer, scene } from './setup';
import { camera } from './camera';

const composer = new EffectComposer(renderer);
const renderModel = new RenderPass(scene, camera);

composer.addPass(renderModel);

export { composer };
