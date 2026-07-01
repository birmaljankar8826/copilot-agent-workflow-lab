const { v4: uuidv4 } = require('uuid');

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

    const [deletedUser] = users.splice(index, 1);
    return deletedUser;
}

function getUsersByRole(role) {
    if (typeof role !== 'string') {
        throw new Error('Role must be a string');
    }

    return users.filter(u => u.role && u.role.toLowerCase() === role.toLowerCase());
}

function searchUsers(query) {
    if (!query || typeof query !== 'string') {
        return [];
    }

    return users.filter(u =>
        (u.name && u.name.toLowerCase().includes(query.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(query.toLowerCase()))
    );
}

function createUser(user) {
    if (!user || typeof user !== 'object') {
        throw new Error('Invalid user object');
    }

    const { name, email, role } = user;

    if (typeof name !== 'string' || typeof email !== 'string' || typeof role !== 'string') {
        throw new Error('Invalid user fields: name, email, and role must be strings');
    }

    const sanitizedUser = {
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
    };

    const newUser = {
        ...sanitizedUser,
        id: user.id || uuidv4(),
        createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    return newUser;
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
