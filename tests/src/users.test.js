const { createUser, getUsers, getUserById, updateUser, deleteUser, getUsersByRole, searchUsers } = require('../../src/users');

let users;

beforeEach(() => {
  jest.resetModules();
  users = require('../../src/users');
});

describe('Users Module', () => {
  describe('createUser', () => {
    // Scenario: creates a user with all required fields
    it('creates a user with all required fields', () => {
      const user = { name: 'John Doe', email: 'john@example.com', role: 'admin' };
      const result = createUser(user);

      expect(result).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin'
      });
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('createdAt');
    });

    // Scenario: throws an error if user object is invalid
    it('throws an error if user object is invalid', () => {
      expect(() => createUser(null)).toThrow('Invalid user object');
      expect(() => createUser('invalid')).toThrow('Invalid user object');
    });
  });

  describe('getUsers', () => {
    // Scenario: returns an empty array when no users exist
    it('returns an empty array when no users exist', () => {
      expect(getUsers()).toEqual([]);
    });

    // Scenario: returns a shallow copy of the users array
    it('returns a shallow copy of the users array', () => {
      const user = createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      const result = getUsers();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
    });
  });

  describe('getUserById', () => {
    // Scenario: returns the user with the given ID
    it('returns the user with the given ID', () => {
      const user = createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      const result = getUserById(user.id);

      expect(result).toEqual(user);
    });

    // Scenario: returns null if the user is not found
    it('returns null if the user is not found', () => {
      expect(getUserById('nonexistent-id')).toBeNull();
    });
  });

  describe('updateUser', () => {
    // Scenario: updates a user with valid fields
    it('updates a user with valid fields', () => {
      const user = createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      const updates = { name: 'Jane Doe', role: 'user' };
      const updatedUser = updateUser(user.id, updates);

      expect(updatedUser).toMatchObject({ name: 'Jane Doe', email: 'john@example.com', role: 'user' });
    });

    // Scenario: throws an error if the user is not found
    it('throws an error if the user is not found', () => {
      expect(() => updateUser('nonexistent-id', { name: 'Jane Doe' })).toThrow('User with id nonexistent-id not found');
    });

    // Scenario: does not allow updating immutable fields
    it('does not allow updating immutable fields', () => {
      const user = createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      const updates = { id: 'new-id', createdAt: '2023-01-01T00:00:00Z' };
      const updatedUser = updateUser(user.id, updates);

      expect(updatedUser.id).toBe(user.id);
      expect(updatedUser.createdAt).toBe(user.createdAt);
    });
  });

  describe('deleteUser', () => {
    // Scenario: deletes a user and returns the deleted user
    it('deletes a user and returns the deleted user', () => {
      const user = createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      const deletedUser = deleteUser(user.id);

      expect(deletedUser).toEqual(user);
      expect(getUsers()).toHaveLength(0);
    });

    // Scenario: throws an error if the user is not found
    it('throws an error if the user is not found', () => {
      expect(() => deleteUser('nonexistent-id')).toThrow('User with id nonexistent-id not found');
    });
  });

  describe('getUsersByRole', () => {
    // Scenario: returns users with the specified role
    it('returns users with the specified role', () => {
      createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      createUser({ name: 'Jane Doe', email: 'jane@example.com', role: 'user' });

      const admins = getUsersByRole('admin');
      expect(admins).toHaveLength(1);
      expect(admins[0].role).toBe('admin');
    });

    // Scenario: performs a case-insensitive role comparison
    it('performs a case-insensitive role comparison', () => {
      createUser({ name: 'John Doe', email: 'john@example.com', role: 'Admin' });

      const admins = getUsersByRole('admin');
      expect(admins).toHaveLength(1);
    });

    // Scenario: returns an empty array if no users match the role
    it('returns an empty array if no users match the role', () => {
      expect(getUsersByRole('nonexistent-role')).toEqual([]);
    });
  });

  describe('searchUsers', () => {
    // Scenario: returns users matching the query in name or email
    it('returns users matching the query in name or email', () => {
      createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      createUser({ name: 'Jane Doe', email: 'jane@example.com', role: 'user' });

      const results = searchUsers('john');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('John Doe');
    });

    // Scenario: performs a case-insensitive search
    it('performs a case-insensitive search', () => {
      createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });

      const results = searchUsers('JOHN');
      expect(results).toHaveLength(1);
    });

    // Scenario: returns an empty array for invalid or empty query
    it('returns an empty array for invalid or empty query', () => {
      expect(searchUsers(null)).toEqual([]);
      expect(searchUsers('')).toEqual([]);
      expect(searchUsers(123)).toEqual([]);
    });
  });
});