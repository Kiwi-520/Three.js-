import * as THREE from "three"; // Import the THREE.js library
import { OrbitControls } from 'jsm/controls/OrbitControls.js'; // Import the OrbitControls class from the controls module

import getStarfield from "./src/getStarfield.js"; // Import the getStarfield function from the local file
import { getFresnelMat } from "./src/getFresnelMat.js"; // Import the getFresnelMat function from the local file

// Set the width and height for the renderer
const w = window.innerWidth;
const h = window.innerHeight;

// Create a new THREE.js scene
const scene = new THREE.Scene();

// Create a perspective camera with field of view, aspect ratio, near and far clipping planes
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5; // Position the camera

// Create a WebGL renderer with antialiasing enabled
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h); // Set the size of the renderer
document.body.appendChild(renderer.domElement); // Append the renderer's DOM element to the body

// Optional color management setting, commented out
// THREE.ColorManagement.enabled = true;

// Set tone mapping and color space for the renderer
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

// Create a group to hold the Earth and its related objects
const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180; // Tilt the group to simulate Earth's axial tilt
scene.add(earthGroup); // Add the group to the scene

// Add orbit controls to allow camera movement with mouse interaction
new OrbitControls(camera, renderer.domElement);

const detail = 12; // Detail level for the geometry

// Create a texture loader to load textures
const loader = new THREE.TextureLoader();

// Create an icosahedron geometry with a radius of 1 and specified detail
const geometry = new THREE.IcosahedronGeometry(1, detail);

// Create a material for the Earth with various maps (textures)
const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/00_earthmap1k.jpg"), // Color map
  specularMap: loader.load("./textures/02_earthspec1k.jpg"), // Specular map
  bumpMap: loader.load("./textures/01_earthbump1k.jpg"), // Bump map for surface details
  bumpScale: 0.04, // Scale of the bump map effect
});

// Create a mesh for the Earth using the geometry and material
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh); // Add the Earth mesh to the group

// Create a material for the city lights using a basic material with additive blending
const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/03_earthlights1k.jpg"), // City lights map
  blending: THREE.AdditiveBlending, // Use additive blending for glow effect
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat); // Create a mesh for the lights
earthGroup.add(lightsMesh); // Add the lights mesh to the group

// Create a material for the clouds with transparency and blending
const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/04_earthcloudmap.jpg"), // Clouds map
  transparent: true, // Enable transparency
  opacity: 0.8, // Set opacity
  blending: THREE.AdditiveBlending, // Use additive blending
  alphaMap: loader.load('./textures/05_earthcloudmaptrans.jpg'), // Alpha map for transparency
  // alphaTest: 0.3, // Optional alpha test value, commented out
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat); // Create a mesh for the clouds
cloudsMesh.scale.setScalar(1.003); // Slightly scale up the clouds mesh to fit around the Earth
earthGroup.add(cloudsMesh); // Add the clouds mesh to the group

// Create a fresnel material for the atmospheric glow
const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat); // Create a mesh for the glow
glowMesh.scale.setScalar(1.01); // Scale up the glow mesh to fit around the Earth and clouds
earthGroup.add(glowMesh); // Add the glow mesh to the group

// Generate and add the starfield to the scene
const stars = getStarfield({numStars: 2000});
scene.add(stars);

// Create a directional light to simulate sunlight
const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5); // Position the sunlight
scene.add(sunLight);

// Animation loop to render the scene
function animate() {
  requestAnimationFrame(animate); // Request the next frame

  // Rotate the Earth and its elements
  earthMesh.rotation.y += 0.002;
  lightsMesh.rotation.y += 0.002;
  cloudsMesh.rotation.y += 0.0023;
  glowMesh.rotation.y += 0.002;
  stars.rotation.y -= 0.0002; // Rotate the starfield

  renderer.render(scene, camera); // Render the scene from the perspective of the camera
}

animate(); // Start the animation loop

// Handle window resize events
function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight; // Update camera aspect ratio
  camera.updateProjectionMatrix(); // Update camera projection matrix
  renderer.setSize(window.innerWidth, window.innerHeight); // Update renderer size
}
window.addEventListener('resize', handleWindowResize, false); // Add event listener for resize
