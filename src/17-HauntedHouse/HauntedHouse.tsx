
import DoorAlphaJPG from '@assets/textures/door/alpha.jpg?url'
import DoorColorJPG from '@assets/textures/door/color.jpg?url'
import DoorAmbientOcclusionJPG from '@assets/textures/door/ambientOcclusion.jpg?url'
import DoorHeightJPG from '@assets/textures/door/height.jpg?url'
import DoorRoughnessJPG from '@assets/textures/door/roughness.jpg?url'
import DoorMetalnessJPG from '@assets/textures/door/metalness.jpg?url'
import DoorNormalJPG from '@assets/textures/door/normal.jpg?url'
import BricksColorJPG from '@assets/textures/bricks/color.jpg?url'
import BricksAmbientOcclusionJPG from '@assets/textures/bricks/ambientOcclusion.jpg?url'
import BricksNormalJPG from '@assets/textures/bricks/normal.jpg?url'
import BricksRoughnessJPG from '@assets/textures/bricks/roughness.jpg?url'
import GrassColorJPG from '@assets/textures/grass/color.jpg?url'
import GrassAmbientOcclusionJPG from '@assets/textures/grass/ambientOcclusion.jpg?url'
import GrassNormalJPG from '@assets/textures/grass/normal.jpg?url'
import GrassRoughnessJPG from '@assets/textures/grass/roughness.jpg?url'

import { FC, ReactNode, RefObject, useCallback } from "react";
import * as Three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useThree } from "../hooks/use-three";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

interface AnimationsOptions {
  children?: ReactNode
}

const HauntedHouse: FC<AnimationsOptions> = () => {
  const onMounted = useCallback((scene: Three.Scene, canvasRef: RefObject<HTMLCanvasElement>) => {

    const panel = new GUI({ width: 310 });

    /**
     * Textures
     */
    const textureLoader = new Three.TextureLoader()
    // door textures
    const doorAlphaTexture = textureLoader.load(DoorAlphaJPG)
    const doorColorTexture = textureLoader.load(DoorColorJPG)
    const doorAmbientOcclusionTexture = textureLoader.load(DoorAmbientOcclusionJPG)
    const doorHeightTexture = textureLoader.load(DoorHeightJPG)
    const doorRoughnessTexture = textureLoader.load(DoorRoughnessJPG)
    const doorMetalnessTexture = textureLoader.load(DoorMetalnessJPG)
    const doorNormalTexture = textureLoader.load(DoorNormalJPG)

    // wall textures
    const bricksColorTexture = textureLoader.load(BricksColorJPG)
    const bricksAmbientOcclusionTexture = textureLoader.load(BricksAmbientOcclusionJPG)
    const bricksRoughnessTexture = textureLoader.load(BricksRoughnessJPG)
    const bricksNormalTexture = textureLoader.load(BricksNormalJPG)

    // grass textures
    const grassColorTexture = textureLoader.load(GrassColorJPG)
    const grassAmbientOcclusionTexture = textureLoader.load(GrassAmbientOcclusionJPG)
    const grassRoughnessTexture = textureLoader.load(GrassRoughnessJPG)
    const grassNormalTexture = textureLoader.load(GrassNormalJPG)

    grassColorTexture.repeat.set(8, 8)
    grassAmbientOcclusionTexture.repeat.set(8, 8)
    grassRoughnessTexture.repeat.set(8, 8)
    grassNormalTexture.repeat.set(8, 8)

    grassColorTexture.wrapS = Three.RepeatWrapping
    grassColorTexture.wrapT = Three.RepeatWrapping
    grassAmbientOcclusionTexture.wrapS = Three.RepeatWrapping
    grassAmbientOcclusionTexture.wrapT = Three.RepeatWrapping
    grassRoughnessTexture.wrapS = Three.RepeatWrapping
    grassRoughnessTexture.wrapT = Three.RepeatWrapping
    grassNormalTexture.wrapS = Three.RepeatWrapping
    grassNormalTexture.wrapT = Three.RepeatWrapping

    /**
     * Fog
     */
    const fog = new Three.Fog('#262837', 1, 17)
    scene.fog = fog

    /**
     * House
     */
    const house = new Three.Group()
    scene.add(house)

    // Walls
    const walls = new Three.Mesh(
      new Three.BoxGeometry(4, 2.5, 4),
      new Three.MeshStandardMaterial({
        map: bricksColorTexture,
        aoMap: bricksAmbientOcclusionTexture,
        aoMapIntensity: 1,
        roughnessMap: bricksRoughnessTexture,
        normalMap: bricksNormalTexture
      })
    )
    walls.geometry.setAttribute(
      'uv2',
      new Three.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
    )
    walls.position.y = 1.25
    house.add(walls)

    // Roof
    const roof = new Three.Mesh(
      new Three.ConeGeometry(3.5, 2, 4),
      new Three.MeshStandardMaterial({ color: '#b35f45' })
    )
    roof.position.y = 3.5
    roof.rotation.y = Math.PI / 4
    house.add(roof)

    // Door
    const door = new Three.Mesh(
      new Three.PlaneGeometry(2.2, 2.2, 100, 100),
      new Three.MeshStandardMaterial({
        color: '#aa7b7b',
        map: doorColorTexture,
        alphaMap: doorAlphaTexture,
        transparent: true,
        aoMap: doorAmbientOcclusionTexture,
        aoMapIntensity: 1,
        displacementMap: doorHeightTexture, // 位移纹理
        displacementScale: 0.1,
        roughnessMap: doorRoughnessTexture,
        metalnessMap: doorMetalnessTexture,
        normalMap: doorNormalTexture
      })
    )
    door.geometry.setAttribute(
      "uv2",
      new Three.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
    )
    door.position.z = 2.01
    door.position.y = 1
    house.add(door)

    // Bushes
    const bushGeometry = new Three.SphereGeometry(1, 16, 16)
    const bushMaterial = new Three.MeshStandardMaterial({
      map: grassColorTexture,
      aoMap: grassAmbientOcclusionTexture,
      aoMapIntensity: 1,
      roughnessMap: grassRoughnessTexture,
      normalMap: grassNormalTexture
    })

    const bush1 = new Three.Mesh(bushGeometry, bushMaterial)
    bush1.scale.set(0.5, 0.5, 0.5)
    bush1.position.set(0.8, 0.2, 2.2)

    const bush2 = new Three.Mesh(bushGeometry, bushMaterial)
    bush2.scale.set(0.25, 0.25, 0.25)
    bush2.position.set(1.4, 0.1, 2.1)

    const bush3 = new Three.Mesh(bushGeometry, bushMaterial)
    bush3.scale.set(0.4, 0.4, 0.4)
    bush3.position.set(-0.8, 0.1, 2.2)

    const bush4 = new Three.Mesh(bushGeometry, bushMaterial)
    bush4.scale.set(0.15, 0.15, 0.15)
    bush4.position.set(-1, 0.05, 2.6)
    house.add(bush1, bush2, bush3, bush4)

    /**
     * Graves
     */
    const graves = new Three.Group()
    scene.add(graves)

    const graveGeometry = new Three.BoxGeometry(0.6, 0.8, 0.2)
    const graveMaterial = new Three.MeshStandardMaterial({ color: '#b2b6b1' })

    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2
      const grave = new Three.Mesh(graveGeometry, graveMaterial)
      const radius = 3 + 6 * Math.random()
      grave.position.x = Math.sin(angle) * radius
      grave.position.z = Math.cos(angle) * radius
      grave.position.y = 0.35
      grave.rotation.y = (Math.random() - 0.5) * 0.4
      grave.rotation.z = (Math.random() - 0.5) * 0.4
      grave.castShadow = true
      grave.receiveShadow = true
      graves.add(grave)
    }

    // floor
    const floor = new Three.Mesh(
      new Three.PlaneGeometry(20, 20),
      new Three.MeshStandardMaterial({
        map: grassColorTexture,
        aoMap: grassAmbientOcclusionTexture,
        aoMapIntensity: 1,
        roughnessMap: grassRoughnessTexture,
        normalMap: grassNormalTexture
      })
    )
    floor.geometry.setAttribute(
      "uv2",
      new Three.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
    )
    floor.rotation.x = - Math.PI / 2
    scene.add(floor)

    const axesHelper = new Three.AxesHelper(5)
    scene.add(axesHelper)

    // 环境光
    const ambientLight = new Three.AmbientLight('#b9d5ff', 0.12)
    panel.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
    scene.add(ambientLight)

    // 定向光
    const directionalLight = new Three.DirectionalLight('#b9d5ff', 0.12)
    directionalLight.position.set(4, 5, -2)
    panel.add(directionalLight, 'intensity').min(0).max(1).step(0.001)
    panel.add(directionalLight.position, 'x').min(-5).max(5).step(0.1)
    panel.add(directionalLight.position, 'y').min(-5).max(5).step(0.1)
    panel.add(directionalLight.position, 'z').min(-5).max(5).step(0.1)
    scene.add(directionalLight)

    // door light
    const doorLight = new Three.PointLight('#ff7d46', 1, 7)
    doorLight.position.set(0, 2.2, 2.7)
    scene.add(doorLight)

    // Ghosts
    const ghosts1 = new Three.PointLight('#ff00ff', 2, 3)
    scene.add(ghosts1)

    const ghosts2 = new Three.PointLight('#00ffff', 2, 3)
    scene.add(ghosts2)

    const ghosts3 = new Three.PointLight('#ffff00', 2, 3)
    scene.add(ghosts3)

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    const camera = new Three.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(6, 6, 6)
    scene.add(camera)

    const renderer = new Three.WebGLRenderer({
      canvas: canvasRef?.current as HTMLCanvasElement
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor('#262837')

    // 要渲染阴影，需要打开这个配置
    renderer.shadowMap.enabled = true
    // 修改投影算法
    renderer.shadowMap.type = Three.PCFSoftShadowMap

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;

    // Shadows
    ambientLight.castShadow = true
    directionalLight.castShadow = true
    doorLight.castShadow = true
    ghosts1.castShadow = true
    ghosts2.castShadow = true
    ghosts3.castShadow = true
    walls.castShadow = true
    
    floor.receiveShadow = true
    walls.receiveShadow = true

    // perfermance optimize
    doorLight.shadow.mapSize.width = 256
    doorLight.shadow.mapSize.height = 256
    doorLight.shadow.camera.far = 7

    ghosts1.shadow.mapSize.width = 256
    ghosts1.shadow.mapSize.height = 256
    ghosts1.shadow.camera.far = 7
    
    ghosts2.shadow.mapSize.width = 256
    ghosts2.shadow.mapSize.height = 256
    ghosts2.shadow.camera.far = 7

    ghosts3.shadow.mapSize.width = 256
    ghosts3.shadow.mapSize.height = 256
    ghosts3.shadow.camera.far = 7

    const clock = new Three.Clock()

    const draw = () => {
      const elapsedTime = clock.getElapsedTime()
      // update ghosts
      ghosts1.position.x = Math.cos(elapsedTime * 0.5) * 4
      ghosts1.position.z = Math.sin(elapsedTime * 0.5) * 4
      ghosts1.position.y = Math.abs(Math.cos(elapsedTime * 3))

      const ghosts2Angle = -elapsedTime * 0.32
      ghosts2.position.x = Math.sin(ghosts2Angle) * 5
      ghosts2.position.z = Math.cos(ghosts2Angle) * 5
      ghosts2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

      const ghosts3Angle = -elapsedTime * 0.18
      ghosts3.position.x = Math.cos(ghosts3Angle) * (7 + Math.sin(elapsedTime * 0.32))
      ghosts3.position.z = Math.sin(ghosts3Angle) * (7 + Math.sin(elapsedTime * 0.5))
      ghosts3.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2)

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

export default HauntedHouse