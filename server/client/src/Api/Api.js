import axios from 'axios';


// payload template.
const payload = {
    gender: "M",
    events: [],
    eventGroups: ["middle distance"],
    conferences: ["acc", "pac-12"],
    round: "final",
    meet: "ncaa",
    seasons: [],
    schools: ["virginia tech", "duke"],
    place: {
        type: "EQUAL",
        primaryComparator: 1,
        secondaryComparator: 0
    }
};

export const Api = {
    getAllConferences: async () => {
        const { data } = await axios.get('/api/get_conferences');
        return data;
    },
    getAllSchools: async () => {
        const { data } = await axios.get('/api/get_schools');
        const { results } = data;
        return results;
    },
    getEventSeasonInfo: async () => {
        const { data } = await axios.get('/api/get_event_info');
        return data;
    }
}