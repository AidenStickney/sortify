import { fetchTracks } from "./requests";

export const chunkArray = (array, chunkSize) => {
  const results = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize));
  }
  return results;
};

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const selectPlaylist = async (playlistId, playlistName, setSelectedPlaylistName, accessToken, setSelectedPlaylistTracks, setBpmFetched) => {
  setSelectedPlaylistName(playlistName);  // Set the selected playlist name

  try {
      const initialTracks = await fetchTracks(playlistId, 0, accessToken);
      let allTracks = initialTracks.items;

      const totalTracks = initialTracks.total;
      const requestsNeeded = Math.ceil(totalTracks / 100) - 1; 

      for (let i = 1; i <= requestsNeeded; i++) {
          await delay(1000);  // Wait for 1 second
          const additionalTracks = await fetchTracks(playlistId, i * 100, accessToken);
          allTracks = [...allTracks, ...additionalTracks.items];
      }

      setSelectedPlaylistTracks(allTracks);
      setBpmFetched(false);  // Set the ref to false after fetching

  } catch (error) {
      console.error("There was an error fetching the playlist tracks", error);
  }
}

export const onDragEnd = (result, selectedPlaylistTracks, setSelectedPlaylistTracks) => {
  if (!result.destination) return;

  const reorderedTracks = Array.from(selectedPlaylistTracks);
  const [movedTrack] = reorderedTracks.splice(result.source.index, 1);
  reorderedTracks.splice(result.destination.index, 0, movedTrack);

  setSelectedPlaylistTracks(reorderedTracks);
};

export const criteriaOptions = ['bpm', 'acousticness', 'danceability', 'energy', 'instrumentalness', 'key', 'liveness', 'valence'];
