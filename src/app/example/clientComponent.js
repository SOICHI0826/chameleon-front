"use client"

import { utils } from "@/lib/utils"
import vertexShaderSource from "./vertexShader.vert";
import fragmentShaderSource from "./fragmentShader.frag";
import { Program } from "@/lib/Program";
import { useEffect } from "react";

export default function ExampleClient() {
  let gl,
      program,
      squareVAO,
      squareIndexBuffer,
      indices;

  useEffect(() => {
    init();
  }, [])

  function configure() {
    if (typeof window === "undefined") {
      return
    }
    // Configure `canvas`
    const canvas = utils.getCanvas("webgl-canvas");
    utils.autoResizeCanvas(canvas);

    // Configure `gl`
    gl = utils.getGLContext(canvas);
    gl.clearColor(0.9, 0.9, 0.9, 1);
    gl.clearDepth(100);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // Configure `clock` which we can subscribe to on every `tick`.
    // We will discuss this in a later chapter, but it's simply a way to
    // abstract away the `requestAnimationFrame` we have been using.
    // clock = new Clock();

    // Configure `program`
    program = new Program(gl, vertexShaderSource, fragmentShaderSource);
    console.log(program);
  }

  function initBuffers() {
    if (typeof window === "undefined") {
      return
    }
    /*
      V0                    V3
      (-0.5, 0.5, 0)        (0.5, 0.5, 0)
      X---------------------X
      |                     |
      |                     |
      |       (0, 0)        |
      |                     |
      |                     |
      X---------------------X
      V1                    V2
      (-0.5, -0.5, 0)       (0.5, -0.5, 0)
    */
    const vertices = [
      -0.5, 0.5, 0,
      -0.5, -0.5, 0,
      0.5, -0.5, 0,
      0.5, 0.5, 0
    ];

    indices = [0, 1, 2, 0, 2, 3];

    squareVAO = gl.createVertexArray();

    gl.bindVertexArray(squareVAO);

    const squareVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(program.aVertexPosition);
    gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

    squareIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  function draw() {
    if (typeof window === "undefined") {
      return
    }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.bindVertexArray(squareVAO);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    gl.bindVertexArray(null);
  }

  function init() {
    configure();
    initBuffers();
    draw();
  }

  return (
    <div className="flex h-full">
      {/* Canvas */}
      <div className="basis-2/3 h-full border border-indigo-600">
        <canvas id="webgl-canvas" className="h-full w-full"/>
      </div>
      {/* Control Panel */}
      <div className="basis-1/3 h-full border border-indigo-600">
      </div>
    </div>
  )
}