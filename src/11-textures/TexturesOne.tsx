import OnePNG from '@assets/matcaps/5.png'
import AlphaJPG from '@assets/textures/door/alpha.jpg'
import ColorJPG from '@assets/textures/door/color.jpg'
import { FC, ReactNode, RefObject, useCallback, useEffect, useRef } from "react";
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
    // const material = new Three.MeshLambertMaterial({
    //   side: Three.DoubleSide,
    //   map: colorTexture
    // })

    const material = new Three.MeshPhongMaterial(); // 高光材质
    material.shininess = 100; // 光泽度

    // const sphere = new Three.Mesh(
    //   new Three.SphereGeometry(0.5, 16, 16),
    //   material
    // )

    // const plane = new Three.Mesh(
    //   new Three.PlaneGeometry(1, 1),
    //   material
    // )
    // plane.position.x = 1

    // const torus = new Three.Mesh(
    //   new Three.TorusGeometry(0.4, 0.1),
    //   material
    // )
    // torus.position.x = -1

    const sphere = new Three.Mesh(new Three.SphereGeometry(0.5, 64, 64), material);
    sphere.position.x = -1.5;
    sphere.geometry.setAttribute("uv2", new Three.BufferAttribute(sphere.geometry.attributes.uv.array, 2));

    const plane = new Three.Mesh(new Three.PlaneGeometry(1, 1, 100, 100), material);
    plane.geometry.setAttribute("uv2", new Three.BufferAttribute(plane.geometry.attributes.uv.array, 2));
    const torus = new Three.Mesh(new Three.TorusGeometry(0.3, 0.1, 64, 128), material);
    torus.position.x = 1.5;
    torus.geometry.setAttribute("uv2", new Three.BufferAttribute(torus.geometry.attributes.uv.array, 2));

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
    const ambientLight = new Three.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 点光源
    // const pointLight = new Three.PointLight(0xffffff, 1)
    // pointLight.position.x = 2
    // pointLight.position.y = 2
    // pointLight.position.z = 2
    // scene.add(pointLight)
    const pointLight = new Three.PointLight(0xffffff, 0.5);
    pointLight.position.x = 2;
    pointLight.position.y = 3;
    pointLight.position.z = 4;
    scene.add(pointLight);

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }


    // Camera
    const camera = new Three.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(0, 0, 5)

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

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // scene
    const scene = new Three.Scene()

    // const geom = new Three.BoxGeometry(4, 4, 4) // 创建几何对象geom
    // const material = new Three.MeshLambertMaterial({ color: 0xff0000 }) // 创建材质对象material
    // const cube = new Three.Mesh(geom, material) // 创建网格对象cube
    // cube.castShadow = true
    // cube.position.set(-4, 3, 2)
    // scene.add(cube) // 将网格对象添加到场景

    const axes = new Three.AxesHelper(10)
    scene.add(axes)

    const sphereGeometry = new Three.SphereGeometry(1, 20, 20) // 创建几何对象sphereGeometry
    const sphereMaterial = new Three.MeshLambertMaterial({ color: 0xffffff }) // 创建材质对象sphereMaterial
    // const sphereMaterial = new Three.MeshBasicMaterial({ color: 0xff0000 }) // 创建材质对象sphereMaterial
    const sphere = new Three.Mesh(sphereGeometry, sphereMaterial) // 创建网格对象sphere
    sphere.castShadow = true
    sphere.receiveShadow = true; // 物体接收阴影
    sphere.position.set(0, 0, 0)
    scene.add(sphere) // 将网格对象添加到场景

    // 添加聚光灯
    // const spotLight = new Three.SpotLight(0xffffff)
    // spotLight.position.set(3, 3, 3)
    // spotLight.castShadow = true
    // scene.add(spotLight) // 聚光灯添加到场景中

    // 环境光
    // const ambientLight = new Three.AmbientLight(0xffffff) // 创建环境光
    // ambientLight.position.set(0, 0, 0)
    // scene.add(ambientLight) // 将环境光添加到场景

    // // 点光源
    const pointLight = new Three.PointLight('#ffffff') // 创建点光源
    pointLight.distance = 10 // 设置点光源照射距离为100
    pointLight.position.set(3, 3, 3)
    scene.add(pointLight) // 将点光源添加到场景

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    // Camera
    const camera = new Three.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(3, 3, 3)
    camera.lookAt(sphere.position)

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

  }, [canvasRef])


  return <>
    <canvas ref={canvasRef}></canvas>
  </>
}

export default Textures