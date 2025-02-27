import { mat4 } from "gl-matrix";

export class Canvas {
    element: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    programs: {[name: string]: Program};
    global_attributes: {[name: string]: Attribute};
    draw_calls: DrawCall[];

    program_vertex_data: {[program: string]: [string, Float32Array]};
    vertex_data: Float32Array;

    constructor(element: HTMLCanvasElement, width: number, height: number) {
        this.element = element;
        this.element.width = width;
        this.element.height = height;
        this.gl = element.getContext('webgl2')!;
        this.programs = {};
        this.vertex_data = new Float32Array();
        this.program_vertex_data = {};
        this.global_attributes = {};
        this.draw_calls = [];

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

    compileProgram(name: string, vsrc: string, fsrc: string) {
        const vertex = this.compileShader(vsrc, this.gl.VERTEX_SHADER)!;
        const fragment = this.compileShader(fsrc, this.gl.FRAGMENT_SHADER)!;
        const gl_program = this.gl.createProgram()!;

        this.gl.attachShader(gl_program, vertex);
        this.gl.attachShader(gl_program, fragment);
        this.gl.linkProgram(gl_program);

        const status = this.gl.getProgramParameter(gl_program, this.gl.LINK_STATUS);
        console.log(this.gl.getProgramInfoLog(gl_program));

        if (status) {
            const program: Program = {name: name, program: gl_program, vao: this.gl.createVertexArray(), attributes: {}, uniforms: {}};
            this.programs[name] = program;
        } else {
            this.gl.deleteProgram(gl_program)
        }
    }

    addAttribute(name: string, program_name: string, size: number, type: GLenum, normalize: boolean, stride: number, offset: number, bufferType: GLenum, isVertexData: boolean) {
        const attributeLocation = this.gl.getAttribLocation(this.programs[program_name].program, name);
        this.programs[program_name].attributes[name] = {name: name, buffer: this.gl.createBuffer()!, location: attributeLocation, size: size, type: type, normalize: normalize, stride: stride, offset: offset, bufferType: bufferType, isVertexData: isVertexData};
        
        this.gl.useProgram(this.programs[program_name].program);

        this.gl.bindBuffer(bufferType, this.programs[program_name].attributes[name].buffer);
        this.gl.bindVertexArray(this.programs[program_name].vao);
        this.gl.enableVertexAttribArray(attributeLocation);
        this.gl.vertexAttribPointer(attributeLocation, size, type, normalize, stride, offset);
        this.gl.bindVertexArray(null);
    }

    attributeData(name: string, program_name: string, data: Float32Array) {
        this.gl.useProgram(this.programs[program_name].program);

        if (this.programs[program_name].attributes[name].isVertexData) {
            this.program_vertex_data[program_name] = [name, data];
        } else {
            this.gl.bindBuffer(this.programs[program_name].attributes[name].bufferType, this.programs[program_name].attributes[name].buffer);
            this.gl.bufferData(this.programs[program_name].attributes[name].bufferType, data, this.gl.STATIC_DRAW);
        }
        //Attribute Data DrawLength: Math.floor((data.length - this.programs[program_name].attributes[name].offset) / this.programs[program_name].attributes[name].size / (this.programs[program_name].attributes[name].stride == 0 ? 1 : this.programs[program_name].attributes[name].stride));
    }

    addUniform(name: string, program_name: string, type: UniformType, length: number) {
        this.gl.useProgram(this.programs[program_name].program)
        const uniformLocation = this.gl.getUniformLocation(this.programs[program_name].program, name)!;
        this.programs[program_name].uniforms[name] = {name: name, location: uniformLocation, type: type, length: length}
    }

    addDrawCall(program_name: string, draw_length: number, offset: number, z_layer: number, options?: DrawCallOptions) {
        const draw_call: DrawCall = {program: this.programs[program_name], drawLength: draw_length, offset: offset, z_layer: z_layer, options: options};
        this.draw_calls.push(draw_call);
        this.draw_calls.sort((a, b) => a.z_layer- b.z_layer)
    }

    clearDrawCalls(program_name?: string) {
        if (program_name !== undefined) {
            this.draw_calls = this.draw_calls.filter((d) => d.program.name !== program_name);
        } else {
            this.draw_calls = [];
        }
    }

    uniformData(name: string, program_name: string, data: number | Float32Array | Int32Array | mat4): void;
    uniformData(name: string, program_name: string, data: number, image: HTMLImageElement | HTMLImageElement[]): void;
    uniformData(name: string, program_name: string, data: number | Float32Array | Int32Array | mat4, image?: HTMLImageElement | HTMLImageElement[]): void {
        this.gl.useProgram(this.programs[program_name].program);

        switch(this.programs[program_name].uniforms[name].type) {
            case UniformType.Float:
                switch(this.programs[program_name].uniforms[name].length) {
                    case 1:
                        if (typeof data === "number") {
                            this.gl.uniform1f(this.programs[program_name].uniforms[name].location, data);
                        }
                        break;
                }
                break;
                // todo: arrays of floats
            case UniformType.FloatArray:
            case UniformType.Integer:
                switch(this.programs[program_name].uniforms[name].length) {
                    case 1:
                        if (typeof data === 'number') {
                            this.gl.uniform1i(this.programs[program_name].uniforms[name].location, data);
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
                    this.gl.uniformMatrix4fv(this.programs[program_name].uniforms[name].location, false, data);
                }
            case UniformType.Texture2D:
                if (image != undefined && typeof data === 'number' && !Array.isArray(image)) {
                    const texture = this.gl.createTexture()!;
                    this.gl.activeTexture(this.gl.TEXTURE0 + data);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

                    // i need to allow changing the settings here later
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, image.width, image.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image!);
                    this.gl.uniform1i(this.programs[program_name].uniforms[name].location, data);
                }
            case UniformType.CubeMap:
                if (image != undefined && typeof data === 'number' && Array.isArray(image)) {
                    const texture = this.gl.createTexture()!;
                    this.gl.activeTexture(this.gl.TEXTURE0 + data);
                    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, texture);

                    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, this.gl.RGBA, image[0].width, image[0].height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image[0]!);
                    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, this.gl.RGBA, image[1].width, image[1].height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image[1]!);
                    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, this.gl.RGBA, image[2].width, image[2].height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image[2]!);
                    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, this.gl.RGBA, image[3].width, image[3].height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image[3]!);
                    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, this.gl.RGBA, image[4].width, image[4].height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image[4]!);
                    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, this.gl.RGBA, image[5].width, image[5].height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image[5]!);
                    
                    this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);

                    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                    this.gl.uniform1i(this.programs[program_name].uniforms[name].location, data);
                }
        }
    }

    clearCanvas() {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    render() {
        this.clearCanvas();
        for (let call of this.draw_calls) {
            this.gl.useProgram(call.program.program);

            const program_name = call.program.name;

            if (call.options && call.options.depth_ignore) {
                this.gl.depthFunc(this.gl.LEQUAL);
            } else {
                this.gl.depthFunc(this.gl.LESS);
            }

            this.gl.bindBuffer(this.programs[program_name].attributes[this.program_vertex_data[program_name][0]].bufferType, this.programs[program_name].attributes[this.program_vertex_data[program_name][0]].buffer);
            this.gl.bufferData(this.programs[program_name].attributes[this.program_vertex_data[program_name][0]].bufferType, this.program_vertex_data[program_name][1], this.gl.STATIC_DRAW);

            this.gl.bindVertexArray(call.program.vao);
            this.gl.drawArrays(this.gl.TRIANGLES, call.offset, call.drawLength);
        }
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
    Texture2D,
    CubeMap
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
    offset: number;
    z_layer: number;
    options?: DrawCallOptions
}

interface DrawCallOptions {
    depth_ignore?: boolean;
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