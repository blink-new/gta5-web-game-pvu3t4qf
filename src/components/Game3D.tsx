import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GameState } from '../types/game';

interface Game3DProps {
  gameState: GameState;
  onPlayerMove: (deltaX: number, deltaY: number) => void;
  onVehicleInteraction: (vehicleId: string) => void;
}

export const Game3D: React.FC<Game3DProps> = ({ 
  gameState, 
  onPlayerMove, 
  onVehicleInteraction 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const playerMeshRef = useRef<THREE.Group>();
  const vehicleMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const npcMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize 3D scene
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount || isInitialized) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a1a1a, 50, 200);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 20, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0a0a, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    currentMount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ff41, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2a2a2a,
      transparent: true,
      opacity: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // City grid
    const gridHelper = new THREE.GridHelper(200, 40, 0x00ff41, 0x00ff41);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Buildings
    createBuildings(scene);

    // Roads
    createRoads(scene);

    setIsInitialized(true);

    // Handle window resize
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isInitialized]);

  // Create buildings
  const createBuildings = (scene: THREE.Scene) => {
    const buildings = [
      { x: -30, z: -30, width: 15, height: 20, depth: 12 },
      { x: 40, z: -25, width: 12, height: 25, depth: 15 },
      { x: -25, z: 35, width: 18, height: 15, depth: 10 },
      { x: 30, z: 30, width: 10, height: 18, depth: 12 },
      { x: -50, z: 10, width: 8, height: 30, depth: 8 },
      { x: 50, z: -10, width: 12, height: 22, depth: 14 }
    ];

    buildings.forEach((building, index) => {
      const geometry = new THREE.BoxGeometry(building.width, building.height, building.depth);
      const material = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(0, 0, 0.1 + Math.random() * 0.2)
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(building.x, building.height / 2, building.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      // Add windows
      const windowGeometry = new THREE.PlaneGeometry(1, 1);
      const windowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff41,
        transparent: true,
        opacity: 0.6
      });

      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
          const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
          window1.position.set(
            building.x + building.width / 2 + 0.1,
            building.height * 0.2 + j * 3,
            building.z - building.depth / 2 + i * 3
          );
          window1.rotation.y = Math.PI / 2;
          scene.add(window1);
        }
      }
    });
  };

  // Create roads
  const createRoads = (scene: THREE.Scene) => {
    // Main road (horizontal)
    const roadGeometry1 = new THREE.PlaneGeometry(200, 8);
    const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const road1 = new THREE.Mesh(roadGeometry1, roadMaterial);
    road1.rotation.x = -Math.PI / 2;
    road1.position.y = 0.01;
    scene.add(road1);

    // Main road (vertical)
    const roadGeometry2 = new THREE.PlaneGeometry(8, 200);
    const road2 = new THREE.Mesh(roadGeometry2, roadMaterial);
    road2.rotation.x = -Math.PI / 2;
    road2.position.y = 0.01;
    scene.add(road2);

    // Road markings
    const lineGeometry = new THREE.PlaneGeometry(200, 0.2);
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const centerLine1 = new THREE.Mesh(lineGeometry, lineMaterial);
    centerLine1.rotation.x = -Math.PI / 2;
    centerLine1.position.y = 0.02;
    scene.add(centerLine1);

    const centerLine2 = new THREE.Mesh(lineGeometry, lineMaterial);
    centerLine2.rotation.x = -Math.PI / 2;
    centerLine2.rotation.z = Math.PI / 2;
    centerLine2.position.y = 0.02;
    scene.add(centerLine2);
  };

  // Create player mesh
  const createPlayerMesh = () => {
    const playerGroup = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.7, 2, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x0066cc });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    playerGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.4, 8, 8);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.4;
    head.castShadow = true;
    playerGroup.add(head);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.5, 6);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.8, 1.2, 0);
    leftArm.castShadow = true;
    playerGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.8, 1.2, 0);
    rightArm.castShadow = true;
    playerGroup.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 6);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, -0.25, 0);
    leftLeg.castShadow = true;
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, -0.25, 0);
    rightLeg.castShadow = true;
    playerGroup.add(rightLeg);

    return playerGroup;
  };

  // Create vehicle mesh
  const createVehicleMesh = (vehicle: any) => {
    const vehicleGroup = new THREE.Group();

    if (vehicle.type === 'motorcycle') {
      // Motorcycle body
      const bodyGeometry = new THREE.BoxGeometry(0.8, 0.6, 2);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: vehicle.color });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.8;
      body.castShadow = true;
      vehicleGroup.add(body);

      // Wheels
      const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 8);
      const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
      
      const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      frontWheel.position.set(0, 0.4, 0.8);
      frontWheel.rotation.z = Math.PI / 2;
      frontWheel.castShadow = true;
      vehicleGroup.add(frontWheel);

      const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      backWheel.position.set(0, 0.4, -0.8);
      backWheel.rotation.z = Math.PI / 2;
      backWheel.castShadow = true;
      vehicleGroup.add(backWheel);
    } else {
      // Car body
      const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: vehicle.color });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.8;
      body.castShadow = true;
      vehicleGroup.add(body);

      // Car roof
      const roofGeometry = new THREE.BoxGeometry(1.8, 0.8, 2);
      const roofMaterial = new THREE.MeshLambertMaterial({ color: vehicle.color });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.y = 1.6;
      roof.position.z = -0.3;
      roof.castShadow = true;
      vehicleGroup.add(roof);

      // Windows
      const windowGeometry = new THREE.BoxGeometry(1.7, 0.7, 1.9);
      const windowMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.6
      });
      const windows = new THREE.Mesh(windowGeometry, windowMaterial);
      windows.position.y = 1.6;
      windows.position.z = -0.3;
      vehicleGroup.add(windows);

      // Wheels
      const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 8);
      const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
      
      const wheels = [
        { x: -0.8, z: 1.2 },
        { x: 0.8, z: 1.2 },
        { x: -0.8, z: -1.2 },
        { x: 0.8, z: -1.2 }
      ];

      wheels.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(pos.x, 0.5, pos.z);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        vehicleGroup.add(wheel);
      });

      // Headlights
      const lightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
      const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      
      const leftLight = new THREE.Mesh(lightGeometry, lightMaterial);
      leftLight.position.set(-0.6, 0.8, 2.1);
      vehicleGroup.add(leftLight);

      const rightLight = new THREE.Mesh(lightGeometry, lightMaterial);
      rightLight.position.set(0.6, 0.8, 2.1);
      vehicleGroup.add(rightLight);
    }

    return vehicleGroup;
  };

  // Create NPC mesh
  const createNPCMesh = (npc: any) => {
    const npcGroup = new THREE.Group();

    // Simplified NPC (similar to player but smaller)
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1.8, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
      color: npc.type === 'police' ? 0x000080 : 0x8b4513 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    body.castShadow = true;
    npcGroup.add(body);

    const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.1;
    head.castShadow = true;
    npcGroup.add(head);

    return npcGroup;
  };

  // Update player position and camera
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !isInitialized) return;

    // Create or update player mesh
    if (!playerMeshRef.current) {
      playerMeshRef.current = createPlayerMesh();
      sceneRef.current.add(playerMeshRef.current);
    }

    // Convert 2D coordinates to 3D
    const x = (gameState.player.x - 400) / 10;
    const z = (gameState.player.y - 300) / 10;

    playerMeshRef.current.position.set(x, 0, z);

    // Update camera to follow player
    const cameraOffset = gameState.player.currentVehicle ? 15 : 10;
    cameraRef.current.position.set(x, cameraOffset, z + cameraOffset);
    cameraRef.current.lookAt(x, 0, z);

  }, [gameState.player, isInitialized]);

  // Update vehicles
  useEffect(() => {
    if (!sceneRef.current || !isInitialized) return;

    gameState.vehicles.forEach(vehicle => {
      let vehicleMesh = vehicleMeshesRef.current.get(vehicle.id);
      
      if (!vehicleMesh) {
        vehicleMesh = createVehicleMesh(vehicle);
        vehicleMeshesRef.current.set(vehicle.id, vehicleMesh);
        sceneRef.current!.add(vehicleMesh);
      }

      const x = (vehicle.x - 400) / 10;
      const z = (vehicle.y - 300) / 10;
      vehicleMesh.position.set(x, 0, z);
    });
  }, [gameState.vehicles, isInitialized]);

  // Update NPCs
  useEffect(() => {
    if (!sceneRef.current || !isInitialized) return;

    gameState.npcs.forEach(npc => {
      let npcMesh = npcMeshesRef.current.get(npc.id);
      
      if (!npcMesh) {
        npcMesh = createNPCMesh(npc);
        npcMeshesRef.current.set(npc.id, npcMesh);
        sceneRef.current!.add(npcMesh);
      }

      const x = (npc.x - 400) / 10;
      const z = (npc.y - 300) / 10;
      npcMesh.position.set(x, 0, z);
    });
  }, [gameState.npcs, isInitialized]);

  // Animation loop
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !isInitialized) return;

    const animate = () => {
      requestAnimationFrame(animate);
      
      if (!gameState.isPaused) {
        rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
      }
    };

    animate();
  }, [gameState.isPaused, isInitialized]);

  // Handle keyboard input for 3D movement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState.isPaused) return;

      const speed = gameState.player.currentVehicle ? 80 : 40;
      
      switch (event.key.toLowerCase()) {
        case 'w':
          onPlayerMove(0, -speed);
          break;
        case 's':
          onPlayerMove(0, speed);
          break;
        case 'a':
          onPlayerMove(-speed, 0);
          break;
        case 'd':
          onPlayerMove(speed, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPaused, gameState.player.currentVehicle, onPlayerMove]);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1 }}
    />
  );
};