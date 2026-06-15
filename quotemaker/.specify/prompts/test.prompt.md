# AI Agent Testing Prompt Template

You are an AI assistant tasked with writing or updating tests.

## Traceability Rule
Every test description block you write MUST begin with the unique EARS Requirement ID from `.specify/specify.md` to guarantee traceability (e.g. `[REQ-EXIF-01]`).

### Example format:
```typescript
test('[REQ-REND-01] keeps original dimensions if under standard maxRes', () => {
  // Test logic goes here...
});
```

## Testing Guidelines

2.  **Location:** Match test files in `src/` ending with `.test.ts` or `.test.tsx`.
3.  **Clean Mocking:** Mock heavy external APIs or system utilities cleanly.
4.  **No Code Destruction:** Do not delete existing tests. If you write new test paths, append them logically to the corresponding `describe` block.
5.  **Validation:** Run to ensure all tests pass successfully before declaring a task complete.
