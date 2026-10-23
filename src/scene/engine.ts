import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three';
import fragmentShader from './morph.frag.glsl?raw';
import { mulberry32 } from './rng';
import vertexShader from './morph.vert.glsl?raw';

/** CSS-Pixel je Welteinheit. */
export const PX = 100;

export interface Target {
  data: Float32Array;
  /** Am Dokument verankert (scrollt mit dem Inhalt) statt am Viewport. */
  anchored: boolean;
  spin?: boolean;
}

/** Eine Partikelwolke, die per Shader zwischen zwei Zielformen überblendet. */
export class ParticleEngine {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, -100, 100);
  private readonly geometry = new BufferGeometry();
  private readonly material: ShaderMaterial;
  private readonly maxCount: number;

  constructor(canvas: HTMLCanvasElement, maxCount: number) {
    this.maxCount = maxCount;
    this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const rng = mulberry32(1);
    const rand = Float32Array.from({ length: maxCount }, rng);
    this.geometry.setAttribute('position', new BufferAttribute(new Float32Array(maxCount * 3), 3));
    this.geometry.setAttribute('aFrom', new BufferAttribute(new Float32Array(maxCount * 3), 3));
    this.geometry.setAttribute('aTo', new BufferAttribute(new Float32Array(maxCount * 3), 3));
    this.geometry.setAttribute('aRand', new BufferAttribute(rand, 1));
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uMorph: { value: 0 },
        uTime: { value: 0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uScale: { value: 1 },
        uFromOffset: { value: new Vector2() },
        uToOffset: { value: new Vector2() },
        uPointer: { value: new Vector2(999, 999) },
        uPointerStrength: { value: 0 },
        uSpin: { value: 0 },
        uOpacity: { value: 1 },
      },
    });
    const points = new Points(this.geometry, this.material);
    points.frustumCulled = false;
    this.scene.add(points);
  }

  resize(width: number, height: number): void {
    this.renderer.setSize(width, height, false);
    const w = width / PX / 2;
    const h = height / PX / 2;
    Object.assign(this.camera, { left: -w, right: w, top: h, bottom: -h });
    this.camera.updateProjectionMatrix();
    this.material.uniforms.uScale!.value = width < 768 ? 1.2 : 1;
    this.material.uniforms.uOpacity!.value = width < 768 ? 0.75 : 1;
  }

  setTargets(from: Target, to: Target): void {
    (this.geometry.getAttribute('aFrom') as BufferAttribute).copyArray(from.data.subarray(0, this.maxCount * 3)).needsUpdate = true;
    (this.geometry.getAttribute('aTo') as BufferAttribute).copyArray(to.data.subarray(0, this.maxCount * 3)).needsUpdate = true;
    this.material.uniforms.uSpin!.value = from.spin ? 1 : 0;
  }

  setFrame(opts: { morph: number; time: number; fromOffset: number; toOffset: number }): void {
    const u = this.material.uniforms;
    u.uMorph!.value = opts.morph;
    u.uTime!.value = opts.time;
    (u.uFromOffset!.value as Vector2).set(0, opts.fromOffset);
    (u.uToOffset!.value as Vector2).set(0, opts.toOffset);
  }

  setPointer(x: number, y: number, strength: number): void {
    (this.material.uniforms.uPointer!.value as Vector2).set(x, y);
    this.material.uniforms.uPointerStrength!.value = strength;
  }

  setCount(count: number): void {
    this.geometry.setDrawRange(0, Math.min(count, this.maxCount));
  }

  /** Shader vorab kompilieren, damit der erste Frame keinen langen Task auslöst. */
  warmup(): void {
    this.renderer.compile(this.scene, this.camera);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
