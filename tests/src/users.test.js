let createUser, getUsers, getUserById, updateUser, deleteUser, getUsersByRole, searchUsers;

beforeEach(() => {
  jest.resetModules();
  ({ createUser, getUsers, getUserById, updateUser, deleteUser, getUsersByRole, searchUsers } = require('../../src/users'));
});

describe('Users Module', () => {

  describe('createUser', () => {
    it('creates a user with all required fields', () => {
      const result = createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      expect(result).toMatchObject({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('createdAt');
    });

    it('throws an error if required fields are missing', () => {
      expect(() => createUser({ name: 'John Doe' })).toThrow('Invalid user fields');
      expect(() => createUser(null)).toThrow('Invalid user fields');
    });

    it('throws an error for duplicate user ID', () => {
      createUser({ id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'admin' });
      expect(() => createUser({ id: 'u1', name: 'Jane Doe', email: 'jane@example.com', role: 'user' })).toThrow('User with id u1 already exists');
    });
  });

  describe('getUsers', () => {
    it('returns an empty array when no users exist', () => {
      expect(getUsers()).toEqual([]);
    });

    it('returns a shallow copy — mutating the result does not affect internal state', () => {
      createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      const result = getUsers();
      result.push({ fake: true });
      expect(getUsers()).toHaveLength(1);
    });
  });

  describe('getUserById', () => {
    it('returns the user with the given ID', () => {
      const user = createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      expect(getUserById(user.id)).toMatchObject({ name: 'John Doe' });
    });

    it('returns null when the user is not found', () => {
      expect(getUserById('nonexistent')).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('updates allowed fields on an existing user', () => {
      const user = createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      const updated = updateUser(user.id, { name: 'Jane Doe' });
      expect(updated.name).toBe('Jane Doe');
    });

    it('throws an error when updating a non-existent user', () => {
      expect(() => updateUser('nonexistent', { name: 'Jane' })).toThrow();
    });

    it('does not allow overwriting immutable fields id and createdAt', () => {
      const user = createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      const updated = updateUser(user.id, { id: 'hacked', createdAt: '1970-01-01' });
      expect(updated.id).toBe(user.id);
      expect(updated.createdAt).toBe(user.createdAt);
    });
  });

  describe('deleteUser', () => {
    it('deletes a user and returns the deleted user', () => {
      const user = createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      const deleted = deleteUser(user.id);
      expect(deleted).toMatchObject({ name: 'John Doe' });
      expect(getUsers()).toHaveLength(0);
    });

    it('throws an error when deleting a non-existent user', () => {
      expect(() => deleteUser('nonexistent')).toThrow();
    });
  });

  describe('getUsersByRole', () => {
    it('returns users with the specified role', () => {
      createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      createUser({ name: 'Jane Doe', email: 'jane@example.com', role: 'user' });
      expect(getUsersByRole('admin')).toHaveLength(1);
    });

    it('performs a case-insensitive role comparison', () => {
      createUser({ name: 'John Doe', email: 'john@example.com', role: 'Admin' });
      expect(getUsersByRole('admin')).toHaveLength(1);
    });

    it('returns an empty array when no users match the role', () => {
      expect(getUsersByRole('superuser')).toEqual([]);
    });
  });

  describe('searchUsers', () => {
    it('returns users matching the query by name', () => {
      createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      createUser({ name: 'Jane Doe', email: 'jane@example.com', role: 'user' });
      expect(searchUsers('John')).toHaveLength(1);
    });

    it('returns users matching the query by email', () => {
      createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      createUser({ name: 'Jane Doe', email: 'jane@example.com', role: 'user' });
      expect(searchUsers('jane@')).toHaveLength(1);
    });

    it('performs a case-insensitive search', () => {
      createUser({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
      expect(searchUsers('JOHN')).toHaveLength(1);
    });

    it('returns an empty array for invalid or empty queries', () => {
      expect(searchUsers('')).toEqual([]);
      expect(searchUsers(null)).toEqual([]);
      expect(searchUsers(123)).toEqual([]);
    });
  });

});
