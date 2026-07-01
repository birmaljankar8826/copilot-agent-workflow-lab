const { v4: uuidv4 } = require('uuid');

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

describe('users module', () => {
  let usersModule;

  beforeEach(() => {
    jest.resetModules();
    usersModule = require('../src/users');
  });

  describe('createUser', () => {
    // Scenario: creates a user with default id and createdAt
    it('creates a user with default id and createdAt', () => {
      const user = { name: 'John Doe', email: 'john@example.com' };
      const result = usersModule.createUser(user);

      expect(result).toEqual({
        ...user,
        id: 'mocked-uuid',
        createdAt: expect.any(String),
      });
    });

    // Scenario: throws error for invalid createdAt
    it('throws an error if createdAt is invalid', () => {
      const user = { name: 'John Doe', email: 'john@example.com', createdAt: 'invalid-date' };

      expect(() => usersModule.createUser(user)).toThrow('createdAt must be a valid ISO date string');
    });
  });

  describe('getUsers', () => {
    // Scenario: returns all users
    it('returns all users', () => {
      usersModule.createUser({ name: 'John Doe', email: 'john@example.com' });
      usersModule.createUser({ name: 'Jane Doe', email: 'jane@example.com' });

      const result = usersModule.getUsers();
      expect(result).toHaveLength(2);
    });
  });

  describe('getUserById', () => {
    // Scenario: returns user by id
    it('returns the user with the given id', () => {
      const user = usersModule.createUser({ name: 'John Doe', email: 'john@example.com' });
      const result = usersModule.getUserById(user.id);

      expect(result).toEqual(user);
    });

    // Scenario: returns null when user not found
    it('returns null if no user is found with the given id', () => {
      const result = usersModule.getUserById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    // Scenario: updates user fields correctly
    it('updates the user with the given id', () => {
      const user = usersModule.createUser({ name: 'John Doe', email: 'john@example.com' });
      const updates = { name: 'John Smith' };

      const result = usersModule.updateUser(user.id, updates);
      expect(result).toEqual({ ...user, ...updates });
    });

    // Scenario: throws error if user not found
    it('throws an error if the user with the given id is not found', () => {
      expect(() => usersModule.updateUser('non-existent-id', { name: 'John Smith' })).toThrow('User with id non-existent-id not found');
    });

    // Scenario: throws error for invalid updates
    it('throws an error if updates is not a valid object', () => {
      const user = usersModule.createUser({ name: 'John Doe', email: 'john@example.com' });

      expect(() => usersModule.updateUser(user.id, null)).toThrow('Updates must be a valid object');
    });
  });

  describe('deleteUser', () => {
    // Scenario: deletes user and returns it
    it('deletes the user with the given id and returns it', () => {
      const user = usersModule.createUser({ name: 'John Doe', email: 'john@example.com' });
      const result = usersModule.deleteUser(user.id);

      expect(result).toEqual(user);
      expect(usersModule.getUsers()).toHaveLength(0);
    });

    // Scenario: returns null if user not found
    it('returns null if no user is found with the given id', () => {
      const result = usersModule.deleteUser('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getUsersByRole', () => {
    // Scenario: returns users matching the role
    it('returns users with the given role', () => {
      usersModule.createUser({ name: 'Admin User', role: 'admin' });
      usersModule.createUser({ name: 'Regular User', role: 'user' });

      const result = usersModule.getUsersByRole('admin');
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('admin');
    });

    // Scenario: throws error for invalid role
    it('throws an error if role is invalid', () => {
      expect(() => usersModule.getUsersByRole('')).toThrow('Role must be a non-empty string');
    });
  });

  describe('searchUsers', () => {
    // Scenario: returns users matching the query
    it('returns users matching the query', () => {
      usersModule.createUser({ name: 'John Doe', email: 'john@example.com' });
      usersModule.createUser({ name: 'Jane Smith', email: 'jane@example.com' });

      const result = usersModule.searchUsers('john');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John Doe');
    });

    // Scenario: returns empty array for invalid query
    it('returns an empty array if query is invalid', () => {
      const result = usersModule.searchUsers(null);
      expect(result).toEqual([]);
    });
  });
});