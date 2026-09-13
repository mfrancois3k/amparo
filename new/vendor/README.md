# Three.js stage bundle

Three.js 0.186.0 from the official npm `three` package (MIT; see THREE-LICENSE.txt).
Bundled with esbuild as an ES module, including GLTFLoader and its utility imports.
No runtime CDN or external requests. Source: https://www.npmjs.com/package/three/v/0.186.0

Exports used by encounter-stage.js: Scene, Group, PerspectiveCamera, WebGLRenderer,
Box3, Vector3, HemisphereLight, DirectionalLight, AnimationMixer,
SRGBColorSpace, ACESFilmicToneMapping, PCFSoftShadowMap, GLTFLoader.

Bundle entry re-exports Three from package/build/three.module.js and GLTFLoader
from package/examples/jsm/loaders/GLTFLoader.js. Build using esbuild --bundle
--minify --format=esm with alias `three` pointing to that package's three.module.js.
