const users = []; 

function createUser(user) {
    if (!user.id || !user.name) {
        throw new Error('User must have an id and a name');
    }
    user.createdAt = new Date();
    users.push(user);
    return user;
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

    const { id: userId, createdAt, ...allowedUpdates } = updates;
    users[index] = { ...users[index], ...allowedUpdates };

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
