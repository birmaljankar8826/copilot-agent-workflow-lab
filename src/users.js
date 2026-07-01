const users = [];

function getUsers() {
    return users;
}

function getUserById(id) {
    const user = users.find(u => u.id === id);
    return user;
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
        return false;
    }

    users.splice(index, 1);
    return true;
}

function getUsersByRole(role) {
    if (!role || typeof role !== 'string') {
        return [];
    }
    return users.filter(u => u.role === role);
}

function searchUsers(query) {
    if (!query || typeof query !== 'string') {
        return [];
    }

    return users.filter(u =>
        typeof u.name === 'string' && u.name.toLowerCase().includes(query.toLowerCase())
    );
}

function createUser(user) {
    if (!user || typeof user !== 'object') {
        throw new Error('Invalid user object');
    }
    const { id, name, email, role } = user;
    if (!id || typeof id !== 'string' || !name || typeof name !== 'string' || !email || typeof email !== 'string' || !role || typeof role !== 'string') {
        throw new Error('Invalid user fields');
    }
    if (users.some(u => u.id === id)) {
        throw new Error(`User with id ${id} already exists`);
    }
    users.push(user);
    return user;
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
