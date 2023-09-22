import { chunkArray } from './helpers';

export const createPlaylist = async (playlistName, userId, accessToken) => {
    try {
        const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: playlistName,
                public: false
            })
        });

        if (!response.ok) {
            throw new Error(`Error creating playlist: ${response.statusText}`);
        }

        const data = await response.json();
        return data.id;

    } catch (error) {
        console.error("Error creating playlist:", error);
        return null;  // Return null if there's an error
    }
}

export const updatePlaylist = async (selectedPlaylistName, selectedPlaylistTracks, userId, accessToken) => {
  const newPlaylistId = await createPlaylist(selectedPlaylistName + " (Reordered)", userId, accessToken);

  if (!newPlaylistId) {
      console.error("Failed to create a new playlist.");
      return;  // Exit the function if newPlaylistId doesn't exist
  }
  const trackChunks = chunkArray([...selectedPlaylistTracks], 100);
  let promiseChain = Promise.resolve();

  trackChunks.forEach((trackChunk, index) => {
      const trackUris = trackChunk.map(track => track.track.uri);

      promiseChain = promiseChain
          .then(() => fetch(`https://api.spotify.com/v1/playlists/${newPlaylistId}/tracks`, {
              method: 'POST',
              headers: {
                  "Authorization": `Bearer ${accessToken}`,
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({
                  uris: trackUris
              })

          }))
          .then(response => {
              if (!response.ok) {
                  throw new Error("Failed to update playlist");
              } else {
                alert("Playlist successfully updated!")
              }
          });
  });

  promiseChain
      .catch(error => {
          console.error("Error updating playlist:", error);
      });
};

export const fetchTracks = async (playlistId, offset, accessToken) => {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch tracks from Spotify");
    }

    return await response.json();
}


export const fetchBpm = async (trackId, accessToken) => {
  const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
      headers: {
          "Authorization": `Bearer ${accessToken}`
      }
  });
  const data = await response.json();
  return data;
}

export const playTrackOnSpotify = async (trackUri, accessToken, setCurrentlyPlayingTrack) => {
    try {
        await fetch('https://api.spotify.com/v1/me/player/play', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,  // assuming you have accessToken in scope
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uris: [trackUri]
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error("Failed to play track on Spotify");
            } else {
              setCurrentlyPlayingTrack(trackUri.split(':')[2]);
            }
        });
    } catch (error) {
        console.error('Failed to play the track on Spotify:', error);
    }
};