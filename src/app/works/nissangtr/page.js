"use client"

import { utils } from "@/lib/utils"
import vertexShaderSource from "./vertexShader.vert";
import fragmentShaderSource from "./fragmentShader.frag";
import { Program } from "@/lib/Program";
import { useEffect } from "react";
import { Clock } from "@/lib/Clock";
import { Scene } from "@/lib/Scene";
import { Camera } from "@/lib/Camera";
import { Controls } from "@/lib/Controls";
import { Transforms } from "@/lib/Transforms";
import { Light, LightsManager } from "@/lib/Light";
import { Floor } from "@/lib/Floor";

import { BsFillTagFill } from "react-icons/bs";
import { BsInfoSquare } from "react-icons/bs";
import { CgController } from "react-icons/cg";

export default function Work() {
  const objectDataBaseUrl = "https://ch-work-data-bucket.s3.ap-northeast-1.amazonaws.com/ch_980c23704378e886ad88ddf74c244f776a9f15a153791aa4ff70d334602ed1b0/object/part"; 
  // Global variables to be used across application
  let 
      gl, 
      program, 
      scene, 
      clock, 
      camera, 
      transforms, 
      lights,
      floor, 
      lightPositions, 
      carModelData,
      clearColor = [0.9, 0.9, 0.9];

  useEffect(() => {
    init();
  }, [])

  function configure() {
    // Configure `canvas`
    const canvas = utils.getCanvas("webgl-canvas");
    utils.autoResizeCanvas(canvas);

    // Configure `gl`
    gl = utils.getGLContext(canvas);
    gl.clearColor(...clearColor, 1);
    gl.clearDepth(1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Configure `program`
    program = new Program(gl, vertexShaderSource, fragmentShaderSource);

    const attributes = [
      'aVertexPosition',
      'aVertexNormal',
      'aVertexColor'
    ];

    const uniforms = [
      'uProjectionMatrix',
      'uModelViewMatrix',
      'uNormalMatrix',
      'uLightPosition',
      'uWireframe',
      'uLd',
      'uLs',
      'uKa',
      'uKd',
      'uKs',
      'uNs',
      'uD',
      'uIllum'
    ];

    // Load attributes and uniforms into program
    program.load(attributes, uniforms);

    // Configure `scene` and `clock`
    scene = new Scene(gl, program);
    clock = new Clock();

    // Configure `camera` and `controls`
    camera = new Camera(Camera.ORBITING_TYPE);
    new Controls(camera, canvas);

    // Configure `transforms`
    transforms = new Transforms(gl, program, camera, canvas);

    // Configure `lights`
    lights = new LightsManager();

    // Light positions for each individual light in the scene
    lightPositions = {
      farLeft: [-1000, 1000, -1000],
      farRight: [1000, 1000, -1000],
      nearLeft: [-1000, 1000, 1000],
      nearRight: [1000, 1000, 1000]
    };

    // Iterate over each light and configure
    Object.keys(lightPositions).forEach(key => {
      const light = new Light(key);
      light.setPosition(lightPositions[key]);
      light.setDiffuse([0.4, 0.4, 0.4]);
      light.setSpecular([0.8, 0.8, 0.8]);
      lights.add(light)
    });

    gl.uniform3fv(program.uLightPosition, lights.getArray('position'));
    gl.uniform3fv(program.uLd, lights.getArray('diffuse'));
    gl.uniform3fv(program.uLs, lights.getArray('specular'));

    gl.uniform3fv(program.uKa, [1, 1, 1]);
    gl.uniform3fv(program.uKd, [1, 1, 1]);
    gl.uniform3fv(program.uKs, [1, 1, 1]);
    gl.uniform1f(program.uNs, 1);

    // Configure `floor`
    floor = new Floor(200, 2);

    // Data describing car model
    carModelData = {
      // This is the alias that's used to determine whether the item being
      // loaded is a body panel with paint. Each object within the model has particular
      // aliases that were set by the 3D artists.
      paintAlias: 'paint',
      // This is the number of parts to load for this particular model
      partsCount: 178,
      // The path to the model
      path: objectDataBaseUrl
    };
  }

  // Position `camera` back to home
  function goHome() {
    camera.goHome([0, 10, 80]);
    camera.setFocus([0, 0, 0]);
    camera.setAzimuth(30);
    camera.setElevation(-10);
  }

  // Load the car into our scene
  function loadCar() {
    scene.objects = [];
    scene.add(floor);
    const { path, partsCount } = carModelData;
    scene.loadByParts(path, partsCount);
  }

  function load() {
    goHome();
    loadCar();
  }

  function draw() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    transforms.updatePerspective();

    try {
      // Iterate over every object in the scene
      scene.traverse(object => {
        // If object is not visisble, then no need to render anything
        if (!object.visible) return;

        // Apply transformations
        transforms.calculateModelView();
        transforms.push();
        transforms.setMatrixUniforms();
        transforms.pop();

        // Set uniforms
        gl.uniform3fv(program.uKa, object.Ka);
        gl.uniform3fv(program.uKd, object.Kd);
        gl.uniform3fv(program.uKs, object.Ks);
        gl.uniform1f(program.uNs, object.Ns);
        gl.uniform1f(program.uD, object.d);
        gl.uniform1i(program.uIllum, object.illum);

        // Bind
        gl.bindVertexArray(object.vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo);

        if (object.wireframe) {
          gl.uniform1i(program.uWireframe, 1);
          gl.drawElements(gl.LINES, object.indices.length, gl.UNSIGNED_SHORT, 0);
        }
        else {
          gl.uniform1i(program.uWireframe, 0);
          gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT, 0);
        }

        // Clean
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      });
    }
    catch (error) {
      console.error(error);
    }
  }

  function init() {
    configure();
    load();
    clock.on('tick', draw);
  }

  return (
    <div className="flex h-full">
      {/* Canvas */}
      <div className="basis-3/4 h-full">
        <div className="flex flex-col h-full">
          <div className="basis-1/6">
            <div className="flex flex-row items-center p-3 text-slate-100">
              <BsFillTagFill size={25} />
              <h1 className="p-3 font-mono text-2xl font-bold">
                Nissan-GTR SHOWROOM
              </h1>
            </div>
          </div>
          <div className="flex-grow m-3 shadow-xl shadow-black">
            <canvas id="webgl-canvas" className="w-full h-full"/>
          </div>
        </div>
      </div>
      {/* Control Panel */}
      <div className="basis-1/4 h-full p-3 m-3 shadow-xl shadow-black">
        <div className="flex flex-row items-center p-3 text-slate-100 ">
          <BsInfoSquare size={25} />
          <h2 className="p-3 font-mono text-xl font-bold">
            Info
          </h2>
        </div>
        <div className="flex flex-row items-center p-3 text-slate-100 ">
          <CgController size={25} />
          <h2 className="p-3 font-mono text-xl font-bold">
            Control
          </h2>
        </div>
      </div>
    </div>
  )
}