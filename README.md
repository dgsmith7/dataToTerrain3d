# dataToTerrain3d

// Phi Lambda - Data to Terrain 3d
// Original code by David G. Smith
// Sep 2022

Builds a .05 x .05 degree "box" of elevation data based on user input of a latitude and longitude position.
It then queries the Open Elevation API (https://open-elevation.com) for elevation data for the "box".
It then uses ThreeJS to build a 3d animation of the terrain for display in a canvas element.
By the way - Phi = Latitude, Lambda = Longitude.

I added a github pages deployment for this too. See the side menus on this repo.

TODO
CSS Grid
Rerack API querie for a higher density grid.  (multiple queries combined will accomplish)
Improve form
Improve readme