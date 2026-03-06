#!/bin/bash
# Remove Claude Code attributions from commit messages
grep -v "Generated with" | grep -v "Co-Authored-By: Claude" | grep -v "Claude Code"
