import OneMatcapPNG from '@assets/matcaps/1.png'
import { FC, ReactNode, RefObject, useCallback } from "react";
import * as Three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useThree } from "../hooks/use-three";
import gentilisRegularTypefaceURL from '@assets/fonts/gentilis_regular.typeface.json?url'
import gsap from 'gsap'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

interface AnimationsOptions {
  children?: ReactNode
}

const ThreeDText: FC<AnimationsOptions> = () => {
  const onMounted = useCallback((scene: Three.Scene, canvasRef: RefObject<HTMLCanvasElement>) => {
    const textureLoader = new Three.TextureLoader()
    const panel = new GUI({ width: 310 });
    scene.background = new Three.Color(0x003261); // 将背景色设置为蓝色

    const oneMatcapTexture = textureLoader.load(OneMatcapPNG)

    // fonts
    const fontsLoader = new FontLoader()
    fontsLoader.load(
      gentilisRegularTypefaceURL,
      (font) => {

        const textGeometry = new TextGeometry(
          "hello threejs!",
          {
            font,
            size: 0.5,
            height: 0.2,
            curveSegments: 5,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 4,
          }
        )

        // 几何边界框。这里我们指定使用框边界。还可以使用球边界
        // textGeometry.computeBoundingBox()
        // textGeometry.translate(
        //   -0.5 * textGeometry.boundingBox.max.x,
        //   -0.5 * (textGeometry.boundingBox.max.y - 0.02),
        //   -0.5 * (textGeometry.boundingBox.max.z - 0.03)
        // )
        // console.log(" boundingBox ", textGeometry.boundingBox);
        // textGeometry.computeBoundingSphere()
        // console.log(" boundingSphere ", textGeometry.boundingSphere);

        // 文字居中
        textGeometry.center()

        const material = new Three.MeshMatcapMaterial({
          matcap: oneMatcapTexture
        })

        const text = new Three.Mesh(textGeometry, material)

        scene.add(text)

        const donutGeometry = new Three.TorusGeometry(0.3, 0.2, 20, 45)

        for (let i = 0; i < 100; i++) {
          const donut = new Three.Mesh(donutGeometry, material)

          donut.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10)
          donut.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, 0)

          const scale = Math.random()
          donut.scale.x = scale
          donut.scale.y = scale
          donut.scale.z = scale

          scene.add(donut)
        }
      }
    )


    const material = new Three.MeshStandardMaterial()

    panel.add(material, 'roughness').min(0).max(1).step(0.001)
    panel.add(material, 'metalness').min(0).max(1).step(0.001)

    const sphere = new Three.Mesh(
      new Three.SphereGeometry(0.5, 64, 64),
      material
    )
    sphere.castShadow = true
    sphere.geometry.setAttribute(
      'uv2',
      new Three.BufferAttribute(sphere.geometry.attributes.uv.array, 2)
    )

    const group = new Three.Group()
    const cubes = [sphere]
    group.add(...cubes)
    // scene.add(group)

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
    camera.position.set(5, 5, 5)

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

export default ThreeDText