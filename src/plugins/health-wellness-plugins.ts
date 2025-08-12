import { PluginManifest } from '../lib/types';

// Fitness Tracker Plugin - Workout logging and progress tracking
export const fitnessTrackerPlugin: PluginManifest = {
  id: 'fitness-tracker',
  name: 'Fitness Tracker',
  version: '1.0.0',
  description: 'Workout logging, exercise database, and fitness progress tracking',
  author: 'MarkItUp Team',
  main: 'fitness-tracker.js',
  
  commands: [
    {
      id: 'create-workout-log',
      name: 'Create Workout Log',
      description: 'Log a workout session',
      callback: async () => {
        const date = new Date().toLocaleDateString();
        const workoutType = prompt('Workout type (strength/cardio/flexibility/sport):');
        const duration = prompt('Duration (minutes):');
        
        const workout = `# Workout Log - ${date}

**Date:** ${date}  
**Type:** ${workoutType || 'General'}  
**Duration:** ${duration || '[Duration]'} minutes  
**Location:** [Gym/Home/Outdoor]

## Pre-Workout
**Energy Level:** [1-10]  
**Sleep Quality:** [Hours slept / Quality 1-10]  
**Nutrition:** [What you ate before]  
**Hydration:** [Glasses of water]

## Warm-up (5-10 minutes)
- [ ] Light cardio (5 min)
- [ ] Dynamic stretching
- [ ] Joint mobility
- [ ] Movement preparation

## Main Workout

### Strength Training
| Exercise | Sets | Reps | Weight | Rest | Notes |
|----------|------|------|--------|------|-------|
| [Exercise 1] | 3 | 10 | [Weight] | 60s | [Form notes] |
| [Exercise 2] | 3 | 12 | [Weight] | 60s | [Progress notes] |
| [Exercise 3] | 3 | 8 | [Weight] | 90s | [Difficulty] |

### Cardio
| Activity | Duration | Intensity | Distance | Calories | Notes |
|----------|----------|-----------|----------|----------|-------|
| [Activity] | [Time] | [Level 1-10] | [Distance] | [Est. cals] | [How it felt] |

### Flexibility/Mobility
- [ ] [Stretch 1] - [Duration]
- [ ] [Stretch 2] - [Duration]
- [ ] [Stretch 3] - [Duration]

## Cool-down (5-10 minutes)
- [ ] Light walking
- [ ] Static stretching
- [ ] Deep breathing
- [ ] Hydration

## Post-Workout
**Energy Level:** [1-10]  
**Muscle Fatigue:** [Areas that feel worked]  
**Overall Feeling:** [Great/Good/Okay/Tough]  
**Heart Rate Recovery:** [How quickly HR returned to normal]

## Progress Notes
**Improvements:** [What went better than last time]  
**Challenges:** [What was difficult]  
**Next Session Goals:** [What to focus on next time]  
**Weight/Measurements:** [If tracking]

## Nutrition Post-Workout
**Post-Workout Meal:** [What you ate after]  
**Hydration:** [Additional water intake]  
**Supplements:** [Any supplements taken]

## Weekly Goals Review
- [ ] Goal 1: [Specific fitness goal]
- [ ] Goal 2: [Specific fitness goal]
- [ ] Goal 3: [Specific fitness goal]

## Equipment Used
- [Equipment 1]
- [Equipment 2]
- [Equipment 3]

## Workout Rating
**Overall Session:** ⭐⭐⭐⭐⭐ ([1-5 stars])  
**Intensity:** [1-10]  
**Enjoyment:** [1-10]
`;
        console.log('Workout log:', workout);
      }
    },
    {
      id: 'exercise-database',
      name: 'Exercise Database',
      description: 'Browse exercise library',
      callback: async () => {
        const category = prompt('Exercise category (chest/back/legs/shoulders/arms/core/cardio):');
        
        const exercises = `# Exercise Database - ${category?.toUpperCase() || 'ALL CATEGORIES'}

## Upper Body

### Chest
- **Push-ups** - Bodyweight | Beginner
  - *Targets:* Chest, shoulders, triceps
  - *Form:* Keep body straight, lower chest to ground
- **Bench Press** - Barbell/Dumbbell | Intermediate
  - *Targets:* Chest, shoulders, triceps
  - *Form:* Control descent, full range of motion
- **Chest Flyes** - Dumbbell/Cable | Intermediate
  - *Targets:* Chest isolation
  - *Form:* Slight bend in elbows, squeeze chest

### Back
- **Pull-ups/Chin-ups** - Bodyweight | Intermediate
  - *Targets:* Lats, rhomboids, biceps
  - *Form:* Full hang to chin over bar
- **Bent-over Rows** - Barbell/Dumbbell | Beginner
  - *Targets:* Lats, rhomboids, rear delts
  - *Form:* Hinge at hips, pull to lower ribs
- **Lat Pulldowns** - Cable | Beginner
  - *Targets:* Latissimus dorsi
  - *Form:* Pull to upper chest, control release

### Shoulders
- **Overhead Press** - Barbell/Dumbbell | Intermediate
  - *Targets:* Shoulders, triceps, core
  - *Form:* Press straight up, core engaged
- **Lateral Raises** - Dumbbell | Beginner
  - *Targets:* Side deltoids
  - *Form:* Lift to shoulder height, control descent
- **Face Pulls** - Cable | Beginner
  - *Targets:* Rear deltoids, rhomboids
  - *Form:* Pull to face level, squeeze shoulder blades

### Arms
- **Bicep Curls** - Dumbbell/Barbell | Beginner
  - *Targets:* Biceps
  - *Form:* Control both directions, no swinging
- **Tricep Dips** - Bodyweight/Assisted | Beginner
  - *Targets:* Triceps, shoulders
  - *Form:* Lower until 90° elbow bend
- **Hammer Curls** - Dumbbell | Beginner
  - *Targets:* Biceps, forearms
  - *Form:* Neutral grip, control movement

## Lower Body

### Legs
- **Squats** - Bodyweight/Barbell | Beginner
  - *Targets:* Quads, glutes, hamstrings
  - *Form:* Hips back, knees track over toes
- **Deadlifts** - Barbell/Dumbbell | Intermediate
  - *Targets:* Hamstrings, glutes, back
  - *Form:* Hip hinge, straight back
- **Lunges** - Bodyweight/Dumbbell | Beginner
  - *Targets:* Quads, glutes, balance
  - *Form:* Step forward, 90° angles both knees

### Glutes
- **Hip Thrusts** - Barbell/Bodyweight | Intermediate
  - *Targets:* Glutes, hamstrings
  - *Form:* Drive through heels, squeeze glutes
- **Glute Bridges** - Bodyweight | Beginner
  - *Targets:* Glutes, core stability
  - *Form:* Squeeze glutes at top, control descent

## Core
- **Planks** - Bodyweight | Beginner
  - *Targets:* Core stability, shoulders
  - *Form:* Straight line, breathe normally
- **Dead Bug** - Bodyweight | Beginner
  - *Targets:* Core stability, coordination
  - *Form:* Opposite arm/leg, maintain back contact
- **Russian Twists** - Bodyweight/Weighted | Intermediate
  - *Targets:* Obliques, core rotation
  - *Form:* Lean back, rotate controlled

## Cardio
- **Running/Jogging** - Outdoor/Treadmill | All levels
  - *Benefits:* Cardiovascular health, endurance
  - *Tips:* Start slow, build gradually
- **Cycling** - Outdoor/Stationary | All levels
  - *Benefits:* Low impact cardio, leg strength
  - *Tips:* Proper bike fit, vary intensity
- **Jump Rope** - Equipment needed | Intermediate
  - *Benefits:* Coordination, cardio, portability
  - *Tips:* Start with short intervals

## Workout Templates

### Full Body Beginner
1. Bodyweight Squats - 3x10
2. Push-ups - 3x8
3. Bent-over Rows - 3x10
4. Overhead Press - 3x8
5. Plank - 3x30s

### Upper/Lower Split
**Upper Day:**
1. Bench Press - 4x8
2. Bent-over Rows - 4x8
3. Overhead Press - 3x10
4. Pull-ups - 3xAMRAP
5. Bicep Curls - 3x12

**Lower Day:**
1. Squats - 4x8
2. Deadlifts - 4x6
3. Lunges - 3x10 each leg
4. Hip Thrusts - 3x12
5. Calf Raises - 3x15

## Recovery & Mobility
- **Foam Rolling** - 5-10 minutes
- **Dynamic Warm-up** - Before workouts
- **Static Stretching** - After workouts
- **Rest Days** - 1-2 per week minimum
`;
        console.log('Exercise database:', exercises);
      }
    }
  ],

  onLoad: async () => {
    console.log('Fitness Tracker plugin loaded');
  }
};

// Nutrition Diary Plugin - Meal planning and nutrition tracking
export const nutritionDiaryPlugin: PluginManifest = {
  id: 'nutrition-diary',
  name: 'Nutrition Diary',
  version: '1.0.0',
  description: 'Food diary, meal planning, and nutrition goal tracking',
  author: 'MarkItUp Team',
  main: 'nutrition-diary.js',
  
  commands: [
    {
      id: 'daily-food-log',
      name: 'Daily Food Log',
      description: 'Create daily nutrition log',
      callback: async () => {
        const date = new Date().toLocaleDateString();
        
        const foodLog = `# Nutrition Log - ${date}

**Date:** ${date}  
**Weight:** [Current weight]  
**Water Intake:** 💧💧💧💧💧💧💧💧 (8 glasses)  
**Energy Level:** [1-10]  
**Hunger Level:** [1-10]

## Daily Goals
- **Calories:** [Target] kcal
- **Protein:** [Target] g
- **Carbs:** [Target] g  
- **Fat:** [Target] g
- **Fiber:** [Target] g
- **Water:** 8+ glasses

## Meals

### Breakfast - [Time]
**Foods:**
- [Food item] - [Portion size]
- [Food item] - [Portion size]
- [Food item] - [Portion size]

**Estimated Calories:** [Total]  
**Satisfaction:** [1-10]  
**Notes:** [How you felt, energy level]

### Morning Snack - [Time]
**Foods:**
- [Food item] - [Portion size]

**Estimated Calories:** [Total]

### Lunch - [Time]
**Foods:**
- [Food item] - [Portion size]
- [Food item] - [Portion size]
- [Food item] - [Portion size]

**Estimated Calories:** [Total]  
**Satisfaction:** [1-10]  
**Notes:** [How you felt after eating]

### Afternoon Snack - [Time]
**Foods:**
- [Food item] - [Portion size]

**Estimated Calories:** [Total]

### Dinner - [Time]
**Foods:**
- [Food item] - [Portion size]
- [Food item] - [Portion size]
- [Food item] - [Portion size]

**Estimated Calories:** [Total]  
**Satisfaction:** [1-10]  
**Notes:** [Dinner experience]

### Evening Snack - [Time]
**Foods:**
- [Food item] - [Portion size]

**Estimated Calories:** [Total]

## Daily Totals (Estimated)
- **Total Calories:** [Sum] kcal
- **Protein:** [Sum] g
- **Carbohydrates:** [Sum] g
- **Fat:** [Sum] g
- **Fiber:** [Sum] g
- **Sugar:** [Sum] g

## Hydration Tracker
**Water:** [Glasses consumed]  
**Other Fluids:**
- [Beverage] - [Amount]
- [Beverage] - [Amount]

## Supplements
- [ ] Multivitamin
- [ ] Vitamin D
- [ ] Omega-3
- [ ] [Other supplement]

## Physical Activity
**Exercise:** [Type and duration]  
**Steps:** [If tracked]  
**Calories Burned:** [Estimated]

## Mood & Energy
**Morning Energy:** [1-10]  
**Afternoon Energy:** [1-10]  
**Evening Energy:** [1-10]  
**Overall Mood:** [Great/Good/Okay/Low]

## Digestive Health
**Bowel Movement:** [Yes/No]  
**Bloating:** [None/Mild/Moderate/Severe]  
**Heartburn:** [Yes/No]  
**Gas:** [None/Mild/Moderate/Severe]

## Sleep Quality
**Bedtime:** [Time]  
**Wake Time:** [Time]  
**Hours Slept:** [Total]  
**Sleep Quality:** [1-10]

## Reflections
**What went well:** [Positive eating choices]  
**Challenges:** [Difficult moments or cravings]  
**Tomorrow's focus:** [What to improve or maintain]  
**Emotional eating triggers:** [If any]

## Weekly Pattern Check
- [ ] Meeting protein goals
- [ ] Eating enough vegetables
- [ ] Staying hydrated
- [ ] Balanced meals
- [ ] Mindful eating

## Food Prep Notes
**Meals prepped:** [What's ready for tomorrow]  
**Shopping needed:** [Items to buy]  
**Recipe ideas:** [Meals to try]
`;
        console.log('Food log:', foodLog);
      }
    },
    {
      id: 'meal-planner',
      name: 'Meal Planner',
      description: 'Create weekly meal plan',
      callback: async () => {
        const week = prompt('Week starting (MM/DD):') || new Date().toLocaleDateString();
        
        const mealPlan = `# Weekly Meal Plan - Week of ${week}

## Weekly Goals
- **Nutrition Focus:** [Protein/Vegetables/Whole grains/etc.]
- **Prep Time Available:** [Hours for meal prep]
- **Budget:** $[Amount] for groceries
- **Dietary Restrictions:** [Any restrictions]

## Monday
### Breakfast: [Meal name]
**Prep Time:** [Minutes]  
**Ingredients:**
- [Ingredient 1]
- [Ingredient 2]

### Lunch: [Meal name]
**Prep Time:** [Minutes]  
**Ingredients:**
- [Ingredient 1]
- [Ingredient 2]

### Dinner: [Meal name]
**Prep Time:** [Minutes]  
**Ingredients:**
- [Ingredient 1]
- [Ingredient 2]

### Snacks:
- [Snack 1]
- [Snack 2]

---

## Tuesday
### Breakfast: [Meal name]
### Lunch: [Meal name]
### Dinner: [Meal name]
### Snacks: [List]

---

## Wednesday
### Breakfast: [Meal name]
### Lunch: [Meal name]
### Dinner: [Meal name]
### Snacks: [List]

---

## Thursday
### Breakfast: [Meal name]
### Lunch: [Meal name]
### Dinner: [Meal name]
### Snacks: [List]

---

## Friday
### Breakfast: [Meal name]
### Lunch: [Meal name]
### Dinner: [Meal name]
### Snacks: [List]

---

## Saturday
### Breakfast: [Meal name]
### Lunch: [Meal name]
### Dinner: [Meal name]
### Snacks: [List]

---

## Sunday
### Breakfast: [Meal name]
### Lunch: [Meal name]
### Dinner: [Meal name]
### Snacks: [List]

---

## Shopping List

### Proteins
- [ ] [Protein source 1] - [Amount]
- [ ] [Protein source 2] - [Amount]

### Vegetables
- [ ] [Vegetable 1] - [Amount]
- [ ] [Vegetable 2] - [Amount]

### Fruits
- [ ] [Fruit 1] - [Amount]
- [ ] [Fruit 2] - [Amount]

### Grains/Starches
- [ ] [Grain 1] - [Amount]
- [ ] [Grain 2] - [Amount]

### Dairy/Alternatives
- [ ] [Dairy item 1] - [Amount]
- [ ] [Dairy item 2] - [Amount]

### Pantry Items
- [ ] [Pantry item 1] - [Amount]
- [ ] [Pantry item 2] - [Amount]

### Snacks
- [ ] [Snack 1] - [Amount]
- [ ] [Snack 2] - [Amount]

## Meal Prep Schedule

### Sunday Prep (2-3 hours)
- [ ] Wash and chop vegetables
- [ ] Cook grains for the week
- [ ] Prepare protein for 3-4 meals
- [ ] Make overnight oats/chia pudding
- [ ] Portion snacks

### Wednesday Prep (1 hour)
- [ ] Prepare remaining proteins
- [ ] Refresh vegetables
- [ ] Prep Thursday-Sunday meals

## Weekly Nutrition Goals
- **Vegetables:** 5+ servings daily
- **Protein:** [Target] g daily
- **Water:** 8+ glasses daily
- **Whole Grains:** 3+ servings daily
- **Healthy Fats:** 2-3 servings daily

## Budget Breakdown
- **Proteins:** $[Amount]
- **Produce:** $[Amount]
- **Pantry Items:** $[Amount]
- **Total Estimated:** $[Total]

## Notes
- **Leftover Plan:** [How to use leftovers]
- **Backup Meals:** [Quick options if plans change]
- **Restaurant/Takeout:** [Planned eating out]
`;
        console.log('Meal plan:', mealPlan);
      }
    }
  ],

  onLoad: async () => {
    console.log('Nutrition Diary plugin loaded');
  }
};

// Sleep Tracker Plugin - Sleep quality and pattern tracking
export const sleepTrackerPlugin: PluginManifest = {
  id: 'sleep-tracker',
  name: 'Sleep Tracker',
  version: '1.0.0',
  description: 'Sleep quality tracking, bedtime routine planning, and sleep habit analysis',
  author: 'MarkItUp Team',
  main: 'sleep-tracker.js',
  
  commands: [
    {
      id: 'sleep-log',
      name: 'Sleep Log',
      description: 'Log sleep data and quality',
      callback: async () => {
        const date = new Date().toLocaleDateString();
        
        const sleepLog = `# Sleep Log - ${date}

**Date:** ${date}  
**Day of Week:** ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}

## Sleep Schedule
**Target Bedtime:** [Ideal bedtime]  
**Actual Bedtime:** [When you got in bed]  
**Sleep Onset:** [When you fell asleep]  
**Wake Time:** [When you woke up]  
**Get Up Time:** [When you got out of bed]

## Sleep Duration
**Time in Bed:** [Hours]  
**Actual Sleep Time:** [Hours]  
**Sleep Efficiency:** [Sleep time ÷ Time in bed × 100]%

## Sleep Quality Metrics
**Overall Quality:** ⭐⭐⭐⭐⭐ (1-5 stars)  
**Ease of Falling Asleep:** [1-10]  
**Number of Awakenings:** [Count]  
**Restfulness:** [1-10]  
**Morning Alertness:** [1-10]

## Pre-Sleep Routine (Evening)
**Screen Time:** [Hours before bed]  
**Last Meal:** [Hours before bed]  
**Caffeine Intake:** [Time of last caffeine]  
**Exercise:** [Type and time]  
**Alcohol:** [Amount and time]  
**Relaxation Activities:**
- [ ] Reading
- [ ] Meditation
- [ ] Stretching
- [ ] Warm bath/shower
- [ ] Journaling
- [ ] [Other activity]

## Sleep Environment
**Room Temperature:** [Temperature]°F  
**Darkness Level:** [1-10] (10 = completely dark)  
**Noise Level:** [1-10] (1 = silent)  
**Comfort:** [1-10] (mattress, pillows, bedding)  
**Air Quality:** [1-10]

## Factors Affecting Sleep
### Positive Factors
- [Factor 1]
- [Factor 2]
- [Factor 3]

### Negative Factors
- [Factor 1]
- [Factor 2]
- [Factor 3]

## Physical Symptoms
**Morning Grogginess:** [None/Mild/Moderate/Severe]  
**Headache:** [Yes/No]  
**Body Aches:** [None/Mild/Moderate/Severe]  
**Energy Level:** [1-10]

## Dreams
**Dream Recall:** [None/Vague/Some/Vivid]  
**Dream Content:** [Pleasant/Neutral/Unpleasant]  
**Nightmares:** [Yes/No]  
**Dream Notes:** [Brief description if memorable]

## Medications/Supplements
**Sleep Aids:** [Any used]  
**Time Taken:** [When taken]  
**Effectiveness:** [1-10]  
**Side Effects:** [Any noticed]

## Daily Factors
**Stress Level:** [1-10]  
**Physical Activity:** [Type and intensity]  
**Naps:** [Duration and time]  
**Light Exposure:** [Morning sunlight, evening screens]

## Weekly Sleep Pattern
**Consistency:** [How consistent is your schedule]  
**Weekend vs Weekday:** [Differences in sleep pattern]  
**Sleep Debt:** [Feeling caught up or behind]

## Sleep Goals Progress
- [ ] Consistent bedtime (±30 minutes)
- [ ] 7-9 hours of sleep
- [ ] No screens 1 hour before bed
- [ ] Morning sunlight exposure
- [ ] Regular exercise (not late evening)
- [ ] Limited caffeine after 2 PM

## Next Night Planning
**Target Bedtime:** [Time]  
**Evening Routine Start:** [Time]  
**Tomorrow's Wake Time:** [Time]  
**Focus Area:** [What to improve]

## Notes
**What Worked Well:** [Positive elements to repeat]  
**What to Change:** [Areas for improvement]  
**External Factors:** [Travel, events, etc.]  
**Mood Impact:** [How sleep affected your day]

## Weekly Review (Complete on Sunday)
**Average Sleep Duration:** [Hours]  
**Most Consistent Factor:** [What's working]  
**Biggest Challenge:** [What needs work]  
**Next Week's Goal:** [One specific improvement]
`;
        console.log('Sleep log:', sleepLog);
      }
    }
  ],

  onLoad: async () => {
    console.log('Sleep Tracker plugin loaded');
  }
};

// Mental Health Journal Plugin - Mood tracking and reflection
export const mentalHealthJournalPlugin: PluginManifest = {
  id: 'mental-health-journal',
  name: 'Mental Health Journal',
  version: '1.0.0',
  description: 'Mood tracking, gratitude practice, and mental wellness reflection',
  author: 'MarkItUp Team',
  main: 'mental-health-journal.js',
  
  commands: [
    {
      id: 'daily-mood-check',
      name: 'Daily Mood Check',
      description: 'Daily mood and mental health check-in',
      callback: async () => {
        const date = new Date().toLocaleDateString();
        
        const moodCheck = `# Daily Mental Health Check-in - ${date}

**Date:** ${date}  
**Time:** ${new Date().toLocaleTimeString()}

## Mood Assessment
**Overall Mood:** [😊 Excellent / 😊 Good / 😐 Neutral / 😔 Low / 😢 Very Low]  
**Emotional State:** [Happy/Sad/Anxious/Calm/Excited/Frustrated/Content/Other]  
**Energy Level:** [1-10]  
**Motivation Level:** [1-10]  
**Stress Level:** [1-10]

## Physical Well-being
**Sleep Quality:** [Excellent/Good/Fair/Poor]  
**Physical Energy:** [High/Medium/Low]  
**Physical Symptoms:** [Headache/Tension/Fatigue/None]  
**Appetite:** [Normal/Increased/Decreased/None]

## Emotional Check-in
### Today I'm feeling...
- [ ] Happy
- [ ] Sad
- [ ] Anxious
- [ ] Calm
- [ ] Frustrated
- [ ] Excited
- [ ] Grateful
- [ ] Overwhelmed
- [ ] Peaceful
- [ ] Angry
- [ ] Hopeful
- [ ] Lonely

### Primary Emotion
**Main feeling:** [Dominant emotion]  
**Intensity:** [1-10]  
**Duration:** [How long you've felt this way]

## Thought Patterns
**Positive Thoughts:** [Count or percentage]  
**Negative Thoughts:** [Count or percentage]  
**Ruminating Thoughts:** [Yes/No - repetitive worrying]  
**Racing Thoughts:** [Yes/No - thoughts moving too fast]

### Challenging Thoughts
**Thought:** [Specific negative or concerning thought]  
**Evidence For:** [Is this thought realistic?]  
**Evidence Against:** [What contradicts this thought?]  
**Balanced Perspective:** [More realistic view]

## Daily Activities Impact
### Positive Activities (What lifted your mood?)
- [Activity 1] - Impact: [1-10]
- [Activity 2] - Impact: [1-10]
- [Activity 3] - Impact: [1-10]

### Challenging Situations
**Situation:** [What was difficult today?]  
**Your Response:** [How you handled it]  
**What Helped:** [Coping strategies that worked]  
**What Didn't Help:** [What made it worse]

## Social Connections
**Social Interactions:** [Number and quality]  
**Feeling Connected:** [1-10]  
**Support Received:** [From whom and how]  
**Support Given:** [How you helped others]

## Coping Strategies Used
- [ ] Deep breathing
- [ ] Meditation
- [ ] Exercise
- [ ] Talking to someone
- [ ] Journaling
- [ ] Music
- [ ] Nature/outdoors
- [ ] Creative activity
- [ ] Reading
- [ ] Rest/nap
- [ ] [Other: ___________]

**Most Effective Today:** [Which strategy helped most]

## Gratitude Practice
### Three Things I'm Grateful For:
1. [Gratitude 1] - Why: [Reason]
2. [Gratitude 2] - Why: [Reason]
3. [Gratitude 3] - Why: [Reason]

### Someone I Appreciate:
**Person:** [Name]  
**Why:** [What they did or who they are]  
**How to show appreciation:** [Action you could take]

## Goals and Accomplishments
### Today's Wins (Big or Small)
- [Accomplishment 1]
- [Accomplishment 2]
- [Accomplishment 3]

### Goals Progress
**Goal:** [Current goal you're working on]  
**Progress Today:** [What you did toward this goal]  
**Obstacles:** [What got in the way]  
**Next Step:** [What you'll do tomorrow]

## Self-Care Assessment
**Physical Self-Care:** [1-10] (exercise, nutrition, hygiene)  
**Emotional Self-Care:** [1-10] (processing feelings, boundaries)  
**Mental Self-Care:** [1-10] (learning, creativity, mental stimulation)  
**Social Self-Care:** [1-10] (relationships, community)  
**Spiritual Self-Care:** [1-10] (meaning, purpose, connection)

### Self-Care Planned for Tomorrow
- [Self-care activity 1]
- [Self-care activity 2]

## Reflection Questions
**What am I proud of today?**  
[Your response]

**What challenged me most?**  
[Your response]

**What did I learn about myself?**  
[Your response]

**How can I be kind to myself tomorrow?**  
[Your response]

## Triggers and Patterns
**Mood Triggers:** [What affected your mood negatively]  
**Time Patterns:** [When you felt best/worst]  
**Environmental Factors:** [Weather, location, noise, etc.]  
**Relationship Factors:** [How interactions affected you]

## Tomorrow's Intention
**Focus:** [One thing to prioritize tomorrow]  
**Mindset:** [How you want to approach tomorrow]  
**Self-Compassion Reminder:** [Kind message to yourself]

## Professional Support
**Therapy/Counseling:** [If applicable - how it's going]  
**Medication:** [If applicable - effectiveness, side effects]  
**Need for Support:** [Do you need to reach out to someone?]

## Crisis Check
**Safety:** [Are you safe? Do you need immediate help?]  
**Crisis Resources:** [Remind yourself of emergency contacts]

**Emergency Contacts:**
- Crisis Hotline: 988 (US)
- Trusted Friend/Family: [Number]
- Mental Health Provider: [Number]

## Notes
[Any additional thoughts, insights, or observations about your mental health today]

---

*Remember: This journal is for self-reflection and awareness. If you're experiencing persistent mental health concerns, please consider reaching out to a mental health professional.*
`;
        console.log('Mood check:', moodCheck);
      }
    },
    {
      id: 'anxiety-tracker',
      name: 'Anxiety Tracker',
      description: 'Track anxiety episodes and coping strategies',
      callback: async () => {
        const time = new Date().toLocaleString();
        
        const anxietyTracker = `# Anxiety Episode Tracker - ${time}

**Date & Time:** ${time}

## Anxiety Assessment
**Anxiety Level:** [1-10] (1 = calm, 10 = panic)  
**Type:** [Generalized/Social/Performance/Panic/Specific phobia]  
**Duration:** [How long it lasted or is lasting]

## Physical Symptoms
- [ ] Racing heart
- [ ] Sweating
- [ ] Trembling/shaking
- [ ] Shortness of breath
- [ ] Chest tightness
- [ ] Nausea
- [ ] Dizziness
- [ ] Muscle tension
- [ ] Headache
- [ ] Hot/cold flashes
- [ ] [Other: ________]

**Most Prominent:** [Primary physical symptom]

## Emotional Symptoms
- [ ] Worry/fear
- [ ] Restlessness
- [ ] Irritability
- [ ] Feeling overwhelmed
- [ ] Sense of dread
- [ ] Difficulty concentrating
- [ ] Mind going blank
- [ ] Feeling detached
- [ ] [Other: ________]

## Triggers
**Immediate Trigger:** [What happened right before]  
**Environmental Factors:** [Location, people, noise, etc.]  
**Thoughts:** [What you were thinking about]  
**Situations:** [Work, social, health, financial, etc.]

## Coping Strategies Tried
### Breathing Techniques
- [ ] Deep breathing (4-7-8)
- [ ] Box breathing (4-4-4-4)
- [ ] Belly breathing
- **Effectiveness:** [1-10]

### Grounding Techniques
- [ ] 5-4-3-2-1 technique (5 things you see, 4 hear, etc.)
- [ ] Progressive muscle relaxation
- [ ] Cold water on face/hands
- [ ] Holding ice cubes
- **Effectiveness:** [1-10]

### Cognitive Strategies
- [ ] Challenging anxious thoughts
- [ ] Positive self-talk
- [ ] Mindfulness/present moment focus
- [ ] Accepting the feeling
- **Effectiveness:** [1-10]

### Physical Strategies
- [ ] Walking/movement
- [ ] Stretching
- [ ] Exercise
- [ ] Changing position
- **Effectiveness:** [1-10]

### Other Strategies
- [ ] Calling someone
- [ ] Listening to music
- [ ] Using an app
- [ ] Medication (if prescribed)
- [ ] [Other: ________]
- **Effectiveness:** [1-10]

## Thought Record
**Anxious Thought:** [Specific worry or fear]  
**Evidence For:** [Why this might be true]  
**Evidence Against:** [Why this might not be true]  
**Balanced Thought:** [More realistic perspective]  
**New Anxiety Level:** [1-10 after reframing]

## Recovery
**Time to Feel Better:** [How long it took]  
**What Helped Most:** [Most effective strategy]  
**What Made it Worse:** [What escalated the anxiety]  
**Energy Level After:** [1-10]

## Pattern Recognition
**Time of Day:** [When this typically happens]  
**Frequency:** [How often this occurs]  
**Similar Episodes:** [Have you felt this before?]  
**Life Stressors:** [Current stresses that might contribute]

## Learning and Growth
**What I Learned:** [Insights about your anxiety]  
**What to Try Next Time:** [New strategy to attempt]  
**Warning Signs:** [Early indicators you might have missed]

## Support System
**Who Helped:** [People who supported you]  
**How They Helped:** [What they did]  
**Who to Contact Next Time:** [Support person for future episodes]

## Prevention Planning
**Upcoming Triggers:** [Situations that might cause anxiety]  
**Preparation Strategies:** [How to prepare]  
**Self-Care Needed:** [What you need to reduce overall anxiety]

## Professional Support
**Therapy Techniques:** [Skills from counseling that helped]  
**Medication:** [If applicable - effectiveness]  
**Need to Contact Provider:** [Yes/No]

## Notes
[Additional observations, thoughts, or plans]

---

**Remember:** Anxiety is treatable. If episodes are frequent or severe, consider professional support.

**Crisis Resources:**
- Crisis Text Line: Text HOME to 741741
- National Suicide Prevention Lifeline: 988
- Emergency Services: 911
`;
        console.log('Anxiety tracker:', anxietyTracker);
      }
    }
  ],

  onLoad: async () => {
    console.log('Mental Health Journal plugin loaded');
  }
};
