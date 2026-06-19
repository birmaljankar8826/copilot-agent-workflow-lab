function divide(a, b) {
    if (b === 0) {
        throw new Error("Division by zero");
    }
    return a / b;
}

function mul(a, b) {
    return a * b;
}

const users = {};

function getUser(id) {
    return users[id];
}

module.exports = {
    divide,
    mul,
    getUser
};
