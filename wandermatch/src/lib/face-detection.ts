import * as faceapi from "@vladmandic/face-api";

let isInitialized = false;

export async function loadFaceDetectionModels() {
  if (isInitialized) return;

  try {
    const MODEL_URL = "/models";
    
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    
    isInitialized = true;
    console.log("Face API models loaded successfully");
  } catch (error) {
    console.error("Failed to load Face API models:", error);
    throw error;
  }
}

export async function detectFacesInImage(imageElement: HTMLImageElement) {
  if (!isInitialized) await loadFaceDetectionModels();

  const detections = await faceapi
    .detectAllFaces(imageElement)
    .withFaceLandmarks()
    .withFaceDescriptors();

  return detections.map((d) => ({
    bbox: {
      x: d.detection.box.x,
      y: d.detection.box.y,
      w: d.detection.box.width,
      h: d.detection.box.height,
    },
    // Convert Float32Array to regular array for JSON serialization
    descriptor: Array.from(d.descriptor),
  }));
}

// Compute Euclidean distance between two face descriptors to see if they are the same person
export function isSamePerson(desc1: number[], desc2: number[], threshold = 0.6) {
  const d1 = new Float32Array(desc1);
  const d2 = new Float32Array(desc2);
  const distance = faceapi.euclideanDistance(d1, d2);
  return distance < threshold;
}
