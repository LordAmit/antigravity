# Project Constitution

This document defines the non-negotiable principles, development standards, architectural rules, and safety boundaries for the repository.

## 1. Safety and Deployment Restrictions
*   **No Automated Deployments:** Under no circumstances shall an AI coding assistant run  any commands that deploy code to staging or production environments. All deployments must be done manually by the human user.

*   **Mandatory Plan and Approval Review (No Exceptions):** AI agents shall present a detailed plan and obtain the user's explicit approval *before* executing any modifications to code, configuration files, scripts, workflows, or project instructions. This includes any minor tweaks, script updates, or follow-up changes to already approved plans. No changes shall be made or committed without direct user consent in the current turn.

## 2. Architectural Principles
*   **Separation of Concerns:** Keep core logic, state management, presentation/view layer, and configuration strictly decoupled.
*   **John Maeda's 10 Laws of Simplicity:**
    1. **Reduce:** The simplest way to achieve simplicity is through thoughtful reduction (shrink, hide, embody).
    2. **Organize:** Organization makes a system of many appear fewer (group, prioritize, position).
    3. **Time:** Savings in time feel like simplicity (minimize waiting, stream-line flows).
    4. **Learn:** Knowledge makes things simpler (leverage existing conventions and metaphors).
    5. **Differences:** Simplicity and complexity need each other (appreciate complexity to value simplicity).
    6. **Context:** What lies in the periphery of simplicity is definitely not peripheral (consider white space, ambient feedback).
    7. **Emotion:** More emotions are better than less (design with clean aesthetics, micro-interactions, and delight).
    8. **Trust:** In simplicity we trust (ensure reliable, predictable system states).
    9. **Failure:** Some things can never be made simple (design gracefully for edge cases and errors).
    10. **The One:** Simplicity is about subtracting the obvious and adding the meaningful.

## 3. Technology Stack Rules

