# 🔧 Code Quality Refactor Context (For AI Evaluation Optimization)

## Objective

Improve code quality score from ~86% to 90%+ by optimizing:

* Readability
* Maintainability
* Consistency
* Modularity
* Documentation

This refactor MUST NOT change core functionality.

---

## Mandatory Rules

### 1. Function Design

* Max 25 lines per function
* Each function must do ONE responsibility
* Use helper functions for:

  * validation
  * transformation
  * formatting

---

### 2. Naming Conventions

* Use camelCase for variables and functions
* Use PascalCase for components/classes
* Use UPPER_CASE for constants
* Function names must be verbs:

  * getUserData
  * fetchElectionInfo
  * validateInput

---

### 3. JSDoc (REQUIRED for ALL functions)

Every function must include:

/**

* Brief description of what the function does
* @param {type} paramName - description
* @returns {type} description
  */

---

### 4. Error Handling

* NO raw try-catch blocks scattered
* Use centralized error handler
* Always return structured error response

Format:
{
success: false,
message: "Error description"
}

---

### 5. API Response Format (STRICT)

ALL responses must follow:

{
success: boolean,
data: any,
message: string
}

---

### 6. Code Reusability

* Extract repeated logic into /utils
* Avoid duplicate mapping/filtering logic
* Create helper functions

---

### 7. Constants Management

* No hardcoded strings
* Move all constants to:
  /constants/index.js

---

### 8. Comments

* Only explain WHY, not WHAT
* Avoid obvious comments
* Focus on intent and decisions

---

### 9. Remove Code Smells

* No unused imports
* No commented-out code
* No unused variables

---

### 10. Folder Structure Enforcement

/server
/controllers
/services
/routes
/middlewares
/utils

/client
/components
/services
/hooks
/utils

---

## Output Requirements

* Refactored clean code
* Modular structure
* Consistent naming
* JSDoc added everywhere
* No logic changes
* Improved readability

---

## Evaluation Priority

This refactor is specifically optimized for:
AI-based code quality scoring systems.

Focus on:

* clarity > cleverness
* structure > shortcuts
* consistency > personal style

