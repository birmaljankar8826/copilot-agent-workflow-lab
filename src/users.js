const users = []; 

function createUser(user) {
    if (!user || !user.name || !user.role) {
        throw new Error('User must have a name and role');
    }
    const newUser = { ...user, id: Date.now(), createdAt: new Date() };
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

    const { id: userId, createdAt, ...allowedUpdates } = updates;
    users[index] = { ...users[index], ...allowedUpdates };

    return users[index];
}

function deleteUser(id) {
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        throw new Error(`User with id ${id} not found`);
    }

    const deletedUser = users[index];
    users.splice(index, 1);
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
