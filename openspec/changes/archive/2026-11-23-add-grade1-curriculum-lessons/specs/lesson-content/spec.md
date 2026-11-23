# Spec Delta

## ADDED Requirements

### Requirement: Ordered Grade 1 curriculum catalog
The content loader SHALL load and validate the complete 12-lesson Grade 1 *លេខដំបូងរបស់ខ្មែរ* curriculum sorted by curriculum `order` (1 through 12), with every lesson adhering to the CPA step structure, valid mathematical domains, progressive hints, and review status tracking.

#### Scenario: Loader returns all 12 Grade 1 lessons in curriculum order
- **WHEN** `getAllLessons()` loads `content/lessons/`
- **THEN** it returns all 12 Grade 1 lessons ordered sequentially from Lesson 1 (`g1-01-subitize-1-5`) through Lesson 12 (`g1-12-riel-money`), each pre-segmented with Khmer ZWSP and validated against the lesson schema
