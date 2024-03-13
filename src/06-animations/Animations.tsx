import { FC, ReactNode, RefObject, useCallback, useEffect, useMemo } from "react";
import * as Three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useThree } from "../hooks/use-three";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import gsap from 'gsap'

interface AnimationsOptions {
  children?: ReactNode
}

const Animations: FC<AnimationsOptions> = () => {
  const boxLength = 100

  const onMounted = useCallback((scene: Three.Scene, canvasRef: RefObject<HTMLCanvasElement>) => {

    // Cube
    const geometry = new Three.BoxGeometry(boxLength, boxLength, boxLength)
    const material = new Three.MeshBasicMaterial({ color: 'red' })
    const mesh = new Three.Mesh(geometry, material)
    scene.add(mesh)

    // axes
    const axesHelper = new Three.AxesHelper(boxLength)
    scene.add(axesHelper)

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    const parameters = {
      spin: () => {
        gsap.to(mesh.position, { duration: 3, x: mesh.position.x + 50 })
      }
    }


    const panel = new GUI({ width: 310 });
    panel.add(mesh.position, 'x').min(-200).max(200).step(0.1)
    panel.add(mesh, 'visible')
    panel.add(material, 'wireframe')
    panel.addColor(material, 'color')
    panel.add(parameters, 'spin')


    // Camera
    const camera = new Three.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(0, 0, boxLength * 2)

    camera.lookAt(mesh.position)

    scene.add(camera)

    // Renderer
    const renderer = new Three.WebGLRenderer({
      canvas: canvasRef?.current as HTMLCanvasElement
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const controls = new OrbitControls(camera, renderer.domElement);

    // 可选配置
    controls.enableDamping = true; // 启用阻尼效果
    controls.dampingFactor = 0.25; // 阻尼系数
    controls.enableZoom = true; // 启用相机缩放
    controls.zoomSpeed = 1.0; // 缩放速度

    const draw = () => {

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

export default Animations