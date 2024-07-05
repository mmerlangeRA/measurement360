// src/components/Sphere360.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { clearScene } from '../utils/sceneManagement';

export const toolNames = {
    measure: 'measure'
};

interface Sphere360Props {
    imagePath: string;
    containerRef: React.RefObject<HTMLDivElement>;
    selectedToolName: string;
}

class Measurement {
    point1: THREE.Vector3;
    point2: THREE.Vector3;
    threeObject: THREE.Object3D = null as unknown as THREE.Object3D;

    public constructor() {
        this.point1 = null as unknown as THREE.Vector3;
        this.point2 = null as unknown as THREE.Vector3;
    }

    public setPoint1(p1: THREE.Vector3) {
        this.point1 = p1;
    }
    public setPoint2(p2: THREE.Vector3) {
        this.point2 = p2;
    }

    private createPoint(): THREE.Object3D {
        const geometry = new THREE.SphereGeometry(5, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const extremityPoint = new THREE.Mesh(geometry, material);
        return extremityPoint;
    }

    public setPoints(p1: THREE.Vector3, p2: THREE.Vector3) {
        this.point1 = p1;
        this.point2 = p2;
    }

    public draw(scene: THREE.Scene) {
        if (this.threeObject) {
            scene.remove(this.threeObject)
        }
        if (!this.point1 && !this.point2) {
            return
        }
        this.threeObject = new THREE.Object3D()
        const points = [this.point1, this.point2]
        points.forEach(p => {
            if (p) {
                const startPoint = this.createPoint();
                startPoint.position.copy(p);
                this.threeObject.add(startPoint)
            }
        })

        if (this.point1 && this.point2) {
            const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
            const geometry = new THREE.BufferGeometry().setFromPoints([this.point1, this.point2]);
            const line = new THREE.Line(geometry, material);
            this.threeObject.add(line)
        }
        scene.add(this.threeObject)

    }

    public delete(scene: THREE.Scene) {
        if (this.threeObject) {
            scene.remove(this.threeObject);
        }
    }
}

const Sphere360: React.FC<Sphere360Props> = ({ imagePath, containerRef, selectedToolName }) => {
    const { camera, gl, scene } = useThree();
    const controls = useRef<any>();
    const [points, setPoints] = useState<THREE.Vector3[]>([]);
    const [initDone, setInitDone] = useState<boolean>(false);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [currentMeasurement, setCurrentMeasurement] = useState<Measurement>(null as unknown as Measurement);

    useEffect(() => {
        if (!initDone && camera && imagePath) {
            clearScene(scene);
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(imagePath, (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                const geometry = new THREE.SphereGeometry(500, 60, 40);
                geometry.scale(-1, 1, 1); // Invert the geometry on the x-axis so that all of the faces point inward
                const material = new THREE.MeshBasicMaterial({ map: texture });
                const sphere = new THREE.Mesh(geometry, material);
                sphere.rotation.set(0, -Math.PI / 2, 0);
                sphere.name = 'sphere';
                //@ts-ignore
                window.sphere = sphere;
                scene.add(sphere);
            });

            const handleResize = () => {
                if (containerRef.current) {
                    const { clientWidth, clientHeight } = containerRef.current;
                    gl.setSize(clientWidth, clientHeight);
                    //@ts-ignore
                    camera.aspect = clientWidth / clientHeight;
                    //@ts-ignore
                    window.camera = camera;
                    camera.updateProjectionMatrix();
                }
            };

            window.addEventListener('resize', handleResize);
            handleResize(); // Call once to set the initial size

            camera.position.set(0, 0, 0.001);
            //camera.rotation.set(-Math.PI, Math.PI / 2., Math.PI);
            setInitDone(true);

            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }

        (gl as THREE.WebGLRenderer).outputColorSpace = THREE.SRGBColorSpace; // Set the output color space to sRGB

        if (controls.current) {
            controls.current.minPolarAngle = Math.PI / 2; // Restrict the upward movement
            controls.current.maxPolarAngle = Math.PI / 2; // Restrict the downward movement
        }
    }, [camera, scene, imagePath, gl, initDone, containerRef]);

    const showUV = (event: any) => {
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

    const measureToolManagement = (event: any) => {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const { clientX, clientY } = event;
        const { clientWidth, clientHeight } = gl.domElement;

        mouse.x = (clientX / clientWidth) * 2 - 1;
        mouse.y = -(clientY / clientHeight) * 2 + 1;
        console.log(event);
        console.log(clientWidth, clientHeight);
        console.log(mouse.x, mouse.y);

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
            const intersect = intersects.find(i => i.object.name === 'sphere');
            if (intersect) {
                const point = intersect.point;
                if (!currentMeasurement) {
                    const newMeasurement = new Measurement();
                    newMeasurement.setPoint1(point);
                    newMeasurement.draw(scene);
                    setCurrentMeasurement(newMeasurement)
                    setMeasurements(prevMeasurements => [...prevMeasurements, newMeasurement]);
                } else {
                    currentMeasurement.setPoint2(point)
                    currentMeasurement.draw(scene)
                    setCurrentMeasurement(null as unknown as Measurement)
                }

            }
        }
    };

    const handlePointerDown = (event: any) => {
        showUV(event);
        switch (selectedToolName) {
            case toolNames.measure:
                measureToolManagement(event);
                break;
            default:
                break;
        }
    };


    return (
        <>
            <OrbitControls ref={controls} args={[camera, gl.domElement]} enableZoom={false} enablePan={false} rotateSpeed={-1} />
            <mesh onPointerDown={handlePointerDown}>
                <sphereGeometry args={[500, 60, 40]} />
                <meshBasicMaterial side={THREE.BackSide} />
            </mesh>
        </>
    );
};

const Sphere360App: React.FC<{ imagePath: string, selectedToolName: string }> = ({ imagePath, selectedToolName }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div style={{ width: '100%', height: '100%' }} ref={containerRef}>
            <Canvas>
                <Sphere360 imagePath={imagePath} containerRef={containerRef} selectedToolName={selectedToolName} />
            </Canvas>
        </div>
    );
};

export default Sphere360App;
