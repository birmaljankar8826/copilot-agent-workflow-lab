const { createUser, getUsers, getUserById, updateUser, deleteUser, getUsersByRole, searchUsers } = require('./users');

jest.mock('./users');

beforeEach(() => {
  jest.clearAllMocks();
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
    expect(() => createUser(null)).toThrow('Invalid user object');
    expect(() => createUser('string')).toThrow('Invalid user object');
  });

  // Scenario: throws error when creating a user with missing fields
  it('should throw an error when creating a user with missing fields', () => {
    expect(() => createUser({ name: 'John' })).toThrow('User must have name, email, and role');
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

  // Scenario: throws error when retrieving a user with non-existent ID
  it('should throw an error when retrieving a user with non-existent ID', () => {
    expect(() => getUserById(999)).toThrow('User with id 999 not found');
  });

  // Scenario: updates a user successfully
  it('should update a user successfully', () => {
    const user = { name: 'Alice', email: 'alice@example.com', role: 'editor' };
    const createdUser = createUser(user);
    const updates = { name: 'Alice Smith' };
    const updatedUser = updateUser(createdUser.id, updates);
    expect(updatedUser.name).toBe('Alice Smith');
  });

  // Scenario: throws error when updating a user with non-existent ID
  it('should throw an error when updating a user with non-existent ID', () => {
    expect(() => updateUser(999, { name: 'New Name' })).toThrow('User with id 999 not found');
  });

  // Scenario: throws error when updating a user with invalid updates object
  it('should throw an error when updating a user with invalid updates object', () => {
    const user = { name: 'Bob', email: 'bob@example.com', role: 'viewer' };
    const createdUser = createUser(user);
    expect(() => updateUser(createdUser.id, null)).toThrow('Invalid updates object');
  });

  // Scenario: deletes a user successfully
  it('should delete a user successfully', () => {
    const user = { name: 'Charlie', email: 'charlie@example.com', role: 'admin' };
    const createdUser = createUser(user);
    const deletedUser = deleteUser(createdUser.id);
    expect(deletedUser).toEqual(createdUser);
  });

  // Scenario: throws error when deleting a user with non-existent ID
  it('should throw an error when deleting a user with non-existent ID', () => {
    expect(() => deleteUser(999)).toThrow('User with id 999 not found');
  });

  // Scenario: retrieves users by role
  it('should retrieve users by role', () => {
    createUser({ name: 'Dave', email: 'dave@example.com', role: 'admin' });
    createUser({ name: 'Eve', email: 'eve@example.com', role: 'user' });
    const admins = getUsersByRole('admin');
    expect(admins.length).toBe(1);
    expect(admins[0].role).toBe('admin');
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
});