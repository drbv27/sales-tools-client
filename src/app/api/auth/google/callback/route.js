// app/api/auth/google/callback/route.js
import { NextResponse } from 'next/server';
import Cookies from 'js-cookie'; // Añadimos js-cookie

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state') || '';

  if (!code) {
    return NextResponse.json(
      { error: 'No se recibió el código de autorización' },
      { status: 400 }
    );
  }

  // Intercambiar el código por tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return NextResponse.json({ error: tokenData.error }, { status: 400 });
  }

  // Almacenamos el access_token de Google en la cookie
  Cookies.set('google_access_token', tokenData.access_token, { expires: 7 });

  // Redirige a la URL que vino en state o, si está vacía, a /email-compose con provider=gmail
  const redirectUrl = state || '/email-compose?provider=gmail';
  return NextResponse.redirect(redirectUrl);
}
