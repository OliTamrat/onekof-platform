#!/usr/bin/env python3
import sys

# Read commit message from stdin
message = sys.stdin.read()

# Remove Claude Code attributions
lines = message.split('\n')
cleaned_lines = []

for line in lines:
    # Skip lines with Claude attributions
    if 'Generated with' in line:
        continue
    if 'Co-Authored-By: Claude' in line:
        continue
    if 'Claude Code' in line:
        continue
    if line.strip().startswith('🤖'):
        continue

    cleaned_lines.append(line)

# Output cleaned message
print('\n'.join(cleaned_lines))
