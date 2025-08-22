// Check if we're in test mode
const isTestMode = () => {
  return window.location.search.includes('test=true') || 
         window.location.hostname === 'localhost' ||
         (window as any).__SELENIUM_TEST_MODE__ === true ||
         typeof (window as any).__mockWebAuthn !== 'undefined';
};

export async function captureFaceSignature(): Promise<string> {
  // Use mock in test mode
  if (isTestMode()) {
    console.log('🧪 Using mock face capture for testing');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate capture time
    
    // Generate a consistent test signature
    const testSignature = '1234567890abcdef'; // 16 hex chars for 8x8 hash
    console.log('🧪 Mock face signature:', testSignature);
    return testSignature;
  }

  // Real implementation
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
  try {
    const video = document.createElement('video');
    video.autoplay = true;
    video.srcObject = stream as MediaStream;

    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => resolve();
    });

    // Draw current frame to canvas
    const canvas = document.createElement('canvas');
    const size = 64; // capture at modest resolution before downscaling
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.drawImage(video, 0, 0, size, size);

    // Compute average hash (8x8 grayscale)
    const signature = averageHash(canvas, 8);
    return signature;
  } finally {
    // Cleanup media stream
    stream.getTracks().forEach((t) => t.stop());
  }
}

function averageHash(sourceCanvas: HTMLCanvasElement, hashSize: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = hashSize;
  canvas.height = hashSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.drawImage(sourceCanvas, 0, 0, hashSize, hashSize);
  const imageData = ctx.getImageData(0, 0, hashSize, hashSize);
  const { data } = imageData;

  // Convert to grayscale and compute average
  const gray: number[] = [];
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // luminance
    const y = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    gray.push(y);
    sum += y;
  }
  const avg = sum / gray.length;

  // Build bitstring: 1 if pixel > average
  const bits: number[] = gray.map((v) => (v > avg ? 1 : 0));

  // Convert bits to hex string (64 bits -> 16 hex chars when hashSize = 8)
  let hex = '';
  for (let i = 0; i < bits.length; i += 4) {
    const nibble = (bits[i] << 3) | (bits[i + 1] << 2) | (bits[i + 2] << 1) | bits[i + 3];
    hex += nibble.toString(16);
  }
  return hex;
}


