function divide(a, b) {
    return a / b;
}

function mul(a, b) {
    return a * b;
}

function getUser(id) {
    return users[id];
}

module.exports = {
    divide,
    mul,
    getUser
};