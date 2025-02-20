import { Camera } from "./camera";
import type { Canvas } from "./canvas";
import { generateSector } from "./generate";

export class Scene {
    time: number
    camera: Camera
    vertex_data: Float32Array
    vertex_color_data: Float32Array
    sector_vertex: Float32Array[]
    sector_color: Float32Array[]

    constructor() {
        this.time = 0;
        this.camera = new Camera();
        this.vertex_data = new Float32Array();
        this.vertex_color_data = new Float32Array();
        this.sector_vertex = [];
        this.sector_color = [];
    }

    init(canvas: Canvas) {
        this.camera.init(canvas);
        const floor = generateSector(15, 15, 20);
        this.sector_vertex.push(floor[0]);
        this.sector_color.push(floor[1]);
        this.vertex_data = floor[0];
        this.vertex_color_data = floor[1];
        canvas.attributeData('vertexPosition', this.vertex_data);
        canvas.attributeData('vertexColor', this.vertex_color_data);
    }

    generateSector(canvas: Canvas) {
        const floor = generateSector(15, 15, 20);

        if(this.sector_vertex.length >= 2) {
            this.sector_vertex = this.sector_vertex.splice(1,1);
            this.sector_color = this.sector_color.splice(1,1);
        }

        for(let j = 0; j < this.sector_vertex.length; j++) {
            for(let i = 0; i < this.sector_vertex[j].length; i += 3) {
                this.sector_vertex[j][i+1] -= 10;
            }
        }

        this.sector_vertex.push(floor[0]);
        this.sector_color.push(floor[1])

        let new_vlen = 0;
        let new_clen = 0;

        for(let j = 0; j < this.sector_vertex.length; j++) {
            new_vlen += this.sector_vertex[j].length;
            new_clen += this.sector_color[j].length;
        }

        let new_v = new Float32Array(new_vlen);
        let new_c = new Float32Array(new_clen);

        let offset_v = 0;
        let offset_c = 0;
        for(let i = 0; i < this.sector_vertex.length; i++) {
            new_v.set(this.sector_vertex[i], offset_v);
            offset_v += this.sector_vertex[i].length;

            new_c.set(this.sector_color[i], offset_c);
            offset_c += this.sector_color[i].length;
        }

        this.vertex_data = new_v;
        this.vertex_color_data = new_c;

        canvas.attributeData('vertexPosition', this.vertex_data);
        canvas.attributeData('vertexColor', this.vertex_color_data);
    }

    update(canvas: Canvas) {
        if (this.camera.position[1] < -4) {
            this.camera.position[1] += 10;
            this.generateSector(canvas);
        }

        this.camera.update(canvas);
        this.time += 1/60;
    }
}