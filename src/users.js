const users = [];

function createUser(user) {
    if (!user || typeof user !== 'object') {
        throw new Error('Invalid user object');
    }
    if (!user.name || !user.email || !user.role) {
        throw new Error('User object must contain name, email, and role');
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
    return [...users];
}

function getUserById(id) {
    return users.find(u => u.id === id) || null;
}

function updateUser(id, updates) {
    if (!updates || typeof updates !== 'object') {
        throw new Error('Invalid updates object');
    }
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
    const deletedUser = users.splice(index, 1)[0];
    return deletedUser;
}

function getUsersByRole(role) {
    return users.filter(u => u.role && u.role.toLowerCase() === role.toLowerCase());
}

function searchUsers(query) {
    if (!query || typeof query !== 'string') return [];
    return users.filter(u =>
        (u.name && u.name.toLowerCase().includes(query.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(query.toLowerCase()))
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
