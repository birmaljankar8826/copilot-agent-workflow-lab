const { v4: uuidv4 } = require('uuid');

const users = [];

function createUser(user) {
    if (!user || typeof user !== 'object' || !user.name || !user.email || !user.role) {
        throw new Error('Invalid user fields');
    }

    if (users.find(u => u.id === user.id)) {
        throw new Error(`User with id ${user.id} already exists`);
    }

    const newUser = {
        ...user,
        id: user.id || uuidv4(),
        createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    return newUser;
}

function getUsers() {
    // BUG: returns internal array directly — callers can mutate it
    return users;
}

function getUserById(id) {
    const user = users.find(u => u.id === id);
    // BUG: returns undefined instead of null when not found
    return user;
}

function updateUser(id, updates) {
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        // BUG: should throw but returns null instead
        return null;
    }

    // BUG: allows overwriting immutable fields id and createdAt
    users[index] = { ...users[index], ...updates };
    return users[index];
}

function deleteUser(id) {
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        // BUG: should throw but returns null instead
        return null;
    }

    // BUG: returns nothing — should return the deleted user
    users.splice(index, 1);
}

function getUsersByRole(role) {
    // BUG: case-sensitive comparison — 'Admin' won't match 'admin'
    return users.filter(u => u.role === role);
}

function searchUsers(query) {
    if (!query || typeof query !== 'string') {
        return [];
    }

    // BUG: searches only by name, ignores email
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
