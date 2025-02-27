import { mat4 } from 'gl-matrix';
import { UniformType, type Canvas } from './canvas';

export class Camera {
    position: Float32Array
    fov: number
    worldMatrix: mat4
    viewMatrix: mat4
    projMatrix: mat4

    constructor() {
        this.fov = Math.PI/2;
        this.position = new Float32Array([0, -5, -6]);

        this.worldMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.projMatrix = mat4.create();

        mat4.lookAt(this.viewMatrix, this.position, [0,-5,0], [0,1,0]);
        mat4.perspective(this.projMatrix, this.fov, window.innerWidth/window.innerHeight, 0.01, 100)
    }

    init(canvas: Canvas) {
        canvas.addUniform('world', 'f3d', UniformType.Matrix4, -1);
        canvas.addUniform('view', 'f3d', UniformType.Matrix4, -1);
        canvas.addUniform('proj', 'f3d', UniformType.Matrix4, -1);

        canvas.addUniform('world', 'sky', UniformType.Matrix4, -1);
        canvas.addUniform('view', 'sky', UniformType.Matrix4, -1);
        canvas.addUniform('proj', 'sky', UniformType.Matrix4, -1);

        this.update(canvas);
    }

    update(canvas: Canvas) {
        mat4.rotateY(this.worldMatrix, this.worldMatrix, 0.01);
        this.viewMatrix[12] = this.position[0]
        this.viewMatrix[13] = this.position[1]
        this.viewMatrix[14] = this.position[2]
        this.position[1] -= 0.05;
        
        canvas.uniformData('world', 'f3d', this.worldMatrix);
        canvas.uniformData('view', 'f3d', this.viewMatrix);
        canvas.uniformData('proj', 'f3d', this.projMatrix);

        canvas.uniformData('world', 'sky', this.worldMatrix);
        canvas.uniformData('view', 'sky', this.viewMatrix);
        canvas.uniformData('proj', 'sky', this.projMatrix);
    }
}