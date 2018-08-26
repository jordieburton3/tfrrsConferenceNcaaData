const removeAll = (list, element) => {
    return list.filter(e => {
        const threshold = 6.0;
        let aboveThreshold = true;
        try {

        } catch (err) {

        }
        return e !== element && e !== '\t'&& (!e.includes(`"`))  && e !== ' ';
    })
}

const printAll = (list) => {
    for (let i = 0; i < list.length; i++) {
        console.log(list[i]);
    }
}

const containsWord = (word, list) => {
    const combinedList = list.join(' ');
    const regex = new RegExp('\\b' + word + '\\b');
    return regex.test(combinedList);
}

const removeWhiteSpace = (list) => {
    return list.filter(e => {
        return (e.match(/\s/g) || []).length !== e.length;
    })
}

const removeHeader = (list) => {
    let removeIndex = 0;
    for (let i = 0; i < list.length; i++) {
        if (list[i].includes('1.')) {
            let removeIndex = i;
            return list.slice(removeIndex);
        }
    }
}

const formatList = (list) => {
    const removedHeader = removeHeader(list);
    const workingList = removeWhiteSpace(removedHeader);
    const athleteData = []
    let increment = containsWord('WIND', list) ? 6 : 5;
    for (let i = 0; i < workingList.length; i += increment) {
        let athleteDetails = {};
        athleteDetails.place = workingList[i];
        athleteDetails.name = workingList[i + 1];
        athleteDetails.year = workingList[i + 2];
        athleteDetails.school = workingList[i + 3];
        athleteDetails.mark = workingList[i + 4];   
        athleteData.push(athleteDetails);    
    }

    return athleteData;
}

export {
    removeAll,
    formatList,
    printAll
}