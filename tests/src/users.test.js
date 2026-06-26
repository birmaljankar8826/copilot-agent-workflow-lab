let createUser, getUsers, getUserById, updateUser, deleteUser, getUsersByRole, searchUsers;

beforeEach(() => {
  jest.resetModules();
  ({ createUser, getUsers, getUserById, updateUser, deleteUser, getUsersByRole, searchUsers } = require('../../src/users'));
});

describe('User Management', () => {
  // Scenario: successfully creates a user
  it('should create a user successfully', () => {
    const user = { name: 'John Doe', email: 'john@example.com', role: 'admin' };
    const createdUser = createUser(user);
    expect(createdUser).toMatchObject(user);
    expect(createdUser).toHaveProperty('id');
    expect(createdUser).toHaveProperty('createdAt');
  });

  // Scenario: throws error when creating a user with invalid object
  it('should throw an error when creating a user with invalid object', () => {
    expect(() => createUser(null)).toThrow('User must be a valid object');
    expect(() => createUser('string')).toThrow('User must be a valid object');
  });

  // Scenario: throws error when creating a user with missing fields
  it('should throw an error when creating a user with missing fields', () => {
    expect(() => createUser({ name: 'John' })).toThrow('User must have a name, email, and role');
  });

  // Scenario: throws error when creating a user with invalid email format
  it('should throw an error when creating a user with invalid email format', () => {
    const user = { name: 'John Doe', email: 'johnexample.com', role: 'admin' };
    expect(() => createUser(user)).toThrow('Invalid email format');
  });

  // Scenario: throws error when creating a user with invalid role
  it('should throw an error when creating a user with invalid role', () => {
    const user = { name: 'John Doe', email: 'john@example.com', role: 'superuser' };
    expect(() => createUser(user)).toThrow('Invalid role');
  });

  // Scenario: retrieves all users
  it('should retrieve all users', () => {
    const users = getUsers();
    expect(users).toBeInstanceOf(Array);
  });

  // Scenario: retrieves a user by ID
  it('should retrieve a user by ID', () => {
    const user = { name: 'Jane Doe', email: 'jane@example.com', role: 'user' };
    const createdUser = createUser(user);
    const foundUser = getUserById(createdUser.id);
    expect(foundUser).toEqual(createdUser);
  });

  // Scenario: returns null when retrieving a user with non-existent ID
  it('should return null when retrieving a user with non-existent ID', () => {
    const user = getUserById('non-existent-id');
    expect(user).toBeNull();
  });

  // Scenario: updates a user successfully
  it('should update a user successfully', () => {
    const user = { name: 'Alice', email: 'alice@example.com', role: 'admin' };
    const createdUser = createUser(user);
    const updates = { name: 'Alice Smith' };
    const updatedUser = updateUser(createdUser.id, updates);
    expect(updatedUser.name).toBe('Alice Smith');
  });

  // Scenario: throws error when updating a user with non-existent ID
  it('should throw an error when updating a user with non-existent ID', () => {
    expect(() => updateUser('non-existent-id', { name: 'New Name' })).toThrow('User with id non-existent-id not found');
  });

  // Scenario: throws error when updating a user with invalid updates object
  it('should throw an error when updating a user with invalid updates object', () => {
    const user = { name: 'Bob', email: 'bob@example.com', role: 'user' };
    const createdUser = createUser(user);
    expect(() => updateUser(createdUser.id, null)).toThrow('Updates must be a valid object');
  });

  // Scenario: deletes a user successfully
  it('should delete a user successfully', () => {
    const user = { name: 'Charlie', email: 'charlie@example.com', role: 'admin' };
    const createdUser = createUser(user);
    const deletedUser = deleteUser(createdUser.id);
    expect(deletedUser).toEqual(createdUser);
  });

  // Scenario: returns null when deleting a user with non-existent ID
  it('should return null when deleting a user with non-existent ID', () => {
    const result = deleteUser('non-existent-id');
    expect(result).toBeNull();
  });

  // Scenario: retrieves users by role
  it('should retrieve users by role', () => {
    createUser({ name: 'Dave', email: 'dave@example.com', role: 'admin' });
    createUser({ name: 'Eve', email: 'eve@example.com', role: 'user' });
    const admins = getUsersByRole('admin');
    expect(admins.length).toBe(1);
    expect(admins[0].role).toBe('admin');
  });

  // Scenario: throws error when retrieving users by invalid role
  it('should throw an error when retrieving users by invalid role', () => {
    expect(() => getUsersByRole(123)).toThrow('Role must be a valid string');
  });

  // Scenario: returns empty array when retrieving users by non-existent role
  it('should return empty array when retrieving users by non-existent role', () => {
    const users = getUsersByRole('non-existent-role');
    expect(users).toEqual([]);
  });

  // Scenario: searches users by query
  it('should search users by query', () => {
    createUser({ name: 'Frank', email: 'frank@example.com', role: 'user' });
    const results = searchUsers('frank');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Frank');
  });

  // Scenario: returns empty array when searching with empty query
  it('should return empty array when searching with empty query', () => {
    const results = searchUsers('');
    expect(results).toEqual([]);
  });

  // Scenario: returns empty array when searching with non-matching query
  it('should return empty array when searching with non-matching query', () => {
    const results = searchUsers('non-existent-query');
    expect(results).toEqual([]);
  });

  // Scenario: returns empty array when searching with invalid query type
  it('should return empty array when searching with invalid query type', () => {
    const results = searchUsers(123);
    expect(results).toEqual([]);
  });
});
