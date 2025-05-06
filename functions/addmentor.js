// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js";
console.info('server started');
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      }
    });
  }

  const {email,firstname,lastname,password} = await req.json();

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // 1. Admin: Create User via REST API
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true, // <---- ✅ This marks email as verified!
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    return new Response(JSON.stringify({ error: err }), { status: 500 });
  }

  const user = await response.json();

  // 2. Insert into userprofile table
  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        user_id: user.id, // ← Foreign key to auth.users.id
        first_name: first_name,
        last_name: last_name,
        email: email,
        role:'mentor',
        phone:phone,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
        return new Response(JSON.stringify({ error }), { status: 500 ,    headers: {
            'Content-Type': 'application/json',
            'Connection': 'keep-alive',
            "Access-Control-Allow-Origin": "*"
          }});
      }
    
      return new Response(JSON.stringify({ success: true, user, profile: data }),{    headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
        "Access-Control-Allow-Origin": "*"
      }});
});
