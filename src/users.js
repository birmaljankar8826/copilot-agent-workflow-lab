const users = [];

function getUsers() {
    return [...users];
}

function getUserById(id) {
    const user = users.find(u => u.id === id);
    return user || null;
}

function updateUser(id, updates) {
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        throw new Error(`User with id ${id} not found`);
    }

    const { id: unusedId, createdAt: unusedCreatedAt, ...safeUpdates } = updates;
    users[index] = { ...users[index], ...safeUpdates };

    return users[index];
}

function deleteUser(id) {
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        throw new Error(`User with id ${id} not found`);
    }

    const [deletedUser] = users.splice(index, 1);
    return deletedUser;
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

function createUser(user) {
    if (!user || typeof user !== 'object' || !user.name || !user.email || !user.role) {
        throw new Error('Invalid user object');
    }
    const newUser = { ...user, id: generateUniqueId(), createdAt: new Date() };
    users.push(newUser);
    return newUser;
}

function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
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
