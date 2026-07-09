# Changelog

All notable changes to Groove Station are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed
- **Login API runtime upgraded to Node.js 22.x.** The `groove-station-login`
  Lambda (AWS account `791327541706`, region `ca-central-1`, fronted by the API
  Gateway endpoint used in `login.js`) was migrated from the end-of-life
  Node.js 20.x runtime to `nodejs22.x`. No handler code changes were required;
  this resolves the AWS Lambda Node.js 20.x deprecation notice. Any future
  Lambda deploy tooling must pin `nodejs22.x` to avoid silently reverting.
