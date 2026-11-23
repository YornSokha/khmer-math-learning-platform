# Project: Khmer Math Learning Platform for Kids

## Role

Act as a senior product designer, mathematics educator, UX engineer, and full-stack developer.

Your task is to research, design, and build a modern interactive mathematics learning web application for Cambodian children, using Khmer as the primary language.

The learning experience should be inspired by Brilliant.org — learning through interaction, visual exploration, puzzles, guided problem-solving, and progressive challenges — but with original design, content, and branding.

Do not build a traditional online course with long text lessons and repetitive quizzes.

---

## 1. Product Goal

Build a platform that helps children understand mathematics through interactive experiences rather than memorization.

Children should be able to:

- Explore mathematical concepts visually.
- Interact with numbers, shapes, and objects.
- Solve puzzles and challenges.
- Receive instant feedback.
- Learn from mistakes.
- Progress from simple concepts to advanced ones.
- Develop mathematical reasoning and confidence.

The application must be Khmer-first, child-friendly, mobile-first, fast, and easy to use.

---

## 2. Target Users

Initially focus on children aged 6–12.

Organize learning by age, grade, topic, and difficulty, while allowing flexibility for children who learn faster or slower than their school grade.

Research the Cambodian mathematics curriculum and use it as a reference for designing learning paths.

---

## 3. Research Before Development

Perform focused research on:

- Brilliant.org's interactive learning methodology.
- Effective mathematics learning for children.
- Cambodian primary mathematics curriculum.
- Age-appropriate lesson progression.
- Khmer language and typography for web applications.
- Gamification that encourages learning without becoming addictive.

Research only what is necessary to make good product and technical decisions.

Use credible sources and cite them.

Avoid spending excessive time on research or producing unnecessary documents.

---

## 4. Learning Experience

Lessons should follow a simple structure:

1. Introduce an interesting mathematical problem.
2. Let the child explore or interact with it.
3. Encourage the child to think and attempt a solution.
4. Provide immediate feedback.
5. Offer hints when the child struggles.
6. Explain the concept visually and in simple Khmer.
7. Give a follow-up challenge.
8. Track understanding and progress.

Prioritize interactive activities such as:

- Drag and drop.
- Number lines.
- Number blocks.
- Visual addition and subtraction.
- Multiplication using groups.
- Fraction visualization.
- Shape manipulation.
- Pattern discovery.
- Logic puzzles.
- Equation building.
- Real-world mathematical scenarios.

Every interaction must serve a clear learning objective.

---

## 5. Curriculum

Design a progressive mathematics curriculum covering:

- Number sense.
- Addition and subtraction.
- Multiplication and division.
- Fractions.
- Decimals.
- Percentages.
- Patterns.
- Measurement.
- Geometry.
- Algebra foundations.
- Logic and problem-solving.
- Basic statistics and probability.

Align topics with Cambodian grade-level expectations where possible.

Use Khmer explanations and culturally familiar examples such as markets, fruit, money, family, school, transportation, and everyday Cambodian life.

Start with a small, high-quality curriculum rather than attempting to create every lesson at once.

---

## 6. Product Features

### Student experience

- Student profile.
- Age or grade selection.
- Learning paths.
- Interactive lessons.
- Progressive difficulty.
- Hints and explanations.
- XP and achievements.
- Learning progress.
- Daily challenges.
- Review of previously learned concepts.

### Parent experience

- Child progress overview.
- Topics learned.
- Learning strengths.
- Topics needing practice.
- Time spent learning.

### Admin experience

- Manage learning paths.
- Manage topics and lessons.
- Manage activities.
- Manage questions and answers.
- Manage Khmer content.
- Publish and update lessons.

Prioritize features according to the MVP. Do not build everything at once.

---

## 7. Technology

Research and choose a modern, maintainable technology stack.

Consider:

- Next.js.
- React.
- TypeScript.
- Tailwind CSS.
- PostgreSQL.
- Prisma or an appropriate alternative.
- SVG or Canvas for interactive mathematical visualizations.
- PWA capabilities for mobile and low-connectivity environments.

Do not use a technology simply because it is popular.

Choose technologies based on the requirements of the application, development complexity, performance, and long-term maintainability.

Keep the lesson content separate from the application logic so new lessons can be created without building new frontend components for every lesson.

---

## 8. UI/UX Requirements

Create a modern educational interface that feels interactive, polished, and engaging.

Design principles:

- Mobile-first.
- Khmer-first.
- Clean and intuitive.
- Visually engaging.
- Friendly without looking overly childish.
- Minimal unnecessary text.
- Smooth, purposeful animations.
- Touch-friendly interactions.
- Responsive layouts.
- Accessible controls.
- Clear learning progress.

Use Brilliant.org as inspiration for interaction and learning quality, not as a design template to copy.

---

## 9. Spec-Driven Development

Use Spec-Driven Development throughout the project.

If OpenSpec is available, use OpenSpec and follow its official workflow. Otherwise, use a similar structured specification workflow.

Do not start implementation without defining the relevant specifications.

For each feature:

1. Define the problem and user value.
2. Define requirements.
3. Define scenarios and acceptance criteria.
4. Identify technical implications.
5. Create or update the specification.
6. Review the spec for ambiguity and missing requirements.
7. Implement the feature according to the approved spec.
8. Write and run tests.
9. Verify the implementation against the acceptance criteria.
10. Update documentation and specs when necessary.

Keep specifications concise, clear, and testable.

Avoid duplicating information across multiple documents.

---

## 10. Development Workflow

Work in the following phases.

### Phase 1 — Discovery

Research the educational and technical requirements.

Produce concise findings and recommendations.

### Phase 2 — Product Specification

Define:

- Product vision.
- Target users.
- Core user journeys.
- Curriculum structure.
- MVP features.
- Learning experience.
- UI/UX direction.
- Technical stack.

### Phase 3 — Project Setup

Initialize the project, development environment, architecture, design system, and foundational components.

### Phase 4 — MVP Implementation

Implement the core student experience:

- Landing page.
- Student onboarding.
- Learning dashboard.
- Learning path.
- Lesson player.
- Interactive activity engine.
- Hint and feedback system.
- Progress tracking.
- Basic achievements.

### Phase 5 — Initial Content

Create the first polished learning path with a minimum of 10 interactive lessons.

Focus on early mathematics concepts and ensure every lesson is accurate, meaningful, and fully usable in Khmer.

### Phase 6 — Testing and Refinement

Test:

- Mathematical correctness.
- Khmer language quality.
- Interaction behavior.
- Mobile responsiveness.
- Accessibility.
- Performance.
- Learning progression.

Fix issues before adding more features.

---

## 11. MVP Priorities

The MVP should demonstrate the core value of the platform.

Prioritize:

1. Excellent Khmer UI.
2. Interactive mathematics lessons.
3. Reusable activity components.
4. Visual learning.
5. Instant feedback and hints.
6. Progressive difficulty.
7. Learning progress.
8. Mobile experience.

Avoid initially:

- Complex AI tutors.
- Social networks.
- Multiplayer.
- Large administrative systems.
- Excessive gamification.
- Unnecessary microservices.
- Complex analytics.
- Features that do not directly improve learning.

---

## 12. Working Rules

- Research before making important decisions.
- Use Spec-Driven Development.
- Keep specifications concise and actionable.
- Implement one feature at a time.
- Do not skip acceptance criteria.
- Do not implement features outside the approved scope without updating the specs.
- Prioritize working software over excessive documentation.
- Prioritize educational quality over visual gimmicks.
- Validate all mathematical content.
- Use Khmer naturally, not machine-translated wording.
- Keep architecture simple and extensible.
- Write automated tests for important logic and interactions.
- Keep the project runnable throughout development.
- Document how to install, run, test, and deploy the application.
- Track completed work and remaining tasks.

---

## 13. Start Now

Begin with Phase 1.

First, inspect the existing project and available tools. If the repository is empty, initialize it appropriately.

Then:

1. Perform focused research.
2. Recommend the product direction and technology stack.
3. Define the MVP.
4. Initialize Spec-Driven Development using OpenSpec if available.
5. Create the initial project specifications.
6. Identify the first implementation milestone.

Do not spend excessive time planning.

Once the initial specifications are clear and reviewed, proceed to implementation in small, verifiable increments.

The objective is to build a real, working, high-quality Khmer mathematics learning platform — not just a collection of research documents or mockup screens.
