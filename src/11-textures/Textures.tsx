import OnePNG from '@assets/matcaps/5.png'
import AlphaJPG from '@assets/textures/door/alpha.jpg'
import ColorJPG from '@assets/textures/door/color.jpg'
import { FC, ReactNode, RefObject, useCallback } from "react";
import * as Three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useThree } from "../hooks/use-three";
import gsap from 'gsap'

interface AnimationsOptions {
  children?: ReactNode
}

const Textures: FC<AnimationsOptions> = () => {

  const onMounted = useCallback((scene: Three.Scene, canvasRef: RefObject<HTMLCanvasElement>) => {
    // textures 
    const textureLoader = new Three.TextureLoader()
    const oneTexture = textureLoader.load(OnePNG)
    const alphaTexture = textureLoader.load(AlphaJPG)
    const colorTexture = textureLoader.load(ColorJPG)
    // Cubes
    // const material = new Three.MeshBasicMaterial({
    //   // color: 'red',
    //   // wireframe: true,
    //   map: colorTexture,
    //   side: Three.DoubleSide,
    //   alphaMap: alphaTexture,
    //   transparent: true
    // })

    // const material = new Three.MeshNormalMaterial({
    //   side: Three.DoubleSide,
    //   flatShading:true
    // })

    // const material = new Three.MeshMatcapMaterial({
    //   side: Three.DoubleSide,
    //   matcap: oneTexture
    // })

    // const material = new Three.MeshDepthMaterial()
    const material = new Three.MeshLambertMaterial({
      side: Three.DoubleSide,
      // color: "#ffffff"
    })

    const sphere = new Three.Mesh(
      new Three.SphereGeometry(0.5, 16, 16),
      material
    )
    sphere.castShadow = true

    const plane = new Three.Mesh(
      new Three.PlaneGeometry(1, 1),
      material
    )
    plane.position.x = 1

    const torus = new Three.Mesh(
      new Three.TorusGeometry(0.4, 0.1),
      material
    )
    torus.position.x = -1

    const group = new Three.Group()
    const cubes = [sphere, plane, torus]
    group.add(...cubes)
    scene.add(group)

    // axes
    const axesHelper = new Three.AxesHelper(5)
    scene.add(axesHelper)

    // lights 
    // 环境光
    // const lights = new Three.AmbientLight(0xffffff, 1)
    // lights.position.x = 2
    // lights.position.y = 2
    // lights.position.z = 2
    // scene.add(lights)
    // const ambientLight = new Three.AmbientLight(0xffffff, 0.5);
    // scene.add(ambientLight);

    // 点光源
    // const pointLight = new Three.PointLight(0xffffff, 1)
    // pointLight.position.x = 2
    // pointLight.position.y = 2
    // pointLight.position.z = 2
    // scene.add(pointLight)

    const pointLight = new Three.PointLight(0xffffff, 1);
    pointLight.position.x = 3;
    pointLight.position.y = 3;
    pointLight.position.z = 3;
    scene.add(pointLight);

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }


    // Camera
    const camera = new Three.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(0, 0, 3)

    // camera.lookAt(mesh.position)

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
    for (const cube of cubes) {
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

export default Textures