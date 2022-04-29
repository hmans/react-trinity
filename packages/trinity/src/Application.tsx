import React, {
  createContext,
  FC,
  ReactNode,
  useContext,
  useState
} from "react"
import * as THREE from "three"
import { AdaptiveToneMappingPass } from "three/examples/jsm/postprocessing/AdaptiveToneMappingPass.js"
import T from "."
import { Composer, Renderer, Ticker, useWindowResizeHandler } from "./engine"
import {
  EffectPass,
  RenderPass,
  UnrealBloomPass,
  Vignette
} from "./postprocessing"

type RenderPipelineComponent = FC<{
  scene: THREE.Scene
  camera: THREE.Camera
  children?: ReactNode
}>

export const BasicRenderPipeline: RenderPipelineComponent = ({
  scene,
  camera,
  children
}) => (
  <Composer>
    <RenderPass scene={scene} camera={camera} />
    {children}
  </Composer>
)

export const FancyRenderPipeline: RenderPipelineComponent = ({
  children,
  ...props
}) => (
  <BasicRenderPipeline {...props}>
    <UnrealBloomPass />
    <EffectPass pass={AdaptiveToneMappingPass} args={[true, 256]} />
    <Vignette />

    {children}
  </BasicRenderPipeline>
)

function useNullableState<T>(initial?: T | (() => T)) {
  return useState<T | null>(initial!)
}

type ApplicationApi = {
  setScene: (scene: THREE.Scene | null) => void
  setCamera: (camera: THREE.Camera | null) => void
}

const ApplicationContext = createContext<ApplicationApi>(null!)

export const useApplication = () => useContext(ApplicationContext)

export const Application: FC<{
  children: ReactNode | ((api: ApplicationApi) => ReactNode)
  renderPipeline?: RenderPipelineComponent
}> = ({ children, renderPipeline: RenderPipeline = BasicRenderPipeline }) => {
  const [scene, setScene] = useNullableState<THREE.Scene>()
  const [camera, setCamera] = useNullableState<THREE.Camera>()

  useWindowResizeHandler(() => {
    if (camera) {
      const width = window.innerWidth
      const height = window.innerHeight

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }
    }
  }, [camera])

  return (
    <Ticker>
      <Renderer>
        {scene && camera && <RenderPipeline scene={scene} camera={camera} />}
        {/* {scene && camera && <EventHandling scene={scene} camera={camera} />} */}

        <T.Scene ref={setScene}>
          <ApplicationContext.Provider value={{ setCamera, setScene }}>
            {children instanceof Function
              ? children({ setScene, setCamera })
              : children}
          </ApplicationContext.Provider>
        </T.Scene>
      </Renderer>
    </Ticker>
  )
}
