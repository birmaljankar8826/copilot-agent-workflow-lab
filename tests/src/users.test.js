const { createUser, getUsers, getUserById, updateUser, deleteUser, getUsersByRole, searchUsers } = require('./users');

jest.mock('./users');

beforeEach(() => {
  jest.clearAllMocks();
});

// Scenario: successfully creates a user
it('should create a user with valid input', () => {
  const user = { name: 'John Doe', role: 'admin' };
  const createdUser = createUser(user);
  expect(createdUser).toMatchObject(user);
  expect(createdUser).toHaveProperty('id');
  expect(createdUser).toHaveProperty('createdAt');
});

// Scenario: throws error when creating a user with invalid input
it('should throw an error if user data is invalid', () => {
  expect(() => createUser({})).toThrow('User must have a name and role');
  expect(() => createUser({ name: 'John' })).toThrow('User must have a name and role');
  expect(() => createUser({ role: 'admin' })).toThrow('User must have a name and role');
});

// Scenario: retrieves all users
it('should return all users', () => {
  const users = getUsers();
  expect(users).toBeInstanceOf(Array);
});

// Scenario: retrieves a user by ID
it('should return a user by ID', () => {
  const user = createUser({ name: 'Jane Doe', role: 'user' });
  const foundUser = getUserById(user.id);
  expect(foundUser).toEqual(user);
});

// Scenario: throws error when user ID not found
it('should throw an error if user ID is not found', () => {
  expect(() => getUserById(999)).toThrow('User with id 999 not found');
});

// Scenario: updates a user
it('should update a user with valid ID', () => {
  const user = createUser({ name: 'Jane Doe', role: 'user' });
  const updates = { name: 'Jane Smith' };
  const updatedUser = updateUser(user.id, updates);
  expect(updatedUser).toMatchObject(updates);
});

// Scenario: throws error when updating a user with invalid ID
it('should throw an error if user ID for update is not found', () => {
  expect(() => updateUser(999, { name: 'New Name' })).toThrow('User with id 999 not found');
});

// Scenario: deletes a user
it('should delete a user with valid ID', () => {
  const user = createUser({ name: 'John Doe', role: 'admin' });
  const deletedUser = deleteUser(user.id);
  expect(deletedUser).toEqual(user);
});

// Scenario: throws error when deleting a user with invalid ID
it('should throw an error if user ID for deletion is not found', () => {
  expect(() => deleteUser(999)).toThrow('User with id 999 not found');
});

// Scenario: retrieves users by role
it('should return users by role', () => {
  createUser({ name: 'Admin User', role: 'admin' });
  createUser({ name: 'Regular User', role: 'user' });
  const admins = getUsersByRole('admin');
  expect(admins.length).toBe(1);
  expect(admins[0].role).toBe('admin');
});

// Scenario: searches users by query
it('should return users matching the search query', () => {
  createUser({ name: 'John Doe', role: 'admin', email: 'john@example.com' });
  createUser({ name: 'Jane Smith', role: 'user', email: 'jane@example.com' });
  const results = searchUsers('john');
  expect(results.length).toBe(1);
  expect(results[0].name).toBe('John Doe');
});

// Scenario: returns empty array when search query is invalid
it('should return an empty array if search query is invalid', () => {
  const results = searchUsers(123);
  expect(results).toEqual([]);
});

// Scenario: returns empty array when search query is empty
it('should return an empty array if search query is empty', () => {
  const results = searchUsers('');
  expect(results).toEqual([]);
});