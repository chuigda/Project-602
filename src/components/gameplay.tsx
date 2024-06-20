import * as THREE from 'three'
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import { Wireframe } from 'three/addons/lines/Wireframe.js'
import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js'
import { h } from 'tsx-dom'

import './gameplay.css'

export async function createGameplayWindowDemo(): Promise<HTMLElement> {
   const scene = new THREE.Scene()
   const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
   const loader = new GLTFLoader()
   camera.position.set(10,7.5,0);
   camera.up = new THREE.Vector3(0, 1, 0)
   camera.lookAt(new THREE.Vector3(0, 0, 0))

   const gltf: GLTF = await new Promise(resolve => {
      loader.load('/chess-pieces-obj/chess-pieces.glb', (gltf: GLTF) => {
         resolve(gltf)
      })
   })

   const chessPieces: Record<string, THREE.Mesh> = {}
   for (const object of gltf.scene.children) {
      chessPieces[object.name] = object as THREE.Mesh
   }

   console.log(chessPieces)
   const pawn = new THREE.Mesh(chessPieces['1_pawn'].geometry, new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x000000, flatShading: true }))
   const pawnWireframe = new Wireframe(
      new WireframeGeometry2(chessPieces['1_pawn'].geometry),
      new LineMaterial({
         color: 'greenyellow',
         linewidth: 4, // in pixels
         dashed: false
      })
   )
   pawnWireframe.computeLineDistances()
   scene.add(pawn)
   scene.add(pawnWireframe)

   const renderer = new THREE.WebGLRenderer({ antialias: true })
   renderer.setPixelRatio( window.devicePixelRatio )
   renderer.setSize(window.innerWidth, window.innerHeight)
   document.body.appendChild(
      <div class="gameplay-demo">
         {renderer.domElement}
      </div>
   )

   function animate() {
      renderer.render( scene, camera );
   }
   renderer.setAnimationLoop( animate );

   return renderer.domElement
}
