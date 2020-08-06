export const apiUrl = "http://localhost:5000/api"; // Change this

export function handleResponse(response) {
    return response.text().then(text => {
        if (!response.ok) {
            let error = `${response.statusText}: ${text}`;
            return Promise.reject(error);
        }
        return text && JSON.parse(text);
    });
}

let i = {
    '': ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    'Level': ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', '13th', '14th', '15th', '16th', '17th', '18th', '19th', '20th'],
    'Proficiency Bonus': ['+2', '+2', '+2', '+2', '+3', '+3', '+3', '+3', '+4', '+4', '+4', '+4', '+5', '+5', '+5', '+5', '+6', '+6', '+6', '+6'],
    'Features': ['Spellcasting, Divine Domain', 'Channel Divinity (1/rest), Divine Domain Feature', '-', 'Ability Score Improvement', 'Destroy Undead (CR 1/2)', 'Channel Divinity (2/rest), Divine Domain Feature', '-', 'Ability Score Improvement, Destroy Undead (CR 1), Divine Domain Feature', '-', 'Divine Intervention', 'Destroy Undead (CR 2)', 'Ability Score Improvement', '-', 'Destroy Undead (CR 3)', '-', 'Ability Score Improvement', 'Destroy Undead (CR 4), Divine Domain Feature', 'Channel Divinity (3/rest)', 'Ability Score Improvement', 'Divine Intervention improvement'],
    'Cantrips Known': ['3', '3', '3', '4', '4', '4', '4', '4', '4', '5', '5', '5', '5', '5', '5', '5', '5', '5', '5', '5'],
    '1st': ['2', '3', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4'],
    '2nd': ['-', '-', '2', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3'],
    '3rd': ['-', '-', '-', '-', '2', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3'],
    '4th': ['-', '-', '-', '-', '-', '-', '1', '2', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3'],
    '5th': ['-', '-', '-', '-', '-', '-', '-', '-', '1', '2', '2', '2', '2', '2', '2', '2', '2', '3', '3', '3'],
    '6th': ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '1', '1', '1', '1', '1', '1', '1', '1', '2', '2'],
    '7th': ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '1', '1', '1', '1', '1', '1', '1', '2'],
    '8th': ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '1', '1', '1', '1', '1', '1'],
    '9th': ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '1', '1', '1', '1']
}