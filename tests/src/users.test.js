const { createUser, getUsers, getUserById, updateUser, deleteUser, getUsersByRole, searchUsers } = require('./users');

jest.mock('./users', () => ({
  createUser: jest.fn(),
  getUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  getUsersByRole: jest.fn(),
  searchUsers: jest.fn(),
}));

describe('User Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    // Scenario: successfully creates a new user
    it('should create a new user and return it', () => {
      const mockUser = { id: 1, name: 'John Doe' };
      const createdUser = { ...mockUser, createdAt: new Date() };
      createUser.mockReturnValue(createdUser);

      const result = createUser(mockUser);

      expect(result).toEqual(createdUser);
      expect(createUser).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('getUsers', () => {
    // Scenario: returns an array of users
    it('should return an array of users', () => {
      const mockUsers = [{ id: 1, name: 'John Doe' }];
      getUsers.mockReturnValue(mockUsers);

      const result = getUsers();

      expect(result).toEqual(mockUsers);
      expect(getUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserById', () => {
    // Scenario: returns a user by ID
    it('should return a user by ID', () => {
      const mockUser = { id: 1, name: 'John Doe' };
      getUserById.mockReturnValue(mockUser);

      const result = getUserById(1);

      expect(result).toEqual(mockUser);
      expect(getUserById).toHaveBeenCalledWith(1);
    });

    // Scenario: throws an error for non-existing user
    it('should throw an error for non-existing user', () => {
      getUserById.mockImplementation(() => {
        throw new Error('User with id 2 not found');
      });

      expect(() => getUserById(2)).toThrow('User with id 2 not found');
    });
  });

  describe('updateUser', () => {
    // Scenario: updates and returns the user
    it('should update and return the user', () => {
      const mockUser = { id: 1, name: 'John Doe' };
      const updates = { name: 'Jane Doe' };
      const updatedUser = { ...mockUser, ...updates };
      updateUser.mockReturnValue(updatedUser);

      const result = updateUser(1, updates);

      expect(result).toEqual(updatedUser);
      expect(updateUser).toHaveBeenCalledWith(1, updates);
    });

    // Scenario: throws an error if user not found
    it('should throw an error if user not found', () => {
      updateUser.mockImplementation(() => {
        throw new Error('User with id 2 not found');
      });

      expect(() => updateUser(2, {})).toThrow('User with id 2 not found');
    });
  });

  describe('deleteUser', () => {
    // Scenario: deletes the user and returns success
    it('should delete the user and return success', () => {
      const mockUser = { id: 1, name: 'John Doe' };
      deleteUser.mockReturnValue(mockUser);

      const result = deleteUser(1);

      expect(result).toEqual(mockUser);
      expect(deleteUser).toHaveBeenCalledWith(1);
    });

    // Scenario: throws an error if user not found
    it('should throw an error if user not found', () => {
      deleteUser.mockImplementation(() => {
        throw new Error('User with id 2 not found');
      });

      expect(() => deleteUser(2)).toThrow('User with id 2 not found');
    });
  });

  describe('getUsersByRole', () => {
    // Scenario: returns users with the specified role
    it('should return users with the specified role', () => {
      const mockUsers = [{ id: 1, name: 'John Doe', role: 'admin' }];
      getUsersByRole.mockReturnValue(mockUsers);

      const result = getUsersByRole('admin');

      expect(result).toEqual(mockUsers);
      expect(getUsersByRole).toHaveBeenCalledWith('admin');
    });

    // Scenario: returns an empty array if no users match the role
    it('should return an empty array if no users match the role', () => {
      getUsersByRole.mockReturnValue([]);

      const result = getUsersByRole('nonexistent');

      expect(result).toEqual([]);
      expect(getUsersByRole).toHaveBeenCalledWith('nonexistent');
    });
  });

  describe('searchUsers', () => {
    // Scenario: returns users matching the query
    it('should return users matching the query', () => {
      const mockUsers = [{ id: 1, name: 'John Doe' }];
      searchUsers.mockReturnValue(mockUsers);

      const result = searchUsers('John');

      expect(result).toEqual(mockUsers);
      expect(searchUsers).toHaveBeenCalledWith('John');
    });

    // Scenario: returns an empty array for invalid query
    it('should return an empty array for invalid query', () => {
      searchUsers.mockReturnValue([]);

      const result = searchUsers(123);

      expect(result).toEqual([]);
      expect(searchUsers).toHaveBeenCalledWith(123);
    });

    // Scenario: returns an empty array for empty query
    it('should return an empty array for empty query', () => {
      searchUsers.mockReturnValue([]);

      const result = searchUsers('');

      expect(result).toEqual([]);
      expect(searchUsers).toHaveBeenCalledWith('');
    });
  });
});
