import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { handleSort } from "../utils/sort";
import { onDragEnd, criteriaOptions } from "../utils/helpers";
import { DescIcon, AscIcon, PlaySVG, PauseSVG } from "./icons";
import { playTrackOnSpotify } from "../utils/requests";

export default function TracksTable({ selectedPlaylistTracks, setSelectedPlaylistTracks, sortCriteria, setSortCriteria, sortDirection, setSortDirection, visibleColumns, accessToken, setCurrentlyPlayingTrack, currentlyPlayingTrack }: any) {
  return (
    <div className="w-full">
      <table className="min-w-full border-collapse">
        <thead>
            <tr className="w-full flex flex-row">
              <th className="border border-primarytext bg-gray-100 p-2 w-full">
                <button onClick={() => handleSort('name', sortCriteria, setSortCriteria, setSortDirection)}>
                  Name
                  {sortCriteria === 'name' && (sortDirection === 'asc' ? <AscIcon /> : <DescIcon />)}
                </button>
              </th>
              <th className="border border-primarytext bg-gray-100 p-2 w-full">
                <button onClick={() => handleSort('artist', sortCriteria, setSortCriteria, setSortDirection)}>
                  Artists
                  {sortCriteria === 'artist' && (sortDirection === 'asc' ? <AscIcon /> : <DescIcon />)}
                </button>
              </th>
              {
                criteriaOptions.map((criteria) => (
                  visibleColumns[criteria] && (
                    <th className={`border border-primarytext bg-gray-100 p-2 w-full`} key={criteria}>
                      <button onClick={() => handleSort(criteria, sortCriteria, setSortCriteria, setSortDirection)}>
                        {criteria.charAt(0).toUpperCase() + criteria.slice(1)}
                        {sortCriteria === criteria && (sortDirection === 'asc' ? <AscIcon /> : <DescIcon />)}
                      </button>
                    </th>
                  )
                ))
              }
            </tr>
        </thead>
      </table>
    <DragDropContext onDragEnd={result => {onDragEnd(result, selectedPlaylistTracks, setSelectedPlaylistTracks)}}>
      <Droppable droppableId="tracks" placeholder="Drop tracks here">
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
                                className={`flex flex-row bg-primaryaccent group/outer cursor-pointer w-full transition-colors duration-75 ${snapshot.isDragging ? 'bg-opacity-50 bg-blue-200 flex justify-evenly' : ''}`}
                              >
                               <td className="border p-2 w-full relative flex flex-row items-center group-hover/outer:bg-primarybg group-hover/outer:bg-opacity-50">
                                  <div className="inline-block relative w-10 h-10 mr-2 cursor-pointer group flex-shrink-0" onClick={() => playTrackOnSpotify(track.track.uri, accessToken, setCurrentlyPlayingTrack)}>
                                      <img src={track.track.album.images[0]?.url} alt={track.track.name} className="w-full h-full object-cover rounded " />
                                      <div className="absolute w-full h-full translate-y-[-100%] bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded transition-colors duration-75"></div>
                                      
                                      {currentlyPlayingTrack === track.track.id ? (
                                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
                                              <PlaySVG />
                                          </div>
                                      ) : (
                                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
                                              <PauseSVG />
                                          </div>
                                      )}
                                  </div>
                                  <div className="flex-1 overflow-hidden max-h-[3.4rem]">
                                      <p className="line-clamp-2">
                                          {track.track.name}
                                      </p>
                                  </div>
                                </td>
                                <td className="border p-2 w-full group-hover/outer:bg-primarybg group-hover/outer:bg-opacity-50">{track.track.artists.length > 0 && track.track.artists.map(artist => artist.name).join(', ')}</td>
                                {
                                  criteriaOptions.map(criteria => (
                                    visibleColumns[criteria] && (
                                    <td className="border p-2 w-full group-hover/outer:bg-primarybg group-hover/outer:bg-opacity-50" key={criteria}>
                                      {track.track[criteria] || 'N/A'}
                                    </td>
                                  )))
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
  </div>
  )
}
