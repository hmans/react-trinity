import T from "@hmans/trinity"
import { BodyThiefHack } from "../BodyThiefHack"
import { controller } from "../controller"
import { PhysicsBody } from "../../lib/physics2d/PhsyicsBody"
import { CircleShape } from "../../lib/physics2d/Shape"
import { ECS, Layers } from "../state"
import { increaseMultiplier } from "../actions/increaseMultiplier"

export const Player = () => (
  <ECS.Collection tag="player" initial={1}>
    {(entity) => (
      <>
        <ECS.Component name="controller" data={controller} />

        <ECS.Component name="transform">
          <PhysicsBody
            linearDamping={0.9995}
            fixedRotation
            interpolate
            userData={entity}
          >
            <BodyThiefHack />

            <CircleShape
              radius={1}
              sensor
              collisionGroup={Layers.Player}
              collisionMask={Layers.Pickups}
              onBeginContact={({ userData: other }) => {
                if (other && other.pickup) {
                  increaseMultiplier()
                  ECS.world.queue.destroyEntity(other)
                }
              }}
            />

            <CircleShape
              radius={1}
              collisionGroup={Layers.Player}
              collisionMask={Layers.Enemies | Layers.Default}
            >
              <T.Mesh>
                <T.SphereGeometry />
                <T.MeshStandardMaterial
                  color="hotpink"
                  emissive="hotpink"
                  emissiveIntensity={0.8}
                />
              </T.Mesh>
            </CircleShape>
          </PhysicsBody>
        </ECS.Component>
      </>
    )}
  </ECS.Collection>
)