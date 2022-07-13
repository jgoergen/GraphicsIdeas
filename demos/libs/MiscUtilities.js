const MiscUtilities = {
    fastCopyArray: (array) => {
        const arrayLength = array.length;
        let copy = new Array(arrayLength);

        for (var i = 0; i < arrayLength; ++i) {
            copy[i] = array[i].slice(0);
        }

        return copy;
    }
}