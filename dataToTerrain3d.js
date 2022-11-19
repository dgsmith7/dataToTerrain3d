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
Using my own old template for the Three stuff (for now): https://github.com/1ofx/templates/tree/main/threejs
Pulled my terrain generation code from 'Terranium' workup on Baconbits

Todo:
Allow user to "save" maps
Add screenshot button to make image of canvas
Palette
styling of page in general

In progress:
Lighting


Done:
get lat long of "box" from form using data entry form
modularize all of this
speed of autorotate?
build array of data points for request
Figure out API request
parse API result JSON, building elevation grid
Add Three JS structures to render animation
make canvas bg
*/


(function () {

    let origCoord = {lat: 37.500, long: 127.600}; // Battle of ChipYongNi - lat-long to 2 decimal places
    let coord = {lat: 37.500, long: 127.600}; // Battle of ChipYongNi - lat-long to 2 decimal places
    let titleStr = "The Battle of Chipyong-ni";
    let quadrant = [[], [], [], []];
    let elevationArray = [];
    let url = "";
    let bod = "";
    let pointsDim = 50;
    let totalPoints = pointsDim * pointsDim;
    let gap = 0.05 / pointsDim;

    function buildRequest(posit) { // posit is an object {latitude to 2 decimal places, longitude to 2 decimal places}
        url = "https://api.open-elevation.com/api/v1/lookup";
        let bodStr = '{"locations": [';
        for (let i = 0; i < pointsDim; i++) {
            for (let j = 0; j < pointsDim; j++) {
                let latitude = (posit.lat - (i * gap)).toFixed(3);
                let longitude = (posit.long + (j * gap)).toFixed(3);
                bodStr += '{"latitude": ' + latitude + ', "longitude": ' + longitude + '},'
            }
        }
        bodStr = bodStr.slice(0, bodStr.length - 1);
        bodStr += ']}';
        bod = JSON.parse(bodStr);
    }

    function getElevationFromAPI(url, input, idx) {
        fetch(url, {
            method: 'POST',
//               mode: 'no-cors',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(input)
        })
            .then((response) => {
                console.log("response - ", response);
//                console.log('response.data', response.data);
//                console.log("response.json() - ", response.json());
//                console.log('data', data);
                return response.json()
            })
            .then((data) => {
                console.log(data);
                //elevationArray = [];  // clear out old data from previous request
                for (let i = 0; i < totalPoints; i++) {
                    quadrant[idx].push(data.results[i].elevation)
                }
                ;
                console.log(quadrant[idx]);
            })
            .then(() => {
                if (idx === 0) {
                    coord = {
                        lat: origCoord.lat,
                        long: origCoord.long + .05
                    }
                    buildRequest(coord);// NE
                    getElevationFromAPI(url, bod, 1);
                }
            })
            .then(() => {
                if (idx === 1) {
                    coord = {
                        lat: origCoord.lat - .05,
                        long: origCoord.long
                    }
                    buildRequest(coord);// SW
                    getElevationFromAPI(url, bod, 2);
                }
            })
            .then(() => {
                if (idx === 2) {
                    coord = {
                        lat: origCoord.lat - .05,
                        long: origCoord.long + .05
                    }
                    buildRequest(coord);// SE
                    getElevationFromAPI(url, bod, 3);
                }
            })
            .then(() => {
                if (idx === 3) {
                    distribute();
                    let anim = new Anim(elevationArray, pointsDim * 2);
                    anim.init();
                }
            })
            .catch(errorMsg => {
                console.log(errorMsg);
            });
    }

    document.getElementById("locDataSubmitButton").onclick = buttonClicked;

    function buttonClicked() {
        let titleStr = document.getElementById("title").value
        let latPosit = Number(document.getElementById("latitude").value);
        let longPosit = Number(document.getElementById("longitude").value);
        let newPosit = {lat: latPosit, long: longPosit};
        document.querySelector("#titleDisplay").innerHTML = titleStr;
        document.querySelector("#locationDisplay").innerHTML = newPosit.lat + " - " + newPosit.long;
        buildAMap(newPosit);
    }

    function distribute() {
        for (let i = 0; i < pointsDim; i++) {
            for (let j = 0; j < pointsDim; j++) {
                elevationArray.push(quadrant[0][(i * pointsDim) + j])
            }
            for (let j = 0; j < pointsDim; j++) {
                elevationArray.push(quadrant[1][(i * pointsDim) + j])
            }
        }
        for (let i = 0; i < pointsDim; i++) {
            for (let j = 0; j < pointsDim; j++) {
                elevationArray.push(quadrant[2][(i * pointsDim) + j])
            }
            for (let j = 0; j < pointsDim; j++) {
                elevationArray.push(quadrant[3][(i * pointsDim) + j])
            }
        }
    }

    function buildAMap(posit) {
        buildRequest(posit);// NW
        getElevationFromAPI(url, bod, 0);
    }

    document.querySelector("#titleDisplay").innerHTML = titleStr;
    document.querySelector("#locationDisplay").innerHTML = coord.lat + " - " + coord.long;
    buildAMap(coord);

}());
