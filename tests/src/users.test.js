const { createUser, getUsers, getUserById, updateUser, deleteUser, getUsersByRole, searchUsers } = require('../src/users');

let usersModule;

beforeEach(() => {
  jest.resetModules();
  usersModule = require('../src/users');
});

describe('users module', () => {
  // Scenario: returns an empty array when no users exist
  it('getUsers() should return an empty array initially', () => {
    expect(usersModule.getUsers()).toEqual([]);
  });

  // Scenario: creates a new user successfully
  it('createUser() should create a new user', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' };
    expect(usersModule.createUser(user)).toEqual(user);
    expect(usersModule.getUsers()).toEqual([user]);
  });

  // Scenario: throws an error when creating a user with invalid fields
  it('createUser() should throw an error for invalid user fields', () => {
    expect(() => usersModule.createUser({ id: '1', name: 'John Doe' })).toThrow('Invalid user fields');
  });

  // Scenario: throws an error when creating a user with duplicate ID
  it('createUser() should throw an error for duplicate user ID', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' };
    usersModule.createUser(user);
    expect(() => usersModule.createUser(user)).toThrow('User with id 1 already exists');
  });

  // Scenario: retrieves a user by ID successfully
  it('getUserById() should return a user by ID', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' };
    usersModule.createUser(user);
    expect(usersModule.getUserById('1')).toEqual(user);
  });

  // Scenario: returns null when user ID is not found
  it('getUserById() should return null for non-existent ID', () => {
    expect(usersModule.getUserById('999')).toBeNull();
  });

  // Scenario: updates a user successfully
  it('updateUser() should update a user by ID', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' };
    usersModule.createUser(user);
    const updates = { name: 'Jane Doe', role: 'user' };
    expect(usersModule.updateUser('1', updates)).toEqual({ ...user, ...updates });
  });

  // Scenario: returns null when updating a non-existent user
  it('updateUser() should return null for non-existent ID', () => {
    expect(usersModule.updateUser('999', { name: 'Jane Doe' })).toBeNull();
  });

  // Scenario: deletes a user successfully
  it('deleteUser() should delete a user by ID', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' };
    usersModule.createUser(user);
    expect(usersModule.deleteUser('1')).toBe(true);
    expect(usersModule.getUsers()).toEqual([]);
  });

  // Scenario: returns null when deleting a non-existent user
  it('deleteUser() should return null for non-existent ID', () => {
    expect(usersModule.deleteUser('999')).toBeNull();
  });

  // Scenario: retrieves users by role successfully
  it('getUsersByRole() should return users with the specified role', () => {
    const user1 = { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' };
    const user2 = { id: '2', name: 'Jane Doe', email: 'jane@example.com', role: 'user' };
    usersModule.createUser(user1);
    usersModule.createUser(user2);
    expect(usersModule.getUsersByRole('admin')).toEqual([user1]);
  });

  // Scenario: returns an empty array for invalid or non-existent roles
  it('getUsersByRole() should return an empty array for invalid or non-existent roles', () => {
    expect(usersModule.getUsersByRole('invalidRole')).toEqual([]);
  });

  // Scenario: searches users by query successfully
  it('searchUsers() should return users matching the query', () => {
    const user1 = { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' };
    const user2 = { id: '2', name: 'Jane Doe', email: 'jane@example.com', role: 'user' };
    usersModule.createUser(user1);
    usersModule.createUser(user2);
    expect(usersModule.searchUsers('Jane')).toEqual([user2]);
  });

  // Scenario: returns an empty array for invalid or empty search queries
  it('searchUsers() should return an empty array for invalid or empty queries', () => {
    expect(usersModule.searchUsers('')).toEqual([]);
    expect(usersModule.searchUsers(null)).toEqual([]);
  });
});