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
        throw new Error(`User with id ${id} not found`);
    }

    if (typeof updates !== 'object' || updates === null) {
        throw new Error('Updates must be a valid object');
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
    if (!role || typeof role !== 'string' || role.trim() === '') {
        throw new Error('Role must be a non-empty string');
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
    if (user.createdAt && isNaN(Date.parse(user.createdAt))) {
        throw new Error('createdAt must be a valid ISO date string');
    }

    const newUser = {
        ...user,
        id: user.id || uuidv4(),
        createdAt: user.createdAt || new Date().toISOString(),
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
