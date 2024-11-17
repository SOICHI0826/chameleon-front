/* eslint-disable */
import { utils } from './utils';
// Simple implementation for post-processing effects
export class PostProcess {

  constructor(gl, canvas, vertexShaderString, fragmentShaderString) {
    this.gl = gl;
    this.texture = null;
    this.framebuffer = null;
    this.renderbuffer = null;
    this.vertexBuffer = null;
    this.textureBuffer = null;
    this.program = null;
    this.uniforms = null;
    this.attributes = null;

    this.startTime = Date.now();
    this.canvas = canvas;

    this.configureFramebuffer();
    this.configureGeometry();
    this.configureShader(vertexShaderString, fragmentShaderString);
  }

  configureFramebuffer() {
    const { width, height } = this.canvas;

    // Init Color Texture
    this.texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);

    // Init Renderbuffer
    this.renderbuffer = this.gl.createRenderbuffer();
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderbuffer);
    this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);

    // Init Framebuffer
    this.framebuffer = this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture, 0);
    this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.renderbuffer);

    // Clean up
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  configureGeometry() {
    // Define the geometry for the full-screen quad
    const vertices = [
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1
    ];

    const textureCoords = [
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1
    ];

    // Init the buffers
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

    this.textureBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoords), this.gl.STATIC_DRAW);

    // Clean up
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }

  configureShader(vertexShaderString, fragmentShaderString) {
    // Compile the shader
    const vertexShader = utils.getShader(this.gl, 'vertex', vertexShaderString);
    const fragmentShader = utils.getShader(this.gl, 'fragment', fragmentShaderString);

    // Cleans up previously created shader objects if we call configureShader again
    if (this.program) {
      this.gl.deleteProgram(this.program);
    }

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error("Could not initialize post-process shader");
    }

    // Store all the attributes and uniforms for later use
    this.attributes = {};
    const attributesCount = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < attributesCount; i++) {
      const attrib = this.gl.getActiveAttrib(this.program, i);
      this.attributes[attrib.name] = this.gl.getAttribLocation(this.program, attrib.name);
    }

    this.uniforms = {};
    const uniformsCount = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformsCount; i++) {
      const uniform = this.gl.getActiveUniform(this.program, i);
      this.uniforms[uniform.name] = this.gl.getUniformLocation(this.program, uniform.name);
    }
  }

  validateSize() {
    const { width, height } = this.canvas;

    // 1. Resize Color Texture
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);

    // 2. Resize Render Buffer
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderbuffer);
    this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);

    // 3. Clean up
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
  }

  bind() {
    const { width, height } = this.canvas;

    // Use the Post Process shader
    this.gl.useProgram(this.program);

    // Bind the quad geometry
    this.gl.enableVertexAttribArray(this.attributes.aVertexPosition);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(this.attributes.aVertexPosition, 2, this.gl.FLOAT, false, 0, 0);

    this.gl.enableVertexAttribArray(this.attributes.aVertexTextureCoords);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer);
    this.gl.vertexAttribPointer(this.attributes.aVertexTextureCoords, 2, this.gl.FLOAT, false, 0, 0);

    // Bind the texture from the framebuffer
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.uniform1i(this.uniforms.uSampler, 0);

    // If the post process shader uses time as an input, pass it in here
    if (this.uniforms.uTime) {
      this.gl.uniform1f(this.uniforms.uTime, (Date.now() - this.startTime) / 1000);
    }

    // The inverse texture size can be useful for effects which require precise pixel lookup
    if (this.uniforms.uInverseTextureSize) {
      this.gl.uniform2f(this.uniforms.uInverseTextureSize, 1 / width, 1 / height);
    }
  }

  // Draw using TRIANGLES primitive
  draw() {
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

}

