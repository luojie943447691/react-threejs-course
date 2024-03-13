import OnePNG from '@assets/matcaps/1.png'
import TowPNG from '@assets/matcaps/2.png'
import ThreePNG from '@assets/matcaps/3.png'
import FourPNG from '@assets/matcaps/4.png'
import FivePNG from '@assets/matcaps/5.png'
import SixPNG from '@assets/matcaps/6.png'
import SevenPNG from '@assets/matcaps/7.png'
import EightPNG from '@assets/matcaps/8.png'
import DoorAlphaJPG from '@assets/textures/door/alpha.jpg'
import DoorColorJPG from '@assets/textures/door/color.jpg'
import DoorAmbientOcclusionJPG from '@assets/textures/door/ambientOcclusion.jpg'
import DoorHeightJPG from '@assets/textures/door/height.jpg'
import DoorRoughnessJPG from '@assets/textures/door/roughness.jpg'
import DoorMetalnessJPG from '@assets/textures/door/metalness.jpg'
import DoorNormalJPG from '@assets/textures/door/normal.jpg'
import GradientThreeJPG from '@assets/textures/gradients/5.jpg'
import { FC, ReactNode, RefObject, useCallback } from "react";
import * as Three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useThree } from "../hooks/use-three";
import gsap from 'gsap'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

interface AnimationsOptions {
  children?: ReactNode
}

const Materials: FC<AnimationsOptions> = () => {

  const onMounted = useCallback((scene: Three.Scene, canvasRef: RefObject<HTMLCanvasElement>) => {
    const panel = new GUI({ width: 310 });
    scene.background = new Three.Color(0x003261); // 将背景色设置为蓝色

    // textures
    const textureLoader = new Three.TextureLoader()
    const cubeTextureLoader = new Three.CubeTextureLoader()


    const oneTexture = textureLoader.load(OnePNG)
    const twoTexture = textureLoader.load(TowPNG)
    const threeTexture = textureLoader.load(ThreePNG)
    const fourTexture = textureLoader.load(FourPNG)
    const fiveTexture = textureLoader.load(FivePNG)
    const sixTexture = textureLoader.load(SixPNG)
    const sevenTexture = textureLoader.load(SevenPNG)
    const eightTexture = textureLoader.load(EightPNG)
    const doorAlphaTexture = textureLoader.load(DoorAlphaJPG)
    const doorColorTexture = textureLoader.load(DoorColorJPG)
    const doorAmbientOcclusionTexture = textureLoader.load(DoorAmbientOcclusionJPG)
    const doorHeightTexture = textureLoader.load(DoorHeightJPG)
    const doorRoughnessTexture = textureLoader.load(DoorRoughnessJPG)
    const doorMetalnessTexture = textureLoader.load(DoorMetalnessJPG)
    const doorNormalTexture = textureLoader.load(DoorNormalJPG)
    const gradientThreeTexture = textureLoader.load(GradientThreeJPG)

    const enviromentMapTexture = cubeTextureLoader
      .setPath("/src/assets/textures/environmentMaps/1/")
      .load([
        "nx.jpg",
        "ny.jpg",
        "nz.jpg",
        "px.jpg",
        "py.jpg",
        "pz.jpg",
      ])


    // Objects
    // const material = new Three.MeshBasicMaterial()
    // material.map = colorTexture // 贴图
    // material.color = new Three.Color("red") // 颜色
    // // material.wireframe = true // 是否将几何体渲染为线框
    // material.transparent = true // 是否为透明
    // material.opacity = 0.5 // 不透明度
    // material.alphaMap = doorAlphaTexture // 灰度纹理 黑色：完全透明；白色：完全不透明
    // material.side = Three.DoubleSide // 两边都展示

    // const material = new Three.MeshNormalMaterial() // 法线网格材质
    // material.flatShading = true // 平面着色渲染

    // const material = new Three.MeshMatcapMaterial()
    // material.matcap = eightTexture

    // 深度绘制集合体。深度基于相机远近平面。白色最近，黑色最远。光线不对该材料起任何作用
    // const material = new Three.MeshDepthMaterial() 

    // 可以反射光，但是不能模拟具有镜面高光的光泽表面（例如涂漆木材）
    // const material = new Three.MeshLambertMaterial() 

    // 该材质可以模拟具有镜面高光的光泽表面
    // const material = new Three.MeshPhongMaterial({
    //   color: 0xffffff,
    //   side: Three.DoubleSide
    // })
    // material.shininess = 1000 // 高亮程度
    // material.specular = new Three.Color('#1188ff') // 材质的高光颜色

    // const material = new Three.MeshToonMaterial() // 卡通色材质
    // gradientThreeTexture.minFilter = Three.NearestFilter
    // gradientThreeTexture.magFilter = Three.NearestFilter
    // gradientThreeTexture.generateMipmaps = false // 如果我们使用了过滤器，尽量让它失效
    // material.gradientMap = gradientThreeTexture // 卡通着色的渐变贴图

    // const material = new Three.MeshStandardMaterial()
    // material.roughness = 0.45 // 材质的粗糙程度。 1 表示粗糙，漫反射
    // material.metalness = 0.65 // 材质与金属的相似度。非金属材质，如木材或石材，使用0.0，金属使用1.0
    // material.map = doorColorTexture // 颜色贴图
    // material.aoMap = doorAmbientOcclusionTexture // 环境遮挡贴图
    // material.aoMapIntensity = 10 // 环境遮挡贴图强度
    // material.alphaMap = doorAlphaTexture // 灰度贴图。黑色：完全透明；白色：完全不透明
    // material.transparent = true // 设置成透明
    // material.side = Three.DoubleSide
    // material.wireframe = true
    // material.displacementMap = doorHeightTexture // 位移纹理。白色最高
    // material.displacementScale = 0 // 位移比例
    // material.roughnessMap = doorRoughnessTexture // 粗糙度贴图
    // material.metalnessMap = doorMetalnessTexture // 金属度贴图
    // material.normalMap = doorNormalTexture // 法线贴图

    const material = new Three.MeshStandardMaterial()
    material.roughness = 0 // 材质的粗糙程度。 1 表示粗糙，漫反射
    material.metalness = 1 // 材质与金属的相似度。非金属材质，如木材或石材，使用0.0，金属使用1.0
    material.envMap = enviromentMapTexture
    material.side = Three.DoubleSide

    panel.add(material, 'roughness').min(0).max(1).step(0.001)
    panel.add(material, 'metalness').min(0).max(1).step(0.001)
    // panel.add(material, 'aoMapIntensity').min(0).max(10).step(0.01)
    // panel.add(material, 'displacementScale').min(0).max(1).step(0.001)

    const sphere = new Three.Mesh(
      new Three.SphereGeometry(0.5, 64, 64),
      material
    )
    sphere.castShadow = true
    sphere.geometry.setAttribute(
      'uv2',
      new Three.BufferAttribute(sphere.geometry.attributes.uv.array, 2)
    )

    const plane = new Three.Mesh(
      new Three.PlaneGeometry(1, 1),
      material
    )
    plane.position.x = 1
    plane.geometry.setAttribute(
      'uv2',
      new Three.BufferAttribute(plane.geometry.attributes.uv.array, 2)
    )

    const torus = new Three.Mesh(
      new Three.TorusGeometry(0.4, 0.1),
      material
    )
    torus.position.x = -1
    torus.geometry.setAttribute(
      'uv2',
      new Three.BufferAttribute(torus.geometry.attributes.uv.array, 2)
    )

    const group = new Three.Group()
    const cubes = [sphere, plane, torus]
    group.add(...cubes)
    scene.add(group)

    // axes
    const axesHelper = new Three.AxesHelper(5)
    scene.add(axesHelper)

    // 环境光
    const ambientLight = new Three.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 点光源
    const pointLight = new Three.PointLight(0xffffff, 1, 1000);
    pointLight.position.x = 1;
    pointLight.position.y = 1;
    pointLight.position.z = 1;
    scene.add(pointLight);

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }


    // Camera
    const camera = new Three.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(1, 1, 1)

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
      // gsap.to(cube.rotation, config)
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

export default Materials