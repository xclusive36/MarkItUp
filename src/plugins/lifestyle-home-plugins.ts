import { PluginManifest } from '../lib/types';

// Home Maintenance Tracker Plugin - Schedule and track home maintenance tasks
export const homeMaintenanceTrackerPlugin: PluginManifest = {
  id: 'home-maintenance-tracker',
  name: 'Home Maintenance Tracker',
  version: '1.0.0',
  description: 'Schedule maintenance tasks, track home improvements, and manage property care',
  author: 'MarkItUp Team',
  main: 'home-maintenance-tracker.js',
  
  commands: [
    {
      id: 'create-maintenance-schedule',
      name: 'Create Maintenance Schedule',
      description: 'Create annual home maintenance schedule',
      callback: async () => {
        const year = prompt('Year:') || new Date().getFullYear();
        
        const schedule = `# Home Maintenance Schedule - ${year}

**Property:** [Address]  
**Home Type:** [Single Family/Condo/Townhouse]  
**Year Built:** [Year]  
**Square Footage:** [Sq Ft]  
**Last Updated:** ${new Date().toLocaleDateString()}

## Monthly Maintenance Calendar

### January
#### Interior Tasks
- [ ] **HVAC Filter** - Replace furnace/AC filters (Monthly)
- [ ] **Deep Clean Kitchen** - Clean oven, refrigerator coils
- [ ] **Test Safety Devices** - Smoke/CO detectors, fire extinguisher
- [ ] **Check Plumbing** - Look for leaks, test water pressure
- [ ] **Organize Storage** - Basement, attic, closets

#### Exterior Tasks
- [ ] **Winter Storm Prep** - Check for ice dams, clear snow loads
- [ ] **Inspect Roof** - Look for damaged shingles, ice damage
- [ ] **Service Snow Removal** - Equipment maintenance
- [ ] **Protect Plants** - Cover sensitive plants if needed

### February
#### Interior Tasks
- [ ] **HVAC Filter** - Replace filters
- [ ] **Water Heater** - Check temperature setting, test relief valve
- [ ] **Electrical Check** - Test GFCI outlets, check panel
- [ ] **Pest Inspection** - Look for signs of rodents or insects
- [ ] **Window Treatments** - Clean blinds, wash curtains

#### Exterior Tasks
- [ ] **Storm Damage** - Assess any winter damage
- [ ] **Plan Spring Projects** - Research and budget improvements
- [ ] **Tool Maintenance** - Service lawn equipment, sharpen tools
- [ ] **Security Systems** - Test outdoor cameras, lighting

### March
#### Interior Tasks
- [ ] **HVAC Filter** - Replace filters
- [ ] **Spring Cleaning** - Deep clean carpets, wash windows
- [ ] **Ceiling Fans** - Clean and reverse direction for spring
- [ ] **Check Caulking** - Around tubs, showers, windows
- [ ] **Organize Garage** - Spring organization and cleaning

#### Exterior Tasks
- [ ] **Gutter Cleaning** - Remove debris, check for damage
- [ ] **Pressure Washing** - Siding, decks, driveways
- [ ] **Landscape Prep** - Prune trees, prepare garden beds
- [ ] **Outdoor Furniture** - Clean and inspect patio furniture

### April
#### Interior Tasks
- [ ] **HVAC Filter** - Replace filters
- [ ] **AC Preparation** - Professional service before summer
- [ ] **Appliance Deep Clean** - Dishwasher, washing machine
- [ ] **Check Attic** - Insulation, ventilation, pest signs
- [ ] **Spring Decor** - Seasonal decorating changes

#### Exterior Tasks
- [ ] **Sprinkler System** - Turn on, test zones, repair leaks
- [ ] **Deck/Patio Maintenance** - Stain, seal, repair boards
- [ ] **Plant Spring Gardens** - Flowers, vegetables, lawn care
- [ ] **Exterior Painting** - Touch up trim, siding

### May
#### Interior Tasks
- [ ] **HVAC Filter** - Replace filters
- [ ] **Basement Check** - Moisture, foundation cracks
- [ ] **Window Screens** - Install, clean, repair
- [ ] **Closet Organization** - Seasonal clothing swap
- [ ] **Light Fixtures** - Clean, replace bulbs with LED

#### Exterior Tasks
- [ ] **Lawn Care** - Fertilize, overseed, weed control
- [ ] **Pool Opening** - If applicable, prepare for season
- [ ] **Outdoor Lighting** - Test and replace bulbs
- [ ] **Fence/Gate Maintenance** - Repair, stain, lubricate hinges

### June
#### Interior Tasks
- [ ] **HVAC Filter** - Replace filters
- [ ] **Exhaust Fans** - Clean bathroom and kitchen fans
- [ ] **Grout Cleaning** - Deep clean tile grout
- [ ] **Summer Prep** - Set up fans, check AC efficiency
- [ ] **Pantry Organization** - Check expiration dates, organize

#### Exterior Tasks
- [ ] **Deck Staining** - Apply protective finish
- [ ] **Garden Maintenance** - Mulching, weeding, watering systems
- [ ] **Exterior Caulking** - Check and repair around windows/doors
- [ ] **Driveway Maintenance** - Seal cracks, clean stains

### July
#### Interior Tasks
- [ ] **HVAC Filter** - Replace filters
- [ ] **Deep Refrigerator Clean** - Clean coils, organize
- [ ] **Carpet Care** - Professional cleaning or deep clean
- [ ] **Update Emergency Kit** - Check supplies, medications
- [ ] **Bathroom Deep Clean** - Recaulk if needed

#### Exterior Tasks
- [ ] **Irrigation Efficiency** - Check sprinkler heads, timers
- [ ] **Pest Control** - Summer insect management
- [ ] **Pool Maintenance** - Regular cleaning and chemical balance
- [ ] **Outdoor Equipment** - Maintain mowers, trimmers

### August
#### Interior Tasks
- [ ] **HVAC Filter** - Replace filters
- [ ] **Washing Machine** - Deep clean, check hoses
- [ ] **Kitchen Deep Clean** - Clean inside appliances
- [ ] **Check Insulation** - Prepare for fall energy efficiency
- [ ] **Smoke Detector** - Test and replace batteries

#### Exterior Tasks
- [ ] **Tree Trimming** - Remove dead branches before storm season
- [ ] **Siding Inspection** - Look for damage, clean as needed
- [ ] **Outdoor Drainage** - Ensure proper water flow away from house
- [ ] **Storm Prep** - Check hurricane/severe weather preparedness

### September
#### Interior Tasks
- [ ] **HVAC Filter** - Replace filters
- [ ] **Fall Cleaning** - Deep clean before spending more time indoors
- [ ] **Ceiling Fan Direction** - Reverse for fall/winter
- [ ] **Check Weather Stripping** - Around doors and windows
- [ ] **Organize Winter Items** - Bring out heaters, blankets

#### Exterior Tasks
- [ ] **Gutter Cleaning** - Prepare for fall leaves
- [ ] **Fall Planting** - Trees, shrubs, fall flowers
- [ ] **Outdoor Furniture** - Clean and prepare for storage
- [ ] **Chimney Inspection** - Professional cleaning and inspection

### October
#### Interior Tasks
- [ ] **HVAC Filter** - Replace filters
- [ ] **Furnace Preparation** - Professional service, test heating
- [ ] **Winter Clothing** - Organize and store summer clothes
- [ ] **Check Basement** - Prepare for heating season
- [ ] **Holiday Decorations** - Organize and plan seasonal decor

#### Exterior Tasks
- [ ] **Winterize Sprinklers** - Drain and shut off outdoor water
- [ ] **Rake Leaves** - Keep gutters and lawn clear
- [ ] **Storm Window Installation** - If applicable
- [ ] **Garden Cleanup** - Prepare beds for winter

### November
#### Interior Tasks
- [ ] **HVAC Filter** - Replace filters
- [ ] **Water Heater** - Drain sediment, check anode rod
- [ ] **Fireplace Prep** - Clean, check damper, stock wood
- [ ] **Holiday Prep** - Electrical capacity for decorations
- [ ] **Indoor Air Quality** - Clean humidifier, check ventilation

#### Exterior Tasks
- [ ] **Final Gutter Clean** - Remove all leaves and debris
- [ ] **Winter Tool Prep** - Snow shovels, salt supplies
- [ ] **Protect Outdoor Equipment** - Store or cover lawn equipment
- [ ] **Tree Protection** - Wrap young trees if needed

### December
#### Interior Tasks
- [ ] **HVAC Filter** - Replace filters
- [ ] **Holiday Safety** - Check electrical loads, tree watering
- [ ] **Year-End Deep Clean** - Prepare for new year
- [ ] **Check Humidifier** - Clean and maintain for dry winter air
- [ ] **Plan Next Year** - Schedule major projects, budget

#### Exterior Tasks
- [ ] **Snow Removal Prep** - Test equipment, stock supplies
- [ ] **Holiday Lighting** - Safe installation, check electrical
- [ ] **Protect Pipes** - Insulate exposed pipes from freezing
- [ ] **Winter Emergency Kit** - Update supplies for power outages

## Emergency Maintenance Fund
**Current Balance:** $[Amount]  
**Annual Target:** $[Amount] (1-3% of home value)  
**Monthly Contribution:** $[Amount]

## Professional Service Schedule
### Annual Services
- **HVAC Service:** [Company] - [Phone] - [Date]
- **Pest Control:** [Company] - [Phone] - [Schedule]
- **Chimney Cleaning:** [Company] - [Phone] - [Date]
- **Septic Pumping:** [Company] - [Phone] - [Every 3-5 years]

### Warranty Information
| Item | Brand/Model | Purchase Date | Warranty Expires | Service Contact |
|------|-------------|---------------|------------------|-----------------|
| [Appliance] | [Brand] | [Date] | [Date] | [Phone] |

## Home Improvement Projects

### Completed This Year
| Project | Date Completed | Cost | Contractor | Notes |
|---------|----------------|------|------------|-------|
| [Project] | [Date] | $[Amount] | [Company] | [Details] |

### Planned Projects
| Project | Priority | Estimated Cost | Target Date | Status |
|---------|----------|----------------|-------------|--------|
| [Project] | High | $[Amount] | [Date] | Planning |

### Future Projects (5+ years)
- [Major project 1] - Estimated: $[Amount]
- [Major project 2] - Estimated: $[Amount]

## Utility Efficiency Tracking
### Monthly Utility Costs
| Month | Electricity | Gas | Water | Trash | Total |
|-------|-------------|-----|-------|-------|-------|
| Jan | $[Amount] | $[Amount] | $[Amount] | $[Amount] | $[Total] |

### Energy Efficiency Improvements
- [ ] **LED Bulbs** - Replace incandescent throughout house
- [ ] **Programmable Thermostat** - Install smart thermostat
- [ ] **Weather Stripping** - Update around doors/windows
- [ ] **Insulation** - Upgrade attic insulation
- [ ] **Energy Audit** - Professional assessment

## Important Home Information
### Utilities
- **Electric:** [Company] - [Account #] - [Emergency #]
- **Gas:** [Company] - [Account #] - [Emergency #]
- **Water:** [Company] - [Account #] - [Emergency #]
- **Internet:** [Company] - [Account #] - [Support #]

### Emergency Contacts
- **General Contractor:** [Name] - [Phone]
- **Plumber:** [Name] - [Phone]
- **Electrician:** [Name] - [Phone]
- **HVAC:** [Name] - [Phone]

## Notes & Reminders
- [Important maintenance notes]
- [Seasonal reminders]
- [Future improvement ideas]
`;
        console.log('Home maintenance schedule:', schedule);
      }
    },
    {
      id: 'log-maintenance-task',
      name: 'Log Maintenance Task',
      description: 'Log completed maintenance task',
      callback: async () => {
        const task = prompt('Task completed:');
        const cost = prompt('Cost (if any):') || '0';
        
        if (task) {
          const log = `## Maintenance Task Completed

**Date:** ${new Date().toLocaleDateString()}  
**Task:** ${task}  
**Cost:** $${cost}  
**Time Spent:** [Hours]  
**DIY/Professional:** [Choice]  
**Contractor:** [If applicable]

### Details
**Materials Used:**
- [Material 1] - $[Cost]
- [Material 2] - $[Cost]

**Tools Required:**
- [Tool 1]
- [Tool 2]

**Steps Completed:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Results
**Before Condition:** [Description]  
**After Condition:** [Description]  
**Quality:** ⭐⭐⭐⭐⭐ (1-5 stars)

### Follow-up Actions
- [ ] [Next maintenance date for this item]
- [ ] [Related tasks to schedule]
- [ ] [Warranty registration if applicable]

### Lessons Learned
**What Went Well:** [Successes]  
**What Was Challenging:** [Difficulties]  
**Would Do Differently:** [Improvements]  
**Recommend to Others:** Yes/No - [Why]

### Photos
- [ ] Before photos taken
- [ ] During process photos
- [ ] After completion photos
- [ ] Receipt/documentation saved
`;
          console.log('Maintenance log:', log);
        }
      }
    }
  ],

  onLoad: async () => {
    console.log('Home Maintenance Tracker plugin loaded');
  }
};

// Recipe Book Plugin - Personal recipe collection and meal planning
export const recipeBookPlugin: PluginManifest = {
  id: 'recipe-book',
  name: 'Recipe Book',
  version: '1.0.0',
  description: 'Digital recipe collection, meal planning, and cooking notes',
  author: 'MarkItUp Team',
  main: 'recipe-book.js',
  
  commands: [
    {
      id: 'add-recipe',
      name: 'Add Recipe',
      description: 'Add new recipe to collection',
      callback: async () => {
        const recipeName = prompt('Recipe name:');
        const cuisine = prompt('Cuisine type:') || '[Cuisine]';
        const servings = prompt('Number of servings:') || '[Servings]';
        
        if (recipeName) {
          const recipe = `# ${recipeName}

**Cuisine:** ${cuisine}  
**Servings:** ${servings}  
**Prep Time:** [Minutes]  
**Cook Time:** [Minutes]  
**Total Time:** [Minutes]  
**Difficulty:** ⭐⭐⭐☆☆ (1-5 stars)

## Recipe Rating & Notes
**Overall Rating:** ⭐⭐⭐⭐⭐ (1-5 stars)  
**Family Approved:** ✅/❌  
**Make Again:** ✅/❌  
**Last Made:** [Date]

## Ingredients
### Main Ingredients
- [ ] [Quantity] [Ingredient]
- [ ] [Quantity] [Ingredient]
- [ ] [Quantity] [Ingredient]

### Spices & Seasonings
- [ ] [Amount] [Spice]
- [ ] [Amount] [Spice]

### Garnish/Toppings
- [ ] [Optional ingredients]

**Shopping List Total:** [Estimated cost]

## Equipment Needed
- [Equipment 1]
- [Equipment 2]
- [Equipment 3]

## Instructions
### Prep Work (${new Date().toLocaleTimeString()})
1. [Prep step 1]
2. [Prep step 2]
3. [Prep step 3]

### Cooking Steps
1. **[Step name]** ([Time]): [Detailed instruction]
2. **[Step name]** ([Time]): [Detailed instruction]
3. **[Step name]** ([Time]): [Detailed instruction]

### Finishing
1. [Final steps]
2. [Plating instructions]
3. [Serving suggestions]

## Cooking Tips & Tricks
**Chef's Notes:**
- [Tip 1]
- [Tip 2]
- [Tip 3]

**Common Mistakes to Avoid:**
- [Mistake 1]
- [Mistake 2]

**Substitutions:**
- **[Ingredient]** can be replaced with [Alternative]
- **[Ingredient]** can be replaced with [Alternative]

## Nutritional Information (Approximate per serving)
- **Calories:** [Amount]
- **Protein:** [Amount]g
- **Carbs:** [Amount]g
- **Fat:** [Amount]g
- **Fiber:** [Amount]g
- **Sugar:** [Amount]g

**Dietary Categories:**
- [ ] Vegetarian
- [ ] Vegan
- [ ] Gluten-Free
- [ ] Dairy-Free
- [ ] Keto-Friendly
- [ ] Low-Carb
- [ ] High-Protein

## Source & Variations
**Recipe Source:** [Where you got it]  
**Original Recipe By:** [Chef/Author]  
**Recipe URL:** [Link if online]  
**Date Added:** ${new Date().toLocaleDateString()}

### Variations Tried
1. **[Variation Name]:** [What you changed] - Rating: ⭐⭐⭐⭐⭐
2. **[Variation Name]:** [What you changed] - Rating: ⭐⭐⭐⭐⭐

### Ideas for Next Time
- [Modification idea 1]
- [Modification idea 2]
- [Serving suggestion]

## Cooking Log
### Attempt 1: ${new Date().toLocaleDateString()}
**Results:** [How it turned out]  
**What Worked:** [Successes]  
**What Didn't:** [Issues]  
**Changes Made:** [Any modifications]  
**Rating:** ⭐⭐⭐⭐⭐

### Attempt 2: [Date]
**Results:** [How it turned out]  
**Improvements:** [What was better]  
**Rating:** ⭐⭐⭐⭐⭐

## Pairing Suggestions
**Wine/Beer:** [Beverage pairings]  
**Side Dishes:** [Complementary sides]  
**Appetizers:** [What to serve before]  
**Desserts:** [What to serve after]

## Meal Planning Notes
**Best Season:** [When ingredients are best]  
**Occasion:** [When to make this - weeknight/special occasion]  
**Prep Ahead:** [What can be done in advance]  
**Leftovers:** [How to store and reheat]  
**Freezer Friendly:** ✅/❌

## Cost Analysis
**Ingredient Cost:** $[Total]  
**Cost Per Serving:** $[Amount]  
**Compared to Restaurant:** [Savings amount]  
**Budget-Friendly:** ✅/❌

## Photos & Memories
- [ ] Ingredient prep photos
- [ ] Cooking process photos
- [ ] Final dish photos
- [ ] Family eating photos

**Special Memories:**
[Any special occasions or memories associated with this recipe]

## Tags for Organization
#${cuisine.toLowerCase()} #[difficulty-level] #[meal-type] #[season] #[dietary-restriction]
`;
          console.log('Recipe added:', recipe);
        }
      }
    },
    {
      id: 'weekly-meal-plan',
      name: 'Weekly Meal Plan',
      description: 'Create weekly meal plan from recipes',
      callback: async () => {
        const week = prompt('Week starting (MM/DD):') || new Date().toLocaleDateString();
        
        const mealPlan = `# Weekly Meal Plan - Week of ${week}

**Family Size:** [Number] people  
**Dietary Preferences:** [Any restrictions]  
**Budget Target:** $[Amount] for groceries  
**Prep Day:** [Day of week for meal prep]

## This Week's Menu

### Monday
- **Breakfast:** [Recipe/Meal] - Prep: [Time]
- **Lunch:** [Recipe/Meal] - Prep: [Time]
- **Dinner:** [Recipe/Meal] - Prep: [Time]
- **Snacks:** [Options]

### Tuesday
- **Breakfast:** [Recipe/Meal] - Prep: [Time]
- **Lunch:** [Recipe/Meal] - Prep: [Time]
- **Dinner:** [Recipe/Meal] - Prep: [Time]
- **Snacks:** [Options]

### Wednesday
- **Breakfast:** [Recipe/Meal] - Prep: [Time]
- **Lunch:** [Recipe/Meal] - Prep: [Time]
- **Dinner:** [Recipe/Meal] - Prep: [Time]
- **Snacks:** [Options]

### Thursday
- **Breakfast:** [Recipe/Meal] - Prep: [Time]
- **Lunch:** [Recipe/Meal] - Prep: [Time]
- **Dinner:** [Recipe/Meal] - Prep: [Time]
- **Snacks:** [Options]

### Friday
- **Breakfast:** [Recipe/Meal] - Prep: [Time]
- **Lunch:** [Recipe/Meal] - Prep: [Time]
- **Dinner:** [Recipe/Meal] - Prep: [Time]
- **Snacks:** [Options]

### Saturday
- **Breakfast:** [Recipe/Meal] - Prep: [Time]
- **Lunch:** [Recipe/Meal] - Prep: [Time]
- **Dinner:** [Recipe/Meal] - Prep: [Time]
- **Snacks:** [Options]

### Sunday
- **Breakfast:** [Recipe/Meal] - Prep: [Time]
- **Lunch:** [Recipe/Meal] - Prep: [Time]
- **Dinner:** [Recipe/Meal] - Prep: [Time]
- **Snacks:** [Options]

## Consolidated Shopping List

### Proteins
- [ ] [Protein 1] - [Amount] - $[Cost]
- [ ] [Protein 2] - [Amount] - $[Cost]

### Vegetables
- [ ] [Vegetable 1] - [Amount] - $[Cost]
- [ ] [Vegetable 2] - [Amount] - $[Cost]

### Fruits
- [ ] [Fruit 1] - [Amount] - $[Cost]
- [ ] [Fruit 2] - [Amount] - $[Cost]

### Dairy
- [ ] [Dairy item 1] - [Amount] - $[Cost]
- [ ] [Dairy item 2] - [Amount] - $[Cost]

### Pantry Staples
- [ ] [Staple 1] - [Amount] - $[Cost]
- [ ] [Staple 2] - [Amount] - $[Cost]

### Snacks & Beverages
- [ ] [Snack 1] - [Amount] - $[Cost]
- [ ] [Beverage 1] - [Amount] - $[Cost]

**Total Estimated Cost:** $[Amount]

## Meal Prep Schedule

### [Prep Day] Prep Session
**Time Needed:** [Hours]

#### Prep Tasks (2-3 hours)
- [ ] **Proteins:** [Cook chicken, portion fish, etc.]
- [ ] **Vegetables:** [Wash, chop, roast vegetables]
- [ ] **Grains:** [Cook rice, quinoa, pasta]
- [ ] **Snacks:** [Portion nuts, cut fruit]
- [ ] **Breakfast:** [Overnight oats, egg muffins]

#### Storage Plan
- **Refrigerator:** [What goes in fridge, containers needed]
- **Freezer:** [What to freeze, freezer containers]
- **Pantry:** [Dry goods organization]

## Daily Cooking Schedule

### Low-Prep Days (Monday, Wednesday, Friday)
**Strategy:** Use meal-prepped ingredients  
**Max Cook Time:** 20 minutes  
**Examples:** Salad bowls, grain bowls, simple proteins

### Medium-Prep Days (Tuesday, Thursday)
**Strategy:** One-pot meals or simple recipes  
**Max Cook Time:** 30-45 minutes  
**Examples:** Stir-fries, pasta dishes, sheet pan meals

### High-Prep Days (Weekend)
**Strategy:** Try new recipes, batch cooking  
**Cook Time:** 1+ hours allowed  
**Examples:** Slow-cooked meals, baking, complex recipes

## Leftover Management
**Monday's Dinner:** Becomes Tuesday's lunch  
**Wednesday's Dinner:** Becomes Thursday's lunch  
**Friday's Dinner:** Becomes Saturday's lunch  

### Leftover Transformation Ideas
- **Roasted Chicken** → Chicken salad, soup, tacos
- **Rice/Grains** → Fried rice, grain bowls, stuffed peppers
- **Vegetables** → Smoothies, frittatas, soups

## Nutrition Goals This Week
- [ ] **Vegetables:** 5+ servings daily
- [ ] **Protein:** [Target] grams daily
- [ ] **Whole Grains:** 3+ servings daily
- [ ] **Healthy Fats:** Include daily
- [ ] **Hydration:** 8+ glasses water daily

## Budget Tracking
**Planned Spending:** $[Budget]  
**Actual Spending:** $[Actual]  
**Savings:** $[Difference]  
**Cost Per Meal:** $[Amount]

## Family Feedback
**Monday:** [How meals were received]  
**Tuesday:** [Family favorites/dislikes]  
**Wednesday:** [What worked/didn't work]  
**Thursday:** [Cooking time reality vs plan]  
**Friday:** [Overall week assessment]  

## Next Week Planning
**Recipes to Repeat:** [Popular meals]  
**Recipes to Avoid:** [What didn't work]  
**New Recipes to Try:** [Ideas for next week]  
**Shopping Adjustments:** [What to buy more/less of]
`;
        console.log('Meal plan:', mealPlan);
      }
    }
  ],

  onLoad: async () => {
    console.log('Recipe Book plugin loaded');
  }
};

// Gift Planner Plugin - Holiday and special occasion gift planning
export const giftPlannerPlugin: PluginManifest = {
  id: 'gift-planner',
  name: 'Gift Planner',
  version: '1.0.0',
  description: 'Plan gifts for holidays, birthdays, and special occasions with budget tracking',
  author: 'MarkItUp Team',
  main: 'gift-planner.js',
  
  commands: [
    {
      id: 'create-gift-plan',
      name: 'Create Gift Plan',
      description: 'Create gift plan for holiday or occasion',
      callback: async () => {
        const occasion = prompt('Occasion (Christmas/Birthday/etc.):') || 'Holiday';
        const year = prompt('Year:') || new Date().getFullYear();
        
        const giftPlan = `# ${occasion} Gift Plan - ${year}

**Occasion:** ${occasion}  
**Date:** [Event date]  
**Total Budget:** $[Amount]  
**Created:** ${new Date().toLocaleDateString()}

## Gift Recipients

### Family
| Person | Relationship | Age | Interests | Budget | Ideas | Status |
|--------|--------------|-----|-----------|--------|-------|--------|
| [Name] | [Relationship] | [Age] | [Hobbies] | $[Amount] | [Gift ideas] | 📝 Planning |
| [Name] | [Relationship] | [Age] | [Hobbies] | $[Amount] | [Gift ideas] | 🛒 Shopping |

### Friends
| Person | Relationship | Interests | Budget | Ideas | Status |
|--------|--------------|-----------|--------|-------|--------|
| [Name] | [Close friend] | [Hobbies] | $[Amount] | [Gift ideas] | 📝 Planning |

### Colleagues/Others
| Person | Relationship | Budget | Ideas | Status |
|--------|--------------|--------|-------|--------|
| [Name] | [Coworker] | $[Amount] | [Simple gifts] | 📝 Planning |

## Budget Breakdown
**Total Budget:** $[Amount]

### By Category
- **Immediate Family:** $[Amount] ([X]% of budget)
- **Extended Family:** $[Amount] ([X]% of budget)
- **Friends:** $[Amount] ([X]% of budget)
- **Colleagues:** $[Amount] ([X]% of budget)
- **Gift Wrapping/Cards:** $[Amount] ([X]% of budget)
- **Shipping:** $[Amount] ([X]% of budget)

### By Person Budget Range
- **$0-25:** [Number] people
- **$25-50:** [Number] people
- **$50-100:** [Number] people
- **$100+:** [Number] people

## Detailed Gift Planning

### [Person Name 1]
**Relationship:** [Family/Friend]  
**Age:** [Age]  
**Budget:** $[Amount]

#### What They Love
- [Interest 1]
- [Interest 2]
- [Interest 3]

#### Gift Ideas Brainstorm
1. **[Gift idea 1]** - $[Price] - [Why they'd love it]
2. **[Gift idea 2]** - $[Price] - [Why they'd love it]
3. **[Gift idea 3]** - $[Price] - [Why they'd love it]

#### Final Decision
**Chosen Gift:** [Gift name]  
**Price:** $[Amount]  
**Where to Buy:** [Store/Website]  
**Why Perfect:** [Reasoning]

#### Purchase Tracking
- [ ] Research completed
- [ ] Price comparison done
- [ ] Purchased
- [ ] Wrapped
- [ ] Card written
- [ ] Given/Shipped

### [Person Name 2]
**Relationship:** [Family/Friend]  
**Age:** [Age]  
**Budget:** $[Amount]

#### What They Need/Want
- [Current need 1]
- [Wishlist item 1]
- [Something they mentioned wanting]

#### Gift Strategy
**Type:** [Practical/Fun/Experience/Handmade]  
**Approach:** [Surprise/Ask for wishlist/Experience together]

## Gift Shopping Timeline

### 6-8 Weeks Before
- [ ] Create gift list and budgets
- [ ] Start brainstorming ideas
- [ ] Check for early sales
- [ ] Begin researching big-ticket items

### 4-6 Weeks Before
- [ ] Finalize gift decisions
- [ ] Start purchasing non-perishable gifts
- [ ] Order personalized items (longer lead time)
- [ ] Buy gift wrapping supplies

### 2-4 Weeks Before
- [ ] Complete most gift purchases
- [ ] Buy cards and write them
- [ ] Wrap gifts as purchased
- [ ] Arrange shipping for distant relatives

### 1 Week Before
- [ ] Complete all purchases
- [ ] Finish all wrapping
- [ ] Buy any perishable gifts
- [ ] Confirm shipping delivery dates

## Shopping Strategy

### Money-Saving Tips
- **Sales & Coupons:** Track Black Friday, Cyber Monday deals
- **Cashback Apps:** Use Rakuten, credit card rewards
- **Price Tracking:** Use Honey, CamelCamelCamel for price history
- **Generic Alternatives:** Consider store brands for similar items
- **Bundle Deals:** Look for gift sets or buy-one-get-one offers

### Where to Shop
#### Online
- **Amazon:** [Specific items/categories]
- **Target:** [Specific items/categories]
- **Specialty Sites:** [Etsy, specific brand sites]

#### Local Stores
- **Department Stores:** [Macy's, Nordstrom for clothing]
- **Specialty Shops:** [Local bookstores, craft stores]
- **Small Businesses:** [Support local makers]

## Experience Gifts
### Instead of Physical Gifts
| Person | Experience Idea | Cost | How to Give |
|--------|-----------------|------|-------------|
| [Name] | [Concert tickets] | $[Amount] | [Physical tickets in card] |
| [Name] | [Cooking class] | $[Amount] | [Gift certificate] |

### Group Experiences
- **Family:** [Activity for everyone]
- **Friends:** [Group outing or event]

## DIY & Handmade Gifts

### [Person Name]
**DIY Project:** [Craft/baked goods/photo album]  
**Materials Needed:** [List supplies]  
**Time Required:** [Hours/days]  
**Cost:** $[Material cost]  
**Why Special:** [Personal meaning]

#### Project Timeline
- [ ] Gather materials
- [ ] Plan design/recipe
- [ ] Create/make gift
- [ ] Package beautifully

## Gift Wrapping & Presentation

### Wrapping Supplies Needed
- [ ] **Wrapping Paper:** [Colors/patterns for different people]
- [ ] **Gift Bags:** [Sizes needed]
- [ ] **Tissue Paper:** [Colors]
- [ ] **Ribbons/Bows:** [Coordinating colors]
- [ ] **Gift Tags:** [Style preference]
- [ ] **Cards:** [Individual or bulk]

### Wrapping Strategy
**Theme:** [Coordinated colors/style]  
**Special Touches:** [Personal elements like photos, special ribbons]  
**Presentation:** [Under tree, in stockings, special reveal]

## Tracking Purchases

### Completed Purchases
| Date | Person | Gift | Store | Amount | Wrapped |
|------|--------|------|-------|--------|---------|
| [Date] | [Name] | [Gift] | [Store] | $[Amount] | ✅/❌ |

### Still Need to Buy
| Person | Gift Idea | Priority | Budget | Target Store |
|--------|-----------|----------|--------|-------------|
| [Name] | [Gift] | High | $[Amount] | [Store] |

## Cards & Messages

### Card List
| Person | Card Type | Message Written | Signed |
|--------|-----------|-----------------|--------|
| [Name] | [Holiday/Birthday] | ✅/❌ | ✅/❌ |

### Message Ideas
**Family:** [Heartfelt, personal memories]  
**Friends:** [Fun, inside jokes, appreciation]  
**Colleagues:** [Professional but warm]

## Budget Reality Check

### Actual Spending
**Planned Budget:** $[Amount]  
**Actual Spent:** $[Running total]  
**Remaining:** $[Amount left]  
**Over/Under Budget:** $[Difference]

### If Over Budget
- [ ] Return/exchange items for less expensive alternatives
- [ ] Make some gifts DIY instead
- [ ] Combine gifts for couples/families
- [ ] Give experience coupons (homemade certificates)

## Post-Gift Reflection

### What Worked Well
- [Successful gifts and why]
- [Good shopping strategies]
- [Time management wins]

### What to Improve Next Time
- [Gifts that weren't hits]
- [Budget adjustments needed]
- [Timeline improvements]

### Thank You Notes Received
| Person | Gift Given | Thank You Received | Their Reaction |
|--------|------------|-------------------|----------------|
| [Name] | [Gift] | ✅/❌ | [How they responded] |

## Next Year Planning
**Start Earlier:** [What to do sooner]  
**Budget Adjustments:** [Changes for next year]  
**Gift Ideas to Remember:** [Ideas that came too late this year]  
**Annual Savings Goal:** $[Amount] to save monthly for next ${occasion}
`;
        console.log('Gift plan:', giftPlan);
      }
    }
  ],

  onLoad: async () => {
    console.log('Gift Planner plugin loaded');
  }
};
