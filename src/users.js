const { v4: uuidv4 } = require('uuid');

let users = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', createdAt: new Date('2024-01-15') },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'user', createdAt: new Date('2024-02-20') },
    { id: '3', name: 'Carol White', email: 'carol@example.com', role: 'user', createdAt: new Date('2024-03-10') },
];

// BUG: No input validation — name/email/role are not validated before inserting
function createUser(name, email, role = 'user') {
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    const newUser = {
        id: uuidv4(),
        name,
        email,
        role,
        createdAt: new Date(),
    };

    users.push(newUser);
    // BUG: Returns the full mutable object reference instead of a copy
    return newUser;
}

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
