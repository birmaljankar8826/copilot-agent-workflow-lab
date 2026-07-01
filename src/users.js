const users = [];

function getUsers() {
    return users;
}

function getUserById(id) {
    const user = users.find(u => u.id === id);
    if (!user) {
        throw new Error(`User not found`);
    }
    return user;
}

function createUser(user) {
    if (!user || typeof user !== 'object') {
        throw new Error('Invalid user object');
    }
    const { id, name, email, role } = user;
    if (!id || !name || !email || !role) {
        throw new Error('Invalid user fields');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }
    if (users.some(u => u.id === id)) {
        throw new Error(`User with id ${id} already exists`);
    }
    return user;
}

function updateUser(id, updates) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
        return null;
    }
    users[index] = { ...users[index], ...updates };
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
    return users.filter(u => u.role === role);
}

function searchUsers(query) {
    if (!query || typeof query !== 'string') {
        return [];
    }
    return users.filter(u =>
        typeof u.email === 'string' && u.email.toLowerCase().includes(query.toLowerCase())
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
