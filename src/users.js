const users = [];

function getUsers() {
    return JSON.parse(JSON.stringify(users));
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

    const deletedUser = users.splice(index, 1)[0];
    return deletedUser || null;
}

function getUsersByRole(role) {
    if (!role || typeof role !== 'string') {
        throw new Error('Invalid role');
    }
    return users.filter(u => u.role.toLowerCase() === role.toLowerCase());
}

function searchUsers(query) {
    if (!query || typeof query !== 'string') {
        return [];
    }

    return users.filter(u =>
        typeof u.name === 'string' && u.name.toLowerCase().includes(query.toLowerCase()) ||
        typeof u.email === 'string' && u.email.toLowerCase().includes(query.toLowerCase())
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
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
