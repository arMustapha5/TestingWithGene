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

    // Simulate fingerprint authentication scenarios
    const fingerprintSuccess = Math.random() > 0.3; // 70% success rate for demo
    
    let response;
    
    if (userId === "demo-user") {
      // Predefined scenarios for testing
      const hour = new Date().getHours();
      
      if (hour % 3 === 0) {
        response = { success: false, message: "Fingerprint not recognized - please try again" };
      } else if (hour % 5 === 0) {
        response = { success: false, message: "Sensor malfunction - please clean sensor and retry" };
      } else if (hour % 7 === 0) {
        response = { success: false, message: "Permission denied - biometric access not authorized" };
      } else {
        response = { 
          success: true, 
          message: "Fingerprint authentication successful",
          userId: "demo-user",
          authMethod: "fingerprint",
          timestamp: new Date().toISOString()
        };
      }
    } else {
      response = fingerprintSuccess 
        ? { 
            success: true, 
            message: "Fingerprint authentication successful",
            userId,
            authMethod: "fingerprint",
            timestamp: new Date().toISOString()
          }
        : { success: false, message: "Fingerprint not recognized" };
    }

    // Simulate biometric processing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    // Log biometric attempt for AI analysis
    console.log(`[AUTH-FINGERPRINT] ${new Date().toISOString()} - User: ${userId}, Success: ${response.success}, BiometricData: ${biometricData?.substring(0, 20)}...`);

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
    console.error('[AUTH-FINGERPRINT] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Biometric sensor error" 
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