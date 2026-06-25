const users = [];

// BUG: createUser is exported but never defined — ReferenceError at runtime
function addUser(user) {
    const newUser = {
        ...user,
        id: Date.now(),
        createdAt: new Date(),
    };
    users.push(newUser);
    return newUser;
}

// BUG: returns the internal array directly — callers can mutate state
function getUsers() {
    return users;
}

// BUG: returns undefined silently when user is not found
function getUserById(id) {
    return users.find(u => u.id === id);
}

function updateUser(id, updates) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
        throw new Error(`User with id ${id} not found`);
    }
    // BUG: spread allows callers to overwrite id and createdAt
    users[index] = { ...users[index], ...updates };
    return users[index];
}

// BUG: returns nothing — caller cannot confirm deletion succeeded
function deleteUser(id) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
        throw new Error(`User with id ${id} not found`);
    }
    users.splice(index, 1);
}

// BUG: case-sensitive — 'Admin' will not match 'admin'
function getUsersByRole(role) {
    return users.filter(u => u.role === role);
}

// BUG: only searches by name, ignores email field entirely
function searchUsers(query) {
    if (!query || typeof query !== 'string') return [];
    return users.filter(u =>
        u.name.toLowerCase().includes(query.toLowerCase())
    );
}

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUsersByRole,
    searchUsers,
};
