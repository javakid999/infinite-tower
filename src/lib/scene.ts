import { Camera } from "./camera";
import { type Canvas } from "./canvas";
import { generateSector } from "./generate";

export class Scene {
    time: number
    camera: Camera
    vertex_data: Float32Array
    vertex_color_data: Float32Array
    vertex_normal_data: Float32Array
    sector_vertex: Float32Array[]
    sector_color: Float32Array[]
    sector_normal: Float32Array[]

    constructor() {
        this.time = 0;
        this.camera = new Camera();
        this.vertex_data = new Float32Array();
        this.vertex_color_data = new Float32Array();
        this.vertex_normal_data = new Float32Array();
        this.sector_vertex = [];
        this.sector_color = [];
        this.sector_normal = [];
    }

    init(canvas: Canvas) {
        this.camera.init(canvas);
        const floor = generateSector(15, 15, 20);
        this.sector_vertex.push(floor[0]);
        this.sector_color.push(floor[1]);
        this.sector_normal.push(floor[2]);
        this.vertex_data = floor[0];
        this.vertex_color_data = floor[1];
        this.vertex_normal_data = floor[2];
        canvas.attributeData('vertexPosition', 'f3d', this.vertex_data);
        canvas.attributeData('vertexColor', 'f3d', this.vertex_color_data);
        canvas.attributeData('vertexNormal', 'f3d', this.vertex_normal_data);
        canvas.attributeData('screenPosition', 'sky', new Float32Array([-1,1, 1,1, -1,-1, 1,1, 1,-1, -1,-1]))
        
        canvas.addDrawCall('sky', 6, 0, 1, {depth_ignore: true});
    }

    generateSector(canvas: Canvas) {
        const floor = generateSector(15, 15, 20);

        if(this.sector_vertex.length >= 2) {
            this.sector_vertex = this.sector_vertex.splice(1,1);
            this.sector_color = this.sector_color.splice(1,1);
            this.sector_normal = this.sector_normal.splice(1,1);
        }

        for(let j = 0; j < this.sector_vertex.length; j++) {
            for(let i = 0; i < this.sector_vertex[j].length; i += 3) {
                this.sector_vertex[j][i+1] -= 10;
            }
        }

        this.sector_vertex.push(floor[0]);
        this.sector_color.push(floor[1])
        this.sector_normal.push(floor[2])

        let new_vlen = 0;
        let new_clen = 0;
        let new_nlen = 0;

        for(let j = 0; j < this.sector_vertex.length; j++) {
            new_vlen += this.sector_vertex[j].length;
            new_clen += this.sector_color[j].length;
            new_nlen += this.sector_normal[j].length;
        }

        let new_v = new Float32Array(new_vlen);
        let new_c = new Float32Array(new_clen);
        let new_n = new Float32Array(new_nlen);

        let offset_v = 0;
        let offset_c = 0;
        let offset_n = 0;
        for(let i = 0; i < this.sector_vertex.length; i++) {
            new_v.set(this.sector_vertex[i], offset_v);
            offset_v += this.sector_vertex[i].length;

            new_c.set(this.sector_color[i], offset_c);
            offset_c += this.sector_color[i].length;

            new_n.set(this.sector_normal[i], offset_n);
            offset_n += this.sector_normal[i].length;
        }

        this.vertex_data = new_v;
        this.vertex_color_data = new_c;
        this.vertex_normal_data = new_n;

        canvas.attributeData('vertexPosition', 'f3d', this.vertex_data);
        canvas.attributeData('vertexColor', 'f3d', this.vertex_color_data);
        canvas.attributeData('vertexNormal', 'f3d', this.vertex_normal_data);
        canvas.clearDrawCalls('f3d');
        canvas.addDrawCall('f3d', new_v.length / 3, 0, 0);
    }

    update(canvas: Canvas) {
        if (this.camera.position[1] < -4) {
            this.camera.position[1] += 10;
            this.generateSector(canvas);
        }

        canvas.uniformData('time', 'sky', this.time);

        this.camera.update(canvas);
        this.time += 1/60;
    }
}