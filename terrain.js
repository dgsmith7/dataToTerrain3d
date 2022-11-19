function buildTerrain() {   // from Baconbits Terranium

    //  put all of your geometry and materials in here
    maxElev = 0;
    //  calculateNoiseGrid();
    let terrainData;// = calculateNoiseGridV2(0);
    lowerData = terrainData.grid;
    ldMax = terrainData.max;

    let vertices = [];

    for (let i = 0; i < width - 1; i++) {
        for (let j = 0; j < height - 1; j++) {
            if (maxElev < lowerData[i * height + j]) {
                maxElev = lowerData[i * height + j];
            }

            let cv = getPalletteSample(lowerData[i * height + j] / ldMax, pallette);
            let colVal = [cv.r, cv.g, cv.b];

            vertices.push({
                pos: [i - height / 2, lowerData[i * height + j], j - width / 2],
                col: colVal,
            });
            vertices.push({
                pos: [
                    i + 1 - height / 2,
                    lowerData[(i + 1) * height + j],
                    j - width / 2,
                ],
                col: colVal,
            });
            vertices.push({
                pos: [
                    i - height / 2,
                    lowerData[i * height + (j + 1)],
                    j + 1 - width / 2,
                ],
                col: colVal,
            });
            vertices.push({
                pos: [
                    i + 1 - height / 2,
                    lowerData[(i + 1) * height + j],
                    j - width / 2,
                ],
                col: colVal,
            });
            vertices.push({
                pos: [
                    i + 1 - height / 2,
                    lowerData[(i + 1) * height + (j + 1)],
                    j + 1 - width / 2,
                ],
                col: colVal,
            });
            vertices.push({
                pos: [
                    i - height / 2,
                    lowerData[i * height + (j + 1)],
                    j + 1 - width / 2,
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

    let geometry = new BufferGeometry();
    geometry.setAttribute(
        "position",
        new BufferAttribute(new Float32Array(positions), 3)
    );
    geometry.setAttribute(
        "color",
        new BufferAttribute(new Float32Array(colors), 3)
    );

    geometry.computeVertexNormals();

    material = new MeshPhongMaterial({
        vertexColors: VertexColors,
        side: DoubleSide,
    });

    let mesh = new InstancedMesh(geometry, material, 49);

    //  mesh.instanceMatrix.setUsage(DynamicDrawUsage);

    for (let i = 0; i < 49; i++) {
        dummy.position.set(
            Math.floor(i / 7) * (width - 1),
            0,
            Math.floor(i % 7) * (height - 1)
        );
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.position.x = -width * 3;
    mesh.position.y = 0;
    mesh.position.z = -height * 3;

    // let mesh2 = mesh.clone();
    // mesh2.position.y = -15;
    // tMap.add(mesh2);

    tMap.add(mesh);
    scene.add(tMap);
    mapID = tMap.uuid;
    //  console.log("Terrain built");
}