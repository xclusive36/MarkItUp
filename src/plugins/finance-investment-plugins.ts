import { PluginManifest } from '../lib/types';

// Budget Planner Plugin - Personal budgeting and expense planning
export const budgetPlannerPlugin: PluginManifest = {
  id: 'budget-planner',
  name: 'Budget Planner',
  version: '1.0.0',
  description: 'Monthly budget planning, expense categories, and financial goal tracking',
  author: 'MarkItUp Team',
  main: 'budget-planner.js',
  
  commands: [
    {
      id: 'create-monthly-budget',
      name: 'Create Monthly Budget',
      description: 'Create comprehensive monthly budget plan',
      callback: async () => {
        const month = prompt('Month (MM/YYYY):') || new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' });
        const income = prompt('Monthly Income:') || '[Enter amount]';
        
        const budget = `# Monthly Budget - ${month}

**Total Monthly Income:** $${income}  
**Budget Created:** ${new Date().toLocaleDateString()}  
**Budget Status:** 📝 Planning

## Income Sources
| Source | Amount | Frequency | Notes |
|--------|--------|-----------|-------|
| Primary Job | $${income} | Monthly | Base salary |
| Side Hustle | $[Amount] | [Frequency] | [Description] |
| Investments | $[Amount] | Monthly | Dividends/Interest |
| Other | $[Amount] | [Frequency] | [Description] |

**Total Income:** $${income}

## Fixed Expenses (Needs - 50% of income)
### Housing (25-30% of income)
- **Rent/Mortgage:** $[Amount]
- **Property Tax:** $[Amount]
- **Home Insurance:** $[Amount]
- **HOA Fees:** $[Amount]
- **Maintenance:** $[Amount]

### Utilities (5-10% of income)
- **Electricity:** $[Amount]
- **Gas:** $[Amount]
- **Water/Sewer:** $[Amount]
- **Internet:** $[Amount]
- **Phone:** $[Amount]
- **Trash/Recycling:** $[Amount]

### Transportation (10-15% of income)
- **Car Payment:** $[Amount]
- **Auto Insurance:** $[Amount]
- **Gas/Fuel:** $[Amount]
- **Maintenance:** $[Amount]
- **Registration/Fees:** $[Amount]
- **Public Transit:** $[Amount]

### Insurance & Healthcare
- **Health Insurance:** $[Amount]
- **Life Insurance:** $[Amount]
- **Disability Insurance:** $[Amount]
- **Out-of-pocket Medical:** $[Amount]

### Debt Payments
- **Credit Cards (Minimum):** $[Amount]
- **Student Loans:** $[Amount]
- **Personal Loans:** $[Amount]
- **Other Debt:** $[Amount]

**Total Fixed Expenses:** $[Calculate total]

## Variable Expenses (Wants - 30% of income)
### Food & Dining
- **Groceries:** $[Amount]
- **Restaurants:** $[Amount]
- **Coffee/Takeout:** $[Amount]
- **Meal Delivery:** $[Amount]

### Entertainment & Recreation
- **Streaming Services:** $[Amount]
- **Movies/Theater:** $[Amount]
- **Hobbies:** $[Amount]
- **Gym/Fitness:** $[Amount]
- **Travel/Vacation:** $[Amount]

### Shopping & Personal
- **Clothing:** $[Amount]
- **Personal Care:** $[Amount]
- **Gifts:** $[Amount]
- **Subscriptions:** $[Amount]
- **Miscellaneous:** $[Amount]

**Total Variable Expenses:** $[Calculate total]

## Savings & Investments (20% of income)
### Emergency Fund
- **Target:** 3-6 months of expenses
- **Current Balance:** $[Amount]
- **Monthly Contribution:** $[Amount]
- **Goal Date:** [Date]

### Retirement
- **401(k) Contribution:** $[Amount]
- **IRA Contribution:** $[Amount]
- **Employer Match:** $[Amount]

### Short-term Savings
- **Vacation Fund:** $[Amount]
- **Car Replacement:** $[Amount]
- **Home Down Payment:** $[Amount]
- **Other Goals:** $[Amount]

### Investments
- **Stocks/ETFs:** $[Amount]
- **Bonds:** $[Amount]
- **Real Estate:** $[Amount]
- **Other Investments:** $[Amount]

**Total Savings & Investments:** $[Calculate total]

## Budget Summary
| Category | Budgeted | % of Income | Actual | Difference |
|----------|----------|-------------|--------|------------|
| Fixed Expenses | $[Amount] | [%] | $[Amount] | $[+/-] |
| Variable Expenses | $[Amount] | [%] | $[Amount] | $[+/-] |
| Savings & Investments | $[Amount] | [%] | $[Amount] | $[+/-] |
| **Total** | **$[Total]** | **100%** | **$[Actual]** | **$[+/-]** |

## Financial Goals for ${month}
### Short-term Goals (1-12 months)
- [ ] **Goal 1:** [Description] - Target: $[Amount] by [Date]
- [ ] **Goal 2:** [Description] - Target: $[Amount] by [Date]
- [ ] **Goal 3:** [Description] - Target: $[Amount] by [Date]

### Medium-term Goals (1-5 years)
- [ ] **Goal 1:** [Description] - Target: $[Amount] by [Date]
- [ ] **Goal 2:** [Description] - Target: $[Amount] by [Date]

### Long-term Goals (5+ years)
- [ ] **Goal 1:** [Description] - Target: $[Amount] by [Date]
- [ ] **Goal 2:** [Description] - Target: $[Amount] by [Date]

## Spending Rules & Guidelines
### 50/30/20 Rule
- **50% Needs:** Essential expenses (housing, utilities, transportation)
- **30% Wants:** Discretionary spending (entertainment, dining out)
- **20% Savings:** Emergency fund, retirement, investments

### Monthly Spending Limits
- **Dining Out:** Max $[Amount]
- **Entertainment:** Max $[Amount]
- **Shopping:** Max $[Amount]
- **Miscellaneous:** Max $[Amount]

## Weekly Check-ins
### Week 1 (${month}/1-7)
- **Spent:** $[Amount]
- **Remaining:** $[Amount]
- **On Track:** ✅/❌

### Week 2 (${month}/8-14)
- **Spent:** $[Amount]
- **Remaining:** $[Amount]
- **On Track:** ✅/❌

### Week 3 (${month}/15-21)
- **Spent:** $[Amount]
- **Remaining:** $[Amount]
- **On Track:** ✅/❌

### Week 4 (${month}/22-31)
- **Spent:** $[Amount]
- **Remaining:** $[Amount]
- **On Track:** ✅/❌

## Money-Saving Tips
- **Meal Planning:** Plan meals to reduce food waste and dining out
- **Bulk Buying:** Purchase non-perishables in bulk for discounts
- **Subscription Audit:** Cancel unused subscriptions and services
- **Energy Efficiency:** Reduce utility costs with efficient practices
- **Generic Brands:** Choose store brands for significant savings

## Budget Review & Adjustments
**What's Working:** [Successful strategies]  
**What's Not Working:** [Areas needing improvement]  
**Next Month's Focus:** [Priority areas for improvement]  
**Adjustments Needed:** [Changes to make for next month]

## Emergency Fund Status
**Current Balance:** $[Amount]  
**Target Amount:** $[Amount] (3-6 months of expenses)  
**Progress:** [X]% complete  
**Monthly Contribution:** $[Amount]  
**Estimated Completion:** [Date]

## Notes & Reminders
- [Important financial deadlines]
- [Upcoming large expenses]
- [Budget review date]
- [Financial advisor appointments]
`;
        console.log('Monthly budget:', budget);
      }
    },
    {
      id: 'expense-category-tracker',
      name: 'Expense Category Tracker',
      description: 'Track expenses by category',
      callback: async () => {
        const tracker = `# Expense Category Tracker

**Month:** ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}  
**Last Updated:** ${new Date().toLocaleDateString()}

## Category Spending Overview

### 🏠 Housing & Utilities
**Budget:** $[Budget Amount] | **Spent:** $[Spent Amount] | **Remaining:** $[Remaining]

| Date | Description | Amount | Payment Method | Notes |
|------|-------------|--------|----------------|-------|
| [Date] | [Expense] | $[Amount] | [Card/Cash] | [Notes] |

### 🚗 Transportation
**Budget:** $[Budget Amount] | **Spent:** $[Spent Amount] | **Remaining:** $[Remaining]

| Date | Description | Amount | Payment Method | Notes |
|------|-------------|--------|----------------|-------|
| [Date] | [Expense] | $[Amount] | [Card/Cash] | [Notes] |

### 🍕 Food & Dining
**Budget:** $[Budget Amount] | **Spent:** $[Spent Amount] | **Remaining:** $[Remaining]

#### Subcategories:
- **Groceries:** $[Amount] / $[Budget]
- **Restaurants:** $[Amount] / $[Budget]
- **Coffee/Takeout:** $[Amount] / $[Budget]

| Date | Description | Amount | Category | Payment Method |
|------|-------------|--------|----------|----------------|
| [Date] | [Expense] | $[Amount] | [Subcategory] | [Method] |

### 🎬 Entertainment & Recreation
**Budget:** $[Budget Amount] | **Spent:** $[Spent Amount] | **Remaining:** $[Remaining]

| Date | Description | Amount | Payment Method | Notes |
|------|-------------|--------|----------------|-------|
| [Date] | [Expense] | $[Amount] | [Card/Cash] | [Notes] |

### 👕 Shopping & Personal Care
**Budget:** $[Budget Amount] | **Spent:** $[Spent Amount] | **Remaining:** $[Remaining]

| Date | Description | Amount | Category | Store/Vendor |
|------|-------------|--------|----------|-------------|
| [Date] | [Item] | $[Amount] | [Clothing/Personal] | [Store] |

### 🏥 Healthcare & Insurance
**Budget:** $[Budget Amount] | **Spent:** $[Spent Amount] | **Remaining:** $[Remaining]

| Date | Description | Amount | Provider | Insurance Coverage |
|------|-------------|--------|----------|-------------------|
| [Date] | [Service] | $[Amount] | [Provider] | $[Covered Amount] |

### 💳 Debt Payments
**Budget:** $[Budget Amount] | **Spent:** $[Spent Amount] | **Remaining:** $[Remaining]

| Date | Creditor | Amount | Payment Type | Balance After |
|------|----------|--------|--------------|---------------|
| [Date] | [Creditor] | $[Amount] | [Minimum/Extra] | $[Balance] |

## Quick Add Expense
**Date:** [Today's Date]  
**Amount:** $[Amount]  
**Category:** [Category]  
**Description:** [What was purchased]  
**Payment Method:** [Card/Cash/Check]  
**Vendor:** [Where purchased]  
**Notes:** [Additional details]

## Weekly Spending Summary
### Week 1: $[Amount]
- Housing: $[Amount]
- Food: $[Amount]  
- Transportation: $[Amount]
- Other: $[Amount]

### Week 2: $[Amount]
- Housing: $[Amount]
- Food: $[Amount]
- Transportation: $[Amount]  
- Other: $[Amount]

### Week 3: $[Amount]
- Housing: $[Amount]
- Food: $[Amount]
- Transportation: $[Amount]
- Other: $[Amount]

### Week 4: $[Amount]
- Housing: $[Amount]
- Food: $[Amount]
- Transportation: $[Amount]
- Other: $[Amount]

## Category Analysis
### Overspent Categories
- **[Category]:** Over by $[Amount] ([X]% over budget)
- **[Category]:** Over by $[Amount] ([X]% over budget)

### Under-Budget Categories
- **[Category]:** Under by $[Amount] ([X]% under budget)
- **[Category]:** Under by $[Amount] ([X]% under budget)

### Recommendations
- **Reduce:** [Suggestions for overspent categories]
- **Reallocate:** [Move budget from under-spent to overspent]
- **Next Month:** [Adjustments for next month's budget]
`;
        console.log('Expense tracker:', tracker);
      }
    }
  ],

  onLoad: async () => {
    console.log('Budget Planner plugin loaded');
  }
};

// Investment Tracker Plugin - Portfolio tracking and investment analysis
export const investmentTrackerPlugin: PluginManifest = {
  id: 'investment-tracker',
  name: 'Investment Tracker',
  version: '1.0.0',
  description: 'Portfolio tracking, investment performance analysis, and asset allocation',
  author: 'MarkItUp Team',
  main: 'investment-tracker.js',
  
  commands: [
    {
      id: 'create-portfolio',
      name: 'Create Portfolio',
      description: 'Create investment portfolio tracker',
      callback: async () => {
        const portfolioName = prompt('Portfolio name:') || 'My Portfolio';
        
        const portfolio = `# Investment Portfolio: ${portfolioName}

**Created:** ${new Date().toLocaleDateString()}  
**Last Updated:** ${new Date().toLocaleDateString()}  
**Total Portfolio Value:** $[Calculate total]

## Portfolio Overview
**Investment Goal:** [Long-term growth/Income/Balanced]  
**Risk Tolerance:** [Conservative/Moderate/Aggressive]  
**Time Horizon:** [Years until needed]  
**Target Asset Allocation:** [% Stocks / % Bonds / % Other]

## Holdings Summary

### 📈 Stocks & ETFs
| Symbol | Name | Shares | Cost Basis | Current Price | Market Value | Gain/Loss | % Portfolio |
|--------|------|--------|------------|---------------|--------------|-----------|-------------|
| [TICKER] | [Company Name] | [Shares] | $[Cost] | $[Price] | $[Value] | $[+/-] ([%]) | [%] |
| [TICKER] | [Fund Name] | [Shares] | $[Cost] | $[Price] | $[Value] | $[+/-] ([%]) | [%] |

**Total Stocks/ETFs:** $[Total Value] ([X]% of portfolio)

### 🏦 Bonds & Fixed Income
| Name | Type | Par Value | Purchase Price | Current Value | Yield | Maturity |
|------|------|-----------|----------------|---------------|-------|----------|
| [Bond Name] | [Type] | $[Par] | $[Purchase] | $[Current] | [%] | [Date] |

**Total Bonds:** $[Total Value] ([X]% of portfolio)

### 🏠 Real Estate (REITs)
| Symbol | Name | Shares | Cost Basis | Current Value | Dividend Yield | % Portfolio |
|--------|------|--------|------------|---------------|----------------|-------------|
| [TICKER] | [REIT Name] | [Shares] | $[Cost] | $[Value] | [%] | [%] |

**Total REITs:** $[Total Value] ([X]% of portfolio)

### 💰 Cash & Cash Equivalents
| Account | Type | Balance | APY | Notes |
|---------|------|---------|-----|-------|
| [Account] | [Savings/CD/MM] | $[Balance] | [%] | [Notes] |

**Total Cash:** $[Total Value] ([X]% of portfolio)

### 🪙 Alternative Investments
| Asset | Type | Quantity | Cost Basis | Current Value | % Portfolio |
|-------|------|----------|------------|---------------|-------------|
| [Asset] | [Crypto/Commodity] | [Amount] | $[Cost] | $[Value] | [%] |

**Total Alternatives:** $[Total Value] ([X]% of portfolio)

## Asset Allocation Analysis
### Current Allocation
- **Stocks/ETFs:** [X]% (Target: [Y]%)
- **Bonds:** [X]% (Target: [Y]%)
- **REITs:** [X]% (Target: [Y]%)
- **Cash:** [X]% (Target: [Y]%)
- **Alternatives:** [X]% (Target: [Y]%)

### Rebalancing Needed
- **Overweight:** [Asset class] by [X]%
- **Underweight:** [Asset class] by [X]%
- **Action:** [Buy/Sell recommendations]

## Performance Tracking

### Portfolio Performance
**Total Return:** $[Amount] ([X]% since inception)  
**Today's Change:** $[Amount] ([X]%)  
**1 Month:** [X]%  
**3 Months:** [X]%  
**1 Year:** [X]%  
**Since Inception:** [X]%

### Benchmark Comparison
| Period | Portfolio | S&P 500 | Difference |
|--------|-----------|---------|------------|
| 1 Month | [X]% | [Y]% | [+/-]% |
| 3 Months | [X]% | [Y]% | [+/-]% |
| 1 Year | [X]% | [Y]% | [+/-]% |

### Dividend & Income Tracking
| Symbol | Quarterly Dividend | Annual Yield | Last Ex-Date | Next Ex-Date |
|--------|-------------------|--------------|--------------|--------------|
| [TICKER] | $[Amount] | [%] | [Date] | [Date] |

**Total Annual Dividend Income:** $[Amount]  
**Average Portfolio Yield:** [X]%

## Investment Goals & Progress
### Goal 1: [Retirement Fund]
**Target Amount:** $[Amount]  
**Target Date:** [Date]  
**Current Value:** $[Amount]  
**Progress:** [X]% complete  
**Monthly Contribution:** $[Amount]  
**On Track:** ✅/❌

### Goal 2: [House Down Payment]
**Target Amount:** $[Amount]  
**Target Date:** [Date]  
**Current Value:** $[Amount]  
**Progress:** [X]% complete  
**Monthly Contribution:** $[Amount]  
**On Track:** ✅/❌

## Recent Transactions
| Date | Action | Symbol | Quantity | Price | Total | Notes |
|------|--------|--------|----------|-------|-------|-------|
| [Date] | [Buy/Sell] | [TICKER] | [Shares] | $[Price] | $[Total] | [Notes] |

## Watch List
| Symbol | Name | Current Price | Target Buy Price | Notes |
|--------|------|---------------|------------------|-------|
| [TICKER] | [Company] | $[Price] | $[Target] | [Research notes] |

## Investment Rules & Strategy
### Buy Rules
- Only invest money not needed for 5+ years
- Maximum 5% of portfolio in any single stock
- Rebalance quarterly or when allocation is off by 5%+
- Dollar-cost average into positions over time

### Sell Rules
- Rebalance when overweight by 5%+
- Take profits when individual stock exceeds 10% of portfolio
- Cut losses if investment thesis changes
- Harvest tax losses in December

## Tax Considerations
### Tax-Advantaged Accounts
- **401(k) Balance:** $[Amount]
- **IRA Balance:** $[Amount]
- **Roth IRA Balance:** $[Amount]
- **HSA Balance:** $[Amount]

### Taxable Account Tax Loss Harvesting
**Realized Gains:** $[Amount]  
**Realized Losses:** $[Amount]  
**Net Capital Gains:** $[Amount]  
**Tax Loss Carryforward:** $[Amount]

## Market Research & Notes
### Investment Thesis
**Current Market Outlook:** [Bull/Bear/Neutral]  
**Key Themes:** [Technology growth, inflation hedge, etc.]  
**Opportunities:** [Sectors or stocks to research]  
**Risks:** [Market concerns and mitigation strategies]

### Next Actions
- [ ] Research [Company/Fund]
- [ ] Rebalance portfolio
- [ ] Review asset allocation
- [ ] Update investment goals
- [ ] Tax loss harvesting

## Emergency Fund Status
**Emergency Fund Balance:** $[Amount]  
**Target:** 3-6 months expenses ($[Amount])  
**Status:** [X]% funded  
**Separate from Investment Portfolio:** ✅/❌

---

**Disclaimer:** This is for tracking purposes only. Consult with a financial advisor for investment advice.
`;
        console.log('Investment portfolio:', portfolio);
      }
    }
  ],

  onLoad: async () => {
    console.log('Investment Tracker plugin loaded');
  }
};

// Debt Payoff Planner Plugin - Debt reduction strategies and tracking
export const debtPayoffPlannerPlugin: PluginManifest = {
  id: 'debt-payoff-planner',
  name: 'Debt Payoff Planner',
  version: '1.0.0',
  description: 'Debt reduction strategies, payoff calculators, and progress tracking',
  author: 'MarkItUp Team',
  main: 'debt-payoff-planner.js',
  
  commands: [
    {
      id: 'create-debt-plan',
      name: 'Create Debt Plan',
      description: 'Create comprehensive debt payoff plan',
      callback: async () => {
        const strategy = prompt('Payoff strategy (snowball/avalanche/custom):') || 'snowball';
        
        const debtPlan = `# Debt Payoff Plan - ${strategy.toUpperCase()} Method

**Created:** ${new Date().toLocaleDateString()}  
**Strategy:** ${strategy.toUpperCase()}  
**Total Debt:** $[Calculate total]  
**Target Payoff Date:** [Calculate based on strategy]

## Current Debt Inventory

| Creditor | Type | Balance | Min Payment | Interest Rate | Payoff Order |
|----------|------|---------|-------------|---------------|--------------|
| [Creditor 1] | [Credit Card] | $[Balance] | $[Min] | [%] | ${strategy === 'snowball' ? '[Smallest first]' : '[Highest rate first]'} |
| [Creditor 2] | [Student Loan] | $[Balance] | $[Min] | [%] | [Order] |
| [Creditor 3] | [Car Loan] | $[Balance] | $[Min] | [%] | [Order] |

**Total Monthly Minimum Payments:** $[Sum of minimums]  
**Extra Payment Available:** $[Amount above minimums]  
**Total Monthly Debt Payment:** $[Total available]

## ${strategy.toUpperCase()} Strategy Details

${strategy === 'snowball' ? `### Debt Snowball Method
**Focus:** Pay minimums on all debts, put extra money toward smallest balance
**Psychology:** Quick wins build momentum and motivation
**Order:** Smallest balance to largest balance (regardless of interest rate)

**Advantages:**
- Psychological motivation from quick wins
- Simplifies debt management
- Builds good payment habits

**Next Target:** [Smallest debt] - $[Balance]` : ''}

${strategy === 'avalanche' ? `### Debt Avalanche Method
**Focus:** Pay minimums on all debts, put extra money toward highest interest rate
**Math:** Saves the most money in interest over time
**Order:** Highest interest rate to lowest interest rate (regardless of balance)

**Advantages:**
- Saves maximum money on interest
- Faster total payoff time
- Most mathematically efficient

**Next Target:** [Highest rate debt] - [%] APR` : ''}

## Payoff Timeline

### Phase 1: [First Debt Name]
**Target Debt:** [Creditor] - $[Balance] at [%] APR  
**Monthly Payment:** $[Min payment + extra]  
**Estimated Payoff:** [Month/Year]  
**Interest Saved:** $[Amount]

**Monthly Breakdown:**
- Minimum Payment: $[Amount]
- Extra Payment: $[Amount]
- **Total Monthly:** $[Total]

### Phase 2: [Second Debt Name]
**Target Debt:** [Creditor] - $[Balance] at [%] APR  
**Monthly Payment:** $[Previous total + freed payment]  
**Estimated Payoff:** [Month/Year]  
**Interest Saved:** $[Amount]

### Phase 3: [Third Debt Name]
**Target Debt:** [Creditor] - $[Balance] at [%] APR  
**Monthly Payment:** $[Snowballed amount]  
**Estimated Payoff:** [Month/Year]  
**Interest Saved:** $[Amount]

## Progress Tracking

### Monthly Check-in: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

#### Current Focus Debt: [Debt Name]
**Starting Balance:** $[Amount]  
**Current Balance:** $[Amount]  
**Paid This Month:** $[Amount]  
**Progress:** [X]% complete  
**Months Remaining:** [Number]

#### All Debts Update
| Creditor | Previous Balance | Payments Made | New Balance | Progress |
|----------|------------------|---------------|-------------|----------|
| [Creditor 1] | $[Amount] | $[Payment] | $[New] | [%] |
| [Creditor 2] | $[Amount] | $[Payment] | $[New] | [%] |

**Total Debt Reduction This Month:** $[Amount]  
**Total Interest Paid This Month:** $[Amount]

### Debt-Free Milestone Tracker
- [ ] **First Debt Paid Off** - Target: [Date]
- [ ] **50% of Debt Eliminated** - Target: [Date]
- [ ] **Credit Cards Paid Off** - Target: [Date]
- [ ] **75% of Debt Eliminated** - Target: [Date]
- [ ] **All Debt Paid Off** - Target: [Date]

## Financial Impact Analysis

### Interest Savings
**Total Interest with Current Plan:** $[Amount]  
**Total Interest with Minimum Payments Only:** $[Amount]  
**Interest Savings:** $[Difference]  
**Time Savings:** [Months/Years earlier]

### Cash Flow After Payoff
**Monthly Payment Amount Freed:** $[Total monthly payments]  
**Annual Cash Flow Increase:** $[Monthly × 12]  
**Investment Potential:** $[Amount] invested at [%] return = $[Future value]

## Motivation & Accountability

### Why I'm Paying Off Debt
1. [Personal reason 1]
2. [Personal reason 2]
3. [Personal reason 3]

### Debt-Free Goals
**When I'm debt-free, I will:**
- [ ] [Goal 1 - vacation, investment, etc.]
- [ ] [Goal 2]
- [ ] [Goal 3]

### Monthly Rewards System
- **Pay extra $[Amount]:** [Small reward]
- **Pay off a debt:** [Medium reward]
- **Reach milestone:** [Larger reward]

## Strategies to Accelerate Payoff

### Increase Income
- [ ] Side hustle: [Type] - Potential: $[Amount/month]
- [ ] Freelancing: [Skill] - Potential: $[Amount/month]
- [ ] Sell items: [What] - Potential: $[Amount]
- [ ] Ask for raise: Target: $[Amount/year]

### Reduce Expenses
- [ ] Cancel subscriptions: Savings: $[Amount/month]
- [ ] Meal planning: Savings: $[Amount/month]
- [ ] Lower bills: [Which bills] - Savings: $[Amount/month]
- [ ] Transportation: [Changes] - Savings: $[Amount/month]

### Windfalls Strategy
**Tax Refund:** Apply [%] to debt = $[Amount]  
**Bonus:** Apply [%] to debt = $[Amount]  
**Gifts:** Apply [%] to debt = $[Amount]

## Emergency Fund Considerations
**Current Emergency Fund:** $[Amount]  
**Target Emergency Fund:** $[Amount] (1 month while paying off debt)  
**Status:** [Adequate/Need to build]

**Strategy:** Maintain small emergency fund ($500-$1,000) while paying off debt, then build full 3-6 month fund after debt-free.

## Credit Score Monitoring
**Current Credit Score:** [Score]  
**Goal Credit Score:** [Target]  
**Factors Improving Score:**
- Paying down balances (utilization ratio)
- On-time payments
- Not closing old accounts

## Debt Payoff Checklist
### Monthly Tasks
- [ ] Make all minimum payments on time
- [ ] Apply extra payment to target debt
- [ ] Update debt balances
- [ ] Review progress and motivation

### Quarterly Tasks
- [ ] Review and adjust strategy if needed
- [ ] Check credit report
- [ ] Evaluate additional income opportunities
- [ ] Celebrate progress milestones

## Notes & Reminders
**Important Dates:**
- [Payment due dates]
- [When to call for better rates]
- [Review dates]

**Contact Information:**
- [Creditor 1]: [Phone] - Account: [Number]
- [Creditor 2]: [Phone] - Account: [Number]
`;
        console.log('Debt payoff plan:', debtPlan);
      }
    }
  ],

  onLoad: async () => {
    console.log('Debt Payoff Planner plugin loaded');
  }
};
