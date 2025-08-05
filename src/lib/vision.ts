// lib/vision.ts
import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient({
  keyFilename: "gcloud-key.json",
});

export default client;
