'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import type { ToolId } from './Header'

type FlowKind = 'cool' | 'hot'

interface PacketSystem {
  mesh: THREE.InstancedMesh
  path: THREE.CurvePath<THREE.Vector3>
  count: number
  speed: number
  kind: FlowKind
}

type LayerName = 'scan' | 'business' | 'risk' | 'replication'

interface District {
  group: THREE.Group
  flowMaterials: THREE.ShaderMaterial[]
  packetSystems: PacketSystem[]
  buildings: THREE.Group[]
  layers: Record<LayerName, THREE.Group>
}

interface DistrictSceneProps {
  flowDirection: 1 | -1
  emphasis: ToolId | null
  chapter: string
  demandDensity: number
  sourceAvailability: number
}

interface ChapterPose {
  camera: [number, number, number]
  district: [number, number, number]
  target: [number, number, number]
  scale: number
  rotation: number
}

const COOL = new THREE.Color('#00e5ff')
const HOT = new THREE.Color('#ff6a00')

const DEFAULT_POSE: ChapterPose = {
  camera: [0, 0, 0],
  district: [0, 0, 0],
  target: [0, 0.25, 0],
  scale: 1,
  rotation: -0.1,
}

const CHAPTER_POSES: Record<string, ChapterPose> = {
  overview: DEFAULT_POSE,
  promise: { camera: [-2, 5, -1], district: [0.5, -0.4, 0], target: [1, 0.1, 0], scale: 0.9, rotation: 0.08 },
  tools: { camera: [0, 3, 1], district: [0.8, -0.6, 0], target: [1, 0.1, 0], scale: 0.84, rotation: -0.24 },
  'quick-inputs': { camera: [-2, 1, 2], district: [0.8, -0.2, 0], target: [0.8, 0.3, 0], scale: 0.94, rotation: -0.02 },
  'quick-assessment': { camera: [0, 6, 0], district: [1.2, -0.7, 0], target: [1.2, 0, 0], scale: 1.02, rotation: 0.16 },
  'quick-results': { camera: [1, 3, -3], district: [-5.5, -1.2, 0], target: [-1.4, 0.2, 0], scale: 0.76, rotation: -0.32 },
  'business-use-cases': { camera: [0, 3, 2], district: [0.6, -0.3, 0], target: [0.8, 0.2, 0], scale: 0.94, rotation: 0.28 },
  'business-canvas': { camera: [0, 8, 1], district: [1.5, -1.2, 0], target: [1, 0, 0], scale: 0.78, rotation: -0.06 },
  'reality-check': { camera: [-1, 2, 1], district: [-5.8, -0.6, 0], target: [-1.2, 0.4, 0], scale: 0.96, rotation: -0.36 },
  scalability: { camera: [0, 10, 4], district: [1.2, -1.4, 0], target: [0.8, 0, 0], scale: 0.64, rotation: 0.12 },
  implementation: { camera: [-2, 5, -2], district: [-5.2, -1, 0], target: [-1, 0.2, 0], scale: 0.8, rotation: 0.34 },
  methodology: { camera: [0, 5, 0], district: [0, -1, 0], target: [0, 0, 0], scale: 0.8, rotation: -0.1 },
  'get-started': { camera: [-1, 2, 0], district: [-3.4, -0.4, 0], target: [0, 0.3, 0], scale: 1.08, rotation: -0.1 },
}

function seededRandom(seed: number) {
  let value = seed >>> 0
  return () => {
    value += 0x6d2b79f5
    let result = value
    result = Math.imul(result ^ (result >>> 15), result | 1)
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

function roundedPath(points: THREE.Vector3[], radius = 0.18) {
  const path = new THREE.CurvePath<THREE.Vector3>()
  let cursor = points[0].clone()

  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1]
    const corner = points[index]
    const next = points[index + 1]
    const incoming = corner.clone().sub(previous).normalize()
    const outgoing = next.clone().sub(corner).normalize()
    const cornerRadius = Math.min(radius, previous.distanceTo(corner) / 3, corner.distanceTo(next) / 3)
    const entry = corner.clone().addScaledVector(incoming, -cornerRadius)
    const exit = corner.clone().addScaledVector(outgoing, cornerRadius)

    path.add(new THREE.LineCurve3(cursor, entry))
    path.add(new THREE.QuadraticBezierCurve3(entry, corner.clone(), exit))
    cursor = exit
  }

  path.add(new THREE.LineCurve3(cursor, points[points.length - 1].clone()))
  return path
}

function rectanglePath(width: number, depth: number, y: number) {
  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
    [-1, -1],
  ]
  return roundedPath(corners.map(([x, z]) => new THREE.Vector3(x * width / 2, y, z * depth / 2)))
}

function createGroundGrid() {
  const points: THREE.Vector3[] = []
  const width = 11.2
  const depth = 8
  const step = 0.5

  for (let x = -width / 2; x <= width / 2 + 0.001; x += step) {
    points.push(new THREE.Vector3(x, -0.105, -depth / 2), new THREE.Vector3(x, -0.105, depth / 2))
  }
  for (let z = -depth / 2; z <= depth / 2 + 0.001; z += step) {
    points.push(new THREE.Vector3(-width / 2, -0.105, z), new THREE.Vector3(width / 2, -0.105, z))
  }

  return new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x67828c, transparent: true, opacity: 0.075 }),
  )
}

function createBuilding(
  x: number,
  z: number,
  width: number,
  depth: number,
  height: number,
  materials: {
    shell: THREE.MeshStandardMaterial
    roof: THREE.MeshStandardMaterial
    edges: THREE.LineBasicMaterial
    floors: THREE.LineBasicMaterial
  },
) {
  const building = new THREE.Group()
  building.position.set(x, -0.12, z)

  const shellGeometry = new THREE.BoxGeometry(width, height, depth)
  const shell = new THREE.Mesh(shellGeometry, materials.shell)
  shell.position.y = height / 2
  building.add(shell)

  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(shellGeometry, 25), materials.edges)
  edges.position.copy(shell.position)
  building.add(edges)

  const floorPoints: THREE.Vector3[] = []
  for (let y = 0.32; y < height - 0.12; y += 0.34) {
    floorPoints.push(
      new THREE.Vector3(-width / 2 + 0.04, y, depth / 2 + 0.003),
      new THREE.Vector3(width / 2 - 0.04, y, depth / 2 + 0.003),
      new THREE.Vector3(width / 2 + 0.003, y, -depth / 2 + 0.04),
      new THREE.Vector3(width / 2 + 0.003, y, depth / 2 - 0.04),
    )
  }
  if (floorPoints.length > 0) {
    building.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(floorPoints), materials.floors))
  }

  const roofUnit = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.34, 0.15, depth * 0.34),
    materials.roof,
  )
  roofUnit.position.y = height + 0.075
  building.add(roofUnit)

  const roofEdges = new THREE.LineSegments(new THREE.EdgesGeometry(roofUnit.geometry), materials.edges)
  roofEdges.position.copy(roofUnit.position)
  building.add(roofEdges)

  return building
}

function createEnergyPath(
  district: District,
  path: THREE.CurvePath<THREE.Vector3>,
  color: THREE.Color,
  kind: FlowKind,
  packetCount: number,
) {
  const tubeSegments = packetCount > 8 ? 220 : 100
  const base = new THREE.Mesh(
    new THREE.TubeGeometry(path, tubeSegments, 0.052, 8, false),
    new THREE.MeshBasicMaterial({
      color: color.clone().multiplyScalar(0.34),
      transparent: true,
      opacity: 0.82,
    }),
  )
  district.group.add(base)

  const flowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDirection: { value: 1 },
      uBoost: { value: 1 },
      uFlowRate: { value: 1 },
      uColor: { value: color.clone() },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uDirection;
      uniform float uBoost;
      uniform float uFlowRate;
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float travel = fract(vUv.x * 7.0 - uTime * 0.55 * uFlowRate * uDirection);
        float attack = smoothstep(0.015, 0.10, travel);
        float release = 1.0 - smoothstep(0.10, 0.48, travel);
        float pulse = attack * release;
        float intensity = (0.46 + pulse * 3.4) * uBoost;
        float alpha = clamp((0.38 + pulse * 0.62) * uBoost, 0.0, 1.0);
        gl_FragColor = vec4(uColor * intensity, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  })
  flowMaterial.userData.kind = kind
  district.flowMaterials.push(flowMaterial)

  district.group.add(new THREE.Mesh(new THREE.TubeGeometry(path, tubeSegments, 0.035, 8, false), flowMaterial))

  const glow = new THREE.Mesh(
    new THREE.TubeGeometry(path, tubeSegments, 0.105, 8, false),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.045,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  )
  district.group.add(glow)

  const packetMaterial = new THREE.MeshBasicMaterial({
    color: color.clone().multiplyScalar(1.7),
    transparent: true,
    opacity: 0.95,
    toneMapped: false,
  })
  const packets = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 8, 6), packetMaterial, packetCount)
  packets.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  packets.frustumCulled = false
  district.group.add(packets)
  district.packetSystems.push({ mesh: packets, path, count: packetCount, speed: 0.055, kind })
}

function createNode(group: THREE.Group, position: THREE.Vector3, color: THREE.Color) {
  const node = new THREE.Group()
  node.position.copy(position)

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.018, 6, 28),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, toneMapped: false }),
  )
  ring.rotation.x = Math.PI / 2
  node.add(ring)

  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.16, 8),
    new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(1.4), toneMapped: false }),
  )
  core.position.y = 0.04
  node.add(core)
  group.add(node)
}

function prepareLayer(layer: THREE.Group) {
  layer.userData.factor = 0
  layer.visible = false
  layer.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((material) => {
        material.transparent = true
        material.userData.baseOpacity = material.opacity
      })
    }
  })
  return layer
}

function updateLayer(layer: THREE.Group, target: number, delta: number) {
  const factor = THREE.MathUtils.damp(layer.userData.factor ?? 0, target, 4.5, delta)
  layer.userData.factor = factor
  layer.visible = factor > 0.008
  layer.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((material) => {
        material.opacity = (material.userData.baseOpacity ?? 1) * factor
      })
    }
  })
}

function createScanLayer() {
  const layer = new THREE.Group()
  const volume = new THREE.BoxGeometry(12, 4.2, 8.8)
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(volume),
    new THREE.LineBasicMaterial({ color: COOL, transparent: true, opacity: 0.24 }),
  )
  edges.position.y = 1.85
  layer.add(edges)

  const scanPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(11.7, 8.5),
    new THREE.MeshBasicMaterial({
      color: COOL,
      transparent: true,
      opacity: 0.085,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  scanPlane.name = 'scan-plane'
  scanPlane.rotation.x = -Math.PI / 2
  layer.add(scanPlane)
  return prepareLayer(layer)
}

function createBusinessLayer() {
  const layer = new THREE.Group()
  const center = new THREE.Vector3(0, 2.4, 0)
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x9ed9e5, transparent: true, opacity: 0.34 })

  for (let index = 0; index < 6; index += 1) {
    const angle = index / 6 * Math.PI * 2
    const position = new THREE.Vector3(Math.cos(angle) * 4.2, 2.7 + (index % 2) * 0.55, Math.sin(angle) * 3.1)
    layer.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([center, position]), lineMaterial))

    const color = index % 2 === 0 ? COOL : HOT
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 12, 8),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, toneMapped: false }),
    )
    node.position.copy(position)
    layer.add(node)

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.25, 0.018, 6, 28),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, toneMapped: false }),
    )
    ring.position.copy(position)
    ring.rotation.x = Math.PI / 2
    layer.add(ring)
  }

  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.24, 0),
    new THREE.MeshBasicMaterial({ color: COOL, transparent: true, opacity: 1, toneMapped: false }),
  )
  core.position.copy(center)
  layer.add(core)
  return prepareLayer(layer)
}

function createRiskLayer() {
  const layer = new THREE.Group()
  for (let index = 0; index < 3; index += 1) {
    const angle = index / 3 * Math.PI * 2 + 0.4
    const position = new THREE.Vector3(Math.cos(angle) * 3.4, 2.4 + index * 0.4, Math.sin(angle) * 2.5)
    const marker = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.22, 0),
      new THREE.MeshBasicMaterial({ color: HOT, transparent: true, opacity: 1, toneMapped: false }),
    )
    marker.position.copy(position)
    marker.userData.phase = index * 1.7
    layer.add(marker)

    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([position, new THREE.Vector3(position.x, 0.05, position.z)]),
      new THREE.LineBasicMaterial({ color: HOT, transparent: true, opacity: 0.3 }),
    )
    layer.add(line)
  }
  return prepareLayer(layer)
}

function createSettlementGlyph(index: number) {
  const settlement = new THREE.Group()
  const angle = index / 3 * Math.PI * 2 - Math.PI / 2
  settlement.position.set(Math.cos(angle) * 8.2, 0, Math.sin(angle) * 6.3)
  settlement.scale.setScalar(0.32)

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 0.18, 4.2),
    new THREE.MeshBasicMaterial({ color: 0x122229, transparent: true, opacity: 0.9 }),
  )
  settlement.add(base)
  const outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(base.geometry),
    new THREE.LineBasicMaterial({ color: index === 1 ? HOT : COOL, transparent: true, opacity: 0.55 }),
  )
  settlement.add(outline)

  for (let buildingIndex = 0; buildingIndex < 5; buildingIndex += 1) {
    const height = 0.8 + (buildingIndex % 3) * 0.55
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, height, 0.72),
      new THREE.MeshBasicMaterial({ color: 0x263c44, transparent: true, opacity: 0.92 }),
    )
    building.position.set((buildingIndex % 3 - 1) * 1.25, height / 2 + 0.1, (Math.floor(buildingIndex / 3) - 0.4) * 1.4)
    settlement.add(building)
  }
  return settlement
}

function createReplicationLayer() {
  const layer = new THREE.Group()
  const connectionMaterial = new THREE.LineBasicMaterial({ color: COOL, transparent: true, opacity: 0.25 })
  for (let index = 0; index < 3; index += 1) {
    const settlement = createSettlementGlyph(index)
    layer.add(settlement)
    layer.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), settlement.position.clone()]),
      connectionMaterial,
    ))
  }
  return prepareLayer(layer)
}

function createDistrict(): District {
  const district: District = {
    group: new THREE.Group(),
    flowMaterials: [],
    packetSystems: [],
    buildings: [],
    layers: {
      scan: new THREE.Group(),
      business: new THREE.Group(),
      risk: new THREE.Group(),
      replication: new THREE.Group(),
    },
  }
  const random = seededRandom(525)

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(11.8, 0.32, 8.6),
    new THREE.MeshStandardMaterial({ color: 0x0c1317, metalness: 0.76, roughness: 0.42 }),
  )
  base.position.y = -0.28
  district.group.add(base)

  const baseEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(base.geometry),
    new THREE.LineBasicMaterial({ color: 0x6f929d, transparent: true, opacity: 0.25 }),
  )
  baseEdges.position.copy(base.position)
  district.group.add(baseEdges)
  district.group.add(createGroundGrid())

  const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x101b20, transparent: true, opacity: 0.82 })
  const roadA = new THREE.Mesh(new THREE.PlaneGeometry(11.2, 0.85), roadMaterial)
  roadA.rotation.x = -Math.PI / 2
  roadA.position.y = -0.095
  district.group.add(roadA)
  const roadB = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 8), roadMaterial)
  roadB.rotation.x = -Math.PI / 2
  roadB.position.y = -0.09
  district.group.add(roadB)

  const buildingMaterials = {
    shell: new THREE.MeshStandardMaterial({ color: 0x142128, metalness: 0.8, roughness: 0.3 }),
    roof: new THREE.MeshStandardMaterial({ color: 0x243840, metalness: 0.72, roughness: 0.26 }),
    edges: new THREE.LineBasicMaterial({ color: 0x9bc2cc, transparent: true, opacity: 0.23 }),
    floors: new THREE.LineBasicMaterial({ color: 0x7397a2, transparent: true, opacity: 0.12 }),
  }

  for (let gridX = -3; gridX <= 3; gridX += 1) {
    for (let gridZ = -2; gridZ <= 2; gridZ += 1) {
      if (gridX === 0 || gridZ === 0 || random() < 0.12) continue
      const width = 0.68 + random() * 0.48
      const depth = 0.68 + random() * 0.5
      const height = 0.65 + Math.pow(random(), 1.25) * 2.7
      const x = gridX * 1.46 + (random() - 0.5) * 0.12
      const z = gridZ * 1.47 + (random() - 0.5) * 0.12
      const building = createBuilding(x, z, width, depth, height, buildingMaterials)
      district.buildings.push(building)
      district.group.add(building)
    }
  }

  createEnergyPath(district, rectanglePath(10.7, 7.5, 0.015), COOL, 'cool', 14)
  createEnergyPath(district, rectanglePath(10.05, 6.85, 0.045), HOT, 'hot', 12)
  createEnergyPath(
    district,
    roundedPath([new THREE.Vector3(-5.35, 0.02, 0), new THREE.Vector3(5.35, 0.02, 0)]),
    COOL,
    'cool',
    7,
  )
  createEnergyPath(
    district,
    roundedPath([new THREE.Vector3(0, 0.05, -3.75), new THREE.Vector3(0, 0.05, 3.75)]),
    HOT,
    'hot',
    6,
  )

  const nodePositions = [
    new THREE.Vector3(-5.35, 0.03, -3.75),
    new THREE.Vector3(5.35, 0.03, -3.75),
    new THREE.Vector3(5.35, 0.03, 3.75),
    new THREE.Vector3(-5.35, 0.03, 3.75),
  ]
  nodePositions.forEach((position, index) => createNode(district.group, position, index % 2 === 0 ? COOL : HOT))
  createNode(district.group, new THREE.Vector3(0, 0.06, 0), COOL)

  district.layers.scan = createScanLayer()
  district.layers.business = createBusinessLayer()
  district.layers.risk = createRiskLayer()
  district.layers.replication = createReplicationLayer()
  Object.values(district.layers).forEach((layer) => district.group.add(layer))

  district.group.rotation.y = -0.1
  return district
}

function SceneFallback() {
  const buildings = [
    [-180, 40, 62], [-95, 5, 105], [5, 45, 76], [105, 5, 130],
    [-135, 135, 86], [-25, 135, 54], [85, 125, 96], [185, 75, 65],
  ]
  return (
    <svg className="scene-fallback__art" viewBox="0 0 1000 760" aria-hidden="true">
      <g transform="translate(510 280)">
        <path d="M-350 120 0-70 350 120 0 310Z" fill="#0d171c" stroke="#38515a" />
        <path d="M-330 120 0-57 330 120 0 297Z" fill="none" stroke="#00e5ff" strokeWidth="4" />
        <path d="M-314 120 0-45 314 120 0 285Z" fill="none" stroke="#ff6a00" strokeWidth="3" />
        <path d="M-330 120H330M0-57V297" stroke="#00e5ff" strokeOpacity=".45" strokeWidth="2" />
        {buildings.map(([x, y, height], index) => (
          <g key={index} transform={`translate(${x} ${y})`}>
            <path d={`M0 0 48-26 96 0 48 26Z`} fill="#20343c" stroke="#6d929d" strokeOpacity=".5" />
            <path d={`M0 0V-${height}L48-${height + 26}V26Z`} fill="#111f25" stroke="#6d929d" strokeOpacity=".35" />
            <path d={`M48 26V-${height + 26}L96-${height}V0Z`} fill="#172a31" stroke="#6d929d" strokeOpacity=".35" />
            <path d={`M0-${height} 48-${height + 26} 96-${height} 48-${height - 26}Z`} fill="#263e47" stroke="#6d929d" strokeOpacity=".5" />
          </g>
        ))}
      </g>
    </svg>
  )
}

export function DistrictScene({ flowDirection, emphasis, chapter, demandDensity, sourceAvailability }: DistrictSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const directionRef = useRef(flowDirection)
  const emphasisRef = useRef(emphasis)
  const chapterRef = useRef(chapter)
  const demandRef = useRef(demandDensity)
  const sourceRef = useRef(sourceAvailability)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    directionRef.current = flowDirection
  }, [flowDirection])

  useEffect(() => {
    emphasisRef.current = emphasis
  }, [emphasis])

  useEffect(() => {
    chapterRef.current = chapter
  }, [chapter])

  useEffect(() => {
    demandRef.current = demandDensity
  }, [demandDensity])

  useEffect(() => {
    sourceRef.current = sourceAvailability
  }, [sourceAvailability])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    } catch {
      const failureTimer = window.setTimeout(() => setFailed(true), 0)
      return () => window.clearTimeout(failureTimer)
    }

    const gl = renderer.getContext()
    const rendererInfo = gl.getExtension('WEBGL_debug_renderer_info')
    const rendererName = rendererInfo ? String(gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL)) : ''
    const softwareRendering = /swiftshader|llvmpipe|software/i.test(rendererName)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#070b0e')
    scene.fog = new THREE.FogExp2(0x070b0e, 0.018)

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    const district = createDistrict()
    scene.add(district.group)

    scene.add(new THREE.HemisphereLight(0x9ed9e5, 0x071014, 1.25))
    const keyLight = new THREE.DirectionalLight(0xd8f4f7, 2.3)
    keyLight.position.set(4, 10, 7)
    scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0x2bdfff, 1.2)
    rimLight.position.set(-7, 3, -5)
    scene.add(rimLight)
    const warmLight = new THREE.PointLight(0xff6a00, 18, 18, 2)
    warmLight.position.set(4, 2, -2)
    scene.add(warmLight)

    renderer.setClearColor(0x070b0e, 1)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08
    renderer.domElement.className = 'district-canvas'
    renderer.domElement.setAttribute('aria-hidden', 'true')
    container.appendChild(renderer.domElement)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.72, 0.48, 0.42)
    bloom.enabled = !softwareRendering
    composer.addPass(bloom)
    composer.addPass(new OutputPass())

    const pointer = new THREE.Vector2()
    const pointerTarget = new THREE.Vector2()
    const cameraBase = new THREE.Vector3()
    const districtBase = new THREE.Vector3()
    const lookTarget = new THREE.Vector3(0, 0.25, 0)
    const desiredCamera = new THREE.Vector3()
    const desiredDistrict = new THREE.Vector3()
    const desiredLook = new THREE.Vector3()
    const packetTransform = new THREE.Object3D()
    let baseScale = 1
    let isMobile = false
    let chapterProgress = 0
    let width = 1
    let height = 1
    let firstFrame = true
    let elapsed = 0
    let previousTime = performance.now()
    let previousDirection = directionRef.current
    let previousEmphasis = emphasisRef.current
    let previousChapter = chapterRef.current
    let previousDemand = demandRef.current
    let previousSource = sourceRef.current

    const resize = () => {
      width = Math.max(1, container.clientWidth)
      height = Math.max(1, container.clientHeight)
      const mobile = width < 768
      const compact = width >= 768 && width < 1100
      const pixelRatio = Math.min(window.devicePixelRatio || 1, softwareRendering ? 1 : mobile ? 1.35 : 1.7)

      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(width, height, false)
      composer.setPixelRatio(pixelRatio)
      composer.setSize(width, height)
      if (bloom.enabled) bloom.setSize(width * pixelRatio * 0.6, height * pixelRatio * 0.6)
      camera.aspect = width / height
      camera.updateProjectionMatrix()

      isMobile = mobile
      if (mobile) {
        cameraBase.set(16, 13, 19)
        districtBase.set(0, -2.2, 0)
        baseScale = 0.68
        bloom.strength = 0.58
      } else if (compact) {
        cameraBase.set(16, 12, 19)
        districtBase.set(2.3, -0.6, 0)
        baseScale = 0.86
        bloom.strength = 0.65
      } else {
        cameraBase.set(15, 11, 17)
        districtBase.set(3.7, -0.25, 0)
        baseScale = 1
        bloom.strength = 0.72
      }
      district.group.position.copy(districtBase)
      district.group.scale.setScalar(baseScale)
      camera.position.copy(cameraBase)
      camera.lookAt(lookTarget)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const bounds = container.getBoundingClientRect()
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) return
      pointerTarget.set(
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
        ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
      )
    }
    const onPointerLeave = () => pointerTarget.set(0, 0)
    const onScroll = () => {
      const activeSection = document.getElementById(chapterRef.current)
      if (!activeSection) return
      const bounds = activeSection.getBoundingClientRect()
      chapterProgress = THREE.MathUtils.clamp((window.innerHeight * 0.55 - bounds.top) / Math.max(bounds.height, 1), 0, 1)
    }
    const onContextLost = (event: Event) => {
      event.preventDefault()
      setReady(false)
      setFailed(true)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    renderer.domElement.addEventListener('webglcontextlost', onContextLost)
    resize()
    onScroll()

    renderer.setAnimationLoop((now) => {
      if (document.hidden) {
        previousTime = now
        return
      }
      const delta = Math.min((now - previousTime) / 1000, 0.05)
      previousTime = now
      const motionChanged = previousDirection !== directionRef.current
        || previousEmphasis !== emphasisRef.current
        || previousChapter !== chapterRef.current
        || previousDemand !== demandRef.current
        || previousSource !== sourceRef.current

      if (!reducedMotion.matches) elapsed += delta
      pointer.lerp(pointerTarget, reducedMotion.matches ? 1 : 1 - Math.exp(-delta * 3.5))

      const pose = CHAPTER_POSES[chapterRef.current] ?? DEFAULT_POSE
      const sideFactor = isMobile ? 0.22 : 1
      const blend = reducedMotion.matches ? 1 : 1 - Math.exp(-delta * 2.8)
      desiredCamera.copy(cameraBase)
      desiredCamera.x += pose.camera[0] * sideFactor + pointer.x * 0.72
      desiredCamera.y += pose.camera[1] - pointer.y * 0.42 + (chapterProgress - 0.5) * 0.85
      desiredCamera.z += pose.camera[2] - pointer.x * 0.28
      desiredDistrict.copy(districtBase)
      desiredDistrict.x += pose.district[0] * sideFactor
      desiredDistrict.y += pose.district[1]
      desiredDistrict.z += pose.district[2]
      desiredLook.set(pose.target[0] * sideFactor, pose.target[1], pose.target[2])

      camera.position.lerp(desiredCamera, blend)
      lookTarget.lerp(desiredLook, blend)
      camera.lookAt(lookTarget)
      district.group.position.lerp(desiredDistrict, blend)
      const targetScale = baseScale * pose.scale
      district.group.scale.setScalar(THREE.MathUtils.damp(district.group.scale.x, targetScale, 3.2, delta))

      const ambient = reducedMotion.matches ? 0 : Math.sin(elapsed * 0.22) * 0.025
      const targetRotation = pose.rotation + ambient + (chapterProgress - 0.5) * 0.12 + pointer.x * 0.025
      district.group.rotation.y = THREE.MathUtils.damp(district.group.rotation.y, targetRotation, 3.2, delta)

      const activeChapter = chapterRef.current
      const chapterKind = activeChapter.startsWith('quick')
        ? 'cool'
        : activeChapter.startsWith('business') || activeChapter === 'reality-check' || activeChapter === 'implementation'
          ? 'hot'
          : null
      const selectedKind = activeChapter === 'overview' && emphasisRef.current
        ? emphasisRef.current === 'quick-check' ? 'cool' : 'hot'
        : chapterKind
      const flowRate = 0.65 + sourceRef.current / 100 * 0.7

      district.flowMaterials.forEach((material) => {
        const kind = material.userData.kind as FlowKind
        const targetBoost = selectedKind === null ? 1 : selectedKind === kind ? 1.5 : 0.42
        material.uniforms.uTime.value = elapsed
        material.uniforms.uDirection.value = directionRef.current
        material.uniforms.uFlowRate.value = THREE.MathUtils.damp(material.uniforms.uFlowRate.value, flowRate, 4, delta)
        material.uniforms.uBoost.value = THREE.MathUtils.damp(material.uniforms.uBoost.value, targetBoost, 5, delta)
      })

      district.buildings.forEach((building) => {
        const targetHeight = activeChapter === 'quick-inputs' ? 0.78 + demandRef.current / 100 * 0.45 : 1
        building.scale.y = THREE.MathUtils.damp(building.scale.y, targetHeight, 4, delta)
      })

      updateLayer(district.layers.scan, activeChapter === 'quick-inputs' || activeChapter === 'quick-assessment' ? 1 : 0, delta)
      updateLayer(district.layers.business, activeChapter === 'business-use-cases' || activeChapter === 'business-canvas' || activeChapter === 'implementation' ? 1 : 0, delta)
      updateLayer(district.layers.risk, activeChapter === 'reality-check' ? 1 : 0, delta)
      updateLayer(district.layers.replication, activeChapter === 'scalability' ? 1 : 0, delta)

      const scanPlane = district.layers.scan.getObjectByName('scan-plane')
      if (scanPlane) scanPlane.position.y = reducedMotion.matches ? 1.8 : (elapsed * 0.7) % 4.1
      district.layers.business.rotation.y = reducedMotion.matches ? 0 : elapsed * 0.035
      district.layers.risk.children.forEach((marker, index) => {
        if (marker instanceof THREE.Mesh && marker.geometry instanceof THREE.OctahedronGeometry) {
          const pulse = reducedMotion.matches ? 1 : 1 + Math.sin(elapsed * 2.2 + index) * 0.16
          marker.scale.setScalar(pulse)
        }
      })

      district.packetSystems.forEach((system) => {
        const targetOpacity = selectedKind === null ? 0.95 : selectedKind === system.kind ? 1 : 0.22
        const material = system.mesh.material as THREE.MeshBasicMaterial
        material.opacity = THREE.MathUtils.damp(material.opacity, targetOpacity, 5, delta)

        for (let index = 0; index < system.count; index += 1) {
          const rawProgress = elapsed * system.speed * flowRate * directionRef.current + index / system.count
          const progress = ((rawProgress % 1) + 1) % 1
          packetTransform.position.copy(system.path.getPointAt(progress))
          const scale = 0.78 + (reducedMotion.matches ? 0 : Math.sin(elapsed * 3 + index) * 0.18)
          packetTransform.scale.setScalar(scale)
          packetTransform.updateMatrix()
          system.mesh.setMatrixAt(index, packetTransform.matrix)
        }
        system.mesh.instanceMatrix.needsUpdate = true
      })

      if (!reducedMotion.matches || firstFrame || motionChanged || pointer.distanceToSquared(pointerTarget) > 0.00001) {
        if (bloom.enabled) composer.render()
        else renderer.render(scene, camera)
      }
      previousDirection = directionRef.current
      previousEmphasis = emphasisRef.current
      previousChapter = chapterRef.current
      previousDemand = demandRef.current
      previousSource = sourceRef.current

      if (firstFrame) {
        firstFrame = false
        setReady(true)
      }
    })

    return () => {
      renderer.setAnimationLoop(null)
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost)

      const geometries = new Set<THREE.BufferGeometry>()
      const materials = new Set<THREE.Material>()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          geometries.add(object.geometry)
          const objectMaterials = Array.isArray(object.material) ? object.material : [object.material]
          objectMaterials.forEach((material) => materials.add(material))
        }
      })
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      composer.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div className={`district-scene ${ready && !failed ? 'district-scene--ready' : ''}`} ref={containerRef}>
      <div className="scene-fallback"><SceneFallback /></div>
    </div>
  )
}
