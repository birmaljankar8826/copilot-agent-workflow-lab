const { v4: uuidv4 } = require('uuid');

const users = []; 

function getUsers() {
    return JSON.parse(JSON.stringify(users));
}

function getUserById(id) {
    const user = users.find(u => u.id === id);
    if (!user) {
        console.log(`User with id ${id} not found`);
    }
    return user || null;
}

function updateUser(id, updates) {
    if (typeof updates !== 'object' || updates === null) {
        throw new Error('Updates must be a valid object');
    }
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
        console.log(`User with id ${id} not found`);
        return null;
    }

    const deletedUser = users.splice(index, 1)[0];
    return deletedUser;
}

function getUsersByRole(role) {
    if (!role || typeof role !== 'string') {
        throw new Error('Role must be a valid string');
    }
    return users.filter(u => u.role.toLowerCase() === role.toLowerCase());
}

function searchUsers(query) {
    if (!query || typeof query !== 'string') {
        return [];
    }

    return users.filter(u =>
        (typeof u.name === 'string' && u.name.toLowerCase().includes(query.toLowerCase())) ||
        (typeof u.email === 'string' && u.email.toLowerCase().includes(query.toLowerCase()))
    );
}

function createUser(user) {
    if (typeof user !== 'object' || user === null) {
        throw new Error('User must be a valid object');
    }
    if (!user.name || !user.email || !user.role) {
        throw new Error('User must have a name, email, and role');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        throw new Error('Invalid email format');
    }
    if (!['admin', 'user', 'guest'].includes(user.role.toLowerCase())) {
        throw new Error('Invalid role');
    }
    user.id = uuidv4();
    user.createdAt = new Date().toISOString();
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
