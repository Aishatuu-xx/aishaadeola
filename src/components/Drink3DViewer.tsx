import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { THREE_D_PRESETS } from '../data/menu';
import { RotateCw, Sparkles, Layers, Eye, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Drink3DViewerProps {
  initialDrinkId?: string;
  onSelectForOrder?: (menuItemId: string) => void;
  theme?: 'light' | 'dark';
}

export const Drink3DViewer: React.FC<Drink3DViewerProps> = ({
  initialDrinkId = 'cappuccino',
  onSelectForOrder,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const [selectedId, setSelectedId] = useState<string>(initialDrinkId);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const drinkGroupRef = useRef<THREE.Group | null>(null);
  const steamParticlesRef = useRef<THREE.Points | null>(null);
  const bobaPearlsRef = useRef<THREE.Mesh[]>([]);
  const iceCubesRef = useRef<THREE.Mesh[]>([]);
  const animFrameIdRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const activePreset = THREE_D_PRESETS.find((p) => p.id === selectedId) || THREE_D_PRESETS[0];

  // Helper to generate Latte Art texture procedurally
  const createLatteArtTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    // Crema background base
    const grad = ctx.createRadialGradient(256, 256, 80, 256, 256, 256);
    grad.addColorStop(0, '#FFF5EA');
    grad.addColorStop(0.3, '#DE9B52');
    grad.addColorStop(0.7, '#8C4D1D');
    grad.addColorStop(1, '#4E2608');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Heart latte art motif
    ctx.save();
    ctx.translate(256, 260);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(100, 50, 10, 0.4)';
    ctx.shadowBlur = 12;

    // Heart path
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.bezierCurveTo(80, 10, 140, -60, 100, -120);
    ctx.bezierCurveTo(60, -180, 0, -130, 0, -80);
    ctx.bezierCurveTo(0, -130, -60, -180, -100, -120);
    ctx.bezierCurveTo(-140, -60, -80, 10, 0, 60);
    ctx.fill();

    // Rosetta leaves wings
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      ctx.beginPath();
      ctx.ellipse(i * 36, -30 - Math.abs(i) * 18, 14, 26, (i * Math.PI) / 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fill();
    }

    // Small stem tip
    ctx.beginPath();
    ctx.arc(0, 75, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // Helper to generate Cappuccino Foam with Cocoa Dusting texture
  const createCappuccinoTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    // Crema ring around edge
    const grad = ctx.createRadialGradient(256, 256, 120, 256, 256, 256);
    grad.addColorStop(0, '#FCF9F3');
    grad.addColorStop(0.7, '#F3E5D4');
    grad.addColorStop(0.88, '#B87333');
    grad.addColorStop(1, '#532909');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Dusted Cocoa particles
    ctx.fillStyle = '#3E2110';
    for (let i = 0; i < 400; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.6) * 160;
      const x = 256 + Math.cos(angle) * radius;
      const y = 256 + Math.sin(angle) * radius;
      const size = 1 + Math.random() * 2.8;
      ctx.globalAlpha = 0.4 + Math.random() * 0.55;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // Helper to generate Matcha Froth texture
  const createMatchaTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    const grad = ctx.createRadialGradient(256, 256, 80, 256, 256, 256);
    grad.addColorStop(0, '#5C9642');
    grad.addColorStop(0.7, '#44752E');
    grad.addColorStop(1, '#2B4D1B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Whisk foam bubbles
    for (let i = 0; i < 500; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 220;
      const x = 256 + Math.cos(angle) * dist;
      const y = 256 + Math.sin(angle) * dist;
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(125, 185, 95, 0.7)' : 'rgba(38, 70, 24, 0.6)';
      ctx.beginPath();
      ctx.arc(x, y, 1 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // Build the 3D Drink model based on active drink type
  const buildDrinkModel = (scene: THREE.Scene, type: string, exploded: boolean) => {
    if (drinkGroupRef.current) {
      scene.remove(drinkGroupRef.current);
    }

    const group = new THREE.Group();
    drinkGroupRef.current = group;
    bobaPearlsRef.current = [];
    iceCubesRef.current = [];

    // Common ceramic material
    const ceramicMat = new THREE.MeshStandardMaterial({
      color: 0xfbf8f3,
      roughness: 0.15,
      metalness: 0.05,
    });

    // Saucer plate
    const saucerGeo = new THREE.CylinderGeometry(2.3, 1.4, 0.18, 48);
    const saucer = new THREE.Mesh(saucerGeo, ceramicMat);
    saucer.position.y = -1.15;
    saucer.castShadow = true;
    saucer.receiveShadow = true;
    group.add(saucer);

    const saucerRimGeo = new THREE.TorusGeometry(2.2, 0.08, 16, 48);
    saucerRimGeo.rotateX(Math.PI / 2);
    const saucerRim = new THREE.Mesh(saucerRimGeo, ceramicMat);
    saucerRim.position.y = -1.06;
    group.add(saucerRim);

    if (type === 'cappuccino' || type === 'latte') {
      // Ceramic cup body
      const cupGeo = new THREE.CylinderGeometry(1.5, 1.05, 1.9, 48, 1, true);
      const cupMesh = new THREE.Mesh(cupGeo, ceramicMat);
      cupMesh.position.y = 0;
      group.add(cupMesh);

      // Inner cup wall
      const innerCupGeo = new THREE.CylinderGeometry(1.44, 0.99, 1.88, 48, 1, true);
      const innerMat = new THREE.MeshStandardMaterial({
        color: 0xfdfaf6,
        roughness: 0.2,
        side: THREE.BackSide,
      });
      const innerCup = new THREE.Mesh(innerCupGeo, innerMat);
      group.add(innerCup);

      // Cup rim ring
      const rimGeo = new THREE.TorusGeometry(1.47, 0.05, 16, 48);
      rimGeo.rotateX(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, ceramicMat);
      rim.position.y = 0.95;
      group.add(rim);

      // Cup handle
      const handleGeo = new THREE.TorusGeometry(0.55, 0.12, 16, 32, Math.PI * 1.25);
      handleGeo.rotateZ(-Math.PI / 4);
      const handle = new THREE.Mesh(handleGeo, ceramicMat);
      handle.position.set(1.45, 0.1, 0);
      group.add(handle);

      // Liquid base & foam layers
      const liquidGeo = new THREE.CylinderGeometry(1.42, 1.02, 1.7, 48);
      const liquidMat = new THREE.MeshStandardMaterial({
        color: type === 'cappuccino' ? 0x3d1f0d : 0x4a2810,
        roughness: 0.3,
      });
      const liquid = new THREE.Mesh(liquidGeo, liquidMat);
      liquid.position.y = exploded ? -0.4 : -0.05;
      group.add(liquid);

      // Top froth disc with texture
      const topDiscGeo = new THREE.CircleGeometry(1.41, 48);
      topDiscGeo.rotateX(-Math.PI / 2);

      const topTexture = type === 'latte' ? createLatteArtTexture() : createCappuccinoTexture();
      const topMat = new THREE.MeshStandardMaterial({
        map: topTexture,
        roughness: 0.5,
        metalness: 0.05,
      });
      const topDisc = new THREE.Mesh(topDiscGeo, topMat);
      topDisc.position.y = exploded ? 1.4 : 0.82;
      group.add(topDisc);

      // Foam dome for cappuccino
      if (type === 'cappuccino') {
        const domeGeo = new THREE.SphereGeometry(1.41, 32, 16, 0, Math.PI * 2, 0, Math.PI / 4);
        const domeMat = new THREE.MeshStandardMaterial({
          color: 0xfffaee,
          roughness: 0.6,
          bumpScale: 0.05,
        });
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.position.y = exploded ? 1.3 : 0.78;
        group.add(dome);
      }
    } else if (type === 'espresso') {
      // Petite demitasse cup
      const cupGeo = new THREE.CylinderGeometry(1.1, 0.75, 1.2, 40, 1, true);
      const cupMesh = new THREE.Mesh(cupGeo, ceramicMat);
      cupMesh.position.y = -0.3;
      group.add(cupMesh);

      const rimGeo = new THREE.TorusGeometry(1.08, 0.05, 16, 40);
      rimGeo.rotateX(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, ceramicMat);
      rim.position.y = 0.3;
      group.add(rim);

      const handleGeo = new THREE.TorusGeometry(0.38, 0.09, 16, 28, Math.PI * 1.3);
      handleGeo.rotateZ(-Math.PI / 4);
      const handle = new THREE.Mesh(handleGeo, ceramicMat);
      handle.position.set(1.1, -0.25, 0);
      group.add(handle);

      // Deep crema top
      const cremaGeo = new THREE.CircleGeometry(1.03, 40);
      cremaGeo.rotateX(-Math.PI / 2);
      const cremaMat = new THREE.MeshStandardMaterial({
        color: 0xba762d,
        roughness: 0.25,
        metalness: 0.1,
      });
      const crema = new THREE.Mesh(cremaGeo, cremaMat);
      crema.position.y = exploded ? 0.7 : 0.15;
      group.add(crema);

      // Liquid core
      const liquidGeo = new THREE.CylinderGeometry(1.02, 0.72, 0.8, 36);
      const liquidMat = new THREE.MeshStandardMaterial({
        color: 0x220e04,
        roughness: 0.1,
      });
      const liquid = new THREE.Mesh(liquidGeo, liquidMat);
      liquid.position.y = exploded ? -0.6 : -0.3;
      group.add(liquid);
    } else if (type === 'matcha') {
      // Modern Japanese clear/ribbed glass cup
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.9,
        opacity: 1,
        transparent: true,
        roughness: 0.1,
        ior: 1.5,
        thickness: 0.3,
      });

      const glassGeo = new THREE.CylinderGeometry(1.35, 1.05, 2.3, 48, 1, true);
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.y = 0.2;
      group.add(glass);

      const baseGeo = new THREE.CylinderGeometry(1.04, 1.04, 0.15, 48);
      const base = new THREE.Mesh(baseGeo, glassMat);
      base.position.y = -0.92;
      group.add(base);

      // Layer 1: Oat milk bottom
      const milkLayerGeo = new THREE.CylinderGeometry(1.16, 1.03, 0.9, 48);
      const milkMat = new THREE.MeshStandardMaterial({
        color: 0xfbf6ec,
        roughness: 0.2,
      });
      const milkLayer = new THREE.Mesh(milkLayerGeo, milkMat);
      milkLayer.position.y = exploded ? -0.8 : -0.45;
      group.add(milkLayer);

      // Layer 2: Emerald matcha liquid
      const matchaLayerGeo = new THREE.CylinderGeometry(1.28, 1.16, 0.95, 48);
      const matchaMat = new THREE.MeshStandardMaterial({
        color: 0x3f7228,
        roughness: 0.3,
      });
      const matchaLayer = new THREE.Mesh(matchaLayerGeo, matchaMat);
      matchaLayer.position.y = exploded ? 0.35 : 0.35;
      group.add(matchaLayer);

      // Layer 3: Matcha frothy top disc
      const matchaFrothGeo = new THREE.CircleGeometry(1.32, 48);
      matchaFrothGeo.rotateX(-Math.PI / 2);
      const matchaFrothMat = new THREE.MeshStandardMaterial({
        map: createMatchaTexture(),
        roughness: 0.6,
      });
      const matchaFroth = new THREE.Mesh(matchaFrothGeo, matchaFrothMat);
      matchaFroth.position.y = exploded ? 1.5 : 0.83;
      group.add(matchaFroth);
    } else if (type === 'boba') {
      // Tall clear Boba Cup
      const bobaGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.92,
        opacity: 1,
        transparent: true,
        roughness: 0.08,
        ior: 1.48,
        thickness: 0.25,
      });

      const cupGeo = new THREE.CylinderGeometry(1.38, 1.05, 2.7, 48, 1, true);
      const cup = new THREE.Mesh(cupGeo, bobaGlassMat);
      cup.position.y = 0.35;
      group.add(cup);

      const bottomCap = new THREE.Mesh(
        new THREE.CylinderGeometry(1.05, 1.05, 0.12, 48),
        bobaGlassMat
      );
      bottomCap.position.y = -0.98;
      group.add(bottomCap);

      // Milk tea liquid body
      const teaGeo = new THREE.CylinderGeometry(1.34, 1.03, 2.35, 48);
      const teaMat = new THREE.MeshStandardMaterial({
        color: 0xc89667,
        roughness: 0.25,
      });
      const teaLiquid = new THREE.Mesh(teaGeo, teaMat);
      teaLiquid.position.y = exploded ? 0.6 : 0.22;
      group.add(teaLiquid);

      // Cream cap on top
      const creamCapGeo = new THREE.CylinderGeometry(1.35, 1.32, 0.3, 48);
      const creamCapMat = new THREE.MeshStandardMaterial({
        color: 0xfffcf7,
        roughness: 0.4,
      });
      const creamCap = new THREE.Mesh(creamCapGeo, creamCapMat);
      creamCap.position.y = exploded ? 1.7 : 1.35;
      group.add(creamCap);

      // 3D Animated Boba Pearls (tapioca spheres clustered at bottom)
      const bobaMat = new THREE.MeshStandardMaterial({
        color: 0x140804,
        roughness: 0.12,
        metalness: 0.4,
      });

      const bobaCount = 28;
      for (let i = 0; i < bobaCount; i++) {
        const pearlRadius = 0.14 + Math.random() * 0.04;
        const pearlGeo = new THREE.SphereGeometry(pearlRadius, 16, 16);
        const pearl = new THREE.Mesh(pearlGeo, bobaMat);

        const angle = Math.random() * Math.PI * 2;
        const rad = Math.sqrt(Math.random()) * 0.85;
        const px = Math.cos(angle) * rad;
        const pz = Math.sin(angle) * rad;
        const py = -0.85 + Math.random() * 0.55 + (exploded ? -0.5 : 0);

        pearl.position.set(px, py, pz);
        group.add(pearl);
        bobaPearlsRef.current.push(pearl);
      }

      // 3D Ice Cubes
      const iceMat = new THREE.MeshPhysicalMaterial({
        color: 0xf2f8fd,
        transmission: 0.85,
        transparent: true,
        opacity: 0.8,
        roughness: 0.15,
        ior: 1.31,
      });

      for (let i = 0; i < 4; i++) {
        const iceGeo = new THREE.BoxGeometry(0.48, 0.48, 0.48);
        const ice = new THREE.Mesh(iceGeo, iceMat);
        ice.position.set(
          (Math.random() - 0.5) * 0.8,
          0.4 + i * 0.22 + (exploded ? 0.8 : 0),
          (Math.random() - 0.5) * 0.8
        );
        ice.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        group.add(ice);
        iceCubesRef.current.push(ice);
      }

      // Giant Boba Straw
      const strawGeo = new THREE.CylinderGeometry(0.16, 0.16, 3.8, 24);
      const strawMat = new THREE.MeshStandardMaterial({
        color: 0xf07167,
        roughness: 0.3,
      });
      const straw = new THREE.Mesh(strawGeo, strawMat);
      straw.position.set(0.35, 1.2, 0.2);
      straw.rotation.z = -0.22;
      straw.rotation.x = 0.15;
      group.add(straw);
    } else if (type === 'iced-brew') {
      // Glass tumbler
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.92,
        roughness: 0.06,
        transparent: true,
        thickness: 0.3,
      });

      const tumblerGeo = new THREE.CylinderGeometry(1.3, 1.1, 2.5, 48, 1, true);
      const tumbler = new THREE.Mesh(tumblerGeo, glassMat);
      tumbler.position.y = 0.3;
      group.add(tumbler);

      // Deep cold brew liquid
      const brewGeo = new THREE.CylinderGeometry(1.26, 1.06, 2.2, 48);
      const brewMat = new THREE.MeshStandardMaterial({
        color: 0x241407,
        roughness: 0.2,
      });
      const brew = new THREE.Mesh(brewGeo, brewMat);
      brew.position.y = exploded ? 0.3 : 0.18;
      group.add(brew);

      // Sweet cream float on top
      const creamGeo = new THREE.CylinderGeometry(1.27, 1.24, 0.45, 48);
      const creamMat = new THREE.MeshStandardMaterial({
        color: 0xfffcf2,
        roughness: 0.45,
      });
      const cream = new THREE.Mesh(creamGeo, creamMat);
      cream.position.y = exploded ? 1.6 : 1.15;
      group.add(cream);

      // Floating crystal ice cubes
      const iceMat = new THREE.MeshPhysicalMaterial({
        color: 0xe8f4f8,
        transmission: 0.88,
        transparent: true,
        roughness: 0.1,
      });

      for (let i = 0; i < 5; i++) {
        const ice = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), iceMat);
        ice.position.set(
          (Math.random() - 0.5) * 0.9,
          0.35 + i * 0.2 + (exploded ? 0.7 : 0),
          (Math.random() - 0.5) * 0.9
        );
        ice.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        group.add(ice);
        iceCubesRef.current.push(ice);
      }
    }

    // Steam particle system for hot drinks
    if (type === 'cappuccino' || type === 'latte' || type === 'espresso') {
      const particleCount = 45;
      const particlesGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 1.2;
        positions[i * 3 + 1] = 0.9 + Math.random() * 2.2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
      }

      particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Canvas circle for smooth steam particles
      const steamCanvas = document.createElement('canvas');
      steamCanvas.width = 64;
      steamCanvas.height = 64;
      const sCtx = steamCanvas.getContext('2d');
      if (sCtx) {
        const grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        sCtx.fillStyle = grad;
        sCtx.fillRect(0, 0, 64, 64);
      }
      const steamTex = new THREE.CanvasTexture(steamCanvas);

      const steamMat = new THREE.PointsMaterial({
        size: 0.55,
        map: steamTex,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const steam = new THREE.Points(particlesGeo, steamMat);
      steamParticlesRef.current = steam;
      group.add(steam);
    } else {
      steamParticlesRef.current = null;
    }

    scene.add(group);
  };

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 5.5);
    camera.lookAt(0, 0.1, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Warm Ambient Light
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.4);
    scene.add(ambientLight);

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Soft Rim Light from behind
    const rimLight = new THREE.DirectionalLight(0xa5d8ff, 1.5);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    // Warm Fill Light from front
    const fillLight = new THREE.PointLight(0xffdfba, 1.2, 10);
    fillLight.position.set(0, 1, 4);
    scene.add(fillLight);

    // Build Initial Drink
    buildDrinkModel(scene, selectedId, isExploded);

    // Mouse Drag Controls for 360 rotation
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !drinkGroupRef.current) return;
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;

      drinkGroupRef.current.rotation.y += deltaX * 0.008;
      drinkGroupRef.current.rotation.x = Math.max(
        -0.4,
        Math.min(0.6, drinkGroupRef.current.rotation.x + deltaY * 0.008)
      );

      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Touch Controls
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !drinkGroupRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePosRef.current.x;
      const deltaY = e.touches[0].clientY - prevMousePosRef.current.y;

      drinkGroupRef.current.rotation.y += deltaX * 0.008;
      drinkGroupRef.current.rotation.x = Math.max(
        -0.4,
        Math.min(0.6, drinkGroupRef.current.rotation.x + deltaY * 0.008)
      );

      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Gentle auto-rotation
      if (isAutoRotating && !isDraggingRef.current && drinkGroupRef.current) {
        drinkGroupRef.current.rotation.y += delta * 0.45;
      }

      // Animate steam particles
      if (steamParticlesRef.current) {
        const positions = steamParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length / 3; i++) {
          positions[i * 3 + 1] += delta * 0.65;
          positions[i * 3] += Math.sin(time * 2 + i) * 0.002;
          if (positions[i * 3 + 1] > 3.2) {
            positions[i * 3 + 1] = 0.9;
            positions[i * 3] = (Math.random() - 0.5) * 0.8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
          }
        }
        steamParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Animate Boba pearls subtle float
      if (bobaPearlsRef.current.length > 0) {
        bobaPearlsRef.current.forEach((pearl, idx) => {
          pearl.position.y += Math.sin(time * 3 + idx) * 0.001;
        });
      }

      // Animate Ice cubes bobbing
      if (iceCubesRef.current.length > 0) {
        iceCubesRef.current.forEach((ice, idx) => {
          ice.position.y += Math.cos(time * 2 + idx) * 0.0015;
          ice.rotation.y += 0.002;
        });
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
    };
  }, []);

  // Re-build model when selected drink or exploded mode changes
  useEffect(() => {
    if (sceneRef.current) {
      buildDrinkModel(sceneRef.current, selectedId, isExploded);
    }
  }, [selectedId, isExploded]);

  const handleAddToOrder = () => {
    if (onSelectForOrder && activePreset.menuItemId) {
      onSelectForOrder(activePreset.menuItemId);
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2500);
    }
  };

  return (
    <div
      id="drink-3d-studio"
      className={`relative w-full rounded-3xl overflow-hidden border shadow-2xl transition-colors duration-200 ${
        isDark
          ? 'bg-[#231612] border-[#C28E5C]/35 text-[#F7F0E3]'
          : 'bg-[#FFFFFF] border-[#C28E5C]/30 text-[#2B1B16]'
      }`}
    >
      {/* Subtle ambient gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C28E5C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6F4E37]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div
        className={`relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${
          isDark
            ? 'bg-[#1F130F] border-[#C28E5C]/20 text-[#F7F0E3]'
            : 'bg-[#F7F0E3]/60 border-[#C28E5C]/20 text-[#2B1B16]'
        }`}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${
                isDark
                  ? 'bg-[#2B1B16] text-[#C28E5C] border-[#C28E5C]/40'
                  : 'bg-[#FFFFFF] text-[#6F4E37] border-[#C28E5C]/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C28E5C]" />
              Interactive 3D Drink Studio
            </span>
            <span className="text-xs text-[#6F4E37] dark:text-[#C28E5C] font-medium">Drag to rotate 360°</span>
          </div>
          <h2
            className={`text-2xl sm:text-3xl font-serif font-bold tracking-tight ${
              isDark ? 'text-[#FFFFFF]' : 'text-[#2B1B16]'
            }`}
          >
            Craftsmanship in 3D <span className="text-[#C28E5C]">☕✨</span>
          </h2>
          <p
            className={`text-sm max-w-xl ${
              isDark ? 'text-[#F7F0E3]/80' : 'text-[#2B1B16]/80'
            }`}
          >
            Explore the anatomy of handcrafted drinks: silky microfoam, heart latte art, ceremonial matcha whisk, and chewy boba pearls.
          </p>
        </div>

        {/* 3D View Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            id="toggle-rotation-btn"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              isAutoRotating
                ? 'bg-[#6F4E37] text-[#FFFFFF] shadow-sm'
                : isDark
                ? 'bg-[#2B1B16] text-[#F7F0E3] hover:bg-[#34201A] border border-[#C28E5C]/30'
                : 'bg-[#FFFFFF] text-[#2B1B16] hover:bg-[#F7F0E3] border border-[#C28E5C]/30'
            }`}
            title="Toggle 360° auto-rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin text-[#C28E5C]' : 'text-[#6F4E37] dark:text-[#C28E5C]'}`} />
            Auto-Spin
          </button>

          <button
            id="toggle-exploded-layers-btn"
            onClick={() => setIsExploded(!isExploded)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              isExploded
                ? 'bg-[#6F4E37] text-[#FFFFFF] shadow-sm'
                : isDark
                ? 'bg-[#2B1B16] text-[#F7F0E3] hover:bg-[#34201A] border border-[#C28E5C]/30'
                : 'bg-[#FFFFFF] text-[#2B1B16] hover:bg-[#F7F0E3] border border-[#C28E5C]/30'
            }`}
            title="Explode drink layers to inspect composition"
          >
            <Layers className="w-3.5 h-3.5 text-[#C28E5C]" />
            {isExploded ? 'Combined View' : 'Deconstruct Layers'}
          </button>
        </div>
      </div>

      {/* Drink Type Selector Tabs */}
      <div
        className={`relative z-10 px-6 sm:px-8 py-3 border-b overflow-x-auto scrollbar-none flex items-center gap-2 ${
          isDark
            ? 'bg-[#180F0C] border-[#C28E5C]/20'
            : 'bg-[#F7F0E3] border-[#C28E5C]/20'
        }`}
      >
        {THREE_D_PRESETS.map((preset) => (
          <button
            key={preset.id}
            id={`preset-tab-${preset.id}`}
            onClick={() => setSelectedId(preset.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedId === preset.id
                ? 'bg-[#6F4E37] text-[#FFFFFF] shadow-md ring-1 ring-[#C28E5C] font-semibold'
                : isDark
                ? 'bg-[#231612] text-[#F7F0E3]/80 hover:bg-[#34201A] border border-[#C28E5C]/30'
                : 'bg-[#FFFFFF] text-[#2B1B16] hover:bg-[#FFFFFF] border border-[#C28E5C]/30'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full ring-1 ring-black/20"
              style={{ backgroundColor: preset.color }}
            />
            {preset.name}
          </button>
        ))}
      </div>

      {/* Main 3D Canvas & Info Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
        {/* 3D Canvas Area */}
        <div
          className={`lg:col-span-7 relative flex items-center justify-center cursor-grab active:cursor-grabbing p-4 ${
            isDark ? 'bg-[#180F0C]/60' : 'bg-[#F7F0E3]/40'
          }`}
        >
          <div
            ref={containerRef}
            id="threejs-drink-canvas-container"
            className="w-full h-[380px] sm:h-[440px]"
          />

          {/* Canvas Floating Hint */}
          <div
            className={`absolute bottom-4 left-6 flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md border text-[11px] shadow-sm ${
              isDark
                ? 'bg-[#2B1B16]/90 border-[#C28E5C]/40 text-[#F7F0E3]'
                : 'bg-[#FFFFFF]/90 border-[#C28E5C]/40 text-[#2B1B16]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#C28E5C]" />
            <span>Drag horizontally to rotate & view all angles</span>
          </div>
        </div>

        {/* Drink Anatomy & Details Panel */}
        <div
          className={`lg:col-span-5 p-6 sm:p-8 border-t lg:border-t-0 lg:border-l flex flex-col justify-between ${
            isDark
              ? 'bg-[#231612] border-[#C28E5C]/25 text-[#F7F0E3]'
              : 'bg-[#FFFFFF] border-[#C28E5C]/20 text-[#2B1B16]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C28E5C]">
                {activePreset.tag}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                  isDark
                    ? 'bg-[#2B1B16] text-[#F7F0E3] border-[#C28E5C]/30'
                    : 'bg-[#F7F0E3] text-[#2B1B16] border-[#C28E5C]/30'
                }`}
              >
                {activePreset.temperature}
              </span>
            </div>

            <h3
              className={`text-2xl font-serif font-bold mb-1 ${
                isDark ? 'text-[#FFFFFF]' : 'text-[#2B1B16]'
              }`}
            >
              {activePreset.name}
            </h3>
            <p className="text-xs text-[#6F4E37] dark:text-[#C28E5C] font-semibold mb-3">
              {activePreset.subtitle}
            </p>
            <p className="text-sm opacity-80 leading-relaxed mb-6">
              {activePreset.description}
            </p>

            {/* Layer Breakdown Bar */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-xs font-medium">
                <span>Ingredient Architecture</span>
                <span className="text-[#C28E5C] text-[11px] font-mono font-bold">100% Balanced</span>
              </div>

              <div
                className={`h-3 w-full rounded-full overflow-hidden flex ring-1 ring-[#C28E5C]/30 ${
                  isDark ? 'bg-[#180F0C]' : 'bg-[#F7F0E3]'
                }`}
              >
                {activePreset.layers.map((layer, idx) => (
                  <div
                    key={idx}
                    className="h-full transition-all duration-500 hover:brightness-110"
                    style={{
                      width: layer.pct,
                      backgroundColor: layer.color,
                    }}
                    title={`${layer.name}: ${layer.pct}`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {activePreset.layers.map((layer, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs opacity-85">
                    <span
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0 border border-black/15"
                      style={{ backgroundColor: layer.color }}
                    />
                    <span className="truncate font-medium">{layer.name}</span>
                    <span className="text-[#6F4E37] dark:text-[#C28E5C] ml-auto font-mono text-[10px] font-bold">
                      {layer.pct}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border text-xs mb-6 ${
                isDark
                  ? 'bg-[#2B1B16] border-[#C28E5C]/40'
                  : 'bg-[#F7F0E3] border-[#C28E5C]/40'
              }`}
            >
              <span className="font-bold text-[#6F4E37] dark:text-[#C28E5C]">Barista Recommendation: </span>
              Best paired with {activePreset.recommendedMilk}. Whisked or steamed at exact temperature to preserve aromatic sweetness.
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-[#C28E5C]/20 flex items-center gap-3">
            <button
              id="order-3d-preset-button"
              onClick={handleAddToOrder}
              className="flex-1 py-3.5 px-5 rounded-xl bg-[#6F4E37] hover:bg-[#5A3E2B] active:scale-[0.98] text-[#FFFFFF] font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 border border-[#C28E5C]/40"
            >
              {addedNotice ? (
                <>
                  <Check className="w-4 h-4 text-[#FFFFFF]" />
                  <span>Added to Order!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-[#C28E5C]" />
                  <span>Customize & Order {activePreset.name}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
