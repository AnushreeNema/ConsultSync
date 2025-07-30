// lib/vision.ts
import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient({
  keyFilename: "gcloud-key.json", // or set GOOGLE_APPLICATION_CREDENTIALS env var
});

export default client;
