import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface BiometricRequest {
  userId: string;
  biometricData: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, biometricData }: BiometricRequest = await req.json();

    // Simulate Face ID authentication scenarios
    const faceIdSuccess = Math.random() > 0.25; // 75% success rate for demo
    
    let response;
    
    if (userId === "demo-user") {
      // Predefined scenarios for testing
      const minute = new Date().getMinutes();
      
      if (minute % 4 === 0) {
        response = { success: false, message: "Face not recognized - please position face in frame" };
      } else if (minute % 6 === 0) {
        response = { success: false, message: "Insufficient lighting - please move to better lit area" };
      } else if (minute % 8 === 0) {
        response = { success: false, message: "Camera access denied - please check permissions" };
      } else if (minute % 10 === 0) {
        response = { success: false, message: "Multiple faces detected - ensure only one person in frame" };
      } else {
        response = { 
          success: true, 
          message: "Face ID authentication successful",
          userId: "demo-user",
          authMethod: "face",
          confidence: 0.95,
          timestamp: new Date().toISOString()
        };
      }
    } else {
      response = faceIdSuccess 
        ? { 
            success: true, 
            message: "Face ID authentication successful",
            userId,
            authMethod: "face",
            confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
            timestamp: new Date().toISOString()
          }
        : { success: false, message: "Face not recognized" };
    }

    // Simulate Face ID processing delay (typically longer than fingerprint)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1500));

    // Log biometric attempt for AI analysis
    console.log(`[AUTH-FACE] ${new Date().toISOString()} - User: ${userId}, Success: ${response.success}, Confidence: ${response.confidence || 'N/A'}`);

    return new Response(
      JSON.stringify(response),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: response.success ? 200 : 401
      }
    );

  } catch (error) {
    console.error('[AUTH-FACE] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Face ID sensor error" 
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
});