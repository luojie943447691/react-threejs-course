
import BakedShadowPNG from '@assets/textures/shadows/bakedShadow.jpg?url'
import { FC, ReactNode, RefObject, useCallback } from "react";
import * as Three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useThree } from "../hooks/use-three";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

interface AnimationsOptions {
  children?: ReactNode
}

const Shadows: FC<AnimationsOptions> = () => {
  const onMounted = useCallback((scene: Three.Scene, canvasRef: RefObject<HTMLCanvasElement>) => {
    const textureLoader = new Three.TextureLoader()
    const panel = new GUI({ width: 310 });
    scene.background = new Three.Color(0x003261); // 将背景色设置为蓝色

    const bakedShadowTexture = textureLoader.load(BakedShadowPNG)

    const material = new Three.MeshStandardMaterial({
      side: Three.DoubleSide
    })

    const sphere = new Three.Mesh(
      new Three.SphereGeometry(0.5, 64, 64),
      material
    )
    sphere.castShadow = true

    const plane = new Three.Mesh(
      new Three.PlaneGeometry(5, 5),
      // new Three.MeshBasicMaterial({
      //   map: bakedShadowTexture
      // })
      material
    )
    plane.position.y = -0.5
    plane.rotation.x = - Math.PI / 2
    plane.receiveShadow = true

    const group = new Three.Group()
    const cubes = [sphere, plane]
    group.add(...cubes)
    scene.add(group)

    const axesHelper = new Three.AxesHelper(5)
    scene.add(axesHelper)

    // 环境光
    const ambientLight = new Three.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    // 平行光
    const directionalLight = new Three.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(1, 2, 3)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(1024, 1024)
    scene.add(directionalLight)

    // 平行光阴影相机(正交相机)
    directionalLight.shadow.camera.near = 1
    directionalLight.shadow.camera.far = 8
    directionalLight.shadow.camera.top = 1.5
    directionalLight.shadow.camera.right = 3.5
    directionalLight.shadow.camera.bottom = -2.5
    directionalLight.shadow.camera.left = -3.5
    // 当 renderer.shadowMap.type 是 Three.PCFSoftShadowMap 时，不生效
    // directionalLight.shadow.radius = 10 // 模糊半径

    const directionalLightCameraHelper = new Three.CameraHelper(directionalLight.shadow.camera)
    directionalLightCameraHelper.visible = false
    scene.add(directionalLightCameraHelper)

    // 聚光灯
    const spotLight = new Three.SpotLight(0xffffff, 4, 5, Math.PI * 0.1)
    spotLight.position.set(2, 1, -1)
    spotLight.castShadow = true
    spotLight.shadow.mapSize.set(1024, 1024)
    spotLight.shadow.camera.fov = 30
    spotLight.shadow.camera.near = 1
    spotLight.shadow.camera.far = 5
    scene.add(spotLight)
    scene.add(spotLight.target)

    const spotLightCameraHelper = new Three.CameraHelper(spotLight.shadow.camera)
    spotLightCameraHelper.visible = false
    scene.add(spotLightCameraHelper)

    // 点光源
    const pointLight = new Three.PointLight(0xffffff, 2)
    pointLight.castShadow = true
    pointLight.shadow.mapSize.width = 1024
    pointLight.shadow.mapSize.height = 1024
    pointLight.shadow.camera.near = 0.5
    pointLight.shadow.camera.far = 2
    
    pointLight.position.set(-1, 1, 1)
    scene.add(pointLight)

    const pointLightCameraHelper = new Three.CameraHelper(pointLight.shadow.camera)
    pointLightCameraHelper.visible = false
    scene.add(pointLightCameraHelper)

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    const camera = new Three.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(2, 2, -2)
    scene.add(camera)

    const renderer = new Three.WebGLRenderer({
      canvas: canvasRef?.current as HTMLCanvasElement
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // 要渲染阴影，需要打开这个配置
    renderer.shadowMap.enabled = false
    // 修改投影算法
    renderer.shadowMap.type = Three.PCFSoftShadowMap

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;

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

export default Shadows