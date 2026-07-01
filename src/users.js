const users = [];

function getUsers() {
    return JSON.parse(JSON.stringify(users));
}

function getUserById(id) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Invalid id parameter');
    }

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
    if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Invalid id parameter');
    }

    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        throw new Error(`User with id ${id} not found`);
    }

    const deletedUser = users[index];
    users.splice(index, 1);
    return deletedUser || null;
}

function getUsersByRole(role) {
    if (!role || typeof role !== 'string' || role.trim() === '') {
        throw new Error('Invalid role parameter');
    }

    return users.filter(u => u.role.toLowerCase() === role.toLowerCase());
}

function searchUsers(query) {
    if (!query || typeof query !== 'string' || query.trim() === '') {
        return [];
    }

    const lowerCaseQuery = query.toLowerCase();
    return users.filter(u => {
        const nameMatch = typeof u.name === 'string' && u.name.toLowerCase().includes(lowerCaseQuery);
        const emailMatch = typeof u.email === 'string' && u.email.toLowerCase().includes(lowerCaseQuery);
        return nameMatch || emailMatch;
    });
}

function createUser(user) {
    if (!user || typeof user !== 'object') {
        throw new Error('Invalid user object');
    }

    const { id, name, email, role } = user;

    if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Invalid or missing id');
    }

    if (users.some(u => u.id === id)) {
        throw new Error('User with this id already exists');
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new Error('Invalid or missing name');
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid or missing email');
    }

    if (!role || typeof role !== 'string' || role.trim() === '') {
        throw new Error('Invalid or missing role');
    }

    const sanitizedUser = {
        id,
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
    };

    users.push(sanitizedUser);
    return sanitizedUser;
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
