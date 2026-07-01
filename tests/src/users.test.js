let createUser, getUsers, getUserById, updateUser, deleteUser, getUsersByRole, searchUsers;

beforeEach(() => {
  jest.resetModules();
  ({ createUser, getUsers, getUserById, updateUser, deleteUser, getUsersByRole, searchUsers } = require('../../src/users'));
});

describe('User Management', () => {
  // Scenario: successfully creates a user
  it('should create a user successfully', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' };
    const createdUser = createUser(user);
    expect(createdUser).toMatchObject(user);
  });

  // Scenario: throws error when creating a user with invalid object
  it('should throw an error when creating a user with invalid object', () => {
    expect(() => createUser(null)).toThrow('Invalid user object');
    expect(() => createUser('string')).toThrow('Invalid user object');
  });

  // Scenario: throws error when creating a user with missing fields
  it('should throw an error when creating a user with missing fields', () => {
    expect(() => createUser({ name: 'John' })).toThrow('Invalid or missing id');
    expect(() => createUser({ id: '1' })).toThrow('Invalid or missing name');
    expect(() => createUser({ id: '1', name: 'John' })).toThrow('Invalid or missing email');
    expect(() => createUser({ id: '1', name: 'John', email: 'john@example.com' })).toThrow('Invalid or missing role');
  });

  // Scenario: throws error when creating a user with invalid email format
  it('should throw an error when creating a user with invalid email format', () => {
    const user = { id: '1', name: 'John Doe', email: 'johnexample.com', role: 'admin' };
    expect(() => createUser(user)).toThrow('Invalid or missing email');
  });

  // Scenario: throws error when creating a user with duplicate ID
  it('should throw an error when creating a user with duplicate ID', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' };
    createUser(user);
    expect(() => createUser(user)).toThrow('User with this id already exists');
  });

  // Scenario: retrieves all users
  it('should retrieve all users', () => {
    const users = getUsers();
    expect(users).toBeInstanceOf(Array);
  });

  // Scenario: retrieves a user by ID
  it('should retrieve a user by ID', () => {
    const user = { id: '1', name: 'Jane Doe', email: 'jane@example.com', role: 'user' };
    createUser(user);
    const foundUser = getUserById('1');
    expect(foundUser).toEqual(user);
  });

  // Scenario: returns null when retrieving a user with non-existent ID
  it('should return null when retrieving a user with non-existent ID', () => {
    const user = getUserById('non-existent-id');
    expect(user).toBeNull();
  });

  // Scenario: throws error when retrieving a user with invalid ID
  it('should throw an error when retrieving a user with invalid ID', () => {
    expect(() => getUserById(null)).toThrow('Invalid id parameter');
    expect(() => getUserById('')).toThrow('Invalid id parameter');
  });

  // Scenario: updates a user successfully
  it('should update a user successfully', () => {
    const user = { id: '2', name: 'Alice', email: 'alice@example.com', role: 'admin' };
    createUser(user);
    const updates = { name: 'Alice Smith' };
    const updatedUser = updateUser('2', updates);
    expect(updatedUser.name).toBe('Alice Smith');
  });

  // Scenario: throws error when updating a user with non-existent ID
  it('should throw an error when updating a user with non-existent ID', () => {
    expect(() => updateUser('non-existent-id', { name: 'New Name' })).toThrow('User with id non-existent-id not found');
  });

  // Scenario: deletes a user successfully
  it('should delete a user successfully', () => {
    const user = { id: '3', name: 'Charlie', email: 'charlie@example.com', role: 'admin' };
    createUser(user);
    const deletedUser = deleteUser('3');
    expect(deletedUser).toEqual(user);
  });

  // Scenario: throws error when deleting a user with non-existent ID
  it('should throw an error when deleting a user with non-existent ID', () => {
    expect(() => deleteUser('non-existent-id')).toThrow('User with id non-existent-id not found');
  });

  // Scenario: throws error when deleting a user with invalid ID
  it('should throw an error when deleting a user with invalid ID', () => {
    expect(() => deleteUser(null)).toThrow('Invalid id parameter');
    expect(() => deleteUser('')).toThrow('Invalid id parameter');
  });

  // Scenario: retrieves users by role
  it('should retrieve users by role', () => {
    createUser({ id: '4', name: 'Dave', email: 'dave@example.com', role: 'admin' });
    createUser({ id: '5', name: 'Eve', email: 'eve@example.com', role: 'user' });
    const admins = getUsersByRole('admin');
    expect(admins.length).toBe(1);
    expect(admins[0].role).toBe('admin');
  });

  // Scenario: throws error when retrieving users by invalid role
  it('should throw an error when retrieving users by invalid role', () => {
    expect(() => getUsersByRole(123)).toThrow('Invalid role parameter');
    expect(() => getUsersByRole('')).toThrow('Invalid role parameter');
  });

  // Scenario: returns empty array when retrieving users by non-existent role
  it('should return empty array when retrieving users by non-existent role', () => {
    const users = getUsersByRole('non-existent-role');
    expect(users).toEqual([]);
  });

  // Scenario: searches users by query
  it('should search users by query', () => {
    createUser({ id: '6', name: 'Frank', email: 'frank@example.com', role: 'user' });
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