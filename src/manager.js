import assign from 'lodash/assign';
import throttle from 'lodash/throttle';
import isArray from 'lodash/isArray';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';
import each from 'lodash/each';
import times from 'lodash/times';
import range from 'lodash/range';
import fromPairs from 'lodash/fromPairs';
import reverse from 'lodash/fp/reverse';

import Grid from './grid';
import Cube from './cube';

const DIRECTION_VECTORS_MAPPINGS = [
  ['UP', [0, 1, 0]],
  ['RIGHT', [1, 0, 0]],
  ['DOWN', [0, -1, 0]],
  ['LEFT', [-1, 0, 0]],
  ['BACKWARD', [0, 0, -1]],
  ['FORWARD', [0, 0, 1]]
];

export default class Manager {

  static directionToVector = fromPairs(DIRECTION_VECTORS_MAPPINGS);
  static vectorToDirection = fromPairs(map(DIRECTION_VECTORS_MAPPINGS, reverse));

  constructor(Renderer, Controller, options) {
    this.options = assign({
      dimensions: [4, 4, 1],
      startCubesCount: 2,
      background: true
    }, options);

    this.dimensions = Manager.normalizeDimensions(this.options.dimensions);
    this.renderer = new Renderer(this.dimensions, this.options);
    this.controller = new Controller();
    this.grid = new Grid(this.dimensions);
    this.traversalGrid = this.buildTraversalGrid();

    this.start();
  }

  static normalizeDimensions(dims) {
    const normalizedDimensions = isArray(dims) ? dims : [dims, dims, dims];
    (normalizedDimensions.length === 2) && normalizedDimensions.push(1);
    return normalizedDimensions;
  }

  buildTraversalGrid = () => {
    const traversalGrid = {};
    each(Manager.directionToVector, vector => {
      traversalGrid[vector] = [];

      const traversal = map(this.dimensions, range);
      if (vector[0] === 1) traversal[0] = reverse(traversal[0]);
      if (vector[1] === 1) traversal[1] = reverse(traversal[1]);
      if (vector[2] === 1) traversal[2] = reverse(traversal[2]);

      traversal[2].forEach(z => {
        traversal[1].forEach(y => {
          traversal[0].forEach(x => {
            traversalGrid[vector].push({ x, y, z });
          });
        });
      });
    });

    return traversalGrid;
  };

  start = () => {
    const controllerEvent = this.controller.constructor.EVENT
    this.controller.on(controllerEvent, throttle(this.moveCubes, 300));
    return this.addStartCubes().updateRenderer();
  };

  clear = () => {
    // TODO: restart and stop method
    this.controller.clear();
    return this;
  }

  addStartCubes = () => {
    times(this.options.startCubesCount, this.addRandomCube);
    return this;
  };

  addRandomCube = () => {
    if (this.grid.hasAvailableCells()) {
      const value = Math.random() < 0.9 ? 2 : 4;
      const cube = new Cube(this.grid.findRandomAvailableCell(), value);
      this.grid.insert(cube);
    }
    return this;
  };

  prepareCubes = () => {
    this.grid.findOccupiedCells().forEach(cube => {
      cube.mergedFrom = null;
      cube.savePosition();
    });
    return this;
  };

  moveCube = (cube, position) => {
    this.grid.remove(cube);
    cube.updatePosition(position);
    this.grid.insert(cube);
    return this;
  };

  updateRenderer = () => {
    this.renderer.update(this.grid.findOccupiedCells());
    return this;
  };

  moveCubes = (direction) => {
    // TODO: cache all traversals
    this.prepareCubes();

    let moved = false;
    const directionVector = this.renderer.transformDirectionVector(Manager.directionToVector[direction]);
    this.traversalGrid[directionVector].forEach(position => {
      const cube = this.grid.getCellContent(position);
      if (!cube) return;

      const positions = this.findFurthestPosition(position, directionVector);
      const next = this.grid.getCellContent(positions.next);

      if (next && next.value === cube.value && !next.mergedFrom) {
        const merged = new Cube(next, cube.value * 2);
        merged.mergedFrom = [cube, next];
        this.grid.insert(merged);
        this.grid.remove(cube);
        cube.updatePosition(next);
      }
      else {
        this.moveCube(cube, positions.furthest);
      }

      moved = !isEqual(position, cube);
    });

    if (moved) {
      this.addRandomCube();
      this.updateRenderer();
    }
  };

  findFurthestPosition = (position, vector) => {
    let furthest;
    let next = position;

    do {
      furthest = next;
      next = {
        x: furthest.x + vector[0],
        y: furthest.y + vector[1],
        z: furthest.z + vector[2]
      };
    } while (this.grid.isWithinBounds(next) && this.grid.isCellAvailable(next));

    return { furthest, next };
  };
}
