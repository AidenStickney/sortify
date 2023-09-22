import { useState, useEffect } from "react";
import { getSortedTracks } from "../utils/sort";
import { updatePlaylist, fetchBpm } from "../utils/requests";
import { selectPlaylist } from "../utils/helpers";
import { DescIcon, AscIcon, ScrollToBottom } from "../components/icons";
import { FaGithub } from 'react-icons/fa';
import TracksTable from "../components/TracksTable";

export default function Page() {
  const [playlists, setPlaylists] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [selectedPlaylistTracks, setSelectedPlaylistTracks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  const [selectedPlaylistName, setSelectedPlaylistName] = useState(null);
  const [sortCriteria, setSortCriteria] = useState(null); 
  const [sortDirection, setSortDirection] = useState(null); 
  const [currentlyPlayingTrack, setCurrentlyPlayingTrack] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    bpm: true,
    acousticness: false,
    danceability: false,
    energy: false,
    instrumentalness: false,
    key: false,
    liveness: false,
    valence: false
  });
  const [bpmFetched, setBpmFetched] = useState(false);

  useEffect(() => {
    setSelectedPlaylistTracks(getSortedTracks(sortCriteria, sortDirection, selectedPlaylistTracks));
  }, [sortCriteria, sortDirection]);

  useEffect(() => {
    const fetchAllBpm = async () => {
        if (selectedPlaylistTracks.length > 0) {
            const tracksWithBpm = await Promise.all(selectedPlaylistTracks.map(async track => {
                const features = await fetchBpm(track.track.id, accessToken);
                const bpm = await features.tempo;
                const acousticness = await features.acousticness;
                const danceability = await features.danceability;
                const energy = await features.energy;
                const instrumentalness = await features.instrumentalness;
                const key = await features.key;
                const liveness = await features.liveness;
                const valence = await features.valence;
                return {
                    ...track,
                    track: {
                        ...track.track,
                        bpm,
                        acousticness,
                        danceability,
                        energy,
                        instrumentalness,
                        key,
                        liveness,
                        valence
                    }
                };
            }));

            setSelectedPlaylistTracks(tracksWithBpm);
            setBpmFetched(true);
        }
    };

    if (bpmFetched) return;
    fetchAllBpm();
  }, [bpmFetched, selectedPlaylistTracks]);

  useEffect(() => {
      let accessToken;
      let userId;

      const fetchAllPlaylists = async (url) => {
          const response = await fetch(url, {
              headers: {
                  "Authorization": `Bearer ${accessToken}`
              }
          });

          if (!response.ok) {
              setAccessToken(null);
              throw new Error("Spotify request failed");
          }

          const data = await response.json();
          if (!userId) {
              userId = data.href.split('/')[5];
              setUserId(userId);
          }

          const userPlaylists = data.items.filter(playlist => playlist.owner.id === userId && playlist.tracks.total > 0);

          if (data.next) {
              // If there's more playlists to fetch, recursively fetch the next set of playlists
              const morePlaylists = await fetchAllPlaylists(data.next);
              return userPlaylists.concat(morePlaylists);
          } else {
              return userPlaylists;
          }
      };

      fetch("/api/getToken")
          .then(response => response.json())
          .then(data => {
              accessToken = data.accessToken;
              setAccessToken(accessToken);
              return fetchAllPlaylists(`https://api.spotify.com/v1/me/playlists?limit=50`);
          })
          .then(playlists => {
              setPlaylists(playlists);
          })
          .catch(error => {
              console.error("There was an error fetching the playlists", error);
              // Reset the access token in case of failure.
              setAccessToken(null);
          });

  }, []);

  return (
    <div className="px-28 w-full flex flex-col items-center">
      { accessToken ? (
        <div className="w-full">
          <div className="w-full cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {isDropdownOpen ? (
                  <div className="flex flex-col items-center justify-center my-3">
                    <h1 className="flex flex-row w-full justify-center items-center text-center font-semibold text-2xl">Your Spotify Playlists:<DescIcon></DescIcon></h1>
                    <span className="text-sm">(Click to collapse)</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center my-3">
                    <h1 className="flex flex-row w-full justify-center items-center text-center font-semibold text-2xl">Your Spotify Playlists:<AscIcon></AscIcon></h1>
                    <span className="text-sm">(Click to expand)</span>
                  </div>
                )
              }
            </div>
              <div className={`w-full grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4 ${isDropdownOpen ? 'visible' : 'hidden'}`}>
                {playlists && playlists.length > 0 && playlists.map(playlist => (
                  <div key={playlist.id} className="bg-primaryaccent flex flex-col p-2 justify-center items-center rounded-lg shadow cursor-pointer" onClick={() => {selectPlaylist(playlist.id, playlist.name, setSelectedPlaylistName, accessToken, setSelectedPlaylistTracks, setBpmFetched)}}>
                    { playlist.images.length > 0 ? (
                      <img src={playlist.images[0]?.url} alt={playlist.name} className={`w-36 sm:w-36 md:w-36 lg:w-44 object-cover aspect-square rounded-md`} />
                    ) : (
                      <div className="w-20 sm:w-24 md:w-36 lg:w-44 bg-gray-200 rounded"></div>
                    )}
                    <h2 className="text-lg text-center font-bold mt-2 line-clamp-1">{playlist.name}</h2>
                  </div>
                ))}
                {
                  playlists.length === 0 && (
                    <div className="flex flex-col items-center justify-center">
                      <h1 className="text-center font-semibold text-4xl mb-3">No Playlists Found</h1>
                      <h2 className="text-center font-semibold text-2xl mb-3">Create a playlist on Spotify to get started!</h2>
                    </div>
                  )
                }
              </div>
        {
          selectedPlaylistTracks.length > 0 && (
          <div className="flex flex-col items-center">
          <div className="flex flex-col items-center">
            <h1 className="text-center font-semibold text-4xl mb-3">Selected Playlist: {selectedPlaylistName}</h1>
          </div>
            <div className="mb-4 flex flex-row flex-wrap items-center justify-center">
              {Object.keys(visibleColumns).map(col => (
                <label key={col} className="flex flex-row items-center justify-center mr-4 mt-3 rounded bg-primaryaccent p-2 px-3 cursor-pointer">
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                  <input
                    type="checkbox"
                    className="ml-2 focus:ring-0 accent-primary rounded cursor-pointer"
                    checked={visibleColumns[col]}
                    onChange={() => setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }))}
                  />
                </label>
              ))}
            </div>
            <TracksTable selectedPlaylistTracks={selectedPlaylistTracks} setSelectedPlaylistTracks={setSelectedPlaylistTracks} sortCriteria={sortCriteria} setSortCriteria={setSortCriteria} sortDirection={sortDirection} setSortDirection={setSortDirection} visibleColumns={visibleColumns} accessToken={accessToken}  currentlyPlayingTrack={currentlyPlayingTrack} setCurrentlyPlayingTrack={setCurrentlyPlayingTrack}/>
            <button className="bg-primary hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded shadow mt-4 mb-2" onClick={() => updatePlaylist(selectedPlaylistName, selectedPlaylistTracks, userId, accessToken)}>
              Reorder Playlist
            </button>
            <ScrollToBottom />   
        </div>
          )
        }
          <button className="cursor-pointer text-center w-full mb-4 mt-10" onClick={() => setAccessToken(null)}>
            Logout
          </button>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center text-center h-screen w-full">
          <h1 className="text-5xl font-semibold pb-5">Sortify</h1>
          <button 
            className="bg-primary hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded shadow mt-4 mb-2"
            onClick={() => window.location.href="/api/login"}
          >
            Login with Spotify
          </button>
        </div>
      )}
			<FaGithub
				onClick={() =>
					window.open(
						'https://github.com/AidenStickney/sortify'
					)
				}
        className="fixed bottom-0 left-0 mb-11 ml-2 cursor-pointer h-7 w-7"
			/>
      <img
				src="/Spotify_Icon_RGB_White.png"
        className="fixed bottom-0 left-0 mb-2 ml-2 cursor-pointer h-7 w-7"
				onClick={() => window.open('https://open.spotify.com')}
			/>
    <div id="bottom" className="scroll-smooth"></div>
    </div>
  );
}
