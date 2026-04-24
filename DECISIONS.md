# Architecture Decisions - CIRCUIT

## Why custom canvas drag-and-drop?
Custom canvas interactions keep the project lightweight and fully styleable while still enabling visual pipeline authoring.

## Why SVG wires?
SVG bezier paths are simple to animate and easier to keep aligned with moving nodes than a bitmap canvas.

## Why WebSocket + REST?
REST handles execution requests while WebSocket streams live node progress updates for responsive UI feedback.

## Why split executor modules?
Each node type is isolated to make it easier to test, extend, and debug without changing a large shared file.
