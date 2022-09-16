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
get lat long of "box" from form using data entry form
Fix up appearance of page
Allow user to "save" maps
Add screenshot button to make image of canvas

In progress:

Done:
build array of data points for request
Figure out API request
parse API result JSON, building elevation grid
Add Three JS structures to render animation
*/

(function() {
    //Three stuff:
    let container,
        scene,
        camera,
        renderer,
        ambLt,
        dirLt,
        spotLt,
        geometry,
        material,
        mesh,
        controls;

    //Other stuff:
    let coord = {lat: 37.500, long: 127.600}; // Battle of ChipYongNi - lat-long to 2 decimal places
    let elevMatrix = [];
    let url = "";
    let bod = "";
    let pointsDim = 50; // make a power of 10 please unless you wanna refactor
    let totalPoints = pointsDim * pointsDim;
    let gap = 0.05 / pointsDim;
     let pallette = {
         p1: { x: 0.61, y: 0.87, z: 0.33 },
         p2: { x: 0.72, y: 0.51, z: 0.3 },
         p3: { x: 0.38, y: 0.4, z: 0.74 },
         p4: { x: 0.38, y: 0.36, z: 0.27 },
     };

     function processForm() {
         for (let i = 0; i < 500; i += i) {
             console.log(i);
         }
     }

    function buildRequest(posit) { // posit is an object {latitude to 2 decimal places, longitude to 2 decimal places}
        url = "https://api.open-elevation.com/api/v1/lookup";
        let bodStr = '{"locations": [';
        for (let i = 0; i < pointsDim; i ++) {
            for (let j = 0; j < pointsDim; j ++) {
                let latitude = (posit.lat - (i*gap)).toFixed(3);
                let longitude = (posit.long + (j*gap)).toFixed(3);
                bodStr += '{"latitude": ' + latitude + ', "longitude": ' + longitude + '},'
            }
        }
        bodStr = bodStr.slice(0, bodStr.length-1);
        bodStr += ']}';
        console.log(url);
        console.log(bodStr);
        bod = JSON.parse(bodStr);
        console.log(bod);
    }

    //https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    async function getElevationFromAPI(url, input) {
        let elevArray = [];
        let resp = fetch(url, {
            method: 'POST',
 //           mode: 'no-cors',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(input)
        })
            .then((response) => (response.json()))
            .then ((data) => {
 //               console.log(data.results[0].elevation);  // elev for one point
                console.log("From inside: ");
                for(let i = 0; i < totalPoints; i++) {elevArray.push(data.results[i].elevation)};
                console.log(elevArray);
                init();
             })
            .catch(errorMsg => { console.log(errorMsg);});
        return elevArray;
    }

    function init() { // I want this to go only after data is fetched
        console.log("From outside: ");
        console.log("data is: " + elevMatrix);
        setScene();
        setCamera();
        setLights();
        buildRenderer();
        container = renderer.domElement;
        document.body.appendChild(container);
        // buildTerrain();
        buildTerrainFromData();
        addOrbitControls();
        window.addEventListener("resize", onWindowResize);
        animate();
    }

    function setScene() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
    }

    function setCamera() {
        camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );
        camera.position.x = 5;
        camera.position.y = 3;
        camera.position.z = 5;
        scene.add(camera);
    }

    function setLights() {
        ambLt = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambLt);
        dirLt = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLt.position.set(0, 15, 0);
        scene.add(dirLt);
        spotLt = new THREE.SpotLight(0xffffff, 0.5);
        spotLt.position.set(5, 1, 2);
        spotLt.decay = 2.0;
        scene.add(spotLt);
}

    function buildRenderer() {
        // trying to put renderer into a canvas I made instead of the one Three makes:
        // https://discourse.threejs.org/t/setting-up-renderers-canvas-element-by-html-id/13213
        let canv = document.getElementById("display");
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: canv
        });
        renderer.setSize(window.innerWidth, window.innerHeight, true);
        renderer.setPixelRatio(window.devicePixelRatio || 1);
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        updateScene();
        renderer.render(scene, camera);
    }

    function updateScene() {
        controls.update();
    }

    function buildTerrain() {
        // right now we are just throwing a standard block animation into the canvas.
        // Later we will build terrain with elevMatrix.  -  se funtion below
        geometry = new THREE.BoxGeometry(2, 2, 2);
        material = new THREE.MeshPhongMaterial({
            color: "purple",
            side: THREE.DoubleSide,
        });
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        console.log(scene);
    }

    function buildTerrainFromData() {
        let maxElev = Math.max(...elevMatrix);
        //resize elev data
        for (let i = 0; i < elevMatrix.length; i ++) {
            elevMatrix[i] /= 50.0;
        }
        console.log('After shift: ' + elevMatrix);
        // build
        let vertices = [];
        for (let i = 0; i < pointsDim - 1; i ++) {
            for (let j = 0; j < pointsDim - 1; j++) {
                let idx = (i * pointsDim) + j;
                let cv = getPalletteSample(elevMatrix[idx]/maxElev, pallette);
                let colVal = [cv.r, cv.g, cv.b];
                vertices.push({
                    pos: [i - pointsDim / 2, elevMatrix[i * pointsDim + j], j - pointsDim / 2],
                    col: colVal,
                });
                vertices.push({
                    pos: [
                        i + 1 - pointsDim / 2,
                        elevMatrix[(i + 1) * pointsDim + j],
                        j - pointsDim / 2,
                    ],
                    col: colVal,
                });
                vertices.push({
                    pos: [
                        i - pointsDim / 2,
                        elevMatrix[i * pointsDim + (j + 1)],
                        j + 1 - pointsDim / 2,
                    ],
                    col: colVal,
                });
                vertices.push({
                    pos: [
                        i + 1 - pointsDim / 2,
                        elevMatrix[(i + 1) * pointsDim + j],
                        j - pointsDim / 2,
                    ],
                    col: colVal,
                });
                vertices.push({
                    pos: [
                        i + 1 - pointsDim / 2,
                        elevMatrix[(i + 1) * pointsDim + (j + 1)],
                        j + 1 - pointsDim / 2,
                    ],
                    col: colVal,
                });
                vertices.push({
                    pos: [
                        i - pointsDim / 2,
                        elevMatrix[i * pointsDim + (j + 1)],
                        j + 1 - pointsDim / 2,
                    ],
                    col: colVal,
                });
            }
        }
        const positions = [];
        const colors = [];
        for (const vertex of vertices) {
            positions.push(...vertex.pos);
            colors.push(...vertex.col);
        }
        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(positions), 3)
        );
        geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(new Float32Array(colors), 3)
        );

        geometry.computeVertexNormals();

        material = new THREE.MeshPhongMaterial({
            vertexColors: THREE.VertexColors,
            side: THREE.DoubleSide,
        });

        let mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    }

    function addOrbitControls() {
        controls = new THREE.OrbitControls(camera, container);
        controls.minDistance = 5;
        controls.maxDistance = 1500;
        controls.autoRotate = true;
    }

    function getPalletteSample(t, pallette) {
        // adapted from Inigio Quilez: https://iquilezles.org/articles/palettes/
        let re =
            pallette.p1.x +
            pallette.p2.x * Math.cos(2 * Math.PI * (pallette.p3.x * t + pallette.p4.x));
        let gr =
            pallette.p1.y +
            pallette.p2.y * Math.cos(2 * Math.PI * (pallette.p3.y * t + pallette.p4.y));
        let bl =
            pallette.p1.z +
            pallette.p2.z * Math.cos(2 * Math.PI * (pallette.p3.z * t + pallette.p4.z));
        let c = new THREE.Color(re, gr, bl);
        return c;
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function showFormData() {
        console.log("Dumping form data.");
        console.log(document.getElementById("latitude").value);
        console.log(document.getElementById("longitude").value);
        console.log(document.getElementById("title").value);


    }

    async function go() {
         document.getElementById("locDataSubmitButton").onclick = showFormData;
         buildRequest(coord);
         elevMatrix = await getElevationFromAPI(url, bod);//.then(() => init());
        // moved init into success area of API call promise
    }

    go();

} ());
