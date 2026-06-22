function divide(a, b) {
    if (b === 0) {
        throw new Error("Division by zero is not allowed.");
    }
    return a / b;
}

function mul(a, b) {
    return a * b;
}

const users = {}; // Assuming users is an object that holds user data

function getUser(id) {
    return users[id];
}

module.exports = {
    divide,
    mul,
    getUser
};
