<script lang="ts">
    import { onMount } from "svelte";
    import { Canvas, UniformType } from "./canvas";

    import frsc from '../assets/shaders/flat 3d/fragment.glsl?raw';
    import vsrc from '../assets/shaders/flat 3d/vertex.glsl?raw';

    import fsrc_sky from '../assets/shaders/skybox/fragment.glsl?raw';
    import vsrc_sky from '../assets/shaders/skybox/vertex.glsl?raw';

    import ascii_src from '../assets/ascii.png';
    import nx_src from '../assets/nx.png';
    import ny_src from '../assets/ny.png';
    import nz_src from '../assets/nz.png';
    import px_src from '../assets/px.png';
    import py_src from '../assets/py.png';
    import pz_src from '../assets/pz.png';

    import nz_2_src from '../assets/ulukai/corona_bk.png';
    import ny_2_src from '../assets/ulukai/corona_dn.png';
    import pz_2_src from '../assets/ulukai/corona_ft.png';
    import px_2_src from '../assets/ulukai/corona_lf.png';
    import nx_2_src from '../assets/ulukai/corona_rt.png';
    import py_2_src from '../assets/ulukai/corona_up.png';

    import nz_3_src from '../assets/ulukai/redeclipse_bk.png';
    import ny_3_src from '../assets/ulukai/redeclipse_dn.png';
    import pz_3_src from '../assets/ulukai/redeclipse_ft.png';
    import px_3_src from '../assets/ulukai/redeclipse_lf.png';
    import nx_3_src from '../assets/ulukai/redeclipse_rt.png';
    import py_3_src from '../assets/ulukai/redeclipse_up.png';

    import { Scene } from "./scene";

    let cubemap: HTMLImageElement[];
    let cubemap2: HTMLImageElement[];
    let cubemap3: HTMLImageElement[];
    let ascii: HTMLImageElement;
    let canvasElement: HTMLCanvasElement;
    let c: Canvas;
    let scene: Scene;
    let images_loaded = false;

    async function loadImages() {
        const nx = new Image();
        const ny = new Image();
        const nz = new Image();
        const px = new Image();
        const py = new Image();
        const pz = new Image();

        const nx2 = new Image();
        const ny2 = new Image();
        const nz2 = new Image();
        const px2 = new Image();
        const py2 = new Image();
        const pz2 = new Image();

        const nx3 = new Image();
        const ny3 = new Image();
        const nz3 = new Image();
        const px3 = new Image();
        const py3 = new Image();
        const pz3 = new Image();

        cubemap = [nx, ny, nz, px, py, pz];
        cubemap2 = [nx2, ny2, nz2, px2, py2, pz2];
        cubemap3 = [nx3, ny3, nz3, px3, py3, pz3];

        nx.src = nx_src;
        ny.src = ny_src;
        nz.src = nz_src;
        px.src = px_src;
        py.src = py_src;
        pz.src = pz_src;
        nx2.src = nx_2_src;
        ny2.src = ny_2_src;
        nz2.src = nz_2_src;
        px2.src = px_2_src;
        py2.src = py_2_src;
        pz2.src = pz_2_src;
        nx3.src = nx_3_src;
        ny3.src = ny_3_src;
        nz3.src = nz_3_src;
        px3.src = px_3_src;
        py3.src = py_3_src;
        pz3.src = pz_3_src;
        

        ascii = new Image();
        ascii.src = ascii_src;
    }

    onMount(() => {
        c = new Canvas(canvasElement, window.innerWidth, window.innerHeight);
        c.compileProgram('f3d', vsrc, frsc);
        c.compileProgram('sky', vsrc_sky, fsrc_sky);

        c.addAttribute('screenPosition', 'sky', 2, c.gl.FLOAT, false, 0, 0, c.gl.ARRAY_BUFFER, true);

        c.addAttribute('vertexPosition', 'f3d', 3, c.gl.FLOAT, false, 0, 0, c.gl.ARRAY_BUFFER, true);
        c.addAttribute('vertexColor', 'f3d', 4, c.gl.FLOAT, false, 0, 0, c.gl.ARRAY_BUFFER, false);
        c.addAttribute('vertexNormal', 'f3d', 3, c.gl.FLOAT, false, 0, 0, c.gl.ARRAY_BUFFER, false);
        
        c.addUniform('ascii', 'f3d', UniformType.Texture2D, 0)
        c.addUniform('ascii', 'sky', UniformType.Texture2D, 0)
        c.addUniform('skybox', 'sky', UniformType.CubeMap, 0);
        c.addUniform('skybox2', 'sky', UniformType.CubeMap, 1);
        c.addUniform('skybox3', 'sky', UniformType.CubeMap, 2);
        c.addUniform('time', 'sky', UniformType.Float, 1);

        loadImages();

        c.uniformData('skybox', 'sky', 1, cubemap);
        c.uniformData('skybox2', 'sky', 2, cubemap2);
        c.uniformData('skybox3', 'sky', 3, cubemap3);
        c.uniformData('time', 'sky', 0);
        c.uniformData('ascii', 'sky', 0, ascii);
        c.uniformData('ascii', 'f3d', 0, ascii);

        scene = new Scene();
        scene.init(c);

        c.render();
        update();
    });

    function update() {
        scene.update(c);
        c.render();
        c.uniformData('ascii', 'sky', 0, ascii);
        c.uniformData('ascii', 'f3d', 0, ascii);

        if (!images_loaded && cubemap3[5].complete) {
            c.uniformData('skybox', 'sky', 1, cubemap);
            c.uniformData('skybox2', 'sky', 2, cubemap2);
            c.uniformData('skybox3', 'sky', 3, cubemap3);
            images_loaded = true;
        }

        requestAnimationFrame(update);
    }
</script>

<canvas id='canvas' bind:this={canvasElement}></canvas>

<style>
    canvas {
        margin: 0;
        position: absolute;
        top: 0;
        left: 0;
        z-index: -100;
    }
</style>