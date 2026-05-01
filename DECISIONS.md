# Architecture Decisions - CIRCUIT

## Why custom canvas drag-and-drop?
Custom canvas interactions keep the project lightweight and fully styleable while still enabling visual pipeline authoring.

## Why SVG wires?
SVG bezier paths are simple to animate and easier to keep aligned with moving nodes than a bitmap canvas.

## Why WebSocket + REST?
REST handles execution requests while WebSocket streams live node progress updates for responsive UI feedback.

## Why split executor modules?
Each node type is isolated to make it easier to test, extend, and debug without changing a large shared file.
## Why SQLite for History?
SQLite is used for execution history to ensure zero-config persistence that works out-of-the-box in local development environments.

## Why Python Scripting Node?
A Python node provides an escape hatch for complex logic that cannot be expressed via standard AI prompting nodes.
