
interface NavigatumSearchResult {
    sections: {
        facet: 'rooms' | 'sites_buildings';
        entries: {
            id: string;
        }[];
    }[];
}


const findRoomId = async (message: string) => {
    let roomNumberMatch = message.match(/\d+\.\d+\.\d+/);
    console.log(roomNumberMatch);
    if (!roomNumberMatch) {
        return;
    }

    const roomNumber = roomNumberMatch[0];
    let r = await fetch(`https://nav.tum.de/api/search?q=${roomNumber}`);
    let data = (await r.json()) as NavigatumSearchResult;
    if (data.sections.length === 0) {
        return;
    }

    let rooms = undefined;
    for (let section of data.sections) {
        if (section.facet === 'rooms') {
            rooms = section.entries;
            break;
        }
    }

    console.log(rooms);
    if (!rooms || rooms.length === 0) {
        return;
    }

    let room = rooms[0];
    return room.id;
};

export { findRoomId }