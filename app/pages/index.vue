<script setup lang="ts">
import * as THREE from 'three'

const colorMode = useColorMode()

useSeoMeta({
  titleTemplate: '',
  title: 'Lost Blogs',
  ogTitle: 'Lost Blogs',
  ogDescription: 'A lonely boat in the sea of thoughts',
  description: 'A lonely boat in the sea of thoughts',
  ogImage: 'https://o0olele.github.io/_ipx/_/home.png',
  twitterImage: 'https://o0olele.github.io/_ipx/_/home.png'
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Three.js objects that change with the theme
let scene: THREE.Scene | null = null
let ambientLight: THREE.AmbientLight | null = null
let dirLight: THREE.DirectionalLight | null = null
let starPoints: THREE.Points | null = null
let celestialBody: THREE.Mesh | null = null
let celestialGlow: THREE.Mesh | null = null
let oceanMat: THREE.MeshPhongMaterial | null = null
let streakMat: THREE.MeshBasicMaterial | null = null
let lantern: THREE.PointLight | null = null
let lanternMesh: THREE.Mesh | null = null
let renderer: THREE.WebGLRenderer | null = null
let animId = 0

const DARK = {
  bg: 0x060d1f,
  fog: 0x060d1f,
  ambientColor: 0x1a2a4a,
  ambientIntensity: 0.8,
  dirColor: 0x9aafd4,
  dirIntensity: 1.4,
  dirPos: new THREE.Vector3(-15, 30, 10),
  oceanColor: 0x0b2240,
  oceanSpecular: 0x6699bb,
  celestialColor: 0xddeeff,
  celestialGlowColor: 0x8899cc,
  celestialPos: new THREE.Vector3(-60, 70, -120),
  streakOpacity: 0.04,
  starsVisible: true
}

const LIGHT = {
  bg: 0x87ceeb,
  fog: 0xb0d8f0,
  ambientColor: 0xfff5e0,
  ambientIntensity: 1.8,
  dirColor: 0xfffce8,
  dirIntensity: 2.2,
  dirPos: new THREE.Vector3(30, 60, 10),
  oceanColor: 0x1a6fa8,
  oceanSpecular: 0x88ddff,
  celestialColor: 0xfffaaa,
  celestialGlowColor: 0xffee88,
  celestialPos: new THREE.Vector3(80, 100, -80),
  streakOpacity: 0.18,
  starsVisible: false
}

function applyTheme(isDark: boolean) {
  const t = isDark ? DARK : LIGHT
  if (!scene) return

  scene.background = new THREE.Color(t.bg);
  (scene.fog as THREE.FogExp2).color.set(t.fog)

  ambientLight!.color.set(t.ambientColor)
  ambientLight!.intensity = t.ambientIntensity

  dirLight!.color.set(t.dirColor)
  dirLight!.intensity = t.dirIntensity
  dirLight!.position.copy(t.dirPos)

  oceanMat!.color.set(t.oceanColor)
  oceanMat!.specular.set(t.oceanSpecular)

  celestialBody!.material = new THREE.MeshBasicMaterial({ color: t.celestialColor })
  celestialGlow!.material = new THREE.MeshBasicMaterial({
    color: t.celestialGlowColor,
    transparent: true,
    opacity: isDark ? 0.08 : 0.25
  })
  celestialBody!.position.copy(t.celestialPos)

  streakMat!.opacity = t.streakOpacity
  streakMat!.color.set(isDark ? 0xaabbdd : 0xffffff)

  // Stars: hide in light mode
  starPoints!.visible = t.starsVisible

  // Lantern: off in daylight
  lantern!.intensity = isDark ? 2.5 : 0
  lanternMesh!.visible = isDark
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  document.documentElement.style.overflow = 'hidden'

  // ── Scene ────────────────────────────────────────────────────────────────
  scene = new THREE.Scene()
  scene.background = new THREE.Color(DARK.bg)
  scene.fog = new THREE.FogExp2(DARK.fog, 0.012)

  // ── Camera ───────────────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500)
  camera.position.set(0, 9, 24)
  camera.lookAt(0, 0, 0)

  // ── Renderer ─────────────────────────────────────────────────────────────
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // ── Lights ────────────────────────────────────────────────────────────────
  ambientLight = new THREE.AmbientLight(DARK.ambientColor, DARK.ambientIntensity)
  scene.add(ambientLight)

  dirLight = new THREE.DirectionalLight(DARK.dirColor, DARK.dirIntensity)
  dirLight.position.copy(DARK.dirPos)
  scene.add(dirLight)

  // ── Stars ─────────────────────────────────────────────────────────────────
  const starPositions = new Float32Array(3000 * 3)
  for (let i = 0; i < starPositions.length; i++) starPositions[i] = (Math.random() - 0.5) * 600
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  starPoints = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, sizeAttenuation: true }))
  scene.add(starPoints)

  // ── Celestial body (moon / sun) ───────────────────────────────────────────
  celestialBody = new THREE.Mesh(
    new THREE.SphereGeometry(3, 16, 16),
    new THREE.MeshBasicMaterial({ color: DARK.celestialColor })
  )
  celestialBody.position.copy(DARK.celestialPos)
  celestialGlow = new THREE.Mesh(
    new THREE.SphereGeometry(6, 16, 16),
    new THREE.MeshBasicMaterial({ color: DARK.celestialGlowColor, transparent: true, opacity: 0.08 })
  )
  celestialBody.add(celestialGlow)
  scene.add(celestialBody)

  // ── Ocean ─────────────────────────────────────────────────────────────────
  const OCEAN_SEGS = 120
  const oceanGeo = new THREE.PlaneGeometry(300, 300, OCEAN_SEGS, OCEAN_SEGS)
  oceanGeo.rotateX(-Math.PI / 2)
  oceanMat = new THREE.MeshPhongMaterial({
    color: DARK.oceanColor,
    specular: new THREE.Color(DARK.oceanSpecular),
    shininess: 90,
    side: THREE.FrontSide
  })
  scene.add(new THREE.Mesh(oceanGeo, oceanMat))

  const posAttr = oceanGeo.attributes.position as THREE.BufferAttribute
  const baseY = new Float32Array(posAttr.count)
  for (let i = 0; i < posAttr.count; i++) baseY[i] = posAttr.getY(i)

  // ── Boat ──────────────────────────────────────────────────────────────────
  const boat = new THREE.Group()
  const hullW = 2.2, hullH = 0.9, hullL = 5.5
  const tw = hullW, bw = hullW * 0.65
  const hullGeo = new THREE.BufferGeometry()
  hullGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    -bw, 0, -hullL / 2, bw, 0, -hullL / 2, bw, 0, hullL / 2, -bw, 0, hullL / 2,
    -tw, hullH, -hullL / 2, tw, hullH, -hullL / 2, tw, hullH, hullL / 2, -tw, hullH, hullL / 2
  ]), 3))
  hullGeo.setIndex(new THREE.BufferAttribute(new Uint16Array([
    0, 1, 5, 0, 5, 4, 2, 3, 7, 2, 7, 6,
    1, 2, 6, 1, 6, 5, 3, 0, 4, 3, 4, 7,
    4, 5, 6, 4, 6, 7, 0, 3, 2, 0, 2, 1
  ]), 1))
  hullGeo.computeVertexNormals()
  boat.add(new THREE.Mesh(hullGeo, new THREE.MeshPhongMaterial({ color: 0x4a2c0a })))

  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(tw * 1.9, 0.05, hullL * 0.9),
    new THREE.MeshPhongMaterial({ color: 0x6b3d15 })
  )
  deck.position.y = hullH + 0.02
  boat.add(deck)

  const mastMat = new THREE.MeshPhongMaterial({ color: 0x7a5c20 })
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 7.5, 8), mastMat)
  mast.position.set(0, hullH + 3.75, -0.3)
  boat.add(mast)

  const boomGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.8, 6)
  boomGeo.rotateZ(Math.PI / 2)
  const boom = new THREE.Mesh(boomGeo, mastMat)
  boom.position.set(0.8, hullH + 0.9, -0.3)
  boat.add(boom)

  const sailGeo = new THREE.BufferGeometry()
  sailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0, 0, 6.8, 0, 3.2, 0, 0]), 3))
  sailGeo.setIndex([0, 2, 1])
  sailGeo.computeVertexNormals()
  const sail = new THREE.Mesh(sailGeo, new THREE.MeshPhongMaterial({ color: 0xe8dfc8, side: THREE.DoubleSide }))
  sail.position.set(-0.02, hullH + 0.12, -0.32)
  boat.add(sail)

  const jibGeo = new THREE.BufferGeometry()
  jibGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0, 0, 5.5, 0, -2.0, 0, 2.0]), 3))
  jibGeo.setIndex([0, 1, 2])
  jibGeo.computeVertexNormals()
  const jib = new THREE.Mesh(jibGeo, new THREE.MeshPhongMaterial({ color: 0xd8cfb8, side: THREE.DoubleSide }))
  jib.position.set(-0.02, hullH + 0.12, -0.32)
  boat.add(jib)

  lantern = new THREE.PointLight(0xff9944, 2.5, 12)
  lantern.position.set(0, hullH + 1.5, hullL / 2 - 0.5)
  boat.add(lantern)
  lanternMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffbb66 })
  )
  lanternMesh.position.copy(lantern.position)
  boat.add(lanternMesh)

  boat.position.set(0, 0.05, 0)
  scene.add(boat)

  // ── Water reflection streak ───────────────────────────────────────────────
  const streakGeo = new THREE.PlaneGeometry(1.5, 60)
  streakMat = new THREE.MeshBasicMaterial({ color: 0xaabbdd, transparent: true, opacity: 0.04, side: THREE.DoubleSide })
  const streak = new THREE.Mesh(streakGeo, streakMat)
  streak.rotation.x = -Math.PI / 2
  streak.rotation.z = Math.PI / 6
  streak.position.set(-10, 0.05, -20)
  scene.add(streak)

  // Apply initial theme
  applyTheme(colorMode.value === 'dark')

  // ── Resize ────────────────────────────────────────────────────────────────
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer!.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', onResize)

  // ── Animation loop ────────────────────────────────────────────────────────
  const clock = new THREE.Clock()
  const animate = () => {
    animId = requestAnimationFrame(animate)
    const t = clock.getElapsedTime()

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i), z = posAttr.getZ(i)
      posAttr.setY(i,
        baseY[i]
        + Math.sin(x * 0.25 + t * 0.9) * 0.5
        + Math.sin(z * 0.18 + t * 0.65) * 0.4
        + Math.sin((x + z) * 0.12 + t * 1.1) * 0.2
      )
    }
    posAttr.needsUpdate = true
    oceanGeo.computeVertexNormals()

    const waveAtBoat = Math.sin(t * 0.9) * 0.5 + Math.sin(t * 0.65) * 0.4 + Math.sin(t * 1.1) * 0.2
    boat.position.y = 0.05 + waveAtBoat * 0.55
    boat.rotation.z = Math.sin(t * 0.7) * 0.04
    boat.rotation.x = Math.sin(t * 0.5) * 0.025

    if (lantern!.intensity > 0) {
      lantern!.intensity = 2.5 + Math.sin(t * 7.3) * 0.3 + Math.sin(t * 13.1) * 0.15
    }

    camera.position.x = Math.sin(t * 0.04) * 4
    camera.position.y = 9 + Math.sin(t * 0.06) * 0.5
    camera.lookAt(boat.position.x, boat.position.y + 1.5, boat.position.z)

    renderer!.render(scene!, camera)
  }
  animate()

  onBeforeUnmount(() => {
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', onResize)
    document.documentElement.style.overflow = ''
    renderer?.dispose()
    renderer = null
    scene = null
  })
})

// React to color mode changes
watch(() => colorMode.value, (val) => {
  applyTheme(val === 'dark')
})
</script>

<template>
  <div
    class="fixed inset-0 z-0"
    :style="{ background: colorMode.value === 'dark' ? '#060d1f' : '#87ceeb' }"
  >
    <canvas ref="canvasRef" class="block w-full h-full" />

    <!-- Overlay -->
    <div class="absolute inset-x-0 bottom-35 flex flex-col items-center pointer-events-none select-none">
      <h1
        class="text-6xl font-bold tracking-widest mb-3 drop-shadow-lg"
        :class="colorMode.value === 'dark' ? 'text-white' : 'text-slate-800'"
        :style="colorMode.value === 'dark'
          ? 'text-shadow: 0 0 40px rgba(100,160,255,0.4)'
          : 'text-shadow: 0 0 30px rgba(255,255,255,0.6)'"
      >
        Lost Blogs
      </h1>
      <p
        class="text-base tracking-[0.3em] uppercase mb-8"
        :class="colorMode.value === 'dark' ? 'text-blue-200/60' : 'text-slate-600/80'"
      >
        a lonely boat in the sea of thoughts
      </p>
      <a
        href="/golang"
        class="pointer-events-auto px-8 py-2.5 rounded-full text-sm tracking-widest uppercase transition-all duration-300"
        :class="colorMode.value === 'dark'
          ? 'text-blue-300/80 border border-blue-400/30 hover:bg-blue-400/10 hover:border-blue-400/60'
          : 'text-slate-700 border border-slate-400/50 hover:bg-white/30 hover:border-slate-500'"
      >
        Find Blogs
      </a>
    </div>
  </div>
</template>
