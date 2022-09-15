/*
builds a .05 x .05 degree "box" of elevation data based on user input of a position then
converts that grid into a 3d elevation animation.
posit should be the lat-long to 2 decimal places of the NW corner of the box.
lat should a decimal between -80 and 80 (>80 or <-80 will create confusing maps due to position near poles of earth)
longitude can be -180 to 180
get lat long of "box" from form using data entry and "calculate grid"
build array of data points for request
    run loops to request, parsing reply into array

displays terrain in 3d canvas with orbit controls with display map button
    build geometry array
    display

allows for saving maps with save button (glsl model)


*/

(function() {
    let coord = {lat: 37.500, long: 127.600}; // latitude and longitude to 2 decimal places
//    let elevMatrix = []; //{x: 0, y: 0, lat: coord.lat, long: coord.long, elev: 0}
    let url = "";
    let bod = "";

    function buildRequest(posit) { // posit is an object {latitude to 2 decimal places, longitude to 2 decimal places}
        url = "https://api.open-elevation.com/api/v1/lookup";
        let bodStr = '{"locations": [';
        for (let i = 0; i < 2; i ++) {
            for (let j = 0; j < 2; j ++) {
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
    //https://github.com/Jorl17/open-elevation/blob/master/docs/api.md
    //https://api.open-elevation.com/api/v1/lookup?locations=37.500,127.600


    // let elev = getElevationFromAPI(url, bod);
    // console.log(elev);



    async function getElevationFromAPI(url, data) {
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
            .then((response) => response.json())
            //.then ((data) => console.log(data))
            .catch(errorMsg => { console.log(errorMsg);});
        return resp;
    }

    buildRequest(coord);
    console.log(getElevationFromAPI(url, bod));

} ());
