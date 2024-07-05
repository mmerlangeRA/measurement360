// src/components/Cubemap.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useThree, extend } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { BoxGeometry } from 'three';
import { splitCubemap } from '../utils/cubemap';

// Extend the Three.js objects
extend({ BoxGeometry });

const Cubemap: React.FC = () => {
    const { camera, gl, scene } = useThree();
    const controls = useRef<any>();
    const [cubemap, setCubemap] = useState<string[]>([]);

    useEffect(() => {
        const loadCubemap = async () => {
            const img = new Image();
            img.src = '/images/D_P1_CAM_D_2_CUBE.png';
            img.onload = async () => {
                const faces = await splitCubemap(img);
                setCubemap(faces);
            };
        };
        loadCubemap();
    }, []);

    useEffect(() => {
        if (cubemap.length === 6) {
            const loader = new THREE.TextureLoader();
            const materials = cubemap.map((url) => {
                const texture = loader.load(url);
                texture.colorSpace = THREE.SRGBColorSpace;
                return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
            });

            const skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
            const skybox = new THREE.Mesh(skyboxGeo, materials);
            scene.add(skybox);
        }
    }, [cubemap, scene]);

    const handlePointerDown = (event: any) => {
        const { clientX, clientY } = event;
        const { width, height } = gl.domElement;
        const x = (clientX / width) * 2 - 1;
        const y = -(clientY / height) * 2 + 1;
        const vector = new THREE.Vector3(x, y, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));
        console.log('UV Map Position:', pos);
    };

    return (
        <>
            <OrbitControls ref={controls} args={[camera, gl.domElement]} enableZoom={false} enablePan={false} />
            <mesh onPointerDown={handlePointerDown}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial side={THREE.BackSide} />
            </mesh>
        </>
    );
};

const CubemapApp: React.FC = () => (
    <Canvas>
        <Cubemap />
    </Canvas>
);

export default CubemapApp;
