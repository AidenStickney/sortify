export const getSortedTracks = (sortCriteria, sortDirection, selectedPlaylistTracks) => {
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

export const handleSort = (criteria, sortCriteria, setSortCriteria, setSortDirection) => {
  if (sortCriteria === criteria) {
      setSortDirection(prev => {
        if (prev === 'desc') {
            return 'asc';
        } else {
            return 'desc';
        }

      });
  } else {
      setSortCriteria(criteria);
      setSortDirection('asc');
  }
};