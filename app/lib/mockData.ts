import { UnitPlan, Message } from './types';

export const mockUnits: UnitPlan[] = [
  {
    id: '1',
    subject: 'Mathematics',
    yearLevel: 'Year 4',
    topic: 'Fractions and Decimals',
    description: 'Students explore equivalent fractions, compare and order decimals, and apply their understanding to real-world contexts.',
    duration: '5 weeks',
    outcomes: ['ACMNA077', 'ACMNA078', 'ACMNA079'],
    content: '## Unit Overview\nThis unit develops students\' understanding of fractions and decimals, connecting visual representations to numerical operations.\n\n## Weekly Breakdown\n**Week 1:** Introduction to fractions - halves, quarters, thirds, fifths\n**Week 2:** Equivalent fractions using fraction walls\n**Week 3:** Comparing and ordering fractions\n**Week 4:** Introduction to decimals - tenths and hundredths\n**Week 5:** Connecting fractions to decimals and real-world applications\n\n## Assessment\n- Observation checklist during hands-on activities\n- Fractions quiz (Week 3)\n- Decimal application task (Week 5)',
  },
  {
    id: '2',
    subject: 'English',
    yearLevel: 'Year 5',
    topic: 'Persuasive Writing',
    description: 'Students analyse persuasive texts, identify techniques, and craft their own persuasive pieces on topics of interest.',
    duration: '4 weeks',
    outcomes: ['ACELY1694', 'ACELY1701', 'ACELY1702'],
    content: '## Unit Overview\nStudents explore the art of persuasion through reading, analysis, and creation of persuasive texts.\n\n## Weekly Breakdown\n**Week 1:** What is persuasion? Identifying purpose and audience\n**Week 2:** Persuasive techniques - rhetoric, emotive language, repetition\n**Week 3:** Analysing model persuasive texts\n**Week 4:** Planning and writing own persuasive piece\n\n## Assessment\n- Analysis task on persuasive techniques\n- Persuasive speech or written piece',
  },
  {
    id: '3',
    subject: 'Science',
    yearLevel: 'Year 6',
    topic: "Earth's Living History",
    description: 'Students investigate changes to Earth over time, including fossil evidence, adaptation, and evolution.',
    duration: '6 weeks',
    outcomes: ['ACSSU094', 'ACSSU095', 'ACSHE100'],
    content: '## Unit Overview\nStudents explore evidence of Earth\'s history through fossils, rock layers, and adaptation of living things.\n\n## Weekly Breakdown\n**Week 1:** Introduction to Earth\'s timeline\n**Week 2:** What are fossils and how do they form?\n**Week 3:** Reading the rock record\n**Week 4:** Adaptation and survival\n**Week 5:** Evolution - change over time\n**Week 6:** Human impact on Earth\'s systems\n\n## Assessment\n- Fossil discovery investigation\n- Adaptation poster presentation',
  },
  {
    id: '4',
    subject: 'Humanities & Social Sciences',
    yearLevel: 'Year 3',
    topic: 'Our Community',
    description: 'Students explore how communities are organised, the role of rules and laws, and diversity in Australian society.',
    duration: '4 weeks',
    outcomes: ['ACHASSK062', 'ACHASSK063', 'ACHASSK064'],
    content: '## Unit Overview\nStudents develop understanding of community, diversity, and civic participation in Australia.\n\n## Weekly Breakdown\n**Week 1:** What is a community?\n**Week 2:** Rules and laws in our community\n**Week 3:** Diversity in Australia\n**Week 4:** Being an active community member\n\n## Assessment\n- Community helper interview\n- Class book: Our Community',
  },
  {
    id: '5',
    subject: 'Digital Technologies',
    yearLevel: 'Year 5',
    topic: 'Algorithms and Programming',
    description: 'Students design and implement simple algorithms using visual programming environments.',
    duration: '3 weeks',
    outcomes: ['ACTDIP097', 'ACTDIP098', 'ACTDIP099'],
    content: '## Unit Overview\nStudents learn to think computationally by designing step-by-step solutions and implementing them visually.\n\n## Weekly Breakdown\n**Week 1:** What is an algorithm? Sequencing and instructions\n**Week 2:** Loops and repetition in algorithms\n**Week 3:** Debugging and testing programs\n\n## Assessment\n- Algorithm design poster\n- Working program using block-based coding',
  },
  {
    id: '6',
    subject: 'Health & Physical Education',
    yearLevel: 'Year 4',
    topic: 'Healthy Choices',
    description: 'Students explore physical, social, and emotional health, examining factors that influence wellbeing.',
    duration: '3 weeks',
    outcomes: ['ACPPS036', 'ACPPS037', 'ACPPS038'],
    content: '## Unit Overview\nStudents investigate what it means to be healthy across physical, social, and emotional dimensions.\n\n## Weekly Breakdown\n**Week 1:** What is health? Dimensions of wellbeing\n**Week 2:** Factors that influence health choices\n**Week 3:** Making healthy choices - practical strategies\n\n## Assessment\n- Personal health poster\n- Healthy day plan activity',
  },
];

export const mockChatResponses: Record<string, string> = {
  default: "Great question! Here's a structured response:\n\n## Key Concepts\n\nWhen considering this topic for your classroom, focus on these key areas:\n\n1. **Curriculum Alignment** - Ensure activities connect to AC9 outcomes relevant to your year level.\n\n2. **Differentiate** - Consider how to support students who need additional help, as well as extension opportunities for advanced learners.\n\n3. **Practical Application** - Students retain information better when they can connect learning to real-world contexts.\n\n4. **Assessment** - Build in formative assessment opportunities throughout the unit, not just at the end.\n\nWould you like me to:\n- Generate a detailed lesson plan?\n- Create an assessment rubric?\n- Design a worksheet for a specific ability group?\n- Suggest differentiation strategies?\n\nLet me know what would be most helpful!",
  lesson_plan: "Here's a structured lesson plan for this topic:\n\n## Lesson Plan: [Topic]\n\n**Year Level:** [Year Level]\n**Subject:** [Subject]\n**Duration:** 60 minutes\n**Date:** [Date]\n\n### WALT (We Are Learning To)\nUnderstand and apply [concept] through guided practice and independent application.\n\n### TIB (This Is Because)\nMastering [concept] helps students develop critical thinking and problem-solving skills.\n\n### WILF (What I'm Looking For)\n- Students can accurately [skill outcome]\n- Students can explain their reasoning\n- Students can apply to new contexts\n\n### Lesson Sequence\n1. **Hook (10 min)** - [Engaging opening activity]\n2. **Explicit Teaching (15 min)** - [Direct instruction]\n3. **Guided Practice (20 min)** - [Scaffolded activities]\n4. **Independent Work (10 min)** - [Application]\n5. **Reflection (5 min)** - [Exit ticket]\n\n### Resources\n- [Resource 1]\n- [Resource 2]\n\n### Differentiation\n- **Below level:** [Support strategy]\n- **Above level:** [Extension]",
  rubric: "## Assessment Rubric: [Task Name]\n\n**Subject:** [Subject] | **Year Level:** [Year]\n\n| Criterion | A (Excellent) | B (Proficient) | C (Developing) | D (Beginning) |\n|-----------|---------------|----------------|----------------|---------------|\n| Knowledge & Understanding | Demonstrates comprehensive understanding of all concepts | Shows solid understanding of most concepts | Shows basic understanding with some gaps | Limited understanding evident |\n| Application | Applies knowledge accurately to new contexts | Applies knowledge with minor errors | Attempts application with support | Unable to apply without significant support |\n| Communication | Uses precise, clear language throughout | Communicates ideas effectively | Communicates with some confusion | Difficult to follow |\n| Analysis | Provides insightful analysis with evidence | Shows good analytical skills | Basic analysis present | Minimal analysis |",
};

export const mockChatHistory: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Can you help me plan a lesson on fractions for Year 4?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '2',
    role: 'assistant',
    content: mockChatResponses.lesson_plan,
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
  },
  {
    id: '3',
    role: 'user',
    content: 'Yes, and can you also create a rubric for assessing their understanding?',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
  },
  {
    id: '4',
    role: 'assistant',
    content: mockChatResponses.rubric,
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
  },
];