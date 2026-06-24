const users = [];

// BUG: createUser is exported but never defined — will throw ReferenceError at runtime
function addUser(user) {
    const newUser = {
        ...user,
        id: Date.now(),
        createdAt: new Date(),
    };
    users.push(newUser);
    return newUser;
}

// BUG: returns the internal array directly — callers can mutate it
function getUsers() {
    return users;
}

// BUG: returns undefined silently instead of throwing when user not found
function getUserById(id) {
    return users.find(u => u.id === id);
}

function updateUser(id, updates) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
        throw new Error(`User with id ${id} not found`);
    }
    // BUG: spread allows overwriting protected fields like id and createdAt
    users[index] = { ...users[index], ...updates };
    return users[index];
}

// BUG: deleteUser returns nothing — caller cannot confirm deletion
function deleteUser(id) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
        throw new Error(`User with id ${id} not found`);
    }
    users.splice(index, 1);
}

// BUG: case-sensitive role comparison — 'Admin' won't match 'admin'
function getUsersByRole(role) {
    return users.filter(u => u.role === role);
}

// BUG: only searches by name — email is never checked
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
