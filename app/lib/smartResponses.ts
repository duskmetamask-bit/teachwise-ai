// Smart mock responses for teaching contexts
export function getSmartResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  // Lesson Planning
  if (msg.includes('lesson plan') || msg.includes('lesson ') || msg.includes('plan a lesson')) {
    return `## Year 4 Mathematics: Fractions Lesson Plan

**Duration:** 60 minutes | **AC9MFN04**

### WALT
Understand unit fractions and represent them on a number line.

### TIB
Being able to partition and name fractions helps students develop number sense and prepares them for operations with fractions.

### Lesson Sequence

**1. Warm Up (10 min)**
- Fraction pizza game on interactive whiteboard
- "What fraction of the class is wearing blue?"

**2. Explicit Teaching (15 min)**
- Use fraction tiles to model unit fractions
- Model halves, quarters, thirds, fifths
- Connect visual to number line representation

**3. Guided Practice (20 min)**
- Students use playdough to create fractions
- Rotate through 3 workstations:
  - Fractions on number lines
  - Fraction wall matching
  - Real-world fraction problems

**4. Independent Work (10 min)**
- Complete "Fraction Friends" worksheet
- Show 2 different ways to represent the same fraction

**5. Reflection (5 min)**
- Exit ticket: "Draw a number line and place 1/2 and 1/4 on it"

### Differentiation
- **Below level:** Pre-made fraction templates, peer buddy support
- **Above level:** Challenge: "Can you find 3 fractions between 1/4 and 1/2?"

### Resources
- Fraction tiles (or digital equivalent)
- Number lines laminated
- "Fraction Friends" worksheet

Would you like me to generate a complete downloadable lesson plan, or create worksheets for this lesson?`;
  }

  // Rubrics
  if (msg.includes('rubric') || msg.includes('assessment') || msg.includes('marking criteria')) {
    return `## Assessment Rubric: Persuasive Writing

**Subject:** English | **Year Level:** Year 5 | **ACELY1701**

| Criterion | A (Excellent) | B (Proficient) | C (Developing) | D (Beginning) |
|-----------|---------------|----------------|----------------|---------------|
| **Persuasive Techniques** | Uses all 5 techniques effectively: rhetorical questions, emotive language, repetition, statistics, expert opinion | Uses 4 techniques with mostly effective placement | Uses 2-3 techniques but some feel forced or misplaced | Limited or no persuasive techniques evident |
| **Structure** | Strong hook, clear thesis, 3+ supporting arguments, impactful conclusion | Clear introduction, 2-3 arguments, effective conclusion | Basic structure present, some logical gaps | Unclear structure, difficult to follow |
| **Language** | Sophisticated vocabulary, varied sentence structures, formal tone throughout | Good vocabulary range, mostly formal, some variation | Basic vocabulary, limited sentence variety | Simple/limited language, informal tone |
| **Audience Awareness** | Consistently appropriate tone and content for audience | Mostly appropriate, minor missteps | Some disconnect with audience | Little regard for audience |

### Feedback Prompts
- "Your hook really grabbed my attention because..."
- "Consider adding [technique] to strengthen your argument about..."
- "Your conclusion could be more powerful if you..."

Want me to create a rubric for a different subject or year level?`;
  }

  // Differentiation
  if (msg.includes('differentiate') || msg.includes('eald') || msg.includes('extension') || msg.includes('support')) {
    return `## Differentiation Strategies for Year 4-6

### For EAL/D Learners

**Visual Support**
- Word walls with images for key vocabulary
- Sentence starters displayed visually
- Graphic organizers for all tasks

**Language Scaffolding**
- Glossaries with home language translations
- Partner support with bilingual peers
- Reduced language load for assessments

**Example for a fractions lesson:**
- Provide vocabulary cards: numerator, denominator, whole
- Use physical manipulatives over abstract symbols
- Allow verbal explanations alongside written

---

### For Students with Additional Needs

**Sensory Accommodations**
- Fidget tools available
- Flexible seating options
- Noise-cancelling headphones during independent work

**Processing Support**
- Chunked instructions
- Visual timetables
- Regular check-ins

**Example accommodations:**
- Extended time for tasks
- Word prediction software
- scribe for written tasks if needed

---

### Extension Strategies

**Depth over Breadth**
- "What if..." questions
- Open-ended challenges
- Real-world applications

**Example Extension Tasks:**
- Design a fractions game for Year 2s
- Research how fractions are used in cooking/baking
- Create a video tutorial on a concept

---

Would you like me to generate a specific differentiated worksheet or activity?`;
  }

  // Behaviour
  if (msg.includes('behaviour') || msg.includes('behave') || msg.includes('classroom management') || msg.includes('de-escalat')) {
    return `## Behaviour Support Strategies

### De-escalation Script
"When I see [observation], I understand [validating statement]. Right now, I need you to [clear request]. We can [restorative choice]."

**Example:**
"I can see you're really frustrated with this task. That's okay - fractions are tricky. Right now, I need you to use your breathing strategy. We can either take a break or try a different approach to this problem."

---

### Quick Calming Strategies

| Strategy | When to Use | How |
|----------|-------------|-----|
| **5-4-3-2-1** | Rising anxiety | Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste |
| **Balloon breathing** | Need to calm quickly | Inhale for 4 counts, hold for 4, exhale for 6 |
| **Movement break** | Restless, unfocused | 5 star jumps, 3 laps of the room, desk push-ups |
| **Safe spot** | Overwhelmed | Designated calm corner with sensory tools |

---

### Restorative Questions
1. What happened?
2. Who was affected?
3. What do you need right now?
4. How can we make this right?

---

### Proactive Strategies
- **Visual schedules** displayed clearly
- **Movement breaks** every 30 minutes
- **Positive reinforcement** - catch them being good
- **Preferred activities** as rewards
- **Visual timers** for transitions

Would you like me to create a behaviour tracking form or individual support plan?`;
  }

  // Report Comments
  if (msg.includes('report') || msg.includes('comments') || msg.includes('summative')) {
    return `## Report Comment: Mathematics - Year 4

**Student demonstrates solid understanding of...**

### Strengths-Based Comments by Level

**Above Expected:**
"[Name] consistently demonstrates strong number sense and can apply mathematical concepts to solve complex problems. They show excellent reasoning skills and confidently explain their mathematical thinking. [Name] would benefit from challenging extension tasks that require application to unfamiliar contexts."

**At Expected:**
"[Name] has developed a solid understanding of the concepts covered this semester. They apply strategies effectively to solve problems and can explain their thinking clearly. [Name] demonstrates positive engagement with mathematics and shows good growth. Continuing to practice number facts at home would support their continued progress."

**Below Expected (with growth language):**
"[Name] has made pleasing progress this semester in developing their understanding of mathematical concepts. With consistent support and scaffolded tasks, they demonstrate growing confidence in applying basic strategies. [Name] would benefit from additional practice with [specific skill] at home using hands-on materials."

---

### Quick Modifiers
- "has shown excellent growth in"
- "demonstrates strong understanding of"
- "is working towards confidently applying"
- "has made pleasing progress with"

---

Would you like me to generate bulk comments for your whole class, or focus on a specific subject/year level?`;
  }

  // Worksheets
  if (msg.includes('worksheet') || msg.includes('activity') || msg.includes('resources')) {
    return `## Worksheet Ideas by Subject

### Mathematics

**Year 4 - Fractions**
- "Fraction of the Day" template
- Fraction word problems at 3 levels
- Number line placement challenges
- Real-world fraction problems (cooking, shopping)

**Year 5 - Decimals**
- Decimal war card game
- Rounding decimals maze
- Money and decimals connection tasks
- Measurement conversions

---

### English

**Year 4-6 Persuasive Writing**
- Graphic organizer: O.R.E.O. paragraph structure
- Persuasive technique identification sheets
- Argument builder worksheets
- Peer feedback reflection forms

---

### Science

**Year 6 - Earth & Space**
- Eclipse observation log
- Moon phase diary template
- Scale model of solar system
- Seasons investigation planner

---

Want me to generate a complete differentiated worksheet right now? Just tell me:
1. Subject
2. Year level
3. Specific topic or skill
4. Difficulty level needed`;
  }

  // Default response
  return `## How Can I Help?

I can assist you with a wide range of teaching tasks. Here are some things you can ask me:

**📚 Lesson Planning**
"Create a lesson plan for Year 4 fractions"

**📋 Assessment & Rubrics**
"Generate a rubric for persuasive writing"

**🎯 Differentiation**
"How can I differentiate for EAL/D learners?"

**🎭 Behaviour Support**
"What strategies help with de-escalation?"

**📝 Report Writing**
"Write report comments for Year 5 maths"

**📄 Resources & Worksheets**
"Create a worksheet on noun types"

---

Just type what you need and I'll create it for you! You can also ask me to modify or expand on anything I provide.`;
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}