import SceneGravityCubes from "./js/scenarios/GravityCubes/SceneGravityCubes"
import SceneBouncingBubbles from "./js/scenarios/SceneBouncingBubbles"
import GlobalContext from "./js/template/GlobalContext"
import { askMotionAccess } from "./js/Utils/DeviceAccess"

/** TODO */
/** TODO */
/*
    - SceneGravityCubes
        - Mur gauche (responsive)
        - Murs intermédiaires (responsive)
        - Fonction AddCube()
    - SceneBouncingBubbles
        - Fonction RemoveBubble()
        - Debug : paramètre speed (-1 <-> 1)
    - Main
        - Finir les correspondances
            scène 2 -> 3 (faite en cours)
            3 -> 2
            3 -> 1
            1 -> 3
            1 -> 2
            2 -> 1
*/
/** TODO */
/** TODO */

/** motion sensors authorization */
const btn = document.getElementById("btn-access")
btn.addEventListener("click", function () {
    askMotionAccess()
}, false)

/** scenes */
const scene1 = new SceneBouncingBubbles("canvas-scene-1")
const scene2 = new SceneGravityCubes("canvas-scene-2")
const scene3 = new SceneBouncingBubbles("canvas-scene-3")

/** main */
const globalContext = new GlobalContext()
const params = {
    test: 0
}
if (!!globalContext.debug.ui) {
    globalContext.debug.ui.add(params, "test", 0, 10)
}
const time = globalContext.time
const update = () => {
    /** exemple css */
    // const scale_ = 1 + (Math.cos(5 * time.elapsed / 1000) / 2 + 0.5) / 20
    // btn.style.transform = `scale(${scale_}, ${1})`

    // Scene 1 -> Scene 3
    const outScene1_up = scene1.bubbles.filter(b => { return b.y < 0 })

    outScene1_up.forEach(bubbleToRemove => { scene1.removeBubble(bubbleToRemove) })

    outScene1_up.forEach(bubbleToBubble => {
        const newBubble_ = scene3.addBubble(bubbleToBubble.x, scene1.height, bubbleToBubble.color)
        newBubble_.vx = bubbleToBubble.vx
        newBubble_.vy = bubbleToBubble.vy
    })

    // Scene 3 -> Scene 1
    const outScene3_down = scene3.bubbles.filter(b => { return b.y > scene1.height })

    outScene3_down.forEach(bubbleToRemove => { scene3.removeBubble(bubbleToRemove) })

    outScene3_down.forEach(bubbleToBubble => {
        const newBubble_ = scene1.addBubble(bubbleToBubble.x, 0, bubbleToBubble.color)
        newBubble_.vx = bubbleToBubble.vx
        newBubble_.vy = bubbleToBubble.vy
    })


    // Scene 2 -> Scene 3
    /** bubbles + cube scan = is IN or OUT ? */
    const outScene2_down = scene2.cubes.filter(c => { return c.position.y < -scene2.height / 2 })

    /** remove entities (cube + bubble) OUT of their own scene */
    outScene2_down.forEach(cubeToRemove => { scene2.removeCube(cubeToRemove) })

    /** add new entities to corresponding scene */
    outScene2_down.forEach(cubeToBubble => {
        const newBubble_ = scene3.addBubble(cubeToBubble.position.x + scene3.width / 2, 0, cubeToBubble.color)
        newBubble_.vy = Math.abs(newBubble_.vy)
        newBubble_.vx = Math.abs(newBubble_.vx)
    })

    // Scene 2 -> Scene 1
    const outScene2_up = scene2.cubes.filter(c => { return c.position.y > scene2.height })

    outScene2_up.forEach(cubeToRemove => { scene2.removeCube(cubeToRemove) })

    outScene2_up.forEach(cubeToBubble => {
        const newBubble_ = scene1.addBubble(cubeToBubble.position.x + scene3.width / 2, scene1.height, cubeToBubble.color)
        newBubble_.vy = Math.abs(newBubble_.vy)
        newBubble_.vx = Math.abs(newBubble_.vx)
    })


    // Scene 3 -> Scene 2
    const outScene3_up = scene3.bubbles.filter(b => { return b.y + 400 < scene3.height })

    outScene3_up.forEach(bubbleToRemove => scene3.removeBubble(bubbleToRemove))

    outScene3_up.forEach(bubbleToCube => {
        const x = bubbleToCube.x - scene2.width / 2;
        const y = -scene2.height / 2;
        const newCube_ = scene2.addCube(x, y, bubbleToCube.color);
    })

    // Scene 1 -> Scene 2
    const outScene1_down = scene1.bubbles.filter(b => { return b.y > scene1.height })

    outScene1_down.forEach(bubbleToRemove => { scene1.removeBubble(bubbleToRemove) })

    outScene1_down.forEach(bubbleToCube => {
        const x = bubbleToCube.x - scene2.width / 2;
        const y = scene2.height / 2;
        // const y = scene2.height / 2 + 20;
        const newCube_ = scene2.addCube(x, y, bubbleToCube.color);
    })

    // outScene1_down.forEach(bubbleToMove => {
    //     const x = bubbleToMove.x; // Position x de la bulle
    //     const y = -scene2.height / 2 + 50; // Position y par défaut (juste au-dessus du bas de la scène 2)

    //     // Créez un nouveau cube dans la scène 2
    //     const newCube = scene2.addCube(x, y);
    // });


}
time.on("update", update)



/*
Motion capteur en mode dev sans deploy sur vercel :

npm i -D @vitejs/plugin-basic-ssl

Puis modifier le vite.config.mjs :

import basicSsl from '@vitejs/plugin-basic-ssl'
export default {
    root: 'src',
    build: {
        outDir: '../dist'
    },
    plugins: [
        basicSsl()
    ]
}
*/