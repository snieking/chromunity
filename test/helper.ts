const getANumber = () => Math.round(Math.random()*100000);

function sleepUntil(timestampToSleepToAfter: number) {
    while (true) {
        if (Date.now() > timestampToSleepToAfter) {
            break;
        }
    }
}

export  {
    getANumber,
    sleepUntil
}