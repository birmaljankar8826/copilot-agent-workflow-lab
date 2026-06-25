const users = [];

function createUser(user) {
    if (!user || typeof user !== 'object') {
        throw new Error('Invalid user object');
    }
    const { name, email, role } = user;
    if (!name || !email || !role) {
        throw new Error('User must have name, email, and role');
    }
    const newUser = {
        name,
        email,
        role,
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
    const user = users.find(u => u.id === id);
    if (!user) {
        throw new Error(`User with id ${id} not found`);
    }
    return user;
}

function updateUser(id, updates) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
        throw new Error(`User with id ${id} not found`);
    }
    if (!updates || typeof updates !== 'object') {
        throw new Error('Invalid updates object');
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
