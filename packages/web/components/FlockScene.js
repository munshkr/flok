/* eslint-disable no-bitwise */
import React from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "gpucomputationrender-three";

const fragmentShaderPosition = `
uniform float time;
uniform float delta;

void main()	{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 tmpPos = texture2D( texturePosition, uv );
    vec3 position = tmpPos.xyz;
    vec3 velocity = texture2D( textureVelocity, uv ).xyz;
    float phase = tmpPos.w;
    phase = mod( ( phase + delta +
                    length( velocity.xz ) * delta * 3. +
            max( velocity.y, 0.0 ) * delta * 6. ), 62.83 );
    gl_FragColor = vec4( position + velocity * delta * 15. , phase );
}
`;

const fragmentShaderVelocity = `
uniform float time;
uniform float testing;
uniform float delta; // about 0.016
uniform float separationDistance; // 20
uniform float alignmentDistance; // 40
uniform float cohesionDistance; //
uniform float freedomFactor;
uniform vec3 predator;

const float width = resolution.x;
const float height = resolution.y;

const float PI = 3.141592653589793;
const float PI_2 = PI * 2.0;
// const float VISION = PI * 0.55;

float zoneRadius = 40.0;
float zoneRadiusSquared = 1600.0;

float separationThresh = 0.45;
float alignmentThresh = 0.65;

const float UPPER_BOUNDS = BOUNDS;
const float LOWER_BOUNDS = -UPPER_BOUNDS;

const float SPEED_LIMIT = 9.0;

float rand( vec2 co ){
    return fract( sin( dot( co.xy, vec2(12.9898,78.233) ) ) * 43758.5453 );
}

void main() {

    zoneRadius = separationDistance + alignmentDistance + cohesionDistance;
    separationThresh = separationDistance / zoneRadius;
    alignmentThresh = ( separationDistance + alignmentDistance ) / zoneRadius;
    zoneRadiusSquared = zoneRadius * zoneRadius;


    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 birdPosition, birdVelocity;

    vec3 selfPosition = texture2D( texturePosition, uv ).xyz;
    vec3 selfVelocity = texture2D( textureVelocity, uv ).xyz;

    float dist;
    vec3 dir; // direction
    float distSquared;

    float separationSquared = separationDistance * separationDistance;
    float cohesionSquared = cohesionDistance * cohesionDistance;

    float f;
    float percent;

    vec3 velocity = selfVelocity;

    float limit = SPEED_LIMIT;

    dir = predator * UPPER_BOUNDS - selfPosition;
    dir.z = 0.;
    // dir.z *= 0.6;
    dist = length( dir );
    distSquared = dist * dist;

    float preyRadius = 150.0;
    float preyRadiusSq = preyRadius * preyRadius;


    // move birds away from predator
    if ( dist < preyRadius ) {

        f = ( distSquared / preyRadiusSq - 1.0 ) * delta * 100.;
        velocity += normalize( dir ) * f;
        limit += 5.0;
    }


    // if (testing == 0.0) {}
    // if ( rand( uv + time ) < freedomFactor ) {}


    // Attract flocks to the center
    vec3 central = vec3( 0., 0., 0. );
    dir = selfPosition - central;
    dist = length( dir );

    dir.y *= 2.5;
    velocity -= normalize( dir ) * delta * 5.;

    for ( float y = 0.0; y < height; y++ ) {
        for ( float x = 0.0; x < width; x++ ) {

            vec2 ref = vec2( x + 0.5, y + 0.5 ) / resolution.xy;
            birdPosition = texture2D( texturePosition, ref ).xyz;

            dir = birdPosition - selfPosition;
            dist = length( dir );

            if ( dist < 0.0001 ) continue;

            distSquared = dist * dist;

            if ( distSquared > zoneRadiusSquared ) continue;

            percent = distSquared / zoneRadiusSquared;

            if ( percent < separationThresh ) { // low

                // Separation - Move apart for comfort
                f = ( separationThresh / percent - 1.0 ) * delta;
                velocity -= normalize( dir ) * f;

            } else if ( percent < alignmentThresh ) { // high

                // Alignment - fly the same direction
                float threshDelta = alignmentThresh - separationThresh;
                float adjustedPercent = ( percent - separationThresh ) / threshDelta;

                birdVelocity = texture2D( textureVelocity, ref ).xyz;

                f = ( 0.5 - cos( adjustedPercent * PI_2 ) * 0.5 + 0.5 ) * delta;
                velocity += normalize( birdVelocity ) * f;

            } else {

                // Attraction / Cohesion - move closer
                float threshDelta = 1.0 - alignmentThresh;
                float adjustedPercent = ( percent - alignmentThresh ) / threshDelta;

                f = ( 0.5 - ( cos( adjustedPercent * PI_2 ) * -0.5 + 0.5 ) ) * delta;

                velocity += normalize( dir ) * f;

            }

        }

    }



    // this make tends to fly around than down or up
    // if (velocity.y > 0.) velocity.y *= (1. - 0.2 * delta);

    // Speed Limits
    if ( length( velocity ) > limit ) {
        velocity = normalize( velocity ) * limit;
    }

    gl_FragColor = vec4( velocity, 1.0 );

}
`;

const birdVS = `
attribute vec2 reference;
attribute float birdVertex;

attribute vec3 birdColor;

uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

varying vec4 vColor;
varying float z;

uniform float time;

void main() {

    vec4 tmpPos = texture2D( texturePosition, reference );
    vec3 pos = tmpPos.xyz;
    vec3 velocity = normalize(texture2D( textureVelocity, reference ).xyz);

    vec3 newPosition = position;

    if ( birdVertex == 4.0 || birdVertex == 7.0 ) {
        // flap wings
        newPosition.y = sin( tmpPos.w ) * 5.;
    }

    newPosition = mat3( modelMatrix ) * newPosition;


    velocity.z *= -1.;
    float xz = length( velocity.xz );
    float xyz = 1.;
    float x = sqrt( 1. - velocity.y * velocity.y );

    float cosry = velocity.x / xz;
    float sinry = velocity.z / xz;

    float cosrz = x / xyz;
    float sinrz = velocity.y / xyz;

    mat3 maty =  mat3(
        cosry, 0, -sinry,
        0    , 1, 0     ,
        sinry, 0, cosry

    );

    mat3 matz =  mat3(
        cosrz , sinrz, 0,
        -sinrz, cosrz, 0,
        0     , 0    , 1
    );

    newPosition =  maty * matz * newPosition;
    newPosition += pos;

    z = newPosition.z;

    vColor = vec4( birdColor, 1.0 );
    gl_Position = projectionMatrix *  viewMatrix  * vec4( newPosition, 1.0 );
}
`;

const birdFS = `
varying vec4 vColor;
varying float z;

uniform vec3 color;

void main() {
    // Fake colors for now
    float z2 = 0.2 + ( 1000. - z ) / 1000. * vColor.x;
    gl_FragColor = vec4( z2, z2, z2, 1. );

}
`;

const UPSCALE = 2;

const WIDTH = 16;
const BIRDS = WIDTH * WIDTH;
const BOUNDS = 800;
const BOUNDS_HALF = BOUNDS / 2;

// Custom Geometry - using 3 triangles each. No UVs, no normals currently.
// eslint-disable-next-line func-names
const BirdGeometry = function () {
  const triangles = BIRDS * 3;
  const points = triangles * 3;

  THREE.BufferGeometry.call(this);

  const vertices = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
  const birdColors = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
  const references = new THREE.BufferAttribute(new Float32Array(points * 2), 2);
  const birdVertex = new THREE.BufferAttribute(new Float32Array(points), 1);

  this.addAttribute("position", vertices);
  this.addAttribute("birdColor", birdColors);
  this.addAttribute("reference", references);
  this.addAttribute("birdVertex", birdVertex);

  // this.addAttribute( 'normal', new Float32Array( points * 3 ), 3 );

  let v = 0;

  function vertsPush(...args) {
    for (let i = 0; i < args.length; i += 1) {
      vertices.array[v] = args[i];
      v += 1;
    }
  }

  const wingsSpan = 20;

  for (let f = 0; f < BIRDS; f += 1) {
    // Body
    vertsPush(0, -0, -20, 0, 4, -20, 0, 0, 30);
    // Left Wing
    vertsPush(0, 0, -15, -wingsSpan, 0, 0, 0, 0, 15);
    // Right Wing
    vertsPush(0, 0, 15, wingsSpan, 0, 0, 0, 0, -15);
  }

  for (let w = 0; w < triangles * 3; w += 1) {
    const i = ~~(w / 3);
    const x = (i % WIDTH) / WIDTH;
    const y = ~~(i / WIDTH) / WIDTH;
    const c = new THREE.Color(0x111111 + (~~(w / 9) / BIRDS) * 0x222222);
    birdColors.array[w * 3 + 0] = c.r;
    birdColors.array[w * 3 + 1] = c.g;
    birdColors.array[w * 3 + 2] = c.b;
    references.array[w * 2] = x;
    references.array[w * 2 + 1] = y;
    birdVertex.array[w] = w % 9;
  }
  this.scale(0.3, 0.3, 0.3);
};

BirdGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);

class FlockScene extends React.Component {
  static fillPositionTexture(texture) {
    const theArray = texture.image.data;

    for (let k = 0, kl = theArray.length; k < kl; k += 4) {
      const x = Math.random() * BOUNDS - BOUNDS_HALF;
      const y = Math.random() * BOUNDS - BOUNDS_HALF;
      const z = Math.random() * BOUNDS - BOUNDS_HALF;

      theArray[k + 0] = x;
      theArray[k + 1] = y;
      theArray[k + 2] = z;
      theArray[k + 3] = 1;
    }
  }

  static fillVelocityTexture(texture) {
    const theArray = texture.image.data;

    for (let k = 0, kl = theArray.length; k < kl; k += 4) {
      const x = Math.random() - 0.5;
      const y = Math.random() - 0.5;
      const z = Math.random() - 0.5;

      theArray[k + 0] = x * 10;
      theArray[k + 1] = y * 10;
      theArray[k + 2] = z * 10;
      theArray[k + 3] = 1;
    }
  }

  componentDidMount() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.windowHalfX = width / 2;
    this.windowHalfY = height / 2;
    this.mouseX = 0;
    this.mouseY = 0;

    this.last = performance.now();

    // Add Camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 3000);
    this.camera.position.z = 350;

    // Add Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x101010);
    this.scene.fog = new THREE.Fog(0x0, 100, 1000);

    // Add Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio / UPSCALE);
    this.renderer.setSize(width, height);

    this.container.appendChild(this.renderer.domElement);

    this.initComputeRenderer();
    this.initBirds();

    // Events
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleDocumentMouseMove = this.handleDocumentMouseMove.bind(this);
    window.addEventListener("resize", this.handleWindowResize, false);
    document.addEventListener("mousemove", this.handleDocumentMouseMove, false);

    this.start();
  }

  componentWillUnmount() {
    this.stop();
    this.container.removeChild(this.renderer.domElement);
  }

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  };

  stop = () => {
    cancelAnimationFrame(this.frameId);
  };

  animate = () => {
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  };

  initComputeRenderer() {
    this.gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, this.renderer);

    const dtPosition = this.gpuCompute.createTexture();
    const dtVelocity = this.gpuCompute.createTexture();
    FlockScene.fillPositionTexture(dtPosition);
    FlockScene.fillVelocityTexture(dtVelocity);

    this.velocityVariable = this.gpuCompute.addVariable(
      "textureVelocity",
      fragmentShaderVelocity,
      dtVelocity
    );
    this.positionVariable = this.gpuCompute.addVariable(
      "texturePosition",
      fragmentShaderPosition,
      dtPosition
    );

    this.gpuCompute.setVariableDependencies(this.velocityVariable, [
      this.positionVariable,
      this.velocityVariable,
    ]);
    this.gpuCompute.setVariableDependencies(this.positionVariable, [
      this.positionVariable,
      this.velocityVariable,
    ]);

    this.positionUniforms = this.positionVariable.material.uniforms;
    this.velocityUniforms = this.velocityVariable.material.uniforms;

    this.positionUniforms.time = { value: 0.0 };
    this.positionUniforms.delta = { value: 0.0 };
    this.velocityUniforms.time = { value: 1.0 };
    this.velocityUniforms.delta = { value: 0.0 };
    this.velocityUniforms.testing = { value: 1.0 };
    this.velocityUniforms.separationDistance = { value: 20.0 };
    this.velocityUniforms.alignmentDistance = { value: 20.0 };
    this.velocityUniforms.cohesionDistance = { value: 20.0 };
    this.velocityUniforms.freedomFactor = { value: 0.75 };
    this.velocityUniforms.predator = { value: new THREE.Vector3() };
    this.velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed(2);

    this.velocityVariable.wrapS = THREE.RepeatWrapping;
    this.velocityVariable.wrapT = THREE.RepeatWrapping;
    this.positionVariable.wrapS = THREE.RepeatWrapping;
    this.positionVariable.wrapT = THREE.RepeatWrapping;

    const error = this.gpuCompute.init();
    if (error !== null) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  initBirds() {
    const geometry = new BirdGeometry();

    // For Vertex and Fragment
    this.birdUniforms = {
      color: { value: new THREE.Color(0xff2200) },
      texturePosition: { value: null },
      textureVelocity: { value: null },
      time: { value: 1.0 },
      delta: { value: 0.0 },
    };

    // THREE.ShaderMaterial
    const material = new THREE.ShaderMaterial({
      uniforms: this.birdUniforms,
      vertexShader: birdVS,
      fragmentShader: birdFS,
      side: THREE.DoubleSide,
    });

    const birdMesh = new THREE.Mesh(geometry, material);
    birdMesh.rotation.y = Math.PI / 2;
    birdMesh.matrixAutoUpdate = false;
    birdMesh.updateMatrix();

    this.scene.add(birdMesh);
  }

  renderScene = () => {
    const now = performance.now();
    let delta = (now - this.last) / 1000;

    if (delta > 1) delta = 1; // safety cap on large deltas
    this.last = now;

    this.positionUniforms.time.value = now;
    this.positionUniforms.delta.value = delta;
    this.velocityUniforms.time.value = now;
    this.velocityUniforms.delta.value = delta;
    this.birdUniforms.time.value = now;
    this.birdUniforms.delta.value = delta;

    this.velocityUniforms.predator.value.set(
      (0.5 * this.mouseX) / this.windowHalfX,
      (-0.5 * this.mouseY) / this.windowHalfY,
      0
    );

    this.mouseX = 10000;
    this.mouseY = 10000;

    this.gpuCompute.compute();

    this.birdUniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget(
      this.positionVariable
    ).texture;
    this.birdUniforms.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget(
      this.velocityVariable
    ).texture;

    this.renderer.render(this.scene, this.camera);
  };

  handleWindowResize() {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  handleDocumentMouseMove(event) {
    this.mouseX = event.clientX - this.windowHalfX;
    this.mouseY = event.clientY - this.windowHalfY;
  }

  render() {
    const { props } = this;

    return (
      <div
        ref={(mount) => {
          this.container = mount;
        }}
        style={{ position: "absolute", top: 0, left: 0, zIndex: -1 }}
        {...props}
      />
    );
  }
}
export default FlockScene;
