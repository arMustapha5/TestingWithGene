import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface AuthRequest {
  username: string;
  password: string;
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
    const { username, password }: AuthRequest = await req.json();

    // Simulate various authentication scenarios
    const scenarios = [
      { condition: () => username === "admin" && password === "admin123", result: { success: true, message: "Authentication successful", userId: "admin-001" }},
      { condition: () => username === "user" && password === "password", result: { success: true, message: "Authentication successful", userId: "user-001" }},
      { condition: () => username === "testuser" && password === "test123", result: { success: true, message: "Authentication successful", userId: "test-001" }},
      { condition: () => username === "demo" && password === "demo", result: { success: true, message: "Authentication successful", userId: "demo-001" }},
      { condition: () => username === "fail", result: { success: false, message: "Invalid credentials" }},
      { condition: () => username === "network", result: { success: false, message: "Network timeout - please try again" }},
      { condition: () => username === "locked", result: { success: false, message: "Account temporarily locked" }},
    ];

    // Find matching scenario
    const scenario = scenarios.find(s => s.condition());
    const response = scenario ? scenario.result : { success: false, message: "Invalid username or password" };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // Log authentication attempt for AI analysis
    console.log(`[AUTH-PASSWORD] ${new Date().toISOString()} - User: ${username}, Success: ${response.success}, IP: ${req.headers.get('x-forwarded-for') || 'unknown'}`);

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
    console.error('[AUTH-PASSWORD] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Internal server error" 
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