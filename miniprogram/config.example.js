const envConfigs = {
  mock: {
    env: "mock",
    useMock: true,
    baseUrl: "http://127.0.0.1:5174",
    uploadBaseUrl: "http://127.0.0.1:5174",
    cdnBaseUrl: "http://127.0.0.1:5174",
    requestTimeout: 15000
  },
  localHttpMock: {
    env: "local-http-mock",
    useMock: false,
    baseUrl: "http://127.0.0.1:5174",
    uploadBaseUrl: "http://127.0.0.1:5174",
    cdnBaseUrl: "http://127.0.0.1:5174",
    requestTimeout: 15000
  },
  test: {
    env: "test",
    useMock: false,
    baseUrl: "https://test-api.your-domain.com",
    uploadBaseUrl: "https://test-upload.your-domain.com",
    cdnBaseUrl: "https://test-cdn.your-domain.com",
    requestTimeout: 15000
  },
  production: {
    env: "production",
    useMock: false,
    baseUrl: "https://api.your-domain.com",
    uploadBaseUrl: "https://upload.your-domain.com",
    cdnBaseUrl: "https://cdn.your-domain.com",
    requestTimeout: 15000
  }
};

module.exports = envConfigs;
