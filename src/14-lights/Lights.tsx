import OneMatcapPNG from '@assets/matcaps/1.png'
import { FC, ReactNode, RefObject, useCallback } from "react";
import * as Three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useThree } from "../hooks/use-three";
import gsap from 'gsap'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

interface AnimationsOptions {
  children?: ReactNode
}

const Lights: FC<AnimationsOptions> = () => {
  const onMounted = useCallback((scene: Three.Scene, canvasRef: RefObject<HTMLCanvasElement>) => {
    const panel = new GUI({ width: 310 });
    scene.background = new Three.Color(0x003261); // 将背景色设置为蓝色

    const material = new Three.MeshStandardMaterial({
      side: Three.DoubleSide
    })

    const sphere = new Three.Mesh(
      new Three.SphereGeometry(0.5, 64, 64),
      material
    )
    // sphere.position.y = 1

    const box = new Three.Mesh(
      new Three.BoxGeometry(1, 1, 1),
      material
    )
    box.position.x = 1.5

    const torus = new Three.Mesh(
      new Three.TorusGeometry(0.4, 0.1),
      material
    )
    torus.position.x = -1

    const plane = new Three.Mesh(
      new Three.PlaneGeometry(5, 5),
      material
    )
    plane.position.y = -0.5
    plane.rotation.x = Math.PI / 2

    const group = new Three.Group()
    const cubes = [sphere, box, torus, plane]
    group.add(...cubes)
    scene.add(group)

    // axes
    const axesHelper = new Three.AxesHelper(5)
    scene.add(axesHelper)

    // 环境光
    const ambientLight = new Three.AmbientLight(0xffffff, 0.5);
    // scene.add(ambientLight);
    // panel.add(ambientLight, 'intensity').min(0).max(1).step(0.001)

    // 平行光
    // const directionLight = new Three.DirectionalLight(0x00fffc, 0.3)
    // scene.add(directionLight)

    // 半球光
    const hemisphereLight = new Three.HemisphereLight(0xff0000, 0x0000ff, 0.3)
    scene.add(hemisphereLight)

    const hemisphereLightHelper = new Three.HemisphereLightHelper(hemisphereLight, 5);
    scene.add(hemisphereLightHelper);

    // 点光源
    const pointLight = new Three.PointLight(0xff9000, 0.5);
    pointLight.position.set(1, -0.5, 1)
    scene.add(pointLight);

    // 平面光
    const rectAreaLight = new Three.RectAreaLight(0x4e00ff, 2, 1, 1);
    scene.add(rectAreaLight);

    // 聚光灯
    const spotLight = new Three.SpotLight(0x78ff00, 0.5, 4, Math.PI * 0.1, 0.25, 0.5);
    spotLight.position.set(0, 1, 2)
    scene.add(spotLight);

    // Helpers
    // 聚光灯助手
    const spotLightHelper = new Three.SpotLightHelper(spotLight);
    scene.add(spotLightHelper);


    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    // Camera
    const camera = new Three.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(2, 2, 2)
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

    const config = {
      y: Math.PI * 2,
      duration: 4,
      repeat: -1,
      ease: 'linear'
    }
    const rotates = cubes.slice(0, 3)
    for (const cube of rotates) {
      gsap.to(cube.rotation, config)
    }

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

export default Lights