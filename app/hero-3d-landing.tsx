"use client"

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useEffect } from "react";

// Remove all @react-three/postprocessing imports and usage

function AnimatedLaptop() {
  const group = useRef<THREE.Group>(null);
  const screen = useRef<THREE.Mesh>(null);

  // Animate laptop opening on mount
  useEffect(() => {
    gsap.to(group.current!.rotation, {
      x: 0,
      duration: 1.2,
      ease: "power3.out",
    });
    gsap.fromTo(
      screen.current!.material,
      { emissiveIntensity: 0 },
      { emissiveIntensity: 1.2, duration: 1.2, ease: "power2.inOut" }
    );
  }, []);

  // Idle floating
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1 + 0.2;
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    if (screen.current) {
      (screen.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group ref={group} rotation={[Math.PI / 1.7, 0, 0]} position={[0, 0.2, 0]}>
      {/* Laptop base */}
      <RoundedBox args={[2, 0.15, 1.3]} radius={0.08} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#23272f" metalness={0.7} roughness={0.3} />
      </RoundedBox>
      {/* Laptop screen */}
      <mesh
        ref={screen}
        position={[0, 0.7, -0.62]}
        rotation={[-Math.PI / 1.7, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[2, 1.15, 0.08]} />
        <meshStandardMaterial
          color="#0ef6ff"
          emissive="#0ef6ff"
          emissiveIntensity={1.2}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
}

export function Hero3DLanding() {
  return (
    <div className="relative w-full h-screen">
      <Canvas
        className="w-full h-screen bg-[#0a0a0f]"
        shadows
        camera={{ position: [0, 1.2, 4.5], fov: 38 }}
      >
        {/* Lighting Rig */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} color="#4444ff" intensity={1} />
        <spotLight position={[0, 20, 0]} angle={0.3} penumbra={1} intensity={2} />
        <AnimatedLaptop />
        <Environment preset="city" />
        <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
      {/* Overlayed Hero Text */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <div className="pointer-events-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg mb-6">
            Immersive 3D Web Experiences
          </h1>
          <p className="text-lg md:text-2xl text-cyan-200 mb-8 max-w-xl mx-auto">
            Next-gen interactive websites powered by Three.js, React Three Fiber, and GSAP.
          </p>
        </div>
      </div>
    </div>
  );
}
