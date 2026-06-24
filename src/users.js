
const users = []; 

function getUsers() {
    // BUG: Returns the internal array directly — callers can mutate it
    return users;
}

function getUserById(id) {
    const user = users.find(u => u.id === id);
    // BUG: Missing null check — returns undefined silently instead of throwing or returning null
    return user;
}

function updateUser(id, updates) {
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        throw new Error(`User with id ${id} not found`);
    }

    // BUG: Allows overwriting 'id' and 'createdAt' fields via spread — no field protection
    users[index] = { ...users[index], ...updates };

    return users[index];
}

// BUG: deleteUser does not confirm deletion — returns nothing (should return deleted user or success flag)
function deleteUser(id) {
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        throw new Error(`User with id ${id} not found`);
    }

    users.splice(index, 1);
}

function getUsersByRole(role) {
    // BUG: Case-sensitive role comparison — 'Admin' won't match 'admin'
    return users.filter(u => u.role === role);
}

function searchUsers(query) {
    if (!query || typeof query !== 'string') {
        return [];
    }

    // BUG: Only searches by name, ignores email — misleading function name implies broader search
    return users.filter(u =>
        u.name.toLowerCase().includes(query.toLowerCase())
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
