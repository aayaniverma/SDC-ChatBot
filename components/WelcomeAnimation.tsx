"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function WelcomeAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create a starfield
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 500;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 10; // Spread stars randomly
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Lighting (subtle)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      stars.rotation.y += 0.0008; // Slowly rotate stars
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resizing
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="h-screen bg-black relative">
      {/* Heading & Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mt-12 soft-glow-text">
          Welcome to MUJ CSE Chatbot
        </h1>
        <p className="text-gray-300 text-base md:text-lg mt-2">
          Your AI-powered assistant is here!
        </p>
      </div>

      {/* 3D Starfield */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Subtle Glow Effect */}
      <style jsx>{`
        .soft-glow-text {
          text-shadow: 0 0 5px #7d3cff, 0 0 10px rgba(125, 60, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
