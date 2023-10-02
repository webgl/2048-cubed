# 2048^3

> An interactive 3D cube version of 2048 in 3D

---

## Why 2048^3?

Because it’s 2048, but:

- Rendered in 3D
- Built to handle a 3D grid
- Developed with Three.js
  ... hence, 2048^3 cubed :)

## Installation

You can simply fork or clone (download); then follow the given commands.

```bash
  $ npm i
  $ npm start
```

## Usage

Once you've installed all of the dependencies and issued the command `npm start`, parcel will automatically fire up `localhost` and present you with the game.

The controls are as follows (refer to TODOs with upcoming features):

- WASD: Flips the cube around
- Arrows: Move the cubes to either left, right, up, or down
- <: Moves the cubes back (towards the back of the cube)
- ?: Moves the cubes forward (towards the front of the cube)

Additionally, `npm start` provides you with live reloading and compiling of the assets from the `src` directory to `dist`.

Some concepts that you may see through the code:

- Index refers to the position index of a flat array
- Position refers to the position of a cell/cube in a grid
- Coordinates refers to the coordinates of the cube in actual 3D space

## TODOs

I'll be adding more meshing features; that said, if you'd like a feature, let me know so that I'll try and implement it into future updates.

- Responsive: Ensure the application is responsive and adapts
- Gesture Support: Add touch and intuitive gesture support.
- Mobile Support: Make the game responsiveness to various resolutions.
- Optimizations: There are optimizations in the pipeline for faster traversals, data structures, and precomputing.
- Game Mechanics: Add scoring, leaderboards, and other game mechanics.
- Build support: Fix assets directory, compress output, etc.
- Different controllers: Different controllers (e.g. touchpad, VR, etc.).
- Different renderers: Add support for Babylon, CSS3D, SCG, etc.
- Documentation
