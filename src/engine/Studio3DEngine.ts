import * as THREE from 'three';
import {
  AvatarState,
  ClothingItem,
  LightingPreset,
  PerformanceSettings,
  StudioLighting,
} from '../types';
import { generatePatternCanvasUrl } from '../utils/textureGenerator';
import { createAvatarFaceTexture } from '../utils/faceTexture';

export class Studio3DEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public rootGroup: THREE.Group;
  public avatarGroup: THREE.Group;
  public clothingGroup: THREE.Group;
  public primitivesGroup: THREE.Group;

  // Rig limb references for synchronized clothing transforms
  public leftArmGroup: THREE.Group | null = null;
  public rightArmGroup: THREE.Group | null = null;
  public leftLegGroup: THREE.Group | null = null;
  public rightLegGroup: THREE.Group | null = null;
  public torsoMesh: THREE.Mesh | null = null;
  public hipsMesh: THREE.Mesh | null = null;
  public headMesh: THREE.Mesh | null = null;

  // Lights
  private ambientLight: THREE.AmbientLight;
  private keyLight: THREE.DirectionalLight;
  private fillLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private groundCircle: THREE.Mesh;

  // State
  private avatarState: AvatarState;
  private clothingItems: Record<string, ClothingItem>;
  private lightingState: StudioLighting;
  private performanceSettings: PerformanceSettings;

  // Interaction
  public selectedPart: string | null = null;
  public onSelectPart?: (partName: string | null) => void;
  public isTurntableActive = false;
  private turntableSpeed = 0.008;

  // Touch & Orbit
  private isInteracting = false;
  private previousPointerX = 0;
  private previousPointerY = 0;
  private spherical = { radius: 3.8, theta: 0, phi: Math.PI / 2.1 };
  private cameraTarget = new THREE.Vector3(0, 0.9, 0);

  // Animation & Rendering
  private animationFrameId: number | null = null;
  private isDestroyed = false;
  private textureCache = new Map<string, THREE.CanvasTexture | THREE.Texture>();

  constructor(
    container: HTMLElement,
    initialAvatar: AvatarState,
    initialClothing: Record<string, ClothingItem>,
    initialLighting: StudioLighting,
    performance: PerformanceSettings
  ) {
    this.avatarState = initialAvatar;
    this.clothingItems = initialClothing;
    this.lightingState = initialLighting;
    this.performanceSettings = performance;

    // 1. Scene setup
    this.scene = new THREE.Scene();

    // 2. Camera setup
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 50);
    this.updateCameraPosition();

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !performance.batterySaver && performance.mode !== 'low',
      alpha: true,
      powerPreference: performance.batterySaver ? 'low-power' : 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.setPerformanceSettings(performance);
    container.appendChild(this.renderer.domElement);

    // 4. Groups
    this.rootGroup = new THREE.Group();
    this.avatarGroup = new THREE.Group();
    this.clothingGroup = new THREE.Group();
    this.primitivesGroup = new THREE.Group();

    this.rootGroup.add(this.avatarGroup);
    this.rootGroup.add(this.clothingGroup);
    this.rootGroup.add(this.primitivesGroup);
    this.scene.add(this.rootGroup);

    // 5. Lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.keyLight.position.set(3, 4, 3);
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0xa5b4fc, 0.5);
    this.fillLight.position.set(-3, 2, 2);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight(0xe0e7ff, 0.8);
    this.rimLight.position.set(0, 3, -3.5);
    this.scene.add(this.rimLight);

    // 6. Studio Podium Ground
    const groundGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.08, 36);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
      metalness: 0.1,
    });
    this.groundCircle = new THREE.Mesh(groundGeo, groundMat);
    this.groundCircle.position.y = -0.04;
    this.scene.add(this.groundCircle);

    // Rings on ground for studio tech aesthetic
    const ringGeo = new THREE.RingGeometry(1.3, 1.34, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.005;
    this.scene.add(ringMesh);

    // 7. Event listeners
    this.bindPointerEvents(container);

    // 8. Build initial scene
    this.applyLighting(initialLighting);
    this.rebuildAvatar();
    this.rebuildClothing();

    // 9. Start render loop
    this.startLoop();
  }

  // --- CAMERA & TOUCH NAVIGATION ---
  private updateCameraPosition() {
    this.spherical.phi = Math.max(0.15, Math.min(Math.PI / 1.9, this.spherical.phi));
    const x = this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
    const y = this.spherical.radius * Math.cos(this.spherical.phi);
    const z = this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);

    this.camera.position.set(x + this.cameraTarget.x, y + this.cameraTarget.y, z + this.cameraTarget.z);
    this.camera.lookAt(this.cameraTarget);
  }

  public setCameraPreset(preset: 'front' | 'side' | 'back' | 'closeup' | 'shoes') {
    switch (preset) {
      case 'front':
        this.spherical.theta = 0;
        this.spherical.phi = Math.PI / 2.1;
        this.spherical.radius = 3.8;
        this.cameraTarget.set(0, 0.9, 0);
        break;
      case 'side':
        this.spherical.theta = Math.PI / 2;
        this.spherical.phi = Math.PI / 2.1;
        this.spherical.radius = 3.8;
        this.cameraTarget.set(0, 0.9, 0);
        break;
      case 'back':
        this.spherical.theta = Math.PI;
        this.spherical.phi = Math.PI / 2.1;
        this.spherical.radius = 3.8;
        this.cameraTarget.set(0, 0.9, 0);
        break;
      case 'closeup':
        this.spherical.theta = 0;
        this.spherical.phi = Math.PI / 2.05;
        this.spherical.radius = 1.7;
        this.cameraTarget.set(0, 1.45, 0);
        break;
      case 'shoes':
        this.spherical.theta = 0.2;
        this.spherical.phi = Math.PI / 2.3;
        this.spherical.radius = 2.0;
        this.cameraTarget.set(0, 0.25, 0);
        break;
    }
    this.updateCameraPosition();
  }

  private bindPointerEvents(container: HTMLElement) {
    let initialPinchDistance = 0;

    const onPointerDown = (e: PointerEvent) => {
      this.isInteracting = true;
      this.previousPointerX = e.clientX;
      this.previousPointerY = e.clientY;

      // Tap raycasting to select objects
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / container.clientWidth) * 2 - 1,
        -((e.clientY - rect.top) / container.clientHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects([...this.clothingGroup.children, ...this.avatarGroup.children], true);

      if (intersects.length > 0) {
        const topHit = intersects[0].object;
        const partName = topHit.name || (topHit.parent ? topHit.parent.name : null);
        if (partName) {
          this.selectedPart = partName;
          this.onSelectPart?.(partName);
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isInteracting) return;
      const deltaX = e.clientX - this.previousPointerX;
      const deltaY = e.clientY - this.previousPointerY;

      this.spherical.theta -= deltaX * 0.008;
      this.spherical.phi -= deltaY * 0.008;
      this.updateCameraPosition();

      this.previousPointerX = e.clientX;
      this.previousPointerY = e.clientY;
    };

    const onPointerUp = () => {
      this.isInteracting = false;
    };

    // Touch Pinch Zoom support for phones
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (initialPinchDistance > 0) {
          const delta = (initialPinchDistance - distance) * 0.006;
          this.spherical.radius = Math.max(1.2, Math.min(6.5, this.spherical.radius + delta));
          this.updateCameraPosition();
        }
        initialPinchDistance = distance;
      }
    };

    const onTouchEnd = () => {
      initialPinchDistance = 0;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.spherical.radius = Math.max(1.2, Math.min(6.5, this.spherical.radius + e.deltaY * 0.003));
      this.updateCameraPosition();
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('wheel', onWheel, { passive: false });
  }

  // --- AVATAR BUILDER ---
  public updateAvatar(newAvatar: AvatarState) {
    this.avatarState = newAvatar;
    this.rebuildAvatar();
    this.rebuildClothing(); // Clothes conform to avatar proportions and pose
  }

  public rebuildAvatar() {
    // Clear existing
    while (this.avatarGroup.children.length > 0) {
      const obj = this.avatarGroup.children[0];
      this.avatarGroup.remove(obj);
    }

    const {
      style,
      skinTone,
      eyeColor,
      hairStyle,
      hairColor,
      hairSecondaryColor,
      headScale,
      bodyHeight,
      shoulderWidth,
      waistWidth,
      currentPose,
    } = this.avatarState;

    const seg = this.performanceSettings.reducedPolygons ? 12 : 24;
    const isAnime = style === 'anime';

    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinTone),
      roughness: isAnime ? 0.55 : 0.45,
      metalness: 0.02,
      wireframe: this.performanceSettings.wireframe,
    });

    // 0. Neck (smooth anatomical transition from torso to head)
    const neckLen = 0.15 * bodyHeight;
    const neckGeo = new THREE.CylinderGeometry(0.065, 0.078, neckLen, seg);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.name = 'Avatar_Neck';
    neck.position.set(0, 1.41 * bodyHeight, 0);
    this.avatarGroup.add(neck);

    // 1. Head (Sculpted with a gentle, smooth jawline - no awkward sharp cones)
    const headRadius = (isAnime ? 0.22 : 0.20) * headScale;
    const headPos = new THREE.Vector3(0, 1.54 * bodyHeight, 0);
    const headGeo = new THREE.SphereGeometry(headRadius, seg * 2, seg * 2);
    headGeo.scale(0.96, 1.04, 0.98);

    // Gently taper lower half into a sweet, smooth anime chin
    const hPos = headGeo.attributes.position;
    for (let i = 0; i < hPos.count; i++) {
      const vy = hPos.getY(i);
      if (vy < 0) {
        const factor = 1 - Math.abs(vy / (headRadius * 1.04)) * 0.26;
        hPos.setX(i, hPos.getX(i) * factor);
        hPos.setZ(i, hPos.getZ(i) * (factor * 0.96) + Math.abs(vy) * 0.04);
      }
    }
    hPos.needsUpdate = true;
    headGeo.computeVertexNormals();

    const head = new THREE.Mesh(headGeo, skinMat);
    head.name = 'Avatar_Head';
    head.position.copy(headPos);
    this.headMesh = head;
    this.avatarGroup.add(head);

    // 1b. Stylized Cute Ears
    const earGeo = new THREE.SphereGeometry(0.042 * headScale, 12, 12);
    earGeo.scale(0.45, 1.05, 0.65);
    const earL = new THREE.Mesh(earGeo, skinMat);
    earL.position.set(-headRadius * 0.88, headPos.y - 0.005, -0.01);
    earL.rotation.y = -0.25;
    this.avatarGroup.add(earL);

    const earR = new THREE.Mesh(earGeo, skinMat);
    earR.position.set(headRadius * 0.88, headPos.y - 0.005, -0.01);
    earR.rotation.y = 0.25;
    this.avatarGroup.add(earR);

    // 2. High-Definition Expressive Face Decal (Seamlessly hugs skull curvature with zero floating artifacts)
    const faceTexture = createAvatarFaceTexture(style, eyeColor, hairColor, skinTone);
    const faceW = headRadius * 1.54;
    const faceH = headRadius * 1.44;
    const faceGeo = new THREE.PlaneGeometry(faceW, faceH, 24, 24);
    const fPos = faceGeo.attributes.position;
    const rSq = headRadius * headRadius * 1.015;
    for (let i = 0; i < fPos.count; i++) {
      const x = fPos.getX(i);
      const y = fPos.getY(i);
      const dSq = x * x + y * y;
      if (dSq < rSq) {
        fPos.setZ(i, Math.sqrt(rSq - dSq) - headRadius * 0.05);
      } else {
        fPos.setZ(i, 0);
      }
    }
    fPos.needsUpdate = true;
    faceGeo.computeVertexNormals();

    const faceMat = new THREE.MeshBasicMaterial({
      map: faceTexture,
      transparent: true,
      depthWrite: false, // Prevents z-fighting with the head mesh
      side: THREE.FrontSide,
    });
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.name = 'Avatar_Face';
    faceMesh.position.set(0, headPos.y, headRadius * 0.06);
    this.avatarGroup.add(faceMesh);

    // 3. Hair
    this.buildHair(hairStyle, hairColor, hairSecondaryColor, headPos, headScale, isAnime, seg);

    // 4. Torso / Chest (tapered waistline)
    const chestWidth = 0.28 * shoulderWidth;
    const waistR = 0.21 * waistWidth;
    const chestGeo = new THREE.CylinderGeometry(chestWidth, waistR, 0.36 * bodyHeight, seg);
    chestGeo.scale(1.0, 1.0, 0.65);
    const chest = new THREE.Mesh(chestGeo, skinMat);
    chest.name = 'Avatar_Torso';
    chest.position.set(0, 1.21 * bodyHeight, 0);
    this.torsoMesh = chest;
    this.avatarGroup.add(chest);

    // 5. Hips / Pelvis
    const hipRadius = 0.26 * waistWidth;
    const hipsGeo = new THREE.CylinderGeometry(waistR, hipRadius, 0.22 * bodyHeight, seg);
    hipsGeo.scale(1.0, 1.0, 0.70);
    const hips = new THREE.Mesh(hipsGeo, skinMat);
    hips.name = 'Avatar_Hips';
    hips.position.set(0, 0.94 * bodyHeight, 0);
    this.hipsMesh = hips;
    this.avatarGroup.add(hips);

    // 6. Pose Adjustments for Arms & Legs
    this.applyPose(currentPose, bodyHeight, shoulderWidth, skinMat, seg);
  }

  private buildHair(
    style: string,
    color: string,
    secondaryColor: string | undefined,
    headPos: THREE.Vector3,
    scale: number,
    isAnime: boolean,
    seg: number
  ) {
    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.45,
      metalness: 0.08,
      wireframe: this.performanceSettings.wireframe,
    });

    const hairGroup = new THREE.Group();
    hairGroup.name = 'Avatar_Hair';

    const headRadius = (isAnime ? 0.22 : 0.20) * scale;

    // Base Skull Cap (covers crown, sides and back, leaving face open)
    const capGeo = new THREE.SphereGeometry(headRadius * 1.05, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.58);
    capGeo.scale(1.02, 1.06, 1.04);
    const cap = new THREE.Mesh(capGeo, hairMat);
    cap.position.copy(headPos);
    hairGroup.add(cap);

    // Front Bangs & Side Framing Locks (gives charming anime hairstyle silhouette)
    for (let b = -2; b <= 2; b++) {
      const bangW = 0.036 * scale;
      const bangH = (0.12 - Math.abs(b) * 0.015) * scale;
      const bangGeo = new THREE.ConeGeometry(bangW, bangH, 8);
      bangGeo.rotateX(Math.PI);
      const bang = new THREE.Mesh(bangGeo, hairMat);
      bang.position.set(
        b * 0.034 * scale,
        headPos.y + (headRadius * 0.52) - (Math.abs(b) * 0.01 * scale),
        headRadius * 0.92 - (Math.abs(b) * 0.03 * scale)
      );
      bang.rotation.z = -b * 0.12;
      bang.rotation.x = -0.22;
      hairGroup.add(bang);
    }

    // Side temple locks
    [-1, 1].forEach((side) => {
      const sideLockGeo = new THREE.ConeGeometry(0.04 * scale, 0.26 * scale, 8);
      sideLockGeo.rotateX(Math.PI);
      const sideLock = new THREE.Mesh(sideLockGeo, hairMat);
      sideLock.position.set(
        side * headRadius * 0.86,
        headPos.y + 0.02 * scale,
        headRadius * 0.42
      );
      sideLock.rotation.z = side * 0.15;
      sideLock.rotation.x = -0.15;
      hairGroup.add(sideLock);
    });

    switch (style) {
      case 'twin_tails': {
        const tieMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(secondaryColor || '#8b5cf6'),
          roughness: 0.3,
          metalness: 0.2,
        });

        [-1, 1].forEach((side) => {
          // Cute hair scrunchie ring
          const tieGeo = new THREE.TorusGeometry(0.048 * scale, 0.02 * scale, 8, 16);
          const tie = new THREE.Mesh(tieGeo, tieMat);
          tie.position.set(side * 0.24 * scale, headPos.y + 0.10 * scale, -0.02 * scale);
          tie.rotation.y = side * 0.4;
          hairGroup.add(tie);

          // Gracefully flowing pigtails (segmented curve for dynamic anime hair)
          const tailGroup = new THREE.Group();
          tailGroup.position.set(side * 0.24 * scale, headPos.y + 0.09 * scale, -0.02 * scale);
          tailGroup.rotation.z = side * 0.32;
          tailGroup.rotation.x = -0.1;

          // Segment 1 (upper flare)
          const seg1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.062 * scale, 0.078 * scale, 0.20 * scale, 12),
            hairMat
          );
          seg1.position.set(0, -0.10 * scale, 0);
          tailGroup.add(seg1);

          // Segment 2 (mid curve)
          const seg2 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.078 * scale, 0.052 * scale, 0.20 * scale, 12),
            hairMat
          );
          seg2.position.set(side * 0.02 * scale, -0.28 * scale, 0.02 * scale);
          seg2.rotation.z = -side * 0.15;
          tailGroup.add(seg2);

          // Segment 3 (tapered tip)
          const tipGeo = new THREE.ConeGeometry(0.052 * scale, 0.18 * scale, 12);
          tipGeo.rotateX(Math.PI);
          const seg3 = new THREE.Mesh(tipGeo, hairMat);
          seg3.position.set(side * 0.01 * scale, -0.45 * scale, 0.03 * scale);
          tailGroup.add(seg3);

          hairGroup.add(tailGroup);
        });
        break;
      }

      case 'anime_spikes': {
        for (let i = 0; i < 9; i++) {
          const spikeGeo = new THREE.ConeGeometry(0.052 * scale, 0.24 * scale, 8);
          const spike = new THREE.Mesh(spikeGeo, hairMat);
          const angle = (i / 8) * Math.PI - Math.PI / 2;
          spike.position.set(
            Math.sin(angle) * 0.22 * scale,
            headPos.y + 0.18 * scale + Math.cos(angle) * 0.06 * scale,
            Math.cos(angle) * 0.12 * scale - 0.04 * scale
          );
          spike.rotation.z = -angle * 0.75;
          spike.rotation.x = -0.2;
          hairGroup.add(spike);
        }
        break;
      }

      case 'long_bob': {
        const bobBack = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24 * scale, 0.32 * scale, 0.44 * scale, 18, 1, true, -Math.PI * 0.75, Math.PI * 1.5),
          hairMat
        );
        bobBack.position.set(0, headPos.y - 0.15 * scale, 0.01);
        hairGroup.add(bobBack);

        [-1, 1].forEach((side) => {
          const lock = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055 * scale, 0.038 * scale, 0.38 * scale, 10),
            hairMat
          );
          lock.position.set(side * 0.18 * scale, headPos.y - 0.13 * scale, 0.10 * scale);
          lock.rotation.z = side * 0.1;
          lock.rotation.x = -0.1;
          hairGroup.add(lock);
        });
        break;
      }

      case 'wavy_curls': {
        for (let j = 0; j < 8; j++) {
          const side = j % 2 === 0 ? -1 : 1;
          const curlGeo = new THREE.TorusGeometry(0.07 * scale, 0.034 * scale, 8, 16, Math.PI * 1.6);
          const curl = new THREE.Mesh(curlGeo, hairMat);
          curl.position.set(
            side * (0.19 + (j * 0.015)) * scale,
            headPos.y - 0.06 * scale - (j * 0.045 * scale),
            (j % 3 === 0 ? 0.04 : -0.04) * scale
          );
          curl.rotation.x = Math.PI / 2.2;
          curl.rotation.y = side * 0.3;
          hairGroup.add(curl);
        }
        break;
      }

      case 'afro_puffs': {
        [-1, 1].forEach((side) => {
          const puff = new THREE.Mesh(
            new THREE.SphereGeometry(0.18 * scale, 14, 14),
            hairMat
          );
          puff.scale.set(1.05, 1.0, 1.05);
          puff.position.set(side * 0.28 * scale, headPos.y + 0.15 * scale, 0);
          hairGroup.add(puff);

          const band = new THREE.Mesh(
            new THREE.TorusGeometry(0.075 * scale, 0.018 * scale, 8, 16),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 })
          );
          band.position.set(side * 0.22 * scale, headPos.y + 0.08 * scale, 0);
          band.rotation.y = side * 0.5;
          hairGroup.add(band);
        });
        break;
      }

      default: { // Sleek fade
        const topTuft = new THREE.Mesh(
          new THREE.SphereGeometry(0.23 * scale, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.4),
          hairMat
        );
        topTuft.scale.set(0.9, 1.15, 1.2);
        topTuft.position.set(0, headPos.y + 0.04 * scale, 0.02 * scale);
        topTuft.rotation.x = -0.2;
        hairGroup.add(topTuft);
        break;
      }
    }

    this.avatarGroup.add(hairGroup);
  }

  private applyPose(
    pose: string,
    h: number,
    shoulderW: number,
    skinMat: THREE.Material,
    seg: number
  ) {
    const limbMat = skinMat;

    // Helper for limb segments
    const makeLimb = (name: string, r1: number, r2: number, len: number) => {
      const geo = new THREE.CylinderGeometry(r1, r2, len, seg);
      const mesh = new THREE.Mesh(geo, limbMat);
      mesh.name = name;
      return mesh;
    };

    // Helper for joints
    const makeJoint = (r: number) => {
      return new THREE.Mesh(new THREE.SphereGeometry(r, 12, 12), limbMat);
    };

    // Helper for stylized cute hands with thumb
    const makeHand = (isLeft: boolean) => {
      const handGroup = new THREE.Group();
      handGroup.name = isLeft ? 'LeftHand' : 'RightHand';

      // Palm
      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.062, 0.026), limbMat);
      handGroup.add(palm);

      // Thumb
      const thumb = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.009, 0.034, 8), limbMat);
      thumb.position.set(isLeft ? 0.024 : -0.024, 0.006, 0.014);
      thumb.rotation.z = isLeft ? -0.45 : 0.45;
      thumb.rotation.x = 0.3;
      handGroup.add(thumb);

      // Fingers contour
      const fingers = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), limbMat);
      fingers.scale.set(0.9, 0.7, 0.5);
      fingers.position.set(0, -0.032, 0);
      handGroup.add(fingers);

      return handGroup;
    };

    const shoulderOffset = 0.23 * shoulderW;
    const upperArmLen = 0.25 * h;
    const foreArmLen = 0.23 * h;
    const upperLegLen = 0.38 * h;
    const lowerLegLen = 0.38 * h;

    // --- LEFT ARM ---
    const leftArmGroup = new THREE.Group();
    leftArmGroup.name = 'Avatar_LeftArm';
    leftArmGroup.position.set(-shoulderOffset, 1.35 * h, 0);

    const leftShoulderJoint = makeJoint(0.058);
    leftArmGroup.add(leftShoulderJoint);

    const leftUpperArm = makeLimb('LeftUpperArm', 0.050, 0.042, upperArmLen);
    leftUpperArm.position.y = -upperArmLen / 2;
    leftArmGroup.add(leftUpperArm);

    const leftElbow = makeJoint(0.044);
    leftElbow.position.y = -upperArmLen;
    leftArmGroup.add(leftElbow);

    const leftForearm = makeLimb('LeftForearm', 0.042, 0.036, foreArmLen);
    leftForearm.position.y = -upperArmLen - (foreArmLen / 2);
    leftArmGroup.add(leftForearm);

    const leftHand = makeHand(true);
    leftHand.position.y = -upperArmLen - foreArmLen - 0.015;
    leftArmGroup.add(leftHand);

    // --- RIGHT ARM ---
    const rightArmGroup = new THREE.Group();
    rightArmGroup.name = 'Avatar_RightArm';
    rightArmGroup.position.set(shoulderOffset, 1.35 * h, 0);

    const rightShoulderJoint = makeJoint(0.058);
    rightArmGroup.add(rightShoulderJoint);

    const rightUpperArm = makeLimb('RightUpperArm', 0.050, 0.042, upperArmLen);
    rightUpperArm.position.y = -upperArmLen / 2;
    rightArmGroup.add(rightUpperArm);

    const rightElbow = makeJoint(0.044);
    rightElbow.position.y = -upperArmLen;
    rightArmGroup.add(rightElbow);

    const rightForearm = makeLimb('RightForearm', 0.042, 0.036, foreArmLen);
    rightForearm.position.y = -upperArmLen - (foreArmLen / 2);
    rightArmGroup.add(rightForearm);

    const rightHand = makeHand(false);
    rightHand.position.y = -upperArmLen - foreArmLen - 0.015;
    rightArmGroup.add(rightHand);

    // --- LEFT LEG ---
    const leftLegGroup = new THREE.Group();
    leftLegGroup.name = 'Avatar_LeftLeg';
    leftLegGroup.position.set(-0.11, 0.84 * h, 0);

    const leftHipJoint = makeJoint(0.065);
    leftLegGroup.add(leftHipJoint);

    const leftThigh = makeLimb('LeftThigh', 0.066, 0.050, upperLegLen);
    leftThigh.position.y = -upperLegLen / 2;
    leftLegGroup.add(leftThigh);

    const leftKnee = makeJoint(0.050);
    leftKnee.position.y = -upperLegLen;
    leftLegGroup.add(leftKnee);

    const leftCalf = makeLimb('LeftCalf', 0.050, 0.040, lowerLegLen);
    leftCalf.position.y = -upperLegLen - (lowerLegLen / 2);
    leftLegGroup.add(leftCalf);

    const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.076, 0.046, 0.15), limbMat);
    leftFoot.position.set(0, -upperLegLen - lowerLegLen - 0.02, 0.035);
    leftLegGroup.add(leftFoot);

    // --- RIGHT LEG ---
    const rightLegGroup = new THREE.Group();
    rightLegGroup.name = 'Avatar_RightLeg';
    rightLegGroup.position.set(0.11, 0.84 * h, 0);

    const rightHipJoint = makeJoint(0.065);
    rightLegGroup.add(rightHipJoint);

    const rightThigh = makeLimb('RightThigh', 0.066, 0.050, upperLegLen);
    rightThigh.position.y = -upperLegLen / 2;
    rightLegGroup.add(rightThigh);

    const rightKnee = makeJoint(0.050);
    rightKnee.position.y = -upperLegLen;
    rightLegGroup.add(rightKnee);

    const rightCalf = makeLimb('RightCalf', 0.050, 0.040, lowerLegLen);
    rightCalf.position.y = -upperLegLen - (lowerLegLen / 2);
    rightLegGroup.add(rightCalf);

    const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.076, 0.046, 0.15), limbMat);
    rightFoot.position.set(0, -upperLegLen - lowerLegLen - 0.02, 0.035);
    rightLegGroup.add(rightFoot);

    // Configure joint rotations per pose
    switch (pose) {
      case 't_pose':
        leftArmGroup.rotation.z = Math.PI / 2;
        rightArmGroup.rotation.z = -Math.PI / 2;
        break;

      case 'runway_model':
        // Elegant runway stance: right arm on hip, left arm relaxed
        rightArmGroup.rotation.z = -0.48;
        rightArmGroup.rotation.x = 0.22;
        leftArmGroup.rotation.z = 0.12;
        leftArmGroup.rotation.x = -0.12;
        leftLegGroup.rotation.z = -0.05;
        rightLegGroup.rotation.z = 0.03;
        rightLegGroup.rotation.x = -0.08;
        break;

      case 'casual_selfie':
        rightArmGroup.rotation.z = -1.5;
        rightArmGroup.rotation.y = 0.35;
        rightArmGroup.rotation.x = -0.55;
        leftArmGroup.rotation.z = 0.1;
        break;

      case 'hero_stance':
        leftArmGroup.rotation.z = 0.45;
        leftArmGroup.rotation.x = 0.25;
        rightArmGroup.rotation.z = -0.45;
        rightArmGroup.rotation.x = 0.25;
        leftLegGroup.rotation.z = 0.12;
        rightLegGroup.rotation.z = -0.12;
        break;

      case 'sitting':
        leftLegGroup.rotation.x = -Math.PI / 2;
        rightLegGroup.rotation.x = -Math.PI / 2;
        leftArmGroup.rotation.x = -0.45;
        rightArmGroup.rotation.x = -0.45;
        break;

      case 'peace_sign':
        rightArmGroup.rotation.z = -1.95;
        rightArmGroup.rotation.y = 0.28;
        leftArmGroup.rotation.z = 0.15;
        break;

      default:
        break;
    }

    // Store references for synchronized clothing rigging
    this.leftArmGroup = leftArmGroup;
    this.rightArmGroup = rightArmGroup;
    this.leftLegGroup = leftLegGroup;
    this.rightLegGroup = rightLegGroup;

    this.avatarGroup.add(leftArmGroup);
    this.avatarGroup.add(rightArmGroup);
    this.avatarGroup.add(leftLegGroup);
    this.avatarGroup.add(rightLegGroup);
  }

  // --- CLOTHING BUILDER ---
  public updateClothing(items: Record<string, ClothingItem>) {
    this.clothingItems = items;
    this.rebuildClothing();
  }

  public rebuildClothing() {
    while (this.clothingGroup.children.length > 0) {
      const obj = this.clothingGroup.children[0];
      this.clothingGroup.remove(obj);
    }

    const { bodyHeight, shoulderWidth, waistWidth } = this.avatarState;
    const seg = this.performanceSettings.reducedPolygons ? 12 : 24;

    // Rigged limb groups that match the avatar's limbs exactly
    const clothingLeftArm = new THREE.Group();
    clothingLeftArm.name = 'Clothing_LeftArm';
    if (this.leftArmGroup) {
      clothingLeftArm.position.copy(this.leftArmGroup.position);
      clothingLeftArm.rotation.copy(this.leftArmGroup.rotation);
    }

    const clothingRightArm = new THREE.Group();
    clothingRightArm.name = 'Clothing_RightArm';
    if (this.rightArmGroup) {
      clothingRightArm.position.copy(this.rightArmGroup.position);
      clothingRightArm.rotation.copy(this.rightArmGroup.rotation);
    }

    const clothingLeftLeg = new THREE.Group();
    clothingLeftLeg.name = 'Clothing_LeftLeg';
    if (this.leftLegGroup) {
      clothingLeftLeg.position.copy(this.leftLegGroup.position);
      clothingLeftLeg.rotation.copy(this.leftLegGroup.rotation);
    }

    const clothingRightLeg = new THREE.Group();
    clothingRightLeg.name = 'Clothing_RightLeg';
    if (this.rightLegGroup) {
      clothingRightLeg.position.copy(this.rightLegGroup.position);
      clothingRightLeg.rotation.copy(this.rightLegGroup.rotation);
    }

    this.clothingGroup.add(clothingLeftArm);
    this.clothingGroup.add(clothingRightArm);
    this.clothingGroup.add(clothingLeftLeg);
    this.clothingGroup.add(clothingRightLeg);

    Object.values(this.clothingItems).forEach((item) => {
      const mat = this.createClothingMaterial(item);

      switch (item.category) {
        case 'top':
          this.buildTopClothing(item, mat, bodyHeight, shoulderWidth, waistWidth, seg, clothingLeftArm, clothingRightArm);
          break;
        case 'bottom':
          this.buildBottomClothing(item, mat, bodyHeight, waistWidth, seg, clothingLeftLeg, clothingRightLeg);
          break;
        case 'shoes':
          this.buildShoes(item, mat, bodyHeight, seg, clothingLeftLeg, clothingRightLeg);
          break;
        case 'accessory':
          this.buildAccessory(item, mat, bodyHeight, seg);
          break;
      }
    });
  }

  private createClothingMaterial(item: ClothingItem): THREE.Material {
    const isWireframe = this.performanceSettings.wireframe;
    let baseColor = new THREE.Color(item.color);
    let roughness = item.roughness ?? 0.7;
    let metalness = item.metalness ?? 0.1;

    // Premium Material Enhancements
    if (item.material === 'liquid_chrome') {
      metalness = 0.95;
      roughness = 0.08;
      baseColor = new THREE.Color(0xf1f5f9);
    } else if (item.material === 'holographic') {
      metalness = 0.7;
      roughness = 0.2;
      baseColor = new THREE.Color(0x38bdf8);
    } else if (item.material === 'velvet') {
      roughness = 0.95;
      metalness = 0.02;
    } else if (item.material === 'silk') {
      roughness = 0.3;
      metalness = 0.15;
    }

    const mat = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness,
      metalness,
      wireframe: isWireframe,
      side: THREE.DoubleSide,
    });

    // Texture generation or custom pattern map
    let textureDataUrl = item.patternCanvasUrl;
    if (!textureDataUrl && item.pattern && item.pattern !== 'none') {
      const cacheKey = `${item.pattern}_${item.color}_${item.patternScale}`;
      if (this.textureCache.has(cacheKey)) {
        mat.map = this.textureCache.get(cacheKey)!;
      } else {
        const dataUrl = generatePatternCanvasUrl(item.pattern, '#ffffff', item.color, 512);
        const loader = new THREE.TextureLoader();
        loader.load(dataUrl, (tex) => {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(item.patternScale || 3, item.patternScale || 3);
          mat.map = tex;
          mat.needsUpdate = true;
          this.textureCache.set(cacheKey, tex);
        });
      }
    } else if (textureDataUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(textureDataUrl, (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(item.patternScale || 3, item.patternScale || 3);
        mat.map = tex;
        mat.needsUpdate = true;
      });
    }

    return mat;
  }

  private buildTopClothing(
    item: ClothingItem,
    mat: THREE.Material,
    h: number,
    shoulderW: number,
    waistW: number,
    seg: number,
    leftArmRig: THREE.Group,
    rightArmRig: THREE.Group
  ) {
    const group = new THREE.Group();
    group.name = `Clothing_${item.type}`;

    const puff = item.fit?.puffiness || 1.0;
    const len = item.fit?.length || 1.0;

    const topRadius = 0.31 * shoulderW * puff;
    const bottomRadius = 0.23 * waistW * puff;
    const topHeight = 0.38 * h * len;

    const bodyGeo = new THREE.CylinderGeometry(topRadius, bottomRadius, topHeight, seg);
    bodyGeo.scale(1.05, 1.0, 0.72);
    const bodyMesh = new THREE.Mesh(bodyGeo, mat);
    bodyMesh.position.set(0, 1.21 * h + (1 - len) * 0.06, 0);
    bodyMesh.name = item.name;
    group.add(bodyMesh);

    const upperArmLen = 0.25 * h;
    const foreArmLen = 0.23 * h;

    // Sleeves rigged directly to arms for synchronized rotation with ANY pose!
    if (item.type === 'hoodie' || item.type === 'jacket') {
      const sleeveRadius = 0.065 * puff;
      const sleeveGeo = new THREE.CylinderGeometry(sleeveRadius * 1.05, sleeveRadius * 0.95, upperArmLen * 1.04, seg);

      const sleeveL = new THREE.Mesh(sleeveGeo, mat);
      sleeveL.position.set(0, -upperArmLen / 2, 0);
      sleeveL.name = item.name;
      leftArmRig.add(sleeveL);

      const sleeveR = new THREE.Mesh(sleeveGeo, mat);
      sleeveR.position.set(0, -upperArmLen / 2, 0);
      sleeveR.name = item.name;
      rightArmRig.add(sleeveR);

      // Lower sleeve / forearm
      const foreSleeveGeo = new THREE.CylinderGeometry(sleeveRadius * 0.95, sleeveRadius * 0.85, foreArmLen * 0.92, seg);
      const foreSleeveL = new THREE.Mesh(foreSleeveGeo, mat);
      foreSleeveL.position.set(0, -upperArmLen - (foreArmLen * 0.46), 0);
      foreSleeveL.name = item.name;
      leftArmRig.add(foreSleeveL);

      const foreSleeveR = new THREE.Mesh(foreSleeveGeo, mat);
      foreSleeveR.position.set(0, -upperArmLen - (foreArmLen * 0.46), 0);
      foreSleeveR.name = item.name;
      rightArmRig.add(foreSleeveR);
    }

    // Hood or Collar
    if (item.type === 'hoodie') {
      // Hood rests comfortably behind the neck / upper back
      const hoodGeo = new THREE.SphereGeometry(0.24 * puff, seg, seg, 0, Math.PI * 2, 0, Math.PI / 1.7);
      hoodGeo.scale(1.05, 0.95, 0.85);
      const hood = new THREE.Mesh(hoodGeo, mat);
      hood.position.set(0, 1.38 * h, -0.10);
      hood.rotation.x = -0.45;
      hood.name = item.name;
      group.add(hood);
    } else if (item.type === 'jacket') {
      // Open collar lapels
      const lapelGeo = new THREE.BoxGeometry(0.09, 0.22, 0.03);
      const lapelL = new THREE.Mesh(lapelGeo, mat);
      lapelL.position.set(-0.13, 1.30 * h, 0.16);
      lapelL.rotation.z = -0.25;
      group.add(lapelL);

      const lapelR = new THREE.Mesh(lapelGeo, mat);
      lapelR.position.set(0.13, 1.30 * h, 0.16);
      lapelR.rotation.z = 0.25;
      group.add(lapelR);
    } else if (item.type === 'dress') {
      // Flowing lower dress skirt extension
      const skirtGeo = new THREE.CylinderGeometry(bottomRadius, 0.46 * puff, 0.54 * len, seg);
      const skirtMesh = new THREE.Mesh(skirtGeo, mat);
      skirtMesh.position.set(0, 0.78 * h, 0);
      skirtMesh.name = item.name;
      group.add(skirtMesh);
    }

    this.clothingGroup.add(group);
  }

  private buildBottomClothing(
    item: ClothingItem,
    mat: THREE.Material,
    h: number,
    waistW: number,
    seg: number,
    leftLegRig: THREE.Group,
    rightLegRig: THREE.Group
  ) {
    const group = new THREE.Group();
    group.name = `Clothing_${item.type}`;

    const puff = item.fit?.puffiness || 1.0;
    const len = item.fit?.length || 1.0;
    const upperLegLen = 0.38 * h;
    const lowerLegLen = 0.38 * h;

    if (item.type === 'skirt' || item.type === 'pleated_skirt') {
      const isPleated = item.type === 'pleated_skirt';
      const skirtGeo = new THREE.CylinderGeometry(
        0.26 * waistW,
        0.44 * waistW * puff,
        0.33 * h * len,
        isPleated ? 32 : seg
      );
      const skirt = new THREE.Mesh(skirtGeo, mat);
      skirt.position.set(0, 0.88 * h, 0);
      skirt.name = item.name;
      group.add(skirt);
    } else {
      // Pants, Cargo pants, Jeans rigged directly to leg bones
      const pantRadius = (item.type === 'cargo_pants' ? 0.078 : 0.070) * puff;

      // Upper thighs
      const upperGeo = new THREE.CylinderGeometry(pantRadius * 1.08, pantRadius * 0.96, upperLegLen * 1.02, seg);
      const upperL = new THREE.Mesh(upperGeo, mat);
      upperL.position.set(0, -upperLegLen / 2, 0);
      upperL.name = item.name;
      leftLegRig.add(upperL);

      const upperR = new THREE.Mesh(upperGeo, mat);
      upperR.position.set(0, -upperLegLen / 2, 0);
      upperR.name = item.name;
      rightLegRig.add(upperR);

      // Lower calves
      const lowerGeo = new THREE.CylinderGeometry(pantRadius * 0.96, pantRadius * 0.90, lowerLegLen * 1.02, seg);
      const lowerL = new THREE.Mesh(lowerGeo, mat);
      lowerL.position.set(0, -upperLegLen - (lowerLegLen / 2), 0);
      lowerL.name = item.name;
      leftLegRig.add(lowerL);

      const lowerR = new THREE.Mesh(lowerGeo, mat);
      lowerR.position.set(0, -upperLegLen - (lowerLegLen / 2), 0);
      lowerR.name = item.name;
      rightLegRig.add(lowerR);

      // Pockets for cargo pants
      if (item.type === 'cargo_pants') {
        const pocketGeo = new THREE.BoxGeometry(0.035, 0.09, 0.08);
        const pL = new THREE.Mesh(pocketGeo, mat);
        pL.position.set(-0.075, -upperLegLen / 2, 0);
        leftLegRig.add(pL);

        const pR = new THREE.Mesh(pocketGeo, mat);
        pR.position.set(0.075, -upperLegLen / 2, 0);
        rightLegRig.add(pR);
      }
    }

    this.clothingGroup.add(group);
  }

  private buildShoes(
    item: ClothingItem,
    mat: THREE.Material,
    h: number,
    seg: number,
    leftLegRig: THREE.Group,
    rightLegRig: THREE.Group
  ) {
    const group = new THREE.Group();
    group.name = `Clothing_${item.type}`;

    const soleMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    const isBoot = item.type === 'boots';
    const shoeLen = 0.18;
    const shoeHeight = isBoot ? 0.18 : 0.085;
    const upperLegLen = 0.38 * h;
    const lowerLegLen = 0.38 * h;
    const footY = -upperLegLen - lowerLegLen - 0.015;

    // Left shoe rigged to left leg
    const shoeGeoL = new THREE.BoxGeometry(0.092, shoeHeight, shoeLen);
    const shoeL = new THREE.Mesh(shoeGeoL, mat);
    shoeL.position.set(0, footY, 0.035);
    shoeL.name = item.name;
    leftLegRig.add(shoeL);

    const soleGeoL = new THREE.BoxGeometry(0.098, 0.025, shoeLen + 0.015);
    const soleL = new THREE.Mesh(soleGeoL, soleMat);
    soleL.position.set(0, footY - (shoeHeight / 2), 0.035);
    leftLegRig.add(soleL);

    // Right shoe rigged to right leg
    const shoeGeoR = new THREE.BoxGeometry(0.092, shoeHeight, shoeLen);
    const shoeR = new THREE.Mesh(shoeGeoR, mat);
    shoeR.position.set(0, footY, 0.035);
    shoeR.name = item.name;
    rightLegRig.add(shoeR);

    const soleGeoR = new THREE.BoxGeometry(0.098, 0.025, shoeLen + 0.015);
    const soleR = new THREE.Mesh(soleGeoR, soleMat);
    soleR.position.set(0, footY - (shoeHeight / 2), 0.035);
    rightLegRig.add(soleR);

    this.clothingGroup.add(group);
  }

  private buildAccessory(item: ClothingItem, mat: THREE.Material, h: number, seg: number) {
    const group = new THREE.Group();
    group.name = `Accessory_${item.type}`;

    if (item.type === 'headphones') {
      const bandGeo = new THREE.TorusGeometry(0.25, 0.022, 8, 24, Math.PI);
      const band = new THREE.Mesh(bandGeo, mat);
      band.position.set(0, 1.60 * h, 0);
      band.rotation.x = -Math.PI / 2;
      group.add(band);

      const cupGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.05, 16);
      cupGeo.rotateZ(Math.PI / 2);

      const cupL = new THREE.Mesh(cupGeo, mat);
      cupL.position.set(-0.24, 1.54 * h, 0);
      group.add(cupL);

      const cupR = new THREE.Mesh(cupGeo, mat);
      cupR.position.set(0.24, 1.54 * h, 0);
      group.add(cupR);
    } else if (item.type === 'cyber_wings') {
      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, 0);
      wingShape.lineTo(0.65, 0.45);
      wingShape.lineTo(0.55, 0.1);
      wingShape.lineTo(0.85, 0.2);
      wingShape.lineTo(0.2, -0.3);
      wingShape.closePath();

      const extrudeSettings = { depth: 0.02, bevelEnabled: true, bevelThickness: 0.01 };
      const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);

      const wingL = new THREE.Mesh(wingGeo, mat);
      wingL.position.set(-0.06, 1.25 * h, -0.16);
      wingL.rotation.y = -0.3;
      group.add(wingL);

      const wingR = new THREE.Mesh(wingGeo, mat);
      wingR.position.set(0.06, 1.25 * h, -0.16);
      wingR.rotation.y = Math.PI + 0.3;
      group.add(wingR);
    } else if (item.type === 'glasses') {
      const frameGeo = new THREE.BoxGeometry(0.24, 0.045, 0.015);
      const frame = new THREE.Mesh(frameGeo, mat);
      frame.position.set(0, 1.54 * h, 0.21);
      group.add(frame);
    } else if (item.type === 'beret') {
      const beretGeo = new THREE.CylinderGeometry(0.28, 0.20, 0.07, 24);
      const beret = new THREE.Mesh(beretGeo, mat);
      beret.position.set(0.05, 1.74 * h, -0.02);
      beret.rotation.z = -0.25;
      group.add(beret);
    }

    this.clothingGroup.add(group);
  }

  // --- 3D MODELING BASIC TOOLS ---
  public addPrimitive(type: 'cube' | 'cylinder' | 'cloth_patch') {
    let geo: THREE.BufferGeometry;
    if (type === 'cube') {
      geo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    } else if (type === 'cylinder') {
      geo = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 16);
    } else {
      geo = new THREE.PlaneGeometry(0.35, 0.35, 8, 8);
    }

    const mat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      roughness: 0.5,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0.4, 1.1, 0.3);
    mesh.name = `Custom_${type}_${Date.now().toString().slice(-4)}`;
    this.primitivesGroup.add(mesh);
    this.selectedPart = mesh.name;
    this.onSelectPart?.(mesh.name);
    return mesh.name;
  }

  public transformSelectedObject(action: 'moveX' | 'moveY' | 'scale' | 'rotateY', delta: number) {
    if (!this.selectedPart) return;

    let target: THREE.Object3D | null = null;
    this.rootGroup.traverse((child) => {
      if (child.name === this.selectedPart) {
        target = child;
      }
    });

    if (target) {
      const obj = target as THREE.Object3D;
      switch (action) {
        case 'moveX':
          obj.position.x += delta;
          break;
        case 'moveY':
          obj.position.y += delta;
          break;
        case 'scale':
          obj.scale.multiplyScalar(1 + delta);
          break;
        case 'rotateY':
          obj.rotation.y += delta;
          break;
      }
    }
  }

  // --- LIGHTING ---
  public applyLighting(presetOrConfig: LightingPreset | StudioLighting) {
    let config: StudioLighting;
    if (typeof presetOrConfig === 'string') {
      config = {
        preset: presetOrConfig,
        intensity: 1.2,
        ambientIntensity: 0.6,
        mainColor: '#ffffff',
        rimColor: '#e0e7ff',
        showShadows: !this.performanceSettings.batterySaver && this.performanceSettings.mode !== 'low',
      };
      if (presetOrConfig === 'sunset') {
        config.mainColor = '#f59e0b';
        config.rimColor = '#ec4899';
        config.ambientIntensity = 0.5;
      } else if (presetOrConfig === 'cyber') {
        config.mainColor = '#06b6d4';
        config.rimColor = '#f43f5e';
        config.ambientIntensity = 0.3;
      } else if (presetOrConfig === 'neon') {
        config.mainColor = '#22c55e';
        config.rimColor = '#a855f7';
        config.ambientIntensity = 0.4;
      } else if (presetOrConfig === 'soft') {
        config.mainColor = '#fffbeb';
        config.rimColor = '#fef3c7';
        config.ambientIntensity = 0.85;
      } else if (presetOrConfig === 'rim') {
        config.mainColor = '#38bdf8';
        config.rimColor = '#ffffff';
        config.intensity = 1.6;
        config.ambientIntensity = 0.2;
      }
    } else {
      config = presetOrConfig;
    }

    this.lightingState = config;
    this.ambientLight.intensity = config.ambientIntensity;
    this.ambientLight.color.set(config.mainColor);

    this.keyLight.intensity = config.intensity;
    this.keyLight.color.set(config.mainColor);

    this.rimLight.intensity = config.intensity * 0.9;
    this.rimLight.color.set(config.rimColor);
  }

  // --- PERFORMANCE SETTINGS ---
  public setPerformanceSettings(settings: PerformanceSettings) {
    this.performanceSettings = settings;
    const pixelRatio =
      settings.mode === 'low' || settings.batterySaver ? 1.0 : Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(pixelRatio);
  }

  // --- RENDERING & EXPORTS ---
  public captureRenderImage(transparent = false): string {
    const prevBg = this.scene.background;
    if (transparent) {
      this.scene.background = null;
    }
    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');
    this.scene.background = prevBg;
    return dataUrl;
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / (height || 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private startLoop() {
    let lastTime = performance.now();
    const fpsInterval = 1000 / (this.performanceSettings.fpsLimit || 60);

    const animate = (currentTime: number) => {
      if (this.isDestroyed) return;
      this.animationFrameId = requestAnimationFrame(animate);

      const elapsed = currentTime - lastTime;
      if (elapsed > fpsInterval) {
        lastTime = currentTime - (elapsed % fpsInterval);

        if (this.isTurntableActive) {
          this.rootGroup.rotation.y += this.turntableSpeed;
        }

        this.renderer.render(this.scene, this.camera);
      }
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.renderer.dispose();
  }
}
