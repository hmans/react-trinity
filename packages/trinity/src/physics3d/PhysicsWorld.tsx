import * as RAPIER from "@dimforge/rapier3d-compat"
import * as miniplex from "miniplex"
import React, {
  createContext,
  FC,
  ReactNode,
  useContext,
  useMemo,
  useRef,
  useState
} from "react"
import { Object3D } from "three"
import T, { useTicker } from ".."

export type PhysicsState = {
  world: RAPIER.World
  ecs: miniplex.World<PhysicsEntity>
}

export type PhysicsEntity = {
  rigidBody?: RAPIER.RigidBody
  transform: Object3D
}

type PhysicsWorldProps = {
  children?: ReactNode
}

export const PhysicsWorldContext = createContext<PhysicsState>(null!)

export const usePhysics = () => useContext(PhysicsWorldContext)

export const PhysicsWorld: FC<PhysicsWorldProps> = ({ children }) => {
  const group = useRef<Object3D>(null!)

  const [state] = useState<PhysicsState>(() => ({
    world: new RAPIER.World({ x: 0, y: -9.81, z: 0 }),
    ecs: new miniplex.World<PhysicsEntity>()
  }))

  const archetypes = useMemo(
    () => ({
      bodies: state.ecs.archetype("transform", "rigidBody")
    }),
    [state.ecs]
  )

  useTicker("physics", () => {
    state.world.step()

    /* Transfer transform data from physics world to scene */
    for (const { rigidBody, transform } of archetypes!.bodies.entities) {
      const t = rigidBody.translation(),
        q = rigidBody.rotation()

      transform.position.set(t.x, t.y, t.z)
      transform.quaternion.set(q.x, q.y, q.z, q.w)
    }
  })

  return (
    <T.Object3D ref={group}>
      {state && (
        <PhysicsWorldContext.Provider value={state}>
          {children}
        </PhysicsWorldContext.Provider>
      )}
    </T.Object3D>
  )
}