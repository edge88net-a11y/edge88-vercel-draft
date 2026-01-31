import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const API_BASE_URL = "https://api.edge88.net/api/v1";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint") || "predictions/active";
    const params = url.searchParams.get("params") || "";
    
    const apiUrl = `${API_BASE_URL}/${endpoint}${params ? `?${params}` : ""}`;
    
    console.log(`Proxying request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Edge88-Frontend/1.0",
      },
    });
    
    if (!response.ok) {
      console.error(`API returned ${response.status}: ${response.statusText}`);
      
      // Return error status - NO FAKE DATA
      return new Response(JSON.stringify({
        success: false,
        error: `API returned ${response.status}: ${response.statusText}`,
        status: response.status,
        maintenance: true,
      }), {
        status: 503, // Service Unavailable
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const data = await response.json();
    console.log(`API returned successfully with ${Array.isArray(data) ? data.length : 'object'} result(s)`);
    
    return new Response(JSON.stringify({
      success: true,
      ...data,
      data: data,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Proxy error:", errorMessage);
    
    // Return error - NO FAKE DATA
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      maintenance: true,
    }), {
      status: 503, // Service Unavailable
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
