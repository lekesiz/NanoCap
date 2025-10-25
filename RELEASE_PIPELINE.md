# NanoCap Release Pipeline

## Automated Build and Release Process

### Prerequisites
- Node.js 16+
- Chrome Web Store Developer Account
- GitHub Actions enabled
- Chrome Extension Developer Mode

### Build Process

#### 1. Development Build
```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run tests
npm run test

# Build development version
npm run build:dev
```

#### 2. Production Build
```bash
# Build production version
npm run build:prod

# Create Chrome Web Store package
npm run package:store

# Generate release notes
npm run release:notes
```

### Release Workflow

#### Version Management
- **Semantic Versioning:** MAJOR.MINOR.PATCH
- **Pre-release:** v0.2.0-beta.1
- **Release:** v0.2.0
- **Hotfix:** v0.2.1

#### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Version bumped in manifest.json
- [ ] Changelog updated
- [ ] Release notes prepared
- [ ] Chrome Web Store assets ready
- [ ] GitHub release created

### Chrome Web Store Deployment

#### Store Assets Required
- **Icons:** 16x16, 48x48, 128x128 PNG
- **Screenshots:** 1280x800 PNG (min 1, max 5)
- **Promotional Images:** 440x280 PNG
- **Store Listing:** Description, keywords, categories

#### Upload Process
1. **Prepare Package:** ZIP file with all extension files
2. **Upload to Store:** Chrome Web Store Developer Dashboard
3. **Review Process:** Google review (1-3 business days)
4. **Publish:** Automatic or manual publication

### GitHub Actions Workflow

```yaml
name: NanoCap CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  release:
    types: [ published ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run lint
      - run: npm run test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run build:prod
      - uses: actions/upload-artifact@v3
        with:
          name: nanocap-extension
          path: dist/

  release:
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name == 'release'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/download-artifact@v3
        with:
          name: nanocap-extension
          path: dist/
      - name: Create Release Package
        run: |
          cd dist
          zip -r ../nanocap-release.zip .
      - uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ github.event.upload_url }}
          asset_path: ./nanocap-release.zip
          asset_name: nanocap-v${{ github.event.release.tag_name }}.zip
          asset_content_type: application/zip
```

### Quality Assurance

#### Automated Testing
- **Unit Tests:** Jest framework
- **Integration Tests:** Chrome extension APIs
- **Performance Tests:** CPU/Memory usage
- **Security Tests:** Permission validation

#### Manual Testing
- **Cross-browser:** Chrome, Edge, Brave
- **Cross-platform:** Windows, macOS, Linux
- **User Scenarios:** Common use cases
- **Edge Cases:** Error conditions

### Monitoring and Analytics

#### Performance Monitoring
- **CPU Usage:** Real-time monitoring
- **Memory Usage:** Heap size tracking
- **Recording Quality:** File size analysis
- **User Feedback:** Error reporting

#### Usage Analytics
- **Installation Count:** Chrome Web Store metrics
- **Active Users:** Daily/Monthly active users
- **Feature Usage:** Most used quality presets
- **Error Rates:** Crash and error frequency

### Rollback Strategy

#### Emergency Rollback
1. **Immediate:** Disable extension in Chrome Web Store
2. **Quick Fix:** Deploy hotfix version
3. **Communication:** Notify users via GitHub
4. **Investigation:** Root cause analysis

#### Version Rollback
1. **Previous Version:** Revert to last stable
2. **Data Migration:** Handle settings compatibility
3. **User Notification:** Update instructions
4. **Post-mortem:** Document lessons learned

### Security Considerations

#### Code Security
- **Dependency Scanning:** Automated vulnerability checks
- **Permission Audit:** Minimal required permissions
- **Code Review:** Peer review process
- **Security Testing:** Penetration testing

#### Data Protection
- **Privacy Policy:** Clear data handling
- **GDPR Compliance:** European regulations
- **CCPA Compliance:** California regulations
- **Data Minimization:** Collect only necessary data

### Documentation Updates

#### Release Documentation
- **Changelog:** Detailed change list
- **Migration Guide:** Upgrade instructions
- **API Changes:** Breaking changes
- **Deprecation Notices:** Removed features

#### User Documentation
- **README Updates:** New features
- **FAQ Updates:** Common questions
- **Tutorial Updates:** Usage guides
- **Troubleshooting:** Common issues

### Community Management

#### User Support
- **GitHub Issues:** Bug reports and feature requests
- **Discussions:** Community conversations
- **Documentation:** Self-service help
- **Responsive Support:** Timely responses

#### Contribution Guidelines
- **Code of Conduct:** Community standards
- **Contributing Guide:** How to contribute
- **Pull Request Template:** Standard format
- **Review Process:** Quality assurance

---

## Release Schedule

### v0.3.0 (Q2 2025)
- File System Access API
- Unlimited recording length
- Streaming file writing

### v0.4.0 (Q3 2025)
- AV1 codec support
- Enhanced compression
- Performance improvements

### v1.0.0 (Q4 2025)
- Chrome Web Store release
- Stable API
- Production ready

---

**Pipeline Status:** ✅ Ready for Production  
**Last Updated:** 2025-01-25  
**Next Release:** v0.3.0 (File System Access API)
