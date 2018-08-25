const createYearMapping = (urls) => {
    const result = {}
    for (let i = 2018; i > 2010; i--) {
        let meet_index = (2018 - i) * 2;
        result[`${i}`] = []
        let limit = meet_index + 2;
        for (let j = meet_index; j < limit; j++) {
            result[`${i}`].push(urls[j])
        }
    }
    return result
}

export default createYearMapping;