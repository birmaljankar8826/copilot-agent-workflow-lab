const users = [];

function addUser(user) {
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
    users[index] = { ...users[index], ...updates };
    return users[index];
}

function deleteUser(id) {
    const index = users.findIndex(u => u.id === id);
    users.splice(index, 1);
}

function getUsersByRole(role) {
    return users.filter(u => u.role === role);
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
