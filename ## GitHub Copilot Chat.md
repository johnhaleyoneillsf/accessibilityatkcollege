## GitHub Copilot Chat

- Extension Version: 0.23.2 (prod)
- VS Code: vscode/1.96.2
- OS: Mac

## Network

User Settings:
```json
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 140.82.113.5 (140 ms)
- DNS ipv6 Lookup: ::ffff:140.82.113.5 (31 ms)
- Proxy URL: None (6 ms)
- Electron fetch (configured): timed out after 10 seconds
- Node.js https: HTTP 200 (113 ms)
- Node.js fetch: HTTP 200 (99 ms)
- Helix fetch: HTTP 200 (166 ms)

Connecting to https://api.individual.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.113.22 (20 ms)
- DNS ipv6 Lookup: ::ffff:140.82.113.22 (1 ms)
- Proxy URL: None (23 ms)
- Electron fetch (configured): HTTP 200 (85 ms)
- Node.js https: HTTP 200 (89 ms)
- Node.js fetch: HTTP 200 (103 ms)
- Helix fetch: HTTP 200 (90 ms)

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).