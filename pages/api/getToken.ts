import { NextApiRequest, NextApiResponse } from 'next';

export default (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = req.cookies.spotifyAccessToken;
  
  if (!accessToken) {
    return res.status(401).json({ error: 'No access token available.' });
  }

  res.status(200).json({ accessToken });
}
