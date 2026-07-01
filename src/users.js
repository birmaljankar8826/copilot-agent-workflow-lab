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

    users[index] = { ...users[index], ...updates };
    return users[index];
}

function deleteUser(id) {
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        throw new Error(`User with id ${id} not found`);
    }

    users.splice(index, 1);
}

function getUsersByRole(role) {
    if (!role || typeof role !== 'string') {
        throw new Error('Invalid role');
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
    const { name, email, role } = user;
    if (!name || typeof name !== 'string' || !email || typeof email !== 'string' || !role || typeof role !== 'string') {
        throw new Error('Invalid user fields');
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
