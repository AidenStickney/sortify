import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const code = req.query.code;

  // Request access token from spotify
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI
    }),
  });

  const data = await response.json();

  if (data.error) {
    // Handle the error on the client
    res.redirect(`/error?message=${data.error}`);
    return;
  }

  // Store access token in a cookie or any client-side storage of your choice
  res.setHeader('Set-Cookie', `spotifyAccessToken=${data.access_token}; Path=/; HttpOnly`);
  res.redirect('/');
}
