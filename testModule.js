class Anim {
    //Three stuff:
    elevationArray;
    container;
    scene;
    camera;
    renderer;
    ambLt;
    dirLt;
    spotLt;
    geometry;
    material;
    mesh;
    controls;
    palette;
    pointsDim;

    constructor(_elevArray, _pointDimension) {
        this.elevationArray = _elevArray;
        this.palette = {
            p1: {x: 0.61, y: 0.87, z: 0.33},
            p2: {x: 0.72, y: 0.51, z: 0.3},
            p3: {x: 0.38, y: 0.4, z: 0.74},
            p4: {x: 0.38, y: 0.36, z: 0.27},
        }
        this.pointsDim = _pointDimension;
    }

    init() {
        this.setScene();
        this.setCamera();
        this.setLights();
        this.buildRenderer();
        this.redBallAtOrigin();
        this.buildTerrainFromData();
        this.addOrbitControls();
        window.addEventListener("resize", this.onWindowResize);
        this.animate();
    }

    setScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xaaaaaa);
    }

    setCamera() {
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );
        this.camera.position.x = 87;
        this.camera.position.y = 45;
        this.camera.position.z = 87;
        this.scene.add(this.camera);
    }

    setLights() {
        this.ambLt = new THREE.AmbientLight(0xffffff, .25);
        this.scene.add(this.ambLt);
        this.dirLt = new THREE.DirectionalLight(0xffffff, .5);
        this.dirLt.position.set(10, 5, 0);
        this.scene.add(this.dirLt);
        this.spotLt = new THREE.SpotLight(0xffffff, 0.5);
        this.spotLt.position.set(0, 50, 0);
        this.spotLt.decay = 2.0;
        this.scene.add(this.spotLt);
    }

    buildRenderer() {
        this.renderer = new THREE.WebGLRenderer(
            {
                antialias: !0,
                alpha: !0
            })
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.autoClear = !1;
        this.renderer.setClearColor(0, 0);
        document.getElementById("wrapper").appendChild(this.renderer.domElement);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.render();
    }

    resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    render() {
        if (this.resizeRendererToDisplaySize(this.renderer)) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
        }
        this.updateScene();
        this.renderer.render(this.scene, this.camera);
    }

    updateScene() {
        this.controls.update();
    }

    redBallAtOrigin() {
        // right now we are just throwing a standard block animation into the canvas.
        // Later we will build terrain with elevationArray.  -  se function below
        //       geometry = new THREE.BoxGeometry(1, 1, 1);
        let geometry = new THREE.SphereGeometry(1);
        let material = new THREE.MeshPhongMaterial({
            color: "red",
            side: THREE.DoubleSide,
        });
        let mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        //console.log(scene);
    }

    buildTerrainFromData() {
        let elevScale = 2.0;
        let yShift = 20;
        let maxElev = Math.max(...this.elevationArray);
        let minElev = Math.min(...this.elevationArray);
        let elevDiff = maxElev - minElev;
        //resize elev data
        for (let i = 0; i < this.elevationArray.length; i++) {
            this.elevationArray[i] = (this.elevationArray[i] / 100.0) - (maxElev / 100.0);
        }
        // build
        let vertices = [];
        for (let i = 0; i < this.pointsDim - 1; i++) {
            for (let j = 0; j < this.pointsDim - 1; j++) {
                let idx = (i * this.pointsDim) + j;
                let cv = this.getPalletteSample(this.elevationArray[idx] / (maxElev - minElev), this.palette);
                let colVal = [cv.r, cv.g, cv.b];
                if (i === 1 && j === 1) {
                    colVal = [1, 0, 1];
                }

                vertices.push({
                    pos: [
                        i - this.pointsDim / 2,
                        this.elevationArray[i * this.pointsDim + j] * elevScale + yShift,
                        j - this.pointsDim / 2
                    ],
                    col: colVal,
                });
                vertices.push({
                    pos: [
                        i + 1 - this.pointsDim / 2,
                        this.elevationArray[(i + 1) * this.pointsDim + j] * elevScale + yShift,
                        j - this.pointsDim / 2,
                    ],
                    col: colVal,
                });
                vertices.push({
                    pos: [
                        i - this.pointsDim / 2,
                        this.elevationArray[i * this.pointsDim + (j + 1)] * elevScale + yShift,
                        j + 1 - this.pointsDim / 2,
                    ],
                    col: colVal,
                });
                vertices.push({
                    pos: [
                        i + 1 - this.pointsDim / 2,
                        this.elevationArray[(i + 1) * this.pointsDim + j] * elevScale + yShift,
                        j - this.pointsDim / 2,
                    ],
                    col: colVal,
                });
                vertices.push({
                    pos: [
                        i + 1 - this.pointsDim / 2,
                        this.elevationArray[(i + 1) * this.pointsDim + (j + 1)] * elevScale + yShift,
                        j + 1 - this.pointsDim / 2,
                    ],
                    col: colVal,
                });
                vertices.push({
                    pos: [
                        i - this.pointsDim / 2,
                        this.elevationArray[i * this.pointsDim + (j + 1)] * elevScale + yShift,
                        j + 1 - this.pointsDim / 2,
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

        let material = new THREE.MeshPhongMaterial({
            vertexColors: THREE.VertexColors,
            side: THREE.DoubleSide,
        });

        let mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
    }

    addOrbitControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.container);
        this.controls.minDistance = 5;
        this.controls.maxDistance = 1500;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 1;
    }

    getPalletteSample(t, palette) {
        // adapted from Inigio Quilez: https://iquilezles.org/articles/palettes/
        let re =
            palette.p1.x +
            palette.p2.x * Math.cos(2 * Math.PI * (palette.p3.x * t + palette.p4.x));
        let gr =
            palette.p1.y +
            palette.p2.y * Math.cos(2 * Math.PI * (palette.p3.y * t + palette.p4.y));
        let bl =
            palette.p1.z +
            palette.p2.z * Math.cos(2 * Math.PI * (palette.p3.z * t + palette.p4.z));
        let c = new THREE.Color(re, gr, bl);
        return c;
    }
}

