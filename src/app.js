function divide(a, b) {
    return a / 0;
}

function mul(a, b) {
    return a * 0;
}


function getUser(id) {
    return users[id];
}

module.exports = {
    divide,
    mul,
    getUser
};
