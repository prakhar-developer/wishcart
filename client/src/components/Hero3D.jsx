import { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sphere, MeshDistortMaterial, Ring, Torus } from '@react-three/drei'

// Floating 3D Dress Shape
const DressShape = () => {
  const meshRef = useRef()
  useFrame((state) => {
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
  })
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} scale={2.5}>
        <torusKnotGeometry args={[1, 0.3, 128, 16]} />
        <MeshDistortMaterial
          color="#ff6b9d"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0}
          metalness={0.8}
        />
      </mesh>
    </Float>
  )
}

// Floating Rings
const FloatingRing = ({ position, color, scale }) => {
  const ref = useRef()
  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * 0.5
    ref.current.rotation.z = state.clock.elapsedTime * 0.3
  })
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <torusGeometry args={[1, 0.05, 16, 100]} />
      <meshStandardMaterial color={color} metalness={1} roughness={0} />
    </mesh>
  )
}

// Floating Spheres
const FloatingSphere = ({ position, color, size }) => {
  const ref = useRef()
  useFrame((state) => {
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.3
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <MeshDistortMaterial
        color={color}
        distort={0.3}
        speed={3}
        metalness={0.5}
        roughness={0}
        transparent
        opacity={0.7}
      />
    </mesh>
  )
}

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ff6b9d" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
      <spotLight position={[0, 10, 0]} intensity={1} color="#ffffff" />

      <DressShape />

      <FloatingRing position={[3, 1, -2]} color="#ff6b9d" scale={1.5} />
      <FloatingRing position={[-3, -1, -1]} color="#a855f7" scale={1} />
      <FloatingRing position={[2, -2, -3]} color="#f472b6" scale={0.8} />

      <FloatingSphere position={[-4, 2, -2]} color="#ff6b9d" size={0.4} />
      <FloatingSphere position={[4, -1, -1]} color="#a855f7" size={0.3} />
      <FloatingSphere position={[-2, -3, -2]} color="#f472b6" size={0.5} />
      <FloatingSphere position={[3, 3, -3]} color="#ec4899" size={0.2} />
    </>
  )
}

const Hero3D = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default Hero3D