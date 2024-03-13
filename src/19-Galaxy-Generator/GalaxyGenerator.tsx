import OnePNG from '@assets/textures/particles/2.png?url'
import { FC, ReactNode, RefObject, useCallback } from "react";
import * as Three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useThree } from "../hooks/use-three";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import gsap from 'gsap'

interface AnimationsOptions {
  children?: ReactNode
}

const GalaxyGenerator: FC<AnimationsOptions> = () => {
  const onMounted = useCallback((scene: Three.Scene, canvasRef: RefObject<HTMLCanvasElement>) => {

    const panel = new GUI({ width: 310 });
    const textureLoader = new Three.TextureLoader()

    const oneTexture = textureLoader.load(OnePNG)

    /**
     * Galaxy
     */
    const parameters = {
      count: 30000,
      size: 0.02,
      radius: 5,
      branches: 5,
      spin: 1,
      randomness: 0.8,
      randomnessPow: 3,
      insideColor: '#ff6030',
      outsideColor: '#1b3984',
    }

    let geometry: Three.BufferGeometry | null = null
    let pointsMaterial: Three.PointsMaterial | null = null
    let points: Three.Points | null = null

    const generateGalaxy = () => {

      // 释放无用图形和材质
      if (points !== null) {
        geometry?.dispose()
        pointsMaterial?.dispose()
        scene.remove(points)
      }

      geometry = new Three.BufferGeometry()
      const positions = new Float32Array(parameters.count * 3)
      const colors = new Float32Array(parameters.count * 3)

      const colorInside = new Three.Color(parameters.insideColor)
      const colorOutside = new Three.Color(parameters.outsideColor)

      for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3

        // Position
        const radius = parameters.radius * Math.random()
        const spinAngle = radius * parameters.spin
        const branchIndex = i % parameters.branches

        const branchAngle = branchIndex * ((Math.PI * 2) / parameters.branches)

        // Math.pow 用来保证圆心内部多，外部少
        const randomX = Math.pow(Math.random(), parameters.randomnessPow) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness
        const randomY = Math.pow(Math.random(), parameters.randomnessPow) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness
        const randomZ = Math.pow(Math.random(), parameters.randomnessPow) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness

        positions[i3 + 0] = radius * Math.cos(branchAngle + spinAngle) + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = radius * Math.sin(branchAngle + spinAngle) + randomZ

        // Colors
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        colors[i3 + 0] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
      }


      geometry.setAttribute('position', new Three.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new Three.BufferAttribute(colors, 3))

      pointsMaterial = new Three.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: Three.AdditiveBlending,
        vertexColors: true
      })

      points = new Three.Points(geometry, pointsMaterial)

      gsap.to(points.rotation, {
        duration: 10,
        y: Math.PI * 2,
        repeat: -1,
        ease: 'linear'
      })

      scene.add(points)
    }
    generateGalaxy()

    panel.add(parameters, 'count').min(100).max(100000).step(1).onFinishChange(generateGalaxy)
    panel.add(parameters, 'size').min(0.001).max(0.1).step(0.0001).onFinishChange(generateGalaxy)
    panel.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
    panel.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
    panel.add(parameters, 'spin').min(-5).max(5).step(0.0001).onFinishChange(generateGalaxy)
    panel.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
    panel.add(parameters, 'randomnessPow').min(2).max(10).step(1).onFinishChange(generateGalaxy)
    panel.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
    panel.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)


    const axesHelper = new Three.AxesHelper(5)
    scene.add(axesHelper)

    // 环境光
    // const ambientLight = new Three.AmbientLight('#ffffff', 1)
    // scene.add(ambientLight)

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    const camera = new Three.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(5, 5, 5)
    scene.add(camera)

    const renderer = new Three.WebGLRenderer({
      canvas: canvasRef?.current as HTMLCanvasElement
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // renderer.setClearColor('#262837')

    // 要渲染阴影，需要打开这个配置
    // renderer.shadowMap.enabled = true
    // 修改投影算法
    // renderer.shadowMap.type = Three.PCFSoftShadowMap

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;

    // const clock = new Three.Clock()

    const draw = () => {

      // const elapsedTime = clock.getElapsedTime()

      controls.update();
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


    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const { canvasRef } = useThree(onMounted)


  return <>
    <canvas ref={canvasRef}></canvas>
  </>
}

export default GalaxyGenerator