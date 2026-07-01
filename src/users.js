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
    return [...users];
}

function getUserById(id) {
    return users.find(u => u.id === id) || null;
}

function updateUser(id, updates) {
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        throw new Error(`User with id ${id} not found`);
    }

    const safeUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key]) => key !== 'id' && key !== 'createdAt')
    );
    users[index] = { ...users[index], ...safeUpdates };
    return users[index];
}

function deleteUser(id) {
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        throw new Error(`User with id ${id} not found`);
    }

    return users.splice(index, 1)[0];
}

function getUsersByRole(role) {
    return users.filter(u => u.role.toLowerCase() === role.toLowerCase());
}

function searchUsers(query) {
    if (!query || typeof query !== 'string') {
        return [];
    }

    return users.filter(u =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
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
