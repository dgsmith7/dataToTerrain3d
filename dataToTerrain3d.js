// Phi Lambda - Data to Terrain 3d
// Original code by David G. Smith
// Sep 2022

/*
builds a .05 x .05 degree "box" of elevation data based on user input of a latitude and longitude position.
It then queries the Open Elevation API (https://open-elevation.com) for elevation data for the "box".
It then uses ThreeJS to build a 3d animation of the terrain for display in a canvas element.
The posit should be the lat-long to 2 decimal places of the NW corner of the box.
The latitude should a decimal between -89.5 and 89.5 ( points >80 or <-80 may create confusing maps due to position near poles of earth).
The longitude should a decimal between -179.49 to 179.49.

Attributions / References:
https://open-elevation.com
https://github.com/Jorl17/open-elevation/blob/master/docs/api.md
https://api.open-elevation.com/api/v1/lookup?locations=41.161758,-8.583933

Todo:
get lat long of "box" from form using data entry form
Fix up appearance of page
Allow user to "save" maps
Add screenshot button to make image of canvas

In progress:
Add Three JS structures to render animation

Done:
build array of data points for request
Figure out API request
parse API result JSON, building elevation grid
*/

(function() {
    //Three stuff:
    let container, scene, camera, renderer, ambLt, dirLT, spotLt, geometry, material, mesh, controls;

    //Other stuff:
    let coord = {lat: 37.500, long: 127.600}; // latitude and longitude to 2 decimal places
    let elevMatrix = [];
    let url = "";
    let bod = "";
    let resStr = "";

    function buildRequest(posit) { // posit is an object {latitude to 2 decimal places, longitude to 2 decimal places}
        url = "https://api.open-elevation.com/api/v1/lookup";
        let bodStr = '{"locations": [';
        for (let i = 0; i < 10; i ++) {
            for (let j = 0; j < 10; j ++) {
                let latitude = (posit.lat - (i/100.0)).toFixed(3);
                let longitude = (posit.long + (j/100.0)).toFixed(3);
                bodStr += '{"latitude": ' + latitude + ', "longitude": ' + longitude + '},'
//                elevMatrix.push({x: i, y: j, lat: latitude, long: longitude});
            }
        }
        bodStr = bodStr.slice(0,bodStr.length-1);
        bodStr += ']}';
        console.log(url);
        console.log(bodStr);
        bod = JSON.parse(bodStr);
        console.log(bod);
    }

    //https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

    async function getElevationFromAPI(url, data) {
        let elevArray = [];
        let resp = fetch(url, {
            method: 'POST',
 //           mode: 'same-origin',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((response) => (response.json()))
            .then ((data) => {
                console.log(data.results[0].elevation);
                for(let i = 0; i < 100; i++) {elevArray.push(data.results[i].elevation)};
                console.log(elevArray);
             })
            .catch(errorMsg => { console.log(errorMsg);});
        return elevArray;
    }

function init() {
    buildRequest(coord);
    elevMatrix = getElevationFromAPI(url, bod);
    setScene();
    setCamera();
    setLights();
    buildRenderer();
    container = renderer.domElement;
    document.body.appendChild(container);
    buildTerrain();
    addOrbitControls();
    window.addEventListener("resize", onWindowResize);
}

function animate() {

}

    init();
    animate();
} ());
