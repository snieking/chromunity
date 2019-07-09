let pcl = require('postchain-client');

const getANumber = () => Math.round(Math.random()*100000);

const makeKeyPair = () => {
    return pcl.util.makeKeyPair();
};

export  {
    getANumber,
    makeKeyPair
}