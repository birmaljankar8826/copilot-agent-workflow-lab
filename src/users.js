const users = []; 

function getUsers() {
    // Return a shallow copy of the users array to prevent external mutation
    return [...users];
}

function getUserById(id) {
    const user = users.find(u => u.id === id);
    // Return null if the user is not found
    return user || null;
}

function updateUser(id, updates) {
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        throw new Error(`User with id ${id} not found`);
    }

    // Protect immutable fields from being overwritten
    const safeUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key]) => key !== 'id' && key !== 'createdAt')
    );
    users[index] = { ...users[index], ...safeUpdates };

    return users[index];
}

function deleteUser(id) {
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        // Return null if the user is not found
        return null;
    }

    // Remove the user and return the deleted user object
    const [deletedUser] = users.splice(index, 1);
    return deletedUser;
}

function getUsersByRole(role) {
    // Perform a case-insensitive role comparison
    return users.filter(u => u.role.toLowerCase() === role.toLowerCase());
}

function searchUsers(query) {
    if (!query || typeof query !== 'string') {
        return [];
    }

    // Extend search to include both name and email
    return users.filter(u =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
    );
}

// Define the createUser function
function createUser(user) {
    // Add the new user to the users array
    const newUser = {
        ...user,
        id: user.id || `${Date.now()}`, // Generate an ID if not provided
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
