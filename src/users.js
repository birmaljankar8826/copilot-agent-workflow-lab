const users = [];

function createUser(user) {
    if (typeof user !== 'object' || !user) {
        throw new Error('Invalid user object');
    }
    const newUser = {
        ...user,
        id: Date.now(),
        createdAt: new Date(),
    };
    users.push(newUser);
    return newUser;
}

function getUsers() {
    return users;
}

function getUserById(id) {
    return users.find(u => u.id === id);
}

function updateUser(id, updates) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
        throw new Error('User not found');
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
        throw new Error('User not found');
    }
    users.splice(index, 1);
    return true;
}

function getUsersByRole(role) {
    return users.filter(u => u.role && u.role.toLowerCase() === role.toLowerCase());
}

function searchUsers(query) {
    if (!query || typeof query !== 'string') return [];
    return users.filter(u =>
        u.name && u.name.toLowerCase().includes(query.toLowerCase())
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
