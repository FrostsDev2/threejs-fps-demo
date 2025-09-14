// Three.js FPS Demo - Minimal Starter
let camera, scene, renderer, controls;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let canJump = false;
const objects = [];

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222233);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(1, 10, 2);
  scene.add(light);

  // Floor
  const floorGeometry = new THREE.PlaneGeometry(100, 100);
  const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // A few boxes to shoot at
  for (let i = 0; i < 10; i++) {
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    const boxMaterial = new THREE.MeshPhongMaterial({ color: 0x44aa55 });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(Math.random() * 60 - 30, 1, Math.random() * 60 - 30);
    scene.add(box);
    objects.push(box);
  }

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Pointer Lock Controls
  controls = new THREE.PointerLockControls(camera, renderer.domElement);
  camera.position.y = 2;

  document.getElementById('instructions').addEventListener('click', function () {
    controls.lock();
  });

  controls.addEventListener('lock', function () {
    document.getElementById('instructions').style.display = 'none';
  });
  controls.addEventListener('unlock', function () {
    document.getElementById('instructions').style.display = '';
  });

  window.addEventListener('resize', onWindowResize);

  // Movement controls
  const onKeyDown = function (event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW': moveForward = true; break;
      case 'ArrowLeft':
      case 'KeyA': moveLeft = true; break;
      case 'ArrowDown':
      case 'KeyS': moveBackward = true; break;
      case 'ArrowRight':
      case 'KeyD': moveRight = true; break;
      case 'Space':
        if (canJump === true) velocity.y += 5;
        canJump = false;
        break;
    }
  };
  const onKeyUp = function (event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW': moveForward = false; break;
      case 'ArrowLeft':
      case 'KeyA': moveLeft = false; break;
      case 'ArrowDown':
      case 'KeyS': moveBackward = false; break;
      case 'ArrowRight':
      case 'KeyD': moveRight = false; break;
    }
  };
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  // Shooting
  document.addEventListener('mousedown', function (event) {
    if (controls.isLocked && event.button === 0) shoot();
  });
}

function shoot() {
  // Raycasting for shooting
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const intersects = raycaster.intersectObjects(objects, false);
  if (intersects.length > 0) {
    intersects[0].object.material.color.set(0xff0000);
    // Remove the object after hit
    setTimeout(() => {
      scene.remove(intersects[0].object);
      const idx = objects.indexOf(intersects[0].object);
      if (idx > -1) objects.splice(idx, 1);
    }, 150);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (controls.isLocked === true) {
    // Simple movement
    let delta = 0.08; // Fixed time step for simplicity
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 5.0 * delta; // gravity

    let direction = new THREE.Vector3();
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward) velocity.z -= direction.z * 50.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 50.0 * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    camera.position.y += velocity.y * delta;

    if (camera.position.y < 2) {
      velocity.y = 0;
      camera.position.y = 2;
      canJump = true;
    }
  }

  renderer.render(scene, camera);
}
