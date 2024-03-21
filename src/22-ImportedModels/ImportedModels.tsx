import FlightHelmetGLTF from '@assets/models/FlightHelmet/glTF/FlightHelmet.gltf?url'
import DuckGLTF from '@assets/models/Duck/glTF-Draco/Duck.gltf?url'
import FoxGLTF from '@assets/models/Fox/glTF/Fox.gltf?url'
import { FC, RefObject, useCallback } from "react";
import * as THREE from 'three';
import { useThree } from "../hooks/use-three";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';


const ImportedModels: FC = () => {
  const onMounted = useCallback((scene: THREE.Scene, canvasRef: RefObject<HTMLCanvasElement>) => {
    let animationFrameID: number | null = null
    const panel = new GUI({ width: 310 });
    const textureLoader = new THREE.TextureLoader()

    /**
     * Models
     */
    const gltfLoader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    let mixer: THREE.AnimationMixer | null = null

    gltfLoader.setDRACOLoader(dracoLoader)
    dracoLoader.setDecoderPath('./draco/')

    gltfLoader.load(FoxGLTF, (gltf) => {
      // console.log(gltf);
      mixer = new THREE.AnimationMixer(gltf.scene)
      for (const animation of gltf.animations) {
        const action = mixer.clipAction(animation)
        action.play()
      }

      gltf.scene.scale.set(0.025, 0.025, 0.025)
      scene.add(gltf.scene)
    })

    // plane
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({
        color: '#4C4C4A'
      })
    )
    plane.receiveShadow = true
    plane.position.y = - 1
    plane.rotation.x = - Math.PI * 0.5
    scene.add(plane)


    const axesHelper = new THREE.AxesHelper(5)
    scene.add(axesHelper)

    // 环境光
    const ambientLight = new THREE.AmbientLight('#ffffff', 1)
    scene.add(ambientLight)

    // 平行光
    // const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
    // directionalLight.position.set(1, 1, 0)
    // scene.add(directionalLight)

    // 点光源
    const pointLight = new THREE.PointLight('#ffffff', 1, 20, 0.05)
    pointLight.position.set(5, 5, 0)
    pointLight.castShadow = true
    scene.add(pointLight)

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(3, 3, 3)

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef?.current as HTMLCanvasElement
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    // renderer.setClearAlpha(0.5)

    /**
     * Controls
     */
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;

    const clock = new THREE.Clock()
    let oldElapsedTime = 0

    const draw = () => {
      const elapsedTime = clock.getElapsedTime()
      const deltaTime = elapsedTime - oldElapsedTime
      oldElapsedTime = elapsedTime

      // Update controls
      controls.update();

      // Update mixer
      mixer?.update(deltaTime)

      renderer.render(scene, camera)
      animationFrameID = requestAnimationFrame(draw)
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
      if (animationFrameID) {
        cancelAnimationFrame(animationFrameID)
      }
    }
  }, [])

  const { canvasRef } = useThree(onMounted)

  return (
    <canvas ref={canvasRef}></canvas>
  )
}

export default ImportedModels