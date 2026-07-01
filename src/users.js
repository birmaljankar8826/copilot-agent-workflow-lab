const users = [];

function getUsers() {
    // Return a shallow copy of the users array to prevent external mutation
    return [...users];
}

function getUserById(id) {
    const user = users.find(u => u.id === id);
    // Return null if user is not found
    return user || null;
}

function updateUser(id, updates) {
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        throw new Error(`User with id ${id} not found`);
    }

    // Protect immutable fields (id, createdAt) from being overwritten
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

    // Return the deleted user
    return users.splice(index, 1)[0];
}

function getUsersByRole(role) {
    // Perform a case-insensitive role comparison
    return users.filter(u => u.role.toLowerCase() === role.toLowerCase());
}

function searchUsers(query) {
    if (!query || typeof query !== 'string') {
        return [];
    }

    // Search by both name and email
    return users.filter(u =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
    );
}

// Define the createUser function
function createUser(user) {
    if (!user || typeof user !== 'object') {
        throw new Error('Invalid user object');
    }

    const newUser = {
        ...user,
        id: user.id || String(Date.now()), // Generate an ID if not provided
        createdAt: user.createdAt || new Date().toISOString(), // Set createdAt if not provided
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
