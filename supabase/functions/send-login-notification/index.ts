import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LoginNotificationRequest {
  email: string;
  loginTime: string;
  deviceInfo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, loginTime, deviceInfo }: LoginNotificationRequest = await req.json();

    // Create Supabase client for logging
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log the login notification (in production, integrate with email service)
    console.log(`Login notification for ${email} at ${loginTime}`);
    console.log(`Device info: ${deviceInfo || "Unknown"}`);

    // For now, we'll just log the notification
    // To send actual emails, you would integrate with Resend:
    // 
    // const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    // await resend.emails.send({
    //   from: "StudyBuddyFinder <notifications@yourdomain.com>",
    //   to: [email],
    //   subject: "New Login to Your StudyBuddyFinder Account",
    //   html: `
    //     <h1>New Login Detected</h1>
    //     <p>Hello,</p>
    //     <p>We noticed a new login to your StudyBuddyFinder account.</p>
    //     <p><strong>Time:</strong> ${loginTime}</p>
    //     <p><strong>Device:</strong> ${deviceInfo || "Unknown"}</p>
    //     <p>If this wasn't you, please secure your account immediately.</p>
    //   `,
    // });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Login notification logged successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-login-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
