import NXJPG from '@assets/textures/environmentMaps/0/nx.jpg?url'
import NYJPG from '@assets/textures/environmentMaps/0/ny.jpg?url'
import NZJPG from '@assets/textures/environmentMaps/0/nz.jpg?url'
import PXJPG from '@assets/textures/environmentMaps/0/px.jpg?url'
import PYJPG from '@assets/textures/environmentMaps/0/py.jpg?url'
import PZJPG from '@assets/textures/environmentMaps/0/pz.jpg?url'
import GradientPNG from '@assets/textures/gradients/3.jpg?url'
import HitSoundMP3 from '@assets/sounds/hit.mp3?url'
import { FC, ReactNode, RefObject, useCallback } from "react";
import * as Three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useThree } from "../hooks/use-three";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import * as CANNON from 'cannon-es'

// 常用 js 库
//  3D: Ammo.js、 Cannon.js、Omio.js
//  2D: Matter.js、P2.js、 Planck.js、Box2D.js

interface AnimationsOptions {
  children?: ReactNode
}

const Physics: FC<AnimationsOptions> = () => {
  const onMounted = useCallback((scene: Three.Scene, canvasRef: RefObject<HTMLCanvasElement>) => {
    let animationFrameID: number | null = null
    const panel = new GUI({ width: 310 });
    const textureLoader = new Three.TextureLoader()
    const cubeTextureLoader = new Three.CubeTextureLoader()

    const environmentMapTexture = cubeTextureLoader.load([
      NXJPG,
      NYJPG,
      NZJPG,
      PXJPG,
      PYJPG,
      PZJPG,
    ])

    /**
     * Sounds
     */
    const hitSound = new Audio(HitSoundMP3)

    const playHitSound = (collision: any) => {
      // 冲击强度
      const impactVelocity = collision.contact.getImpactVelocityAlongNormal()

      if (impactVelocity > 1.5) {
        hitSound.currentTime = 0
        hitSound.play()
      }
    }

    /**
     * Cannon
     */
    const world = new CANNON.World()
    world.broadphase = new CANNON.SAPBroadphase(world)
    world.allowSleep = true
    world.gravity.set(0, -9.82, 0)

    // Material
    const defaultMaterial = new CANNON.Material('default')

    const defaultContactMaterial = new CANNON.ContactMaterial(
      defaultMaterial,
      defaultMaterial,
      {
        friction: 0.1,
        restitution: 0.7
      }
    )
    world.addContactMaterial(defaultContactMaterial)
    world.defaultContactMaterial = defaultContactMaterial


    // // Sphere
    // const sphereShape = new CANNON.Sphere(1)
    // const sphereBody = new CANNON.Body({
    //   mass: 1,
    //   position: new CANNON.Vec3(0, 3, 0),
    //   shape: sphereShape,
    //   // material: defaultMaterial
    // })
    // // 对物体施加力的四种方式
    // sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0))
    // world.addBody(sphereBody)

    // Floor
    const floorShape = new CANNON.Plane()
    const floorBody = new CANNON.Body()
    floorBody.mass = 0
    // floorBody.material = defaultMaterial
    floorBody.addShape(floorShape)
    floorBody.position.y = -1
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
    world.addBody(floorBody)

    const params = {
      materialColor: '#ffeded',
      createSphere: () => {
        createSphere(
          Math.random(),
          new Three.Vector3(
            (Math.random() - 0.5) * 5,
            Math.random() * 5,
            (Math.random() - 0.5) * 5)
        )
      },
      createBox: () => {

        createBox(
          Math.random() * 2,
          Math.random() * 2,
          Math.random() * 2,
          new Three.Vector3(
            (Math.random() - 0.5) * 3,
            Math.random() * 3,
            (Math.random() - 0.5) * 3)
        )
      },
      reset: () => {
        for (const { mesh, body } of objectsToUpdate) {
          // remove mesh
          scene.remove(mesh)
          body.removeEventListener('collide', playHitSound)
          world.removeBody(body)
        }
        objectsToUpdate.length = 0
      }
    }

    const gradientTexture = textureLoader.load(GradientPNG)
    gradientTexture.magFilter = Three.NearestFilter

    panel.add(params, 'createSphere')
    panel.add(params, 'createBox')
    panel.add(params, 'reset')

    // 
    // const sphere = new Three.Mesh(
    //   new Three.SphereGeometry(1, 32, 64),
    //   material
    // )
    // sphere.castShadow = true
    // scene.add(sphere)

    // plane
    const plane = new Three.Mesh(
      new Three.PlaneGeometry(10, 10),
      new Three.MeshStandardMaterial({
        color: '#4C4C4A'
      })
    )
    plane.receiveShadow = true
    plane.position.y = - 1
    plane.rotation.x = - Math.PI * 0.5
    scene.add(plane)


    const axesHelper = new Three.AxesHelper(5)
    scene.add(axesHelper)

    // 环境光
    const ambientLight = new Three.AmbientLight('#ffffff', 1)
    scene.add(ambientLight)

    // 平行光
    // const directionalLight = new Three.DirectionalLight('#ffffff', 1)
    // directionalLight.position.set(1, 1, 0)
    // scene.add(directionalLight)

    // 点光源
    const pointLight = new Three.PointLight('#ffffff', 1, 20, 0.05)
    pointLight.position.set(5, 5, 0)
    pointLight.castShadow = true
    scene.add(pointLight)

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    /**
     * CameraGroup 用于控制鼠标变动
     */
    const cameraGroup = new Three.Group()
    scene.add(cameraGroup)

    const camera = new Three.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(5, 5, 5)
    cameraGroup.add(camera)

    /**
     * Renderer
     */
    const renderer = new Three.WebGLRenderer({
      canvas: canvasRef?.current as HTMLCanvasElement
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    // renderer.setClearAlpha(0.5)

    /**
     * Utils
     */
    const objectsToUpdate: Array<{ mesh: Three.Object3D, body: CANNON.Body }> = []

    const sphereGeometry = new Three.SphereGeometry(1, 32, 64)
    const sphereMaterial = new Three.MeshStandardMaterial({
      roughness: 0.4,
      metalness: 0.3,
      envMap: environmentMapTexture
    })
    const createSphere = (radius: number, position: Three.Vector3) => {
      const mesh = new Three.Mesh(
        sphereGeometry,
        sphereMaterial
      )
      mesh.scale.set(radius, radius, radius)
      mesh.castShadow = true
      mesh.position.copy(position)
      scene.add(mesh)

      // Cannon.js Body  
      const shape = new CANNON.Sphere(radius)
      const body = new CANNON.Body({
        mass: 1,
        shape: shape,
        // position: position as unknown as CANNON.Vec3,
        position: new CANNON.Vec3(0, 3, 0),
        material: defaultMaterial
      })
      body.position.copy(position as unknown as CANNON.Vec3)
      world.addBody(body)

      objectsToUpdate.push(
        {
          mesh: mesh,
          body: body
        }
      )
    }


    const boxGeometry = new Three.BoxGeometry(1, 1, 1)
    const boxMaterial = new Three.MeshStandardMaterial({
      roughness: 0.4,
      metalness: 0.3,
      envMap: environmentMapTexture
    })
    const createBox = (width: number, height: number, depth: number, position: Three.Vector3) => {
      const mesh = new Three.Mesh(
        boxGeometry,
        boxMaterial
      )
      mesh.scale.set(width, height, depth)
      mesh.castShadow = true
      mesh.position.copy(position)
      scene.add(mesh)

      // Cannon.js Body  
      const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))
      const body = new CANNON.Body({
        mass: 1,
        shape: shape,
        position: new CANNON.Vec3(0, 3, 0),
        material: defaultMaterial
      })
      body.position.copy(position as unknown as CANNON.Vec3)
      body.addEventListener('collide', playHitSound)
      world.addBody(body)

      objectsToUpdate.push(
        {
          mesh: mesh,
          body: body
        }
      )
    }

    /**
     * Controls
     */
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;

    const clock = new Three.Clock()
    let oldElapsedTime = 0

    const draw = () => {
      const elapsedTime = clock.getElapsedTime()
      const deltaTime = elapsedTime - oldElapsedTime
      oldElapsedTime = elapsedTime
      // Update world
      // sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position)

      world.step(1 / 60, deltaTime, 3)

      for (const { mesh, body } of objectsToUpdate) {
        // 位移
        mesh.position.copy(body.position)
        // 旋转
        mesh.quaternion.copy(body.quaternion)
      }

      // Update controls
      controls.update();

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

export default Physics