import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Helper to convert hex string to ArrayBuffer
function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer as ArrayBuffer;
}

// Helper to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

async function getEncryptionKey(): Promise<CryptoKey> {
  const keyHex = Deno.env.get("SSN_ENCRYPTION_KEY");
  if (!keyHex || keyHex.length !== 64) {
    throw new Error("Invalid SSN_ENCRYPTION_KEY - must be 64 hex characters (256 bits)");
  }
  
  const keyBuffer = hexToArrayBuffer(keyHex);
  return await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptSSN(ssn: string): Promise<string> {
  const key = await getEncryptionKey();
  
  // Generate random 12-byte IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encode SSN as UTF-8
  const encoder = new TextEncoder();
  const ssnBytes = encoder.encode(ssn);
  
  // Encrypt with AES-256-GCM
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    ssnBytes
  );
  
  // Format: base64(iv):base64(ciphertext+authTag)
  return `${arrayBufferToBase64(iv.buffer as ArrayBuffer)}:${arrayBufferToBase64(ciphertext)}`;
}

async function decryptSSN(encryptedSSN: string): Promise<string> {
  // SECURITY: Reject plaintext SSNs - all SSNs must be encrypted
  // The encrypted format is: base64(iv):base64(ciphertext)
  if (!encryptedSSN.includes(':')) {
    console.error("[ssn-crypto] SECURITY: Attempted to decrypt plaintext SSN - this should not happen. Run migration to encrypt all SSNs.");
    throw new Error("Invalid encrypted SSN format - plaintext SSNs are not accepted. Please run SSN migration.");
  }
  
  const key = await getEncryptionKey();
  
  // Parse format: base64(iv):base64(ciphertext+authTag)
  const parts = encryptedSSN.split(':');
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted SSN format");
  }
  
  const ivBuffer = base64ToArrayBuffer(parts[0]);
  const ciphertextWithTag = base64ToArrayBuffer(parts[1]);
  
  // Decrypt with AES-256-GCM (automatically verifies auth tag)
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBuffer },
    key,
    ciphertextWithTag
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ssn } = await req.json();
    
    if (!action || !ssn) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: action and ssn" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "encrypt") {
      // Validate SSN format (9 digits)
      const cleanSSN = ssn.replace(/\D/g, '');
      if (cleanSSN.length !== 9) {
        return new Response(
          JSON.stringify({ error: "Invalid SSN format - must be 9 digits" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const encrypted = await encryptSSN(cleanSSN);
      console.log("[ssn-crypto] SSN encrypted successfully");
      
      return new Response(
        JSON.stringify({ encrypted }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (action === "decrypt") {
      // For decryption, verify admin role via JWT
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Authorization required for decryption" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      
      // Verify user and check admin role
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: "Invalid authentication" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check admin role using service role client
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      
      const { data: roleData, error: roleError } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      if (roleError || !roleData) {
        console.log("[ssn-crypto] Unauthorized decryption attempt by user:", user.id);
        return new Response(
          JSON.stringify({ error: "Admin role required for SSN decryption" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const decrypted = await decryptSSN(ssn);
      console.log("[ssn-crypto] SSN decrypted by admin:", user.id);
      
      return new Response(
        JSON.stringify({ decrypted }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (action === "migrate") {
      // Migrate all plaintext SSNs to encrypted format - admin only
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Authorization required for migration" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      
      // Verify user and check admin role
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: "Invalid authentication" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check admin role
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      
      const { data: roleData, error: roleError } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      if (roleError || !roleData) {
        console.log("[ssn-crypto] Unauthorized migration attempt by user:", user.id);
        return new Response(
          JSON.stringify({ error: "Admin role required for SSN migration" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Fetch all customer applications with SSN
      const { data: applications, error: fetchError } = await adminClient
        .from("customer_applications")
        .select("id, ssn")
        .not("ssn", "is", null);
      
      if (fetchError) {
        console.error("[ssn-crypto] Error fetching applications:", fetchError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch applications" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      let migrated = 0;
      let skipped = 0;
      let errors = 0;
      
      for (const app of applications || []) {
        // Skip if already encrypted (contains colon) or null/empty
        if (!app.ssn || app.ssn.includes(':')) {
          skipped++;
          continue;
        }
        
        // Skip if not a valid 9-digit SSN
        const cleanSSN = app.ssn.replace(/\D/g, '');
        if (cleanSSN.length !== 9) {
          console.log(`[ssn-crypto] Skipping invalid SSN format for app ${app.id}`);
          skipped++;
          continue;
        }
        
        try {
          const encrypted = await encryptSSN(cleanSSN);
          
          const { error: updateError } = await adminClient
            .from("customer_applications")
            .update({ ssn: encrypted })
            .eq("id", app.id);
          
          if (updateError) {
            console.error(`[ssn-crypto] Error updating app ${app.id}:`, updateError);
            errors++;
          } else {
            migrated++;
          }
        } catch (encryptError) {
          console.error(`[ssn-crypto] Error encrypting SSN for app ${app.id}:`, encryptError);
          errors++;
        }
      }
      
      console.log(`[ssn-crypto] Migration complete by admin ${user.id}: ${migrated} migrated, ${skipped} skipped, ${errors} errors`);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          migrated,
          skipped,
          errors,
          total: applications?.length || 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Invalid action - must be 'encrypt', 'decrypt', or 'migrate'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (err) {
    const error = err as Error;
    console.error("[ssn-crypto] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
