import { mat4 } from "gl-matrix";

export class Canvas {
    element: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    program: WebGLProgram;
    vao: WebGLVertexArrayObject;
    attributes: {[name: string]: Attribute};
    uniforms: {[name: string]: Uniform};
    drawLength: {[name: string]: number};

    constructor(element: HTMLCanvasElement, width: number, height: number) {
        this.element = element;
        this.element.width = width;
        this.element.height = height;
        this.gl = element.getContext('webgl2')!;
        this.program = this.gl.createProgram()!;
        this.vao = this.gl.createVertexArray()!;
        this.gl.bindVertexArray(this.vao);
        this.attributes = {};
        this.uniforms = {};
        this.drawLength = {};

        this.initCanvas()
    }

    private initCanvas() {
        this.gl.viewport(0, 0, this.element.width, this.element.height);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
        this.clearCanvas();
    }

    private compileShader(src: string, type: GLenum): WebGLShader | null {
        const shader = this.gl.createShader(type)!;
        this.gl.shaderSource(shader, src);
        this.gl.compileShader(shader);
        const status = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        console.log(this.gl.getShaderInfoLog(shader));
        if (status) {
            return shader;
        } else {
            console.log(this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
    }

    compileProgram(vsrc: string, fsrc: string): WebGLProgram | null {
        const vertex = this.compileShader(vsrc, this.gl.VERTEX_SHADER)!;
        const fragment = this.compileShader(fsrc, this.gl.FRAGMENT_SHADER)!;
        this.program = this.gl.createProgram()!;
        this.gl.attachShader(this.program, vertex);
        this.gl.attachShader(this.program, fragment);
        this.gl.linkProgram(this.program);
        const status = this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS);
        console.log(this.gl.getProgramInfoLog(this.program));
        if (status) {
            this.gl.useProgram(this.program)
            return this.program;
        } else {
            console.log(this.gl.getProgramInfoLog(this.program));
            this.gl.deleteProgram(this.program)
            return null;
        }
    }

    addAttribute(name: string, size: number, type: GLenum, normalize: boolean, stride: number, offset: number, bufferType: GLenum, isVertexData: boolean) {
        const attributeLocation = this.gl.getAttribLocation(this.program, name);
        this.attributes[name] = {name: name, buffer: this.gl.createBuffer()!, location: attributeLocation, size: size, type: type, normalize: normalize, stride: stride, offset: offset, bufferType: bufferType, isVertexData: isVertexData};
        this.gl.bindBuffer(bufferType, this.attributes[name].buffer);
        this.gl.bindVertexArray(this.vao);
        this.gl.enableVertexAttribArray(attributeLocation);
        this.gl.vertexAttribPointer(attributeLocation, size, type, normalize, stride, offset);
        this.gl.bindVertexArray(null);
    }

    attributeData(name: string, data: Float32Array) {
        this.gl.bindBuffer(this.attributes[name].bufferType, this.attributes[name].buffer);
        this.gl.bufferData(this.attributes[name].bufferType, data, this.gl.STATIC_DRAW);
        if (this.attributes[name].isVertexData) this.drawLength[name] = Math.floor((data.length - this.attributes[name].offset) / this.attributes[name].size / (this.attributes[name].stride == 0 ? 1 : this.attributes[name].stride));
    }

    addUniform(name: string, type: UniformType, length: number) {
        const uniformLocation = this.gl.getUniformLocation(this.program, name)!;
        this.uniforms[name] = {name: name, location: uniformLocation, type: type, length: length}
    }

    uniformData(name: string, data: number | Float32Array | Int32Array | mat4): void;
    uniformData(name: string, data: number, image: HTMLImageElement): void;
    uniformData(name: string, data: number | Float32Array | Int32Array | mat4, image?: HTMLImageElement): void {
        switch(this.uniforms[name].type) {
            case UniformType.Float:
                switch(this.uniforms[name].length) {
                    case 1:
                        if (typeof data === "number") {
                            this.gl.uniform1f(this.uniforms[name].location, data);
                        }
                        break;
                }
                break;
                // todo: arrays of floats
            case UniformType.FloatArray:
            case UniformType.Integer:
                switch(this.uniforms[name].length) {
                    case 1:
                        if (typeof data === 'number') {
                            this.gl.uniform1i(this.uniforms[name].location, data);
                        }
                        break;
                }
                break;
                // todo: arrays of ints
            case UniformType.IntegerArray:
            case UniformType.Matrix2:
            case UniformType.Matrix3:
            case UniformType.Matrix4:
                if (typeof data !== 'number' && typeof data[Symbol.iterator] === 'function') {
                    this.gl.uniformMatrix4fv(this.uniforms[name].location, false, data);
                }
            case UniformType.Texture2D:
                if (image != undefined && typeof data === 'number') {
                    const texture = this.gl.createTexture()!;
                    this.gl.activeTexture(this.gl.TEXTURE0 + data);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

                    // i need to allow changing the settings here later
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, image.width, image.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image!);
                    this.gl.uniform1i(this.uniforms[name].location, data);
                }
        }
    }

    clearCanvas() {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    render() {
        let drawLength = 0;
        for (const [key, value] of Object.entries(this.drawLength)) {
            drawLength += value;
        }
        this.clearCanvas();
        this.gl.bindVertexArray(this.vao);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, drawLength);
    }
}

// this is a little bit of a reminder to myself because every time i have to write this fucking boilerplate
// i forget how this works. gl.ARRAY_BUFFER is not just a value that tells webgl what kind of buffer it is,
// it binds the buffer to a global variable which you then use to give shit to the program


// vaos are a collection of how to access attributes. it will contain all the settings you have for giving data to
// attributes *only*. what happens when you bind it, is you are telling it to listen to all the pointers you set for them,
// so you bind it, make all the pointers, and then unbind it. right before you render the things which require the attributes
// you rebind it, and it skips having to set all of those every single frame.

export enum UniformType {
    Float,
    FloatArray,
    Integer,
    IntegerArray,
    Matrix2,
    Matrix3,
    Matrix4,
    Texture2D
}

interface Program {
    name: string;
    program: WebGLProgram;
    vao: WebGLVertexArrayObject;
    attributes: {[name: string]: Attribute};
    uniforms: {[name: string]: Uniform};
}

interface DrawCall {
    program: Program;
    drawLength: number;
}

interface Attribute {
    name: string;
    buffer: WebGLBuffer
    location: GLuint;
    size: number;
    type: GLenum;
    normalize: boolean;
    stride: number;
    offset: number;
    bufferType: GLenum;
    isVertexData: boolean;
}

interface Uniform {
    name: string;
    location: WebGLUniformLocation;
    type: UniformType;
    length: number;
}