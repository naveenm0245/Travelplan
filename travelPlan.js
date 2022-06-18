const cities = require('./cities.json');
const cityList = Object.keys(cities);

const startCityCode = process.argv[2];

//Check if input given is Valid CityCode 
let validCode = false;
for (let i = 0; i < cityList.length; i++) {
    const city = cities[cityList[i]];
    if (city.id === startCityCode) {
        validCode = true;
        break;
    }
}
if (!validCode) {
    console.error('Please enter a valid city code');
    process.exit(1);
}

//Given an array, permutationsGenerator function will return all possible permutation array combination of same length. 
function permutationsGenerator(arr) {
    function generateAll(currentPermutation, markerArr) {
        if (currentPermutation.length === arr.length) {
            const arrCopy = [];
            for (let i = 0; i < currentPermutation.length; i++) {
                arrCopy.push(currentPermutation[i]);
            }

            permutations.push(arrCopy);
            return;
        }

        for (let i = 0; i < arr.length; i++) {
            if (markerArr[i]) {
                currentPermutation.push(arr[i]);
                markerArr[i] = false;
                generateAll(currentPermutation, markerArr);
                markerArr[i] = true;
                currentPermutation.pop();
            }
        }
    }

    const permutations = [];
    generateAll([], arr.map(() => true));
    return permutations;
}

//Find Distance in KM between Two Given Cities. 
function getDistanceBetweenTwoCities(cityCodeI, cityCodeJ) {
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        function deg2rad(deg) {
            return deg * (Math.PI/180)
        }
    
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);
        var dLon = deg2rad(lon2-lon1); 
        var a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2)
          ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        return d;
    }

    const cityI = cities[cityCodeI];
    const cityJ = cities[cityCodeJ];
    return getDistanceFromLatLonInKm(
        cityI.location.lat,
        cityI.location.lon,
        cityJ.location.lat,
        cityJ.location.lon);
}

//Given a way of visiting continent, finding the total distance travelled when distance between two cities are minimum. 
function getMinimumDistanceForASinglePermutation(permutation, continentWiseCities) {
    //From a sourceCity to find minimum distance in another continent. 
    function findMinimumDistanceCity(sourceCity, continent) {
        const cityCodeI = sourceCity;

        let minDistance = Number.MAX_SAFE_INTEGER;
        let minCity = null;
        for (let j = 0; j < continentWiseCities[continent].length; j++) {
            const cityCodeJ = continentWiseCities[continent][j];

            const distance = getDistanceBetweenTwoCities(cityCodeI, cityCodeJ);

            if (distance < minDistance) {
                minDistance = distance;
                minCity = cityCodeJ;
            }

        }

        return { minDistance, minCity };
    }

    let totalDistance = 0;
    const sequence = [startCityCode];

    let sourceCity = startCityCode;
    for (let i = 0; i < permutation.length; i++) {
        const { minDistance, minCity } = findMinimumDistanceCity(sourceCity, permutation[i]);
        totalDistance += minDistance;
        sequence.push(minCity);

        sourceCity = minCity;

        if (i === permutation.length-1) {
            totalDistance += getDistanceBetweenTwoCities(sourceCity, startCityCode);
            sequence.push(startCityCode);
        }
    }

    return { totalDistance, sequence };
}

//Bonous Part Function here

//Given a way of visiting continent, finding the total distance travelled when distance between two cities are maximum. 
function getMaximumDistanceForASinglePermutation(permutation, continentWiseCities) {
    //From a sourceCity to find maximum distance in another continent. 
    function findMaximumDistanceCity(sourceCity, continent) {
        const cityCodeI = sourceCity;

        let maxDistance = 0;
        let maxCity = null;
        for (let j = 0; j < continentWiseCities[continent].length; j++) {
            const cityCodeJ = continentWiseCities[continent][j];

            const distance = getDistanceBetweenTwoCities(cityCodeI, cityCodeJ);

            if (distance  > maxDistance) {
                maxDistance = distance;
                maxCity = cityCodeJ;
            }

        }

        return { maxDistance, maxCity };
    }

    let totalDistance = 0;
    const sequence = [startCityCode];

    let sourceCity = startCityCode;
    for (let i = 0; i < permutation.length; i++) {
        const { maxDistance, maxCity } = findMaximumDistanceCity(sourceCity, permutation[i]);
        totalDistance += maxDistance;
        sequence.push(maxCity);

        sourceCity = maxCity;

        if (i === permutation.length-1) {
            totalDistance += getDistanceBetweenTwoCities(sourceCity, startCityCode);
            sequence.push(startCityCode);
        }
    }

    return { totalDistance, sequence };
}

//Driver code start here... 

const continentWiseCities = {};
for (let i = 0; i < cityList.length; i++) {
    const cityI = cities[cityList[i]];

    if (cityI.contId === cities[startCityCode].contId && cityI.id !== startCityCode) {
        continue;
    }

    if (cityI.id !== startCityCode) {
        if (continentWiseCities.hasOwnProperty(cityI.contId)) {
            continentWiseCities[cityI.contId].push(cityI.id);
        }
        else {
            continentWiseCities[cityI.contId] = [cityI.id];
        }
    }
}

const continents = Object.keys(continentWiseCities);

const permutationList = permutationsGenerator(continents);

let minDistance = Number.MAX_SAFE_INTEGER;
let minSequence = [];
for (let i = 0; i < permutationList.length; i++) {
    const { totalDistance, sequence } = getMinimumDistanceForASinglePermutation(
        permutationList[i], continentWiseCities);

    if (totalDistance < minDistance) {
        minDistance = totalDistance;
        minSequence = sequence;
    }
}

function printCities (maxSequence){
    console.log('The Travel Path is ->')
    for(let i=0;i<maxSequence.length;i++){
        console.log(maxSequence[i], "(", cities[maxSequence[i]].countryName, " ,", cities[maxSequence[i]].contId, ")");
    }
    console.log(" ");
}

console.log('Minimum Distance is -> ', minDistance, "KMs");
printCities(minSequence);

//Bonos part start here...

let maxDistance = 0;
let maxSequence = [];

for (let i = 0; i < permutationList.length; i++) {
    const { totalDistance, sequence } = getMaximumDistanceForASinglePermutation(
        permutationList[i], continentWiseCities);

    if (totalDistance > maxDistance) {
        maxDistance = totalDistance;
        maxSequence = sequence;
    }
}


console.log('Maximum Distance is -> ', maxDistance, "KMs");
printCities(maxSequence);