<script lang="ts">
    import { onMount } from "svelte";
    import { Canvas } from "./canvas";

    import frsc from '../assets/shaders/flat 3d/fragment.glsl?raw';
    import vsrc from '../assets/shaders/flat 3d/vertex.glsl?raw';
    import { Scene } from "./scene";

    let canvasElement: HTMLCanvasElement;
    let c: Canvas;
    let scene: Scene;

    onMount(() => {
        c = new Canvas(canvasElement, window.innerWidth, window.innerHeight);
        c.compileProgram(vsrc, frsc);

        c.addAttribute('vertexPosition', 3, c.gl.FLOAT, false, 0, 0, c.gl.ARRAY_BUFFER, true);
        c.addAttribute('vertexColor', 4, c.gl.FLOAT, false, 0, 0, c.gl.ARRAY_BUFFER, false);

        scene = new Scene();
        scene.init(c);

        c.render();
        update();
    });

    function update() {
        scene.update(c);
        c.render();

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