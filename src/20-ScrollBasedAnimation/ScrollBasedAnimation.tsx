import GradientPNG from '@assets/textures/gradients/3.jpg?url'
import { FC, ReactNode, RefObject, useCallback } from "react";
import * as Three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useThree } from "../hooks/use-three";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import gsap from 'gsap'

interface AnimationsOptions {
  children?: ReactNode
}

const ScrollBasedAnimation: FC<AnimationsOptions> = () => {
  const onMounted = useCallback((scene: Three.Scene, canvasRef: RefObject<HTMLCanvasElement>) => {

    const panel = new GUI({ width: 310 });
    const textureLoader = new Three.TextureLoader()

    /**
     * Scroll
     */
    let scrollY = window.scrollY

    /**
     * Cursor
     */
    const cursor = {
      x: 0,
      y: 0
    }

    const params = {
      materialColor: '#ffeded'
    }

    const gradientTexture = textureLoader.load(GradientPNG)
    gradientTexture.magFilter = Three.NearestFilter

    const material = new Three.MeshToonMaterial({
      color: params.materialColor,
      gradientMap: gradientTexture
    })

    panel.addColor(params, 'materialColor').onFinishChange(() => {
      material.color.set(params.materialColor)
      particlesMaterial.color.set(params.materialColor)
    })

    /**
     * Mesh
     */
    const objectDistance = 4
    const mesh1 = new Three.Mesh(
      new Three.TorusGeometry(1, 0.4, 16, 60),
      material
    )

    const mesh2 = new Three.Mesh(
      new Three.ConeGeometry(1, 2, 32),
      material
    )

    const mesh3 = new Three.Mesh(
      new Three.TorusKnotGeometry(0.8, 0.35, 100, 16),
      material
    )

    mesh1.position.y = - objectDistance * 0
    mesh2.position.y = - objectDistance * 1
    mesh3.position.y = - objectDistance * 2

    mesh1.position.x = 2
    mesh2.position.x = -2
    mesh3.position.x = 2

    const sectionMesh = [mesh1, mesh2, mesh3]

    scene.add(...sectionMesh)

    /**
     * Particales
     */
    // Geomertry 
    const particlesCount = 200
    const positions = new Float32Array(particlesCount * 3)
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3
      positions[i3 + 0] = (Math.random() - 0.5) * 10
      // (Math.random() - 0.5) * objectDistance * (sectionMesh.length + 1) 表示 Y 轴跨度
      // - objectDistance * 0.5 表示还需要下沉半个屏幕(因为这里第三个图形 mesh3 是 objectDistance * 2，要想星星撑满整个区域，就需要下沉)
      positions[i3 + 1] = (Math.random() - 0.5) * objectDistance * (sectionMesh.length + 1) - objectDistance * 0.5
      positions[i3 + 2] = (Math.random() - 0.5) * 10
    }
    const particlesGeometry = new Three.BufferGeometry()
    particlesGeometry.setAttribute("position", new Three.BufferAttribute(positions, 3))

    // Materials
    const particlesMaterial = new Three.PointsMaterial({
      color: params.materialColor,
      size: 0.01,
      sizeAttenuation: true
    })

    const particles = new Three.Points(
      particlesGeometry,
      particlesMaterial
    )

    scene.add(particles)


    // const axesHelper = new Three.AxesHelper(5)
    // scene.add(axesHelper)

    // 环境光
    // const ambientLight = new Three.AmbientLight('#ffffff', 1)
    // scene.add(ambientLight)

    // 平行光
    const directionalLight = new Three.DirectionalLight('#ffffff', 1)
    directionalLight.position.set(1, 1, 0)
    scene.add(directionalLight)

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    /**
     * CameraGroup 用于控制鼠标变动
     */
    const cameraGroup = new Three.Group()
    scene.add(cameraGroup)

    const camera = new Three.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(0, 0, objectDistance)
    camera.lookAt(new Three.Vector3(0, 0, 0))
    cameraGroup.add(camera)

    const renderer = new Three.WebGLRenderer({
      canvas: canvasRef?.current as HTMLCanvasElement
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // renderer.setClearAlpha(0.5)

    const clock = new Three.Clock()
    let previousTime = 0

    const draw = () => {
      const elapsedTime = clock.getElapsedTime()
      const deltTime = elapsedTime - previousTime
      previousTime = elapsedTime

      // 这里很巧妙，使用了 camera 和  cameraGroup
      camera.position.y = - scrollY / sizes.height * objectDistance

      const parallaxX = cursor.x
      const parallaxY = - cursor.y
      cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * deltTime * 2
      cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * deltTime * 2

      for (const mesh of sectionMesh) {
        mesh.rotation.y += deltTime * 0.1
        mesh.rotation.x += deltTime * 0.12
      }

      // controls.update();
      renderer.render(scene, camera)
      requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      // update size
      sizes.height = window.innerHeight
      sizes.width = window.innerWidth
      // update camera
      camera.aspect = sizes.width / sizes.height
      camera.updateProjectionMatrix()
      // update renderer 
      renderer.setSize(sizes.width, sizes.height)
    }

    let currentSection = 0
    const handleScroll = () => {
      scrollY = window.scrollY

      const newSection = Math.round(scrollY / sizes.height)

      if (newSection !== currentSection) {
        currentSection = newSection
        gsap.to(sectionMesh[newSection].rotation, {
          duration: 1.5,
          ease: 'power2.inOut',
          x: '+=6',
          y: '+=3',
          z: '+=1.5'
        })
      }
    }

    const handleMove = (e: MouseEvent) => {
      cursor.x = e.clientX / sizes.width - 0.5
      cursor.y = e.clientY / sizes.height - 0.5
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMove)


    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMove)
    }
  }, [])

  const { canvasRef } = useThree(onMounted)

  const sectionClassName = "flex items-center relative h-full z-10 text-yellow-400 text-[7vmin] px-[10%] odd:justify-end";

  return (
    <>
      <canvas className='fixed top-0 left-0' ref={canvasRef}></canvas>
      <section className={sectionClassName}>
        <h1>A circular shape</h1>
      </section>
      <section className={sectionClassName}>
        <h2>A cone</h2>
      </section>
      <section className={sectionClassName}>
        <h2>What's this?</h2>
      </section>
    </>

  )
}

export default ScrollBasedAnimation