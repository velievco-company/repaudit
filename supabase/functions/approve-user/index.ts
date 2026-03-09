// supabase/functions/approve-user/index.ts
// Edge Function — called from admin panel to approve/reject users
// Also sends notification email to admin on new signup

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = 'velievco@gmail.com';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'RepAudit <noreply@repaudit.app>', to, subject, html }),
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const client = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { action, userId } = await req.json();
  // action: 'notify_admin' | 'approve' | 'reject'

  // Verify caller is admin (for approve/reject)
  if (action === 'approve' || action === 'reject') {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await client.auth.getUser(token!);
    const { data: profile } = await client.from('profiles').select('email').eq('id', user?.id).single();
    if (profile?.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403, headers: corsHeaders });
    }
  }

  if (action === 'notify_admin') {
    // Called after signup — notify admin
    const { data: profile } = await client
      .from('profiles')
      .select('email, full_name, company_name, job_title, country')
      .eq('id', userId)
      .single();

    await sendEmail(
      ADMIN_EMAIL,
      `New signup: ${profile?.full_name || profile?.email}`,
      `
        <h2>New RepAudit signup waiting for approval</h2>
        <table style="font-family:sans-serif;font-size:14px">
          <tr><td><b>Name:</b></td><td>${profile?.full_name || '—'}</td></tr>
          <tr><td><b>Email:</b></td><td>${profile?.email}</td></tr>
          <tr><td><b>Company:</b></td><td>${profile?.company_name || '—'}</td></tr>
          <tr><td><b>Role:</b></td><td>${profile?.job_title || '—'}</td></tr>
          <tr><td><b>Country:</b></td><td>${profile?.country || '—'}</td></tr>
        </table>
        <br>
        <a href="https://repaudit.vercel.app/admin/users" style="background:#3b82f6;color:white;padding:10px 20px;border-radius:6px;text-decoration:none">
          Review in Admin Panel
        </a>
      `
    );
    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  }

  if (action === 'approve') {
    await client.from('profiles').update({ status: 'approved' }).eq('id', userId);

    const { data: profile } = await client.from('profiles').select('email, full_name').eq('id', userId).single();
    await sendEmail(
      profile?.email,
      'Your RepAudit account has been approved',
      `
        <h2>You're in! 🎉</h2>
        <p>Hi ${profile?.full_name || 'there'},</p>
        <p>Your RepAudit account has been approved. You can now sign in and run your first audit.</p>
        <br>
        <a href="https://repaudit.vercel.app" style="background:#3b82f6;color:white;padding:10px 20px;border-radius:6px;text-decoration:none">
          Go to RepAudit
        </a>
      `
    );
    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  }

  if (action === 'reject') {
    await client.from('profiles').update({ status: 'rejected' }).eq('id', userId);

    const { data: profile } = await client.from('profiles').select('email, full_name').eq('id', userId).single();
    await sendEmail(
      profile?.email,
      'RepAudit — account not approved',
      `
        <p>Hi ${profile?.full_name || 'there'},</p>
        <p>Thank you for your interest in RepAudit. Unfortunately, we're not able to approve your account at this time.</p>
        <p>If you have any questions, reply to this email.</p>
      `
    );
    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  }

  return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: corsHeaders });
});
