import * as THREE from 'three';
import each from 'lodash/each';
import assign from 'lodash/assign';
import max from 'lodash/max';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import TWEEN from 'three/examples/jsm/libs/tween.module.js';

export default class Renderer {

  constructor(dimensions, options) {
    const { innerWidth, innerHeight, devicePixelRatio } = window;

    this.options = assign({
      dpi: devicePixelRatio,
      width: innerWidth,
      height: innerHeight,
      background: true,
      antialias: true,
      cubeSize: 5,
      animation: {
        duration: 200,
        easing: TWEEN.Easing.Cubic.InOut
      }
    }, options);

    this.dimensions = dimensions;
    this.setupScene()
      .setupCameraControls()
      .setupBackdrop()
      .setupLights();

    this.cubeVisuals = this.loadCubeVisuals();
    this.cubeContainer = new THREE.Object3D();
    this.scene.add(this.cubeContainer);
    this.scene.add(this.generateCubeContainer());

    this.animate();
  }

  setupScene = () => {
    const { antialias, dpi, width, height } = this.options;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias, logarithmicDepthBuffer: true });
    this.renderer.setPixelRatio(dpi);
    this.renderer.setSize(width, height);
    document.body.appendChild(this.renderer.domElement);
    return this;
  }

  setupCameraControls = () => {
    const { width, height } = this.options;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    // DEMO 5
    this.camera.position.z = max(this.dimensions) * 10;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableKeys = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.2;
    this.controls.enableZoom = true;
    return this;
  };

  setupBackdrop = () => {
    this.scene.background = new THREE.Color('white');

    // DEMO 1
    // if (this.options.background) {
    //   this.scene.background = new THREE.CubeTextureLoader().setPath('/images/skybox/')
    //     .load(['negx.jpg', 'posx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']);
    // } else {
    //   this.scene.background = new THREE.Color('white');
    // }
    return this;
  };

  setupLights = () => {
    this.scene.add(new THREE.AmbientLight('white', 5));

    // DEMO 2
    // const pointLight = new THREE.PointLight('white', 10000);
    // pointLight.position.set(10, 10, -20);
    // this.scene.add(pointLight);
    return this;
  };

  clearContainer = () => {
    this.cubeContainer.children = [];
    return this;
  };

  transformDirectionVector = (directionVector) => {
    return directionVector;

    // DEMO 4
    // const transformedDirection = new THREE.Vector3(...directionVector).applyQuaternion(this.camera.quaternion);

    // let maxValue = -Infinity, maxAxis = null;
    // ['x', 'y', 'z'].forEach((axis) => {
    //   const value = Math.abs(transformedDirection[axis]);
    //   const discardAxis = axis === 'z' && this.dimensions[2] === 1;
    //   if (!discardAxis && value >= maxValue) {
    //     maxValue = value;
    //     maxAxis = axis;
    //   }
    // });

    // const value = transformedDirection[maxAxis];
    // transformedDirection.x = transformedDirection.y = transformedDirection.z = 0;
    // transformedDirection[maxAxis] = value < 0 ? -1 : 1;
    // return [transformedDirection.x, transformedDirection.y, transformedDirection.z];
  };

  addCube = (cube) => {
    const { duration, easing } = this.options.animation;
    const { x, y, z, value, previousPosition, wasMerged, mergedFrom } = cube;
    const coords = this.positionToCoords(previousPosition || { x, y, z });

    const generatedCube = this.generateCube(this.cubeVisuals[value]);
    generatedCube.position.set(coords.x, coords.y, coords.z);

    if (mergedFrom) {
      mergedFrom.forEach((mergedCube) => {
        mergedCube.wasMerged = true;
        this.addCube(mergedCube);
      });
    }

    if (previousPosition) {
      window.requestAnimationFrame(() => {
        new TWEEN
          .Tween({
            x: coords.x,
            y: coords.y,
            z: coords.z
          })
          .to(this.positionToCoords(cube), duration)
          .easing(easing)
          .onUpdate(({ x, y, z }) => {
            generatedCube.position.set(x, y, z);
          })
          .onComplete(() => wasMerged && this.cubeContainer.remove(generatedCube))
          .start();
      });
    }
    else {
      const scale = 1.1, opacity = 0.5;
      const appearEndTween = new TWEEN.Tween({ scale, opacity })
        .to({ scale: 1, opacity: 1 }, duration)
        .easing(easing)
        .onUpdate(({ scale, opacity }) => {
          generatedCube.scale.set(scale, scale, scale);
          generatedCube.material.opacity = opacity;
        });

      new TWEEN
        .Tween({ scale: 0, opacity: 0 })
        .to({ scale, opacity }, duration)
        .easing(easing)
        .chain(appearEndTween)
        .onUpdate(({ scale, opacity }) => {
          generatedCube.scale.set(scale, scale, scale);
          generatedCube.material.opacity = opacity;
        })
        .start();
    }

    this.cubeContainer.add(generatedCube);
    return this;
  };

  update = (cubes) => {
    window.requestAnimationFrame(() => {
      this.clearContainer();
      cubes.forEach(this.addCube);
    });
    return this;
  };

  loadCubeVisuals = () => {
    const loader = new THREE.TextureLoader();
    const common = { shininess: 200, reflectivity: 0.7 };
    // DEMO 3
    // const common = { shininess: 200, reflectivity: 0.7, envMap: this.scene.background };
    // TODO: Better color palette
    const cubeVisuals = {
      2: { ...common, color: 'red' },
      4: { ...common, color: 'cyan' },
      8: { ...common, color: 'orange' },
      16: { ...common, color: 'green' },
      32: { ...common, color: 'purple' },
      64: { ...common, color: 'white' },
      128: { ...common, color: 'yellow' },
      256: { ...common, color: 'silver' },
      512: { ...common, color: 'red' },
      1024: { ...common, color: 'purple' },
      2048: { ...common, color: 'goldenrod' }
    };
    each(cubeVisuals, (data, i) => data.map = loader.load(`/images/cubes/${i}.jpg`));
    return cubeVisuals;
  };

  animate = (t) => {
    TWEEN.update(t);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(t => this.animate(t));
    return this;
  };

  positionToCoords = ({ x, y, z }) => {
    const { cubeSize } = this.options;
    const halfCubeSize = cubeSize / 2;
    const [width, height, depth] = this.dimensions;
    return {
      x: x * cubeSize - (cubeSize * (width / 2) - halfCubeSize),
      y: y * cubeSize - (cubeSize * (height / 2) - halfCubeSize),
      z: z * cubeSize - (cubeSize * (depth / 2) - halfCubeSize)
    };
  };

  generateCubeContainer = () => {
    const { cubeSize } = this.options;
    const [width, height, depth] = this.dimensions;

    const geometry = new THREE.BoxGeometry(
      width * cubeSize,
      height * cubeSize,
      depth * cubeSize
    );
    return new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 'black' })
    );
  };

  generateCube = (cubeVisuals) => {
    const { cubeSize } = this.options;
    // TODO: Cache and pool cubes
    return new THREE.Mesh(
      new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
      new THREE.MeshPhongMaterial(cubeVisuals)
    );
  };

}
