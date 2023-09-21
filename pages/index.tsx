import { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function Page() {
  const [playlists, setPlaylists] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [selectedPlaylistTracks, setSelectedPlaylistTracks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  const [selectedPlaylistName, setSelectedPlaylistName] = useState(null);
  const [selectedPlaylistSnapshot, setSelectedPlaylistSnapshot] = useState(null);
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

  const getSortedTracks = () => {
    if (!sortCriteria) return selectedPlaylistTracks;

    return [...selectedPlaylistTracks].sort((a, b) => {
        let valA, valB;
        
        switch (sortCriteria) {
            case 'name':
                valA = a.track.name;
                valB = b.track.name;
                break;
            case 'artist':
                valA = a.track.artists[0].name;
                valB = b.track.artists[0].name;
                break;
            case 'bpm':
                valA = a.track.bpm;
                valB = b.track.bpm;
                break;
            case 'acousticness':
                valA = a.track.acousticness;
                valB = b.track.acousticness;
                break;
            case 'danceability':
                valA = a.track.danceability;
                valB = b.track.danceability;
                break;
            case 'energy':
                valA = a.track.energy;
                valB = b.track.energy;
                break;
            case 'instrumentalness':
                valA = a.track.instrumentalness;
                valB = b.track.instrumentalness;
                break;
            case 'key':
                valA = a.track.key;
                valB = b.track.key;
                break;
            case 'liveness':
                valA = a.track.liveness;
                valB = b.track.liveness;
                break;
            case 'valence':
                valA = a.track.valence;
                valB = b.track.valence;
                break;
            default:
                return 0;
        }

        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (sortDirection === 'asc') {
            return valA > valB ? 1 : -1;
        } else {
            return valA < valB ? 1 : -1;
        }
    });
  }

  const handleSort = (criteria) => {
    if (sortCriteria === criteria) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
        setSortCriteria(criteria);
        setSortDirection('asc');
    }
  };

  useEffect(() => {
    setSelectedPlaylistTracks(getSortedTracks());
  }, [sortCriteria, sortDirection]);

  const chunkArray = (array, chunkSize) => {
    const results = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      results.push(array.slice(i, i + chunkSize));
    }
    return results;
  };

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const createPlaylist = async (playlistName, userId) => {
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

const updatePlaylist = async (selectedPlaylistTracks, userId) => {
    const newPlaylistId = await createPlaylist(selectedPlaylistName + " (Reordered)", userId);

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
                }
            });
    });

    promiseChain
        .catch(error => {
            console.error("Error updating playlist:", error);
        });
  };

  const selectPlaylist = async (playlistId, playlistName) => {
    setSelectedPlaylistId(playlistId);  // Set the selected playlist ID
    setSelectedPlaylistName(playlistName);  // Set the selected playlist name

    try {
        const initialTracks = await fetchTracks(playlistId, 0);
        let allTracks = initialTracks.items;

        const totalTracks = initialTracks.total;
        const requestsNeeded = Math.ceil(totalTracks / 100) - 1; 

        for (let i = 1; i <= requestsNeeded; i++) {
            await delay(1000);  // Wait for 1 second
            const additionalTracks = await fetchTracks(playlistId, i * 100);
            allTracks = [...allTracks, ...additionalTracks.items];
        }

        setSelectedPlaylistTracks(allTracks);
        setBpmFetched(false);  // Set the ref to false after fetching

    } catch (error) {
        console.error("There was an error fetching the playlist tracks", error);
    }
  }

  const fetchTracks = async (playlistId, offset) => {
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


  const fetchBpm = async (trackId) => {
    const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });
    const data = await response.json();
    return data;
  }

  useEffect(() => {
    const fetchAllBpm = async () => {
        if (selectedPlaylistTracks.length > 0) {
            const tracksWithBpm = await Promise.all(selectedPlaylistTracks.map(async track => {
                const features = await fetchBpm(track.track.id);
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

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedTracks = Array.from(selectedPlaylistTracks);
    const [movedTrack] = reorderedTracks.splice(result.source.index, 1);
    reorderedTracks.splice(result.destination.index, 0, movedTrack);

    setSelectedPlaylistTracks(reorderedTracks);
  };

  const playTrackOnSpotify = async (trackUri) => {
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

  const AscIcon = () => (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor" className="inline-block ml-2">
        <path d="M3 13l5-8 5 8H3z" />
    </svg>
  );

  const DescIcon = () => (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor" className="inline-block ml-2">
          <path d="M13 3l-5 8-5-8h10z" />
      </svg>
  );

  const PlaySVG = () => (
      <svg width="24" height="24" fill="currentColor" color="white">
          <path d="M8 5v14l11-7z"></path>
      </svg>
  );

  const PauseSVG = () => (
      <svg width="24" height="24" fill="currentColor" color="white">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
      </svg>
  );

  return (
    <div className="px-28 flex flex-col items-center">
      { accessToken ? (
        <div>
          <div className="cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
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
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 ${isDropdownOpen ? 'visible' : 'hidden'}`}>
                {playlists && playlists.length > 0 && playlists.map(playlist => (
                  <div key={playlist.id} className="border flex flex-col justify-center items-center p-4 rounded shadow cursor-pointer" onClick={() => {selectPlaylist(playlist.id, playlist.name); setSelectedPlaylistSnapshot(playlist.snapshot_id)}}>
                    { playlist.images.length > 0 ? (
                      <img src={playlist.images[0]?.url} alt={playlist.name} className={`w-44 object-cover rounded `} />
                    ) : (
                      <div className="w-44 h-44 bg-gray-200 rounded"></div>
                    )}
                    <h2 className="text-lg text-center font-bold mt-2">{playlist.name}</h2>
                  </div>
                ))}
              </div>
        {
          selectedPlaylistTracks.length > 0 && (
          <div className="flex flex-col items-center">
          <div className="flex flex-col items-center">
            <h1 className="text-center font-semibold text-4xl mb-3">Selected Playlist: {selectedPlaylistName}</h1>
          </div>
            <div className="mb-4">
              {Object.keys(visibleColumns).map(col => (
                <label key={col} className="mr-2">
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                  <input
                    type="checkbox"
                    className="ml-1"
                    checked={visibleColumns[col]}
                    onChange={() => setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }))}
                  />
                </label>
              ))}
            </div>
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="w-full flex flex-row">
                      <th className="border bg-gray-100 p-2 w-full">
                        <button onClick={() => handleSort('name')}>
                          Name
                          {sortCriteria === 'name' && (sortDirection === 'asc' ? <AscIcon /> : <DescIcon />)}
                        </button>
                      </th>
                      <th className="border bg-gray-100 p-2 w-full">
                        <button onClick={() => handleSort('artist')}>
                          Artist
                          {sortCriteria === 'artist' && (sortDirection === 'asc' ? <AscIcon /> : <DescIcon />)}
                        </button>
                      </th>
                      {visibleColumns.bpm && (
                        <th className="border bg-gray-100 p-2 w-full">
                          <button onClick={() => handleSort('bpm')}>
                            BPM
                            {sortCriteria === 'bpm' && (sortDirection === 'asc' ? <AscIcon /> : <DescIcon />)}
                          </button>
                        </th>
                      )}
                      {visibleColumns.acousticness && (
                        <th className="border bg-gray-100 p-2 w-full">
                          <button onClick={() => handleSort('acousticness')}>
                            Acousticness
                            {sortCriteria === 'acousticness' && (sortDirection === 'asc' ? <AscIcon /> : <DescIcon />)}
                          </button>
                        </th>
                      )}
                      {visibleColumns.danceability && (
                        <th className="border bg-gray-100 p-2 w-full">
                          <button onClick={() => handleSort('danceability')}>
                            Danceability
                            {sortCriteria === 'danceability' && (sortDirection === 'asc' ? <AscIcon /> : <DescIcon />)}
                          </button>
                        </th>
                      )}
                      {visibleColumns.energy && (
                        <th className="border bg-gray-100 p-2 w-full">
                          <button onClick={() => handleSort('energy')}>
                            Energy
                            {sortCriteria === 'energy' && (sortDirection === 'asc' ? <AscIcon /> : <DescIcon />)}
                          </button>
                        </th>)
                      }
                      {visibleColumns.instrumentalness && (
                        <th className="border bg-gray-100 p-2 w-full">
                          <button onClick={() => handleSort('instrumentalness')}>
                            Instrumentalness
                            {sortCriteria === 'instrumentalness' && (sortDirection === 'asc' ? <AscIcon /> : <DescIcon />)}
                          </button>
                        </th>)
                      }
                      {visibleColumns.key && (
                        <th className="border bg-gray-100 p-2 w-full">
                          <button onClick={() => handleSort('key')}>
                            Key
                            {sortCriteria === 'key' && (sortDirection === 'asc' ? <AscIcon /> : <DescIcon />)}
                          </button>
                        </th>)
                      }
                      {visibleColumns.liveness && (
                        <th className="border bg-gray-100 p-2 w-full">
                          <button onClick={() => handleSort('liveness')}>
                            Liveness
                            {sortCriteria === 'liveness' && (sortDirection === 'asc' ? <AscIcon /> : <DescIcon />)}
                          </button>
                        </th>)
                      }
                      {visibleColumns.valence && (
                        <th className="border bg-gray-100 p-2 w-full">
                          <button onClick={() => handleSort('valence')}>
                            Valence
                            {sortCriteria === 'valence' && (sortDirection === 'asc' ? <AscIcon /> : <DescIcon />)}
                          </button>
                        </th>)
                      }

                    </tr>
                </thead>
            </table>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="tracks">
                    {(provided) => (
                        <table ref={provided.innerRef} {...provided.droppableProps} className="min-w-full border-collapse">
                            <tbody>
                                {selectedPlaylistTracks.map((track, index) => (
                                    <Draggable key={index} draggableId={"track_" + index} index={index}>
                                      {(provided, snapshot) => (
                                        <tr 
                                          ref={provided.innerRef} 
                                          {...provided.draggableProps} 
                                          {...provided.dragHandleProps} 
                                          className={`flex flex-row hover:bg-gray-100 cursor-pointer w-full transition-colors duration-75 ${snapshot.isDragging ? 'bg-opacity-50 bg-blue-200 flex justify-evenly' : ''}`}
                                        >
                                          <td className="border p-2 w-full relative flex flex-row items-center">
                                              <div className="inline-block relative w-10 h-10 mr-2 cursor-pointer group" onClick={() => playTrackOnSpotify(track.track.uri)}>
                                                  <img src={track.track.album.images[0]?.url} alt={track.track.name} className="w-full h-full object-cover rounded " />
                                                  <div className="absolute w-full h-full translate-y-[-100%] bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded transition-colors duration-75">
                                                  </div>
                                                  {currentlyPlayingTrack === track.track.id ? (
                                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
                                                        <PlaySVG />
                                                    </div>
                                                  ) :
                                                  (
                                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
                                                        <PauseSVG />
                                                    </div>
                                                  )}
                                              </div>
                                              {track.track.name}
                                          </td>
                                          <td className="border p-2 w-full">{track.track.artists.length > 0 && track.track.artists.map(artist => artist.name).join(', ')}</td>
                                          {visibleColumns.bpm && (
                                            <td className="border p-2 w-full">
                                              {track.track.bpm || 'N/A'}
                                            </td>)
                                          }
                                          {visibleColumns.acousticness && (
                                            <td className="border p-2 w-full">
                                              {track.track.acousticness || 'N/A'}
                                            </td>)
                                          }
                                          {visibleColumns.danceability && (
                                            <td className="border p-2 w-full">
                                              {track.track.danceability || 'N/A'}
                                            </td>)
                                          }
                                          {visibleColumns.energy && (
                                            <td className="border p-2 w-full">
                                              {track.track.energy || 'N/A'}
                                            </td>)
                                          }
                                          {visibleColumns.instrumentalness && (
                                            <td className="border p-2 w-full">
                                              {track.track.instrumentalness || 'N/A'}
                                            </td>)
                                          }
                                          {visibleColumns.key && (
                                            <td className="border p-2 w-full">
                                              {track.track.key || 'N/A'}
                                            </td>)
                                          }
                                          {visibleColumns.liveness && (
                                            <td className="border p-2 w-full">
                                              {track.track.liveness || 'N/A'}
                                            </td>)
                                          }
                                          {visibleColumns.valence && (
                                            <td className="border p-2 w-full">
                                              {track.track.valence || 'N/A'}
                                            </td>)
                                          }

                                        </tr>
                                        )}
                                    </Draggable>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Droppable>
            </DragDropContext>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow mt-4 mb-2" onClick={() => updatePlaylist(selectedPlaylistTracks, userId)}>
              Reorder Playlist
            </button>
            <div className="fixed bottom-0 right-0 mb-4 mr-4">
              <a href="#bottom" className="text-2xl scroll-smooth">&#8595;</a>
            </div>         
        </div>
          )
        }
          <button className="cursor-pointer text-center w-full mb-4">
            Logout
          </button>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center text-center h-screen w-full">
          <h1 className="text-5xl font-semibold pb-5">Spotify</h1>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-fit py-2 px-4 rounded shadow"
            onClick={() => window.location.href="/api/login"}
          >
            Login with Spotify
          </button>
        </div>
      )}
    <div id="bottom" className="scroll-smooth"></div>
    </div>
  );
}
