import map from 'lodash/map';
import each from 'lodash/each';
import reverse from 'lodash/fp/reverse';
import fromPairs from 'lodash/fromPairs';

const KEYDOWN = 'keydown';
const KEY_MAPPINGS = [
  ['LEFT', 37],
  ['UP', 38],
  ['RIGHT', 39],
  ['DOWN', 40],
  ['BACKWARD', 190],
  ['FORWARD', 191]
];

export default class Controller {

  static directionToKeycode = fromPairs(KEY_MAPPINGS);
  static keycodeToDirection = fromPairs(map(KEY_MAPPINGS, reverse));
  static EVENT = 'MOVE_CUBES';

  constructor() {
    this.events = {};
    this.start();
  }

  start = () => {
    document.addEventListener(KEYDOWN, this._initListener);
    return this;
  };

  clear = () => {
    document.removeEventListener(KEYDOWN, this._initListener);
    return this;
  };

  on = (e, cb) => {
    if (!this.events[e]) {
      this.events[e] = [];
    }
    this.events[e].push(cb);
    return this;
  };

  emit = (e, data) => {
    each(this.events[e], (cb) => cb(data));
    return this;
  };

  _initListener = (e) => {
    const direction = Controller.keycodeToDirection[e.which];
    if (direction) {
      e.preventDefault();
      this.emit(Controller.EVENT, direction);
    }
    return this
  };
}
