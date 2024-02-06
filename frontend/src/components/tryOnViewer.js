import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Button, Flex } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useGLTF } from '@react-three/drei';
import modelUrl from './generated.glb';
import occluderUrl from '../resources/head_occluders.glb';
import * as THREE from 'three';

// import main script and neural network model from Jeeliz FaceFilter NPM package
import { JEELIZFACEFILTER, NN_4EXPR } from 'facefilter'

// import THREE.js helper, useful to compute pose
// The helper is not minified, feel free to customize it (and submit pull requests bro):
import { JeelizThreeFiberHelper } from './helper/JeelizThreeFiberHelper.js'

const _maxFacesDetected = 1 // max number of detected faces
const _faceFollowers = new Array(_maxFacesDetected)

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

const Occluder = () => {
    const gltf = useGLTF(occluderUrl, true);
    const occluderRef = useRef();
  
    useEffect(() => {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          // Make each mesh in the occluder invisible but still affect the depth buffer
          child.material = new THREE.MeshBasicMaterial({
            color: 0x000000, // The color won't matter since the material is invisible
            opacity: 0,
            depthWrite: true, // Crucial for the occluder to still affect the depth buffer
            colorWrite: false, // Prevents the material from coloring pixels
          });
        }
      });
  
      occluderRef.current = gltf.scene;
    }, [gltf.scene]);
  
    return <primitive ref={occluderRef} object={gltf.scene} />;
};

// This mesh follows the face. put stuffs in it.
// Its position and orientation is controlled by Jeeliz THREE.js helper
const FaceFollower = (props) => {
    // This reference will give us direct access to the mesh
    const glassesRef = useRef()
    const occluderRef = useRef()
    const objRef = useRef()
    const { scene } = useGLTF(modelUrl);

    useEffect(() => {
        _faceFollowers[props.faceIndex] = objRef.current
    })

    // Adjust this to fit the model to the face correctly
    const modelScale = 9.25;
    const modelPositionOffset = [0, 0.25, -0.25]; // x, y, z
    const occluderScale = 0.13;
    const occluderPositionOffset = [0, -0.25, 0.75]; // x, y, z

    useFrame(() => {
        if (glassesRef.current) {
            glassesRef.current.scale.set(modelScale, modelScale, modelScale);
            glassesRef.current.position.set(...modelPositionOffset);
        }
        if (occluderRef.current) {
            occluderRef.current.scale.set(occluderScale, occluderScale, occluderScale);
            occluderRef.current.position.set(...occluderPositionOffset);
        }
    })

    return (
        <object3D ref={objRef}>
            <group ref={occluderRef}>
                <Occluder />
            </group>
            <group ref={glassesRef}>
                <primitive object={scene.clone(true)} />
            </group>
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
    // const baseFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const height = window.innerHeight * (50 / 100);
    const width = window.innerWidth * (50 / 100);

    // Compute the position of the canvas to center it
    const top = 0;
    const left = 0;

    return { width, height, top, left };
};


export const TryOnViewer = (props) => {
    const navigate = useNavigate();

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
                <FaceFollower faceIndex={0} />
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
