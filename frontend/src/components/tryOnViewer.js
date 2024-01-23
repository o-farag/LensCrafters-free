import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Button, Flex } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

// import main script and neural network model from Jeeliz FaceFilter NPM package
import { JEELIZFACEFILTER, NN_4EXPR } from 'facefilter'

// import THREE.js helper, useful to compute pose
// The helper is not minified, feel free to customize it (and submit pull requests bro):
import { JeelizThreeFiberHelper } from './helper/JeelizThreeFiberHelper.js'


const _maxFacesDetected = 1 // max number of detected faces
const _faceFollowers = new Array(_maxFacesDetected)
let _expressions = null

const callbackDetect = (faceIndex, isDetected) => {
    if (isDetected) {
        console.log('DETECTED')
    } else {
        console.log('LOST')
    }
}

const callbackReady = (errCode, spec) => {
    if (errCode) {
        console.log('AN ERROR HAPPENS. ERR =', errCode)
        return
    }

    console.log('INFO: JEELIZFACEFILTER IS READY')
    // there is only 1 face to track, so 1 face follower:
    JeelizThreeFiberHelper.init(spec, _faceFollowers, callbackDetect)
}


const callbackTrack = (detectStatesArg) => {
    // if 1 face detection, wrap in an array:
    const detectStates = (detectStatesArg.length) ? detectStatesArg : [detectStatesArg]

    // update video and THREE faceFollowers poses:
    JeelizThreeFiberHelper.update(detectStates, _threeFiber.camera)

    // render the video texture on the faceFilter canvas:
    JEELIZFACEFILTER.render_video()

    // get expressions factors:
    detectStates.forEach((detectState, faceIndex) => {
        const exprIn = detectState.expressions
        const expression = _expressions[faceIndex]
        expression.mouthOpen = exprIn[0]
        expression.mouthSmile = exprIn[1]
        expression.eyebrowFrown = exprIn[2] // not used here
        expression.eyebrowRaised = exprIn[3] // not used here
    })
}

export function initJeeliz() {
    JEELIZFACEFILTER.init({
        canvasId: 'jeeFaceFilterCanvas',
        NNC: NN_4EXPR,
        maxFacesDetected: 1,
        followZRot: true,
        callbackReady,
        callbackTrack
    })
    return JEELIZFACEFILTER.destroy
}

// This mesh follows the face. put stuffs in it.
// Its position and orientation is controlled by Jeeliz THREE.js helper
const FaceFollower = (props) => {
    // This reference will give us direct access to the mesh
    const objRef = useRef()
    useEffect(() => {
        const threeObject3D = objRef.current
        _faceFollowers[props.faceIndex] = threeObject3D
    })

    const mouthOpenRef = useRef()
    const mouthSmileRef = useRef()
    useFrame(() => {
        if (mouthOpenRef.current) {
            const s0 = Math.max(0.001, props.expression.mouthOpen) // should not be 0
            mouthOpenRef.current.scale.set(s0, 1, s0)
        }

        if (mouthSmileRef.current) {
            const s1 = Math.max(0.001, props.expression.mouthSmile) // should not be 0
            mouthSmileRef.current.scale.set(s1, 1, s1)
        }
    })

    return (
        <object3D ref={objRef}>
            <mesh name="mainCube">
                <boxGeometry args={[1, 1, 1]} />
                <meshNormalMaterial />
            </mesh>

            <mesh ref={mouthOpenRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0.2]}>
                <cylinderGeometry args={[0.3, 0.3, 1, 32]} />
                <meshBasicMaterial color={0xff0000} />
            </mesh>

            <mesh ref={mouthSmileRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0.2]}>
                <cylinderGeometry args={[0.5, 0.5, 1, 32, 1, false, -Math.PI / 2, Math.PI]} />
                <meshBasicMaterial color={0xff0000} />
            </mesh>
        </object3D>
    )
}


// fake component, display nothing
// just used to get the Camera and the renderer used by React-fiber:
let _threeFiber = null
const ThreeGrabber = (props) => {
    _threeFiber = useThree();
    const sizing = {
        height: document.getElementById('jeeFaceFilterCanvas').offsetHeight,
        width: document.getElementById('jeeFaceFilterCanvas').offsetWidth, top: 0, left: 0
    };
    props.setActualSizing(sizing);
    useFrame(JeelizThreeFiberHelper.update_camera.bind(null, props.actualSizing, _threeFiber.camera));
    return null
}


const compute_sizing = () => {
    // Compute the size of the canvas as a percentage of the window size
    const height = window.innerHeight * (50 / 100);
    const width = window.innerWidth * (50 / 100);

    // Compute the position of the canvas to center it
    const top = 0;
    const left = 0;

    return { width, height, top, left };
};


export const TryOnViewer = (props) => {
    const navigate = useNavigate();

    // init state:
    _expressions = []
    for (let i = 0; i < _maxFacesDetected; ++i) {
        _expressions.push({
            mouthOpen: 0,
            mouthSmile: 0,
            eyebrowFrown: 0,
            eyebrowRaised: 0
        })
    }
    const [sizing, setSizing] = useState(compute_sizing())
    const [actualSizing, setActualSizing] = useState(compute_sizing())

    let _timerResize = null
    const handle_resize = () => {
        // do not resize too often:
        if (_timerResize) {
            clearTimeout(_timerResize)
        }
        _timerResize = setTimeout(do_resize, 200)
    }


    const do_resize = () => {
        _timerResize = null
        const newSizing = compute_sizing()
        setSizing(newSizing)
    }


    useEffect(() => {
        if (!_timerResize) {
            JEELIZFACEFILTER.resize()
        }
    }, [sizing])

    useEffect(() => {
        const canvas = document.getElementById('jeeFaceFilterCanvas');
        if (props.opened) {
            JEELIZFACEFILTER.toggle_pause(false);
            props.modalRef.current.insertBefore(canvas, props.modalRef.current.firstChild);
            if (canvas) {
                canvas.style.display = 'block'; // Show the canvas
                canvas.width = sizing.width;  // Update width
                canvas.height = sizing.height; // Update height
            }
        } else {
            JEELIZFACEFILTER.toggle_pause(true);
            canvas.style.display = 'none';
            document.body.appendChild(canvas); // Move it back to the body
        }
    }, [props.opened]);


    useEffect(() => {
        window.addEventListener('resize', handle_resize)
        window.addEventListener('orientationchange', handle_resize)
    }, [])


    return (
        <>
            <Canvas
                className='mirrorFeed'
                style={{
                    zIndex: 2,
                    ...actualSizing,
                    position: 'absolute'
                }}
                gl={{
                    preserveDrawingBuffer: true
                }}
            >
                <ThreeGrabber actualSizing={actualSizing} setActualSizing={setActualSizing} />
                <FaceFollower faceIndex={0} expression={_expressions[0]} />
            </Canvas>
            <Flex align='center' justify='space-between' bg='#e0ddd7' h='4em' w='100%' gap='sm' px='1em'>
                <Text size='sm' fs='italic' padding='1em'>Lens material: {props.material}</Text>
                <Flex align='center' gap='md'>
                    <Text size='sm' padding='1em'>{props.frameName}</Text>
                    <Button variant='light' onClick={() => {
                        const canvas = document.getElementById('jeeFaceFilterCanvas');
                        canvas.style.display = 'none';
                        document.body.appendChild(canvas);
                        navigate('/select-lens-frame');
                    }}>Change Selection</Button>
                </Flex>
            </Flex>
        </>
    )
} 
