# MDEA Portfolio Design

The portfolio presents applied AI products through clear business scenarios, usable demos, and evidence of engineering decisions.

## Visual foundation

- Use the shared tokens and components in `design-system/`.
- Use Geist Sans for interface text and Geist Mono for code and metrics.
- Support light and dark themes with readable contrast and visible keyboard focus.
- Use spacing, typography, borders, and subtle depth to establish hierarchy.
- Use semantic status colors to explain outcomes and progress.

## Interactive demonstrations

Each demo should explain the business problem, let visitors change meaningful inputs, and make the resulting process and outcome visible. Motion should communicate state transitions and evidence, with support for reduced motion.

Distinguish recorded examples, deterministic simulations, and live executions. Display elapsed time and measured results only when they reflect the execution being shown.

## Content

Describe capabilities and the technical stack without naming external companies in public copy. Keep technical identifiers and integration URLs where needed to run the source code.

Use fictional or anonymized scenarios. Explain the target user, workflow, decision, and practical limitations in plain language.

English is the intended default language, with equivalent Spanish content across the portfolio and demos. The bilingual experience is a planned improvement; it is not yet implemented throughout the projects.

## Shared source

The hub owns `design-system/` and `ai-kit/`. Sibling projects consume local copies through the synchronization scripts. Changes to shared components should remain consistent across those copies.