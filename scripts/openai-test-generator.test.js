const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

jest.mock('fs');
jest.mock('path');
jest.mock('openai');

const { getTestFilePath, generateTestForFile, run } = require('./openai-test-generator');

const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
};

OpenAI.mockImplementation(() => mockOpenAI);

const mockApiKey = 'test-api-key';
process.env.OPENAI_API_KEY = mockApiKey;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getTestFilePath', () => {
  it('should return the correct test file path', () => {
    const sourceFile = '/path/to/source.js';
    const expected = '/path/to/source.test.js';
    expect(getTestFilePath(sourceFile)).toBe(expected);
  });
});

describe('generateTestForFile', () => {
  it('should generate test code for a given file', async () => {
    const filePath = '/path/to/source.js';
    const sourceCode = 'const a = 1;';
    const testCode = 'test code';

    fs.readFileSync.mockReturnValue(sourceCode);
    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ testCode }) } }],
    });

    const result = await generateTestForFile(filePath);
    expect(result).toBe(testCode);
    expect(fs.readFileSync).toHaveBeenCalledWith(filePath, 'utf8');
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
      model: 'gpt-4o',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: expect.any(Array),
    });
  });

  it('should throw an error if OpenAI API fails', async () => {
    const filePath = '/path/to/source.js';
    fs.readFileSync.mockReturnValue('const a = 1;');
    mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

    await expect(generateTestForFile(filePath)).rejects.toThrow('API Error');
  });
});

describe('run', () => {
  it('should generate test files for changed files', async () => {
    const changedFiles = '/path/to/source.js\n/path/to/another.js';
    const testCode = 'test code';

    fs.readFileSync.mockReturnValueOnce(changedFiles).mockReturnValueOnce('const a = 1;');
    fs.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(false);
    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ testCode }) } }],
    });

    await run();

    expect(fs.writeFileSync).toHaveBeenCalledWith('/path/to/source.test.js', testCode);
    expect(fs.writeFileSync).toHaveBeenCalledWith('generated_tests.json', expect.any(String));
  });

  it('should skip existing test files', async () => {
    const changedFiles = '/path/to/source.js';

    fs.readFileSync.mockReturnValueOnce(changedFiles);
    fs.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(true);

    await run();

    expect(fs.writeFileSync).not.toHaveBeenCalledWith('/path/to/source.test.js', expect.any(String));
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Unexpected Error');
    fs.readFileSync.mockImplementation(() => { throw error; });

    await expect(run()).rejects.toThrow('Unexpected Error');
  });
});
