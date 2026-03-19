"use client"

// Hero 3D Landing Section: Cinematic SaaS/dev-tool hero with 3D laptop, GSAP, Drei, Tailwind
import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, RoundedBox } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register GSAP plugins
if (typeof window !== "undefined" && gsap && !gsap.core.globals()["ScrollTrigger"]) {
  gsap.registerPlugin(ScrollTrigger);
}

// --- 3D Laptop Model ---
function Laptop3D({ groupRef, lidRef, screenRef, screenTexture }) {
  // Dimensions
  const baseW = 2.8, baseH = 0.18, baseD = 1.8;
  const lidW = 2.7, lidH = 0.13, lidD = 1.7;
  const hingeR = 0.09, hingeH = 2.5;
  const keyboardW = 2.3, keyboardD = 0.7;
  const trackpadW = 0.45, trackpadD = 0.28;

  // Materials
  const darkMetal = new THREE.MeshStandardMaterial({
    color: "#1a1a2e",
    roughness: 0.3,
    metalness: 0.8,
    envMapIntensity: 1.2,
  });
  const darkMetalLid = new THREE.MeshStandardMaterial({
    color: "#181828",
    roughness: 0.25,
    metalness: 0.85,
    envMapIntensity: 1.3,
  });
  const keyboardMat = new THREE.MeshStandardMaterial({
    color: "#23233a",
    roughness: 0.4,
    metalness: 0.5,
  });
  const trackpadMat = new THREE.MeshStandardMaterial({
    color: "#23233a",
    roughness: 0.2,
    metalness: 0.7,
    emissive: new THREE.Color("#22223a"),
    emissiveIntensity: 0.2,
  });
  const screenMat = new THREE.MeshBasicMaterial({
    map: screenTexture,
    toneMapped: false,
    emissive: new THREE.Color("#7c3aed"),
    emissiveIntensity: 0.7,
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} castShadow receiveShadow>
      {/* Base */}
      <mesh castShadow receiveShadow position={[0, baseH / 2, 0]} material={darkMetal}>
        <boxGeometry args={[baseW, baseH, baseD]} />
      </mesh>
      {/* Keyboard area */}
      <mesh
        position={[0, baseH + 0.01, -0.13]}
        material={keyboardMat}
        receiveShadow
      >
        <planeGeometry args={[keyboardW, keyboardD]} />
        {/* Keyboard keys (optional: subtle lines) */}
      </mesh>
      {/* Trackpad */}
      <RoundedBox
        position={[0, baseH + 0.015, 0.45]}
        args={[trackpadW, 0.025, trackpadD]}
        radius={0.04}
        smoothness={4}
        material={trackpadMat}
        castShadow
        receiveShadow
      />
      {/* Hinge */}
      <mesh
        position={[0, baseH + hingeR / 2 - 0.01, -baseD / 2 + hingeR]}
        rotation={[Math.PI / 2, 0, 0]}
        material={darkMetalLid}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[hingeR, hingeR, hingeH, 32]} />
      </mesh>
      {/* Lid (Screen) */}
      <group ref={lidRef} position={[0, baseH + hingeR, -baseD / 2 + lidD / 2 + hingeR * 0.2]}>
        <mesh castShadow receiveShadow material={darkMetalLid}>
          <boxGeometry args={[lidW, lidH, lidD]} />
        </mesh>
        {/* Screen Display */}
        <mesh
          ref={screenRef}
          position={[0, 0.01 + lidH / 2, lidD / 2 - 0.08]}
          material={screenMat}
        >
          <planeGeometry args={[lidW * 0.93, lidD * 0.7]} />
        </mesh>
      </group>
    </group>
  );
}

// --- Animated Screen Texture ---
function useAnimatedScreenTexture() {
  const [texture] = useState(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext("2d");
    // Initial draw
    ctx.fillStyle = "#181828";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return new THREE.CanvasTexture(canvas);
  });

  useFrame(({ clock }) => {
    const canvas = texture.image;
    const ctx = canvas.getContext("2d");
    // Animated gradient background
    const t = clock.getElapsedTime();
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#23233a");
    grad.addColorStop(0.5 + 0.2 * Math.sin(t * 0.3), "#7c3aed");
    grad.addColorStop(1, "#22d3ee");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Fake UI lines
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = i % 2 === 0 ? "#7c3aed" : "#22d3ee";
      ctx.lineWidth = 2 + Math.sin(t * 0.7 + i) * 1.2;
      ctx.beginPath();
      ctx.moveTo(40, 40 + i * 38 + Math.sin(t * 0.8 + i) * 6);
      ctx.lineTo(canvas.width - 40, 40 + i * 38 + Math.sin(t * 0.8 + i) * 6);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    texture.needsUpdate = true;
  });

  return texture;
}

// --- Lighting Rig ---
function HeroLights() {
  return (
    <>
      <ambientLight intensity={0.3} color="#c8d4ff" />
      <spotLight
        position={[-3, 7, 5]}
        angle={0.5}
        penumbra={0.7}
        intensity={2.2}
        color="#fff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight
        position={[0, 1.2, 2.6]}
        color="#7c3aed"
        intensity={2.1}
        distance={5}
        decay={2}
      />
    </>
  );
}

// --- 3D Scene ---
function Hero3DScene({ timelineRef, opacity, setOpacity }) {
  const groupRef = useRef();
  const lidRef = useRef();
  const screenRef = useRef();
  const screenTexture = useAnimatedScreenTexture();
  const { camera, gl } = useThree();

  // GSAP Animations
  useGSAP(() => {
    if (!groupRef.current || !lidRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
    // Start: lid closed, group below, camera far
    gsap.set(groupRef.current.position, { y: -3 });
    gsap.set(lidRef.current.rotation, { x: -Math.PI / 2 });
    gsap.set(camera.position, { z: 8, y: 1.2 });
    setOpacity(0);
    // Animate in
    tl.to(
      groupRef.current.position,
      { y: 0, duration: 1.6, ease: "elastic.out(1,0.5)" },
      0.1
    )
      .to(
        lidRef.current.rotation,
        { x: -0.36, duration: 1.8 },
        0.0
      )
      .to(
        camera.position,
        { z: 4.2, y: 0.5, duration: 1.5 },
        0.2
      )
      .to(
        {},
        { duration: 0.1, onComplete: () => setOpacity(1) },
        1.2
      );
    // Idle float
    gsap.to(groupRef.current.position, {
      y: "+=0.15",
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(groupRef.current.rotation, {
      y: "+=0.05",
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    // ScrollTrigger: tilt and scale on scroll
    ScrollTrigger.create({
      trigger: gl.domElement,
      start: "top top",
      end: "+=400",
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.to(groupRef.current.rotation, { x: -0.36 - p * 0.3, overwrite: true });
        gsap.to(groupRef.current.scale, { x: 1 - p * 0.12, y: 1 - p * 0.12, z: 1 - p * 0.12, overwrite: true });
        gsap.to(camera.position, { z: 4.2 + p * 1.6, y: 0.5 + p * 0.7, overwrite: true });
      },
    });
    timelineRef.current = tl;
  }, []);

  return (
    <div className="w-full h-full" style={{ opacity, transition: "opacity 0.7s" }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.5, 8], fov: 38 }}
        gl={{ alpha: true, antialias: true }}
        className="w-full h-full bg-transparent"
      >
        <color attach="background" args={["transparent"]} />
        <HeroLights />
        <Laptop3D
          groupRef={groupRef}
          lidRef={lidRef}
          screenRef={screenRef}
          screenTexture={screenTexture}
        />
        <Environment preset="city" />
        <EffectComposer disableNormalPass>
          <Bloom intensity={0.6} luminanceThreshold={0.3} />
          <ChromaticAberration offset={[0.001, 0.001]} />
          <Vignette eskil={false} offset={0.1} darkness={0.5} />
        </EffectComposer>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.3}
          maxPolarAngle={Math.PI / 1.7}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}

// --- Hero Overlay UI ---
function HeroOverlay({ timelineRef }) {
  // GSAP staggered text/button animation
  const overlineRef = useRef();
  const h1Ref = useRef();
  const subRef = useRef();
  const cta1Ref = useRef();
  const cta2Ref = useRef();

  useGSAP(() => {
    const items = [overlineRef.current, h1Ref.current, subRef.current, cta1Ref.current, cta2Ref.current];
    gsap.set(items, { opacity: 0, y: 30 });
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power2.out",
      delay: 0.5,
    });
  }, []);

  return (
    <div className="relative z-10 flex flex-col gap-7 px-6 pt-24 pb-12 md:pt-36 md:pb-24 md:pl-16 md:gap-10 max-w-2xl">
      <span
        ref={overlineRef}
        className="uppercase tracking-widest text-xs font-semibold text-cyan-400 mb-2"
        style={{ letterSpacing: "0.18em" }}
      >
        Introducing v2.0
      </span>
      <h1
        ref={h1Ref}
        className="text-[clamp(2.8rem,7vw,5rem)] leading-[1.08] font-extrabold text-white font-syne drop-shadow-xl"
      >
        The Next-Gen
        <br />
        Developer Workspace
      </h1>
      <p
        ref={subRef}
        className="text-lg md:text-xl text-zinc-400 max-w-xl mb-2"
      >
        Build, deploy, and collaborate in a cinematic 3D environment. Experience the future of SaaS dev tools — fast, beautiful, and immersive.
      </p>
      <div className="flex gap-4 mt-2">
        <button
          ref={cta1Ref}
          className="px-7 py-3 rounded-full font-semibold text-base bg-gradient-to-r from-violet-600 to-cyan-400 text-white shadow-lg border-2 border-transparent hover:from-violet-700 hover:to-cyan-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          Get Started
        </button>
        <button
          ref={cta2Ref}
          className="px-7 py-3 rounded-full font-semibold text-base border border-zinc-600 bg-zinc-900/70 text-zinc-100 hover:bg-zinc-800/90 hover:border-cyan-400 transition-all"
        >
          Live Demo
        </button>
      </div>
    </div>
  );
}

// --- Grid Overlay & Gradient Blob ---
function GridAndBlobBG() {
  return (
    <>
      {/* SVG Grid Overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'><rect x=\'0\' y=\'0\' width=\'40\' height=\'40\' fill=\'none\'/><path d=\'M40 0V40H0\' stroke=\'%236b7280\' stroke-opacity=\'0.09\' stroke-width=\'1\'/><path d=\'M0 0H40V40\' stroke=\'%236b7280\' stroke-opacity=\'0.09\' stroke-width=\'1\'/></svg>')",
          backgroundRepeat: "repeat",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Radial Gradient Blob */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
        style={{
          width: 540,
          height: 420,
          filter: "blur(90px)",
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, #7c3aed88 0%, #22d3ee33 60%, transparent 100%)",
          opacity: 0.7,
        }}
      />
    </>
  );
}

// --- Main Hero Component ---
export default function Hero3DLanding() {
  const timelineRef = useRef();
  const [opacity, setOpacity] = useState(0);

  // Responsive: hide canvas on mobile
  const [isMobile, setIsMobile] = useState(false);
  useLayoutEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#07070f] flex flex-col justify-center items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 60% 40%, #0a0a14 0%, #12001a 100%)"
      }} />
      <GridAndBlobBG />
      <div className="relative z-10 flex flex-col-reverse md:flex-row w-full max-w-7xl mx-auto min-h-screen items-center justify-center">
        {/* Left: Overlay UI */}
        <div className="flex-1 flex items-center justify-center md:justify-start">
          <HeroOverlay timelineRef={timelineRef} />
        </div>
        {/* Right: 3D Canvas */}
        <div className="flex-1 flex items-center justify-center min-h-[420px] md:min-h-[540px] w-full md:w-[48vw] relative">
          {!isMobile && (
            <Hero3DScene timelineRef={timelineRef} opacity={opacity} setOpacity={setOpacity} />
          )}
        </div>
      </div>
    </div>
  );
}
