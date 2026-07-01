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
        return null;
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
        return null;
    }

    users.splice(index, 1);
    return true;
}

function getUsersByRole(role) {
    if (!role || typeof role !== 'string') {
        return [];
    }
    const validRoles = [...new Set(users.map(u => u.role))];
    if (!validRoles.includes(role)) {
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
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
