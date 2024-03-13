import OnePNG from '@assets/textures/particles/2.png?url'
import { FC, ReactNode, RefObject, useCallback } from "react";
import * as Three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useThree } from "../hooks/use-three";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

interface AnimationsOptions {
  children?: ReactNode
}

const Particles: FC<AnimationsOptions> = () => {
  const onMounted = useCallback((scene: Three.Scene, canvasRef: RefObject<HTMLCanvasElement>) => {

    const panel = new GUI({ width: 310 });
    const textureLoader = new Three.TextureLoader()

    const oneTexture = textureLoader.load(OnePNG)
    /**
     * Particles
     */

    // Geometry
    const particlesGometry = new Three.BufferGeometry()
    const count = 500

    const points = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count * 3; i++) {
      points[i] = (Math.random() - 0.5) * 10
      colors[i] = Math.random()
    }

    particlesGometry.setAttribute("position", new Three.BufferAttribute(points, 3))
    particlesGometry.setAttribute("color", new Three.BufferAttribute(colors, 3))

    // Material
    const particlesMaterial = new Three.PointsMaterial({
      alphaMap: oneTexture,
      // color: '#ff88cc',
      // alphaTest: 0.001, // 如果低于此值就不会渲染。这么设置可以保证图片中黑色部分不会被渲染。但是后面的物体可能覆盖前面的物体
      // depthTest: false, // 会导致某个物体之后的东西也会被渲染出来
      depthWrite: false, // 这样设置可以解决 alphaTest 和 depthTest 带来的问题。绝大部分情况下，都是使用它
      blending: Three.AdditiveBlending,
      vertexColors: true, // 使用顶点着色。通过 setAttribute 设置 color 属性时需要打开此设置。否则不生效
      transparent: true,
      size: 0.2,
      sizeAttenuation: true // 粒子随距离放大缩小
    })

    // Cube
    const particles = new Three.Points(
      particlesGometry,
      particlesMaterial
    )

    scene.add(particles)

    // box
    const box = new Three.Mesh(
      new Three.BoxGeometry(),
      new Three.MeshBasicMaterial({
        color: 'blue'
      })
    )
    scene.add(box)

    const axesHelper = new Three.AxesHelper(5)
    scene.add(axesHelper)

    // 环境光
    const ambientLight = new Three.AmbientLight('#ffffff', 1)
    panel.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
    scene.add(ambientLight)

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    const camera = new Three.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(2, 2, 2)
    scene.add(camera)

    const renderer = new Three.WebGLRenderer({
      canvas: canvasRef?.current as HTMLCanvasElement
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor('#262837')

    // 要渲染阴影，需要打开这个配置
    // renderer.shadowMap.enabled = true
    // 修改投影算法
    // renderer.shadowMap.type = Three.PCFSoftShadowMap

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;

    const clock = new Three.Clock()

    const draw = () => {

      const elapsedTime = clock.getElapsedTime()

      // particles.position.y = Math.cos(elapsedTime * 0.5)

      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const x = particlesGometry.attributes.position.array[i3]
        particlesGometry.attributes.position.array[i3 + 1] = Math.cos(elapsedTime + x)
      }

      particlesGometry.attributes.position.needsUpdate = true

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

export default Particles