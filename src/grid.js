import sample from 'lodash/sample';
import compact from 'lodash/compact';
import inRange from 'lodash/inRange';
import fill from 'lodash/fill';


export default class Grid {

  constructor(dimensions) {
    this.dimensions = dimensions;
    this.cells = Grid.buildFlatArray(dimensions);
  }

  // build a 1D array given 3D dimensions
  static buildFlatArray(dimensions) {
    const [width, height, depth] = dimensions;
    return fill(Array(width * height * depth), null)
  };

  isCellAvailable = (cell) => !this.isCellOccupied(cell);

  isCellOccupied = (cell) => !!this.getCellContent(cell);

  hasAvailableCells = () => !!this.findAvailableCells().length;;

  findOccupiedCells = () => compact(this.cells);

  findRandomAvailableCell = () => sample(this.findAvailableCells());

  getCellContent = (cell) => this.isWithinBounds(cell) && this.cells[this.positionToIndex(cell)];

  findAvailableCells = () => {
    const cells = [];
    this.forEachCell((x, y, z, cube) => {
      !cube && cells.push({ x, y, z });
    });
    return cells;
  };

  indexToPosition = (position) => {
    const [width, height, depth] = this.dimensions;
    const doubleSize = width * height;
    const x = position % width;
    const y = ((position - x) / width) % height;
    // TODO: Validate depth usage
    const z = ((position - x - (y * height)) / doubleSize) % doubleSize;
    return { x, y, z };
  };

  positionToIndex = ({ x, y, z }) => {
    // TODO: Validate depth usage
    const [width, height, depth] = this.dimensions;
    return x + (y * height) + (z * width * height);
  };

  forEachCell = (cb) => {
    this.cells.forEach((cell, position) => {
      const { x, y, z } = this.indexToPosition(position);
      cb(x, y, z, cell);
    });
    return this;
  };

  insert = (cube) => {
    const position = this.positionToIndex(cube);
    this.cells[position] = cube;
    return this;
  };

  remove = (cube) => {
    const position = this.positionToIndex(cube);
    this.cells[position] = null;
    return this;
  };

  isWithinBounds = (position) => {
    const { x, y, z } = position;
    const [width, height, depth] = this.dimensions;
    return inRange(x, 0, width) && inRange(y, 0, height) && inRange(z, 0, depth);
  };
}

