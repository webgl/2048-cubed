export default class Cube {

  constructor({ x, y, z }, value = 2) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.value = value;
    this.previousPosition = null;
    this.mergedFrom = null;
  }

  savePosition = () => {
    const { x, y, z } = this;
    // TODO: Clean up to use array
    this.previousPosition = { x, y, z };
    return this;
  };

  updatePosition = ({ x, y, z }) => {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  };

  get position() {
    return { x: this.x, y: this.y, z: this.z }
  }
}
