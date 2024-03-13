import { RefObject, useEffect, useRef } from "react";
import * as Three from "three";

interface UseThreeOption {
  draw?: () => void
  Renderer?: Three.WebGLRenderer | Three.WebGLBufferRenderer
  height?: number
  width?: number
}

export function useThree(onMounted: (scene: Three.Scene, canvasRef: RefObject<HTMLCanvasElement>) => void) {

  const canvasRef = useRef<HTMLCanvasElement>(null)
  // const {
  //   draw = () => { },
  //   Renderer = Three.WebGLRenderer,
  //   height = window.innerHeight,
  //   width = window.innerWidth
  // } = option ?? {}

  useEffect(() => {
    // Scene
    const scene = new Three.Scene()

    return onMounted(scene, canvasRef)

  }, [canvasRef, onMounted])


  return {
    canvasRef
  }
}