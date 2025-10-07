import { PluginManifest, PluginAPI } from '../lib/types';

// Global instances
let crmLiteInstance: CRMLitePlugin | null = null;
let invoiceGeneratorInstance: InvoiceGeneratorPlugin | null = null;
let expenseTrackerInstance: ExpenseTrackerPlugin | null = null;
let contractTemplatesInstance: ContractTemplatesPlugin | null = null;
let businessPlanInstance: BusinessPlanPlugin | null = null;
let timeTrackerInstance: TimeTrackerPlugin | null = null;

// CRM Lite Plugin - Contact management and interaction tracking
export const crmLitePlugin: PluginManifest = {
  id: 'crm-lite',
  name: 'CRM Lite',
  version: '1.0.0',
  description: 'Contact management, interaction tracking, and follow-up reminders',
  author: 'MarkItUp Team',
  main: 'crm-lite.js',

  commands: [
    {
      id: 'add-contact',
      name: 'Add Contact',
      description: 'Add a new contact to CRM',
      keybinding: 'Ctrl+Shift+K',
      callback: async () => {
        try {
          if (crmLiteInstance) {
            await crmLiteInstance.addContact();
          }
        } catch (error) {
          console.error('Error adding contact:', error);
        }
      },
    },
    {
      id: 'log-interaction',
      name: 'Log Interaction',
      description: 'Log interaction with contact',
      callback: async () => {
        try {
          if (crmLiteInstance) {
            await crmLiteInstance.logInteraction();
          }
        } catch (error) {
          console.error('Error logging interaction:', error);
        }
      },
    },
  ],

  views: [
    {
      id: 'crm-dashboard',
      name: 'CRM',
      type: 'sidebar',
      icon: '👥',
      component: () => {
        return `
          <div class="crm-lite">
            <h3>👥 CRM Dashboard</h3>
            <div class="crm-stats">
              <div class="stat">
                <span>Total Contacts:</span>
                <span class="value">47</span>
              </div>
              <div class="stat">
                <span>Active Deals:</span>
                <span class="value">12</span>
              </div>
            </div>
            <div class="recent-contacts">
              <div class="contact-item">
                <div class="contact-name">John Smith</div>
                <div class="contact-company">TechCorp</div>
              </div>
            </div>
            <button onclick="alert('Add new contact')" class="add-contact-btn">+ Add Contact</button>
          </div>
        `;
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      crmLiteInstance = new CRMLitePlugin(api);
    }
    const style = document.createElement('style');
    style.textContent = `
      .crm-lite { padding: 1rem; }
      .crm-stats { margin: 1rem 0; }
      .stat { display: flex; justify-content: space-between; margin: 0.5rem 0; }
      .value { font-weight: bold; color: #3b82f6; }
      .contact-item { padding: 0.5rem; margin: 0.5rem 0; border: 1px solid #e5e7eb; border-radius: 4px; }
      .contact-name { font-weight: bold; }
      .contact-company { font-size: 0.8em; color: #6b7280; }
      .add-contact-btn { width: 100%; padding: 0.5rem; margin-top: 1rem; }
    `;
    document.head.appendChild(style);
  },

  onUnload: () => {
    crmLiteInstance = null;
  },
};

// Invoice Generator Plugin - Create professional invoices
export const invoiceGeneratorPlugin: PluginManifest = {
  id: 'invoice-generator',
  name: 'Invoice Generator',
  version: '1.0.0',
  description: 'Create professional invoices with time tracking integration',
  author: 'MarkItUp Team',
  main: 'invoice-generator.js',

  commands: [
    {
      id: 'create-invoice',
      name: 'Create Invoice',
      description: 'Generate a new invoice',
      callback: async () => {
        try {
          if (invoiceGeneratorInstance) {
            await invoiceGeneratorInstance.createInvoice();
          }
        } catch (error) {
          console.error('Error creating invoice:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      invoiceGeneratorInstance = new InvoiceGeneratorPlugin(api);
    }
    console.log('Invoice Generator plugin loaded');
  },

  onUnload: () => {
    invoiceGeneratorInstance = null;
  },
};

// Expense Tracker Plugin - Log business expenses
export const expenseTrackerPlugin: PluginManifest = {
  id: 'expense-tracker',
  name: 'Expense Tracker',
  version: '1.0.0',
  description: 'Log business expenses, categorize, and track receipts',
  author: 'MarkItUp Team',
  main: 'expense-tracker.js',

  commands: [
    {
      id: 'log-expense',
      name: 'Log Expense',
      description: 'Log a new business expense',
      keybinding: 'Ctrl+Shift+E',
      callback: async () => {
        try {
          if (expenseTrackerInstance) {
            await expenseTrackerInstance.logExpense();
          }
        } catch (error) {
          console.error('Error logging expense:', error);
        }
      },
    },
    {
      id: 'expense-report',
      name: 'Generate Expense Report',
      description: 'Generate monthly expense report',
      callback: async () => {
        try {
          if (expenseTrackerInstance) {
            await expenseTrackerInstance.generateReport();
          }
        } catch (error) {
          console.error('Error generating report:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      expenseTrackerInstance = new ExpenseTrackerPlugin(api);
    }
    console.log('Expense Tracker plugin loaded');
  },

  onUnload: () => {
    expenseTrackerInstance = null;
  },
};

// Contract Templates Plugin - Legal document templates
export const contractTemplatesPlugin: PluginManifest = {
  id: 'contract-templates',
  name: 'Contract Templates',
  version: '1.0.0',
  description: 'Legal document templates, clause library, and version tracking',
  author: 'MarkItUp Team',
  main: 'contract-templates.js',

  commands: [
    {
      id: 'freelance-contract',
      name: 'Freelance Contract',
      description: 'Generate freelance contract template',
      callback: async () => {
        try {
          if (contractTemplatesInstance) {
            await contractTemplatesInstance.generateFreelanceContract();
          }
        } catch (error) {
          console.error('Error generating contract:', error);
        }
      },
    },
    {
      id: 'nda-template',
      name: 'NDA Template',
      description: 'Generate non-disclosure agreement',
      callback: async () => {
        try {
          if (contractTemplatesInstance) {
            await contractTemplatesInstance.generateNDA();
          }
        } catch (error) {
          console.error('Error generating NDA:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      contractTemplatesInstance = new ContractTemplatesPlugin(api);
    }
    console.log('Contract Templates plugin loaded');
  },

  onUnload: () => {
    contractTemplatesInstance = null;
  },
};

// Business Plan Generator Plugin - Structured business plans
export const businessPlanPlugin: PluginManifest = {
  id: 'business-plan-generator',
  name: 'Business Plan Generator',
  version: '1.0.0',
  description: 'Structured business plan templates with financial projections',
  author: 'MarkItUp Team',
  main: 'business-plan.js',

  commands: [
    {
      id: 'create-business-plan',
      name: 'Create Business Plan',
      description: 'Generate comprehensive business plan',
      callback: async () => {
        try {
          if (businessPlanInstance) {
            await businessPlanInstance.createBusinessPlan();
          }
        } catch (error) {
          console.error('Error creating business plan:', error);
        }
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      businessPlanInstance = new BusinessPlanPlugin(api);
    }
    console.log('Business Plan Generator plugin loaded');
  },

  onUnload: () => {
    businessPlanInstance = null;
  },
};

// Time Tracker Plugin - Pomodoro timer and project time logging
export const timeTrackerPlugin: PluginManifest = {
  id: 'time-tracker',
  name: 'Time Tracker',
  version: '1.0.0',
  description: 'Pomodoro timer, project time logging, and productivity analytics',
  author: 'MarkItUp Team',
  main: 'time-tracker.js',

  settings: [
    {
      id: 'pomodoroLength',
      name: 'Pomodoro Length (minutes)',
      type: 'number',
      default: 25,
      description: 'Length of each pomodoro session',
    },
    {
      id: 'shortBreak',
      name: 'Short Break (minutes)',
      type: 'number',
      default: 5,
      description: 'Length of short breaks',
    },
    {
      id: 'longBreak',
      name: 'Long Break (minutes)',
      type: 'number',
      default: 15,
      description: 'Length of long breaks',
    },
  ],

  commands: [
    {
      id: 'start-pomodoro',
      name: 'Start Pomodoro',
      description: 'Start a pomodoro timer',
      keybinding: 'Ctrl+Shift+T',
      callback: async () => {
        try {
          if (timeTrackerInstance) {
            await timeTrackerInstance.startPomodoro();
          }
        } catch (error) {
          console.error('Error starting pomodoro:', error);
        }
      },
    },
    {
      id: 'log-time-entry',
      name: 'Log Time Entry',
      description: 'Log time spent on a project',
      callback: async () => {
        try {
          if (timeTrackerInstance) {
            await timeTrackerInstance.logTimeEntry();
          }
        } catch (error) {
          console.error('Error logging time:', error);
        }
      },
    },
  ],

  views: [
    {
      id: 'pomodoro-timer',
      name: 'Timer',
      type: 'statusbar',
      icon: '⏰',
      component: () => {
        return `
          <div class="pomodoro-timer">
            <span class="timer-display">25:00</span>
            <button onclick="alert('Start timer')" class="timer-btn">▶️</button>
          </div>
        `;
      },
    },
  ],

  onLoad: (api?: PluginAPI) => {
    if (api) {
      timeTrackerInstance = new TimeTrackerPlugin(api);
    }
    const style = document.createElement('style');
    style.textContent = `
      .pomodoro-timer { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8em; }
      .timer-display { font-family: monospace; color: #dc2626; }
      .timer-btn { border: none; background: transparent; cursor: pointer; }
    `;
    document.head.appendChild(style);
    console.log('Time Tracker plugin loaded');
  },

  onUnload: () => {
    timeTrackerInstance = null;
  },
};

// Implementation Classes

class CRMLitePlugin {
  constructor(private api: PluginAPI) {}

  async addContact(): Promise<void> {
    this.api.ui.showNotification(
      'Adding new contact to CRM... Enter contact details: name, company, email, phone',
      'info'
    );
  }

  async logInteraction(): Promise<void> {
    this.api.ui.showNotification(
      'Logging interaction... Select contact and enter interaction type (call/email/meeting) and notes',
      'info'
    );
  }
}

class InvoiceGeneratorPlugin {
  constructor(private api: PluginAPI) {}

  async createInvoice(): Promise<void> {
    // Get invoice details from user
    const clientName = prompt('Client name:');
    const invoiceNumber = prompt('Invoice number:') || `INV-${Date.now()}`;
    const amount = prompt('Total amount:');

    if (clientName && amount) {
      const invoice = `# Invoice ${invoiceNumber}

## Bill To
**${clientName}**  
[Client Address]  
[City, State ZIP]  
[Email]

## Invoice Details
**Invoice Number:** ${invoiceNumber}  
**Date:** ${new Date().toLocaleDateString()}  
**Due Date:** ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}  
**Terms:** Net 30

## Services Provided

| Description | Quantity | Rate | Amount |
|-------------|----------|------|--------|
| Consulting Services | 10 hrs | $100/hr | $1,000.00 |
| Project Management | 5 hrs | $120/hr | $600.00 |

## Summary
**Subtotal:** $1,600.00  
**Tax (8.5%):** $136.00  
**Total:** $${amount}**

## Payment Information
**Payment Method:** [Bank Transfer/Check/PayPal]  
**Account Details:** [Payment details]

## Notes
Thank you for your business! Payment is due within 30 days.

---
*Invoice generated on ${new Date().toLocaleDateString()}*
`;
      this.api.ui.showNotification(`Invoice ${invoiceNumber} created for ${clientName}`, 'info');
      console.log('Invoice created:', invoice);
    }
  }
}

class ExpenseTrackerPlugin {
  constructor(private api: PluginAPI) {}

  async logExpense(): Promise<void> {
    const amount = prompt('Expense amount:');
    const category = prompt('Category (travel/meals/office/software):');
    const description = prompt('Description:');

    if (amount && description) {
      const expense = `
## Expense Entry - ${new Date().toLocaleDateString()}

**Amount:** $${amount}  
**Category:** ${category || 'Uncategorized'}  
**Date:** ${new Date().toLocaleDateString()}  
**Description:** ${description}

**Payment Method:** [Cash/Credit Card/Check]  
**Vendor:** [Vendor Name]  
**Receipt:** [Attach receipt image]

**Tax Deductible:** [ ] Yes [ ] No  
**Billable to Client:** [ ] Yes [ ] No

**Notes:** [Additional notes]

---
`;
      this.api.ui.showNotification(`Expense of $${amount} logged`, 'info');
      console.log('Expense logged:', expense);
    }
  }

  async generateReport(): Promise<void> {
    const report = `# Monthly Expense Report - ${new Date().toLocaleDateString().split('/')[0]}/${new Date().getFullYear()}

## Summary by Category

| Category | Amount | Count | Avg |
|----------|--------|-------|-----|
| Travel | $1,200.00 | 8 | $150.00 |
| Meals | $450.00 | 12 | $37.50 |
| Office Supplies | $230.00 | 5 | $46.00 |
| Software | $180.00 | 3 | $60.00 |

**Total Expenses:** $2,060.00

## Detailed Expenses

### Travel
- Flight to Conference: $800.00
- Hotel (3 nights): $400.00

### Meals
- Client dinner: $85.00
- Business lunch: $45.00

## Tax Deductible Total: $1,850.00
## Client Billable Total: $650.00
`;
    this.api.ui.showNotification('Expense report generated', 'info');
    console.log('Expense report:', report);
  }
}

class ContractTemplatesPlugin {
  constructor(private api: PluginAPI) {}

  async generateFreelanceContract(): Promise<void> {
    const clientName = prompt('Client name:');
    const projectName = prompt('Project name:');
    const rate = prompt('Hourly rate or project fee:');

    if (clientName && projectName) {
      const contract = `# Freelance Services Agreement

**Effective Date:** ${new Date().toLocaleDateString()}

## Parties
**Service Provider:** [Your Name]  
**Client:** ${clientName}

## Project Description
**Project:** ${projectName}  
**Scope:** [Detailed description of work to be performed]

## Terms and Conditions

### 1. Scope of Work
The Service Provider agrees to provide the following services:
- [Service 1]
- [Service 2]
- [Service 3]

### 2. Compensation
**Rate:** ${rate || '[Rate]'}  
**Payment Terms:** [Payment schedule]  
**Total Project Value:** [Total amount]

### 3. Timeline
**Start Date:** [Start date]  
**Completion Date:** [End date]  
**Milestones:**
- [Milestone 1] - [Date]
- [Milestone 2] - [Date]

### 4. Intellectual Property
[IP ownership terms]

### 5. Confidentiality
Both parties agree to maintain confidentiality of proprietary information.

### 6. Termination
Either party may terminate this agreement with [X] days written notice.

### 7. Governing Law
This agreement shall be governed by the laws of [State/Country].

---

**Service Provider Signature:** ________________ Date: _______

**Client Signature:** ________________ Date: _______

*This is a template and should be reviewed by legal counsel before use.*
`;
      this.api.ui.showNotification(`Freelance contract created for ${clientName}`, 'info');
      console.log('Contract template:', contract);
    }
  }

  async generateNDA(): Promise<void> {
    const template = `# Non-Disclosure Agreement (NDA)

**Effective Date:** ${new Date().toLocaleDateString()}

## Parties
**Disclosing Party:** [Company Name]  
**Receiving Party:** [Recipient Name]

## Definition of Confidential Information
For purposes of this Agreement, "Confidential Information" includes all information disclosed by the Disclosing Party, whether orally, in writing, or in any other form.

## Obligations of Receiving Party
The Receiving Party agrees to:
1. Hold all Confidential Information in strict confidence
2. Not disclose Confidential Information to third parties
3. Use Confidential Information solely for evaluation purposes

## Term
This Agreement shall remain in effect for [X] years from the Effective Date.

## Return of Information
Upon request, the Receiving Party shall return or destroy all Confidential Information.

## Governing Law
This Agreement shall be governed by [State/Country] law.

---

**Disclosing Party:** ________________ Date: _______

**Receiving Party:** ________________ Date: _______
`;
    this.api.ui.showNotification('NDA template created', 'info');
    console.log('NDA template:', template);
  }
}

class BusinessPlanPlugin {
  constructor(private api: PluginAPI) {}

  async createBusinessPlan(): Promise<void> {
    const businessName = prompt('Business name:');
    const industry = prompt('Industry:');

    if (businessName) {
      const plan = `# Business Plan: ${businessName}

**Date:** ${new Date().toLocaleDateString()}  
**Industry:** ${industry || '[Industry]'}

## Executive Summary
[Brief overview of the business, mission, and key success factors]

## Company Description
### Mission Statement
[Your company's mission]

### Vision Statement
[Your company's vision for the future]

### Company History and Ownership
[Background and ownership structure]

## Market Analysis
### Industry Overview
[Analysis of the industry landscape]

### Target Market
- **Primary Target:** [Demographics and characteristics]
- **Market Size:** [Size and growth potential]
- **Market Trends:** [Current trends affecting the market]

### Competitive Analysis
| Competitor | Strengths | Weaknesses | Market Share |
|------------|-----------|------------|--------------|
| [Competitor 1] | [Strengths] | [Weaknesses] | [%] |
| [Competitor 2] | [Strengths] | [Weaknesses] | [%] |

## Organization & Management
### Organizational Structure
[Describe company structure]

### Management Team
- **CEO:** [Name and background]
- **CTO:** [Name and background]
- **CFO:** [Name and background]

## Products or Services
### Product/Service Description
[Detailed description of offerings]

### Pricing Strategy
[How you'll price your products/services]

### Research and Development
[Future product development plans]

## Marketing & Sales Strategy
### Marketing Strategy
[How you'll reach customers]

### Sales Strategy
[Sales process and projections]

### Customer Acquisition Cost
[Cost to acquire each customer]

## Financial Projections
### Revenue Projections (3 years)
| Year | Revenue | Expenses | Profit |
|------|---------|----------|--------|
| Year 1 | $[Amount] | $[Amount] | $[Amount] |
| Year 2 | $[Amount] | $[Amount] | $[Amount] |
| Year 3 | $[Amount] | $[Amount] | $[Amount] |

### Funding Requirements
**Total Funding Needed:** $[Amount]  
**Use of Funds:**
- [Use 1]: $[Amount]
- [Use 2]: $[Amount]

## Risk Analysis
### Potential Risks
1. [Risk 1] - [Mitigation strategy]
2. [Risk 2] - [Mitigation strategy]

## Implementation Timeline
- **Phase 1 (Months 1-3):** [Activities]
- **Phase 2 (Months 4-6):** [Activities]
- **Phase 3 (Months 7-12):** [Activities]

## Appendices
- Financial statements
- Market research data
- Legal documents
`;
      this.api.ui.showNotification(`Business plan created for ${businessName}`, 'info');
      console.log('Business plan:', plan);
    }
  }
}

class TimeTrackerPlugin {
  constructor(private api: PluginAPI) {}

  async startPomodoro(): Promise<void> {
    const task = prompt('What task are you working on?');
    if (task) {
      this.api.ui.showNotification(`Pomodoro started for: ${task}. Focus for 25 minutes!`, 'info');
      console.log(`Starting 25-minute pomodoro for: ${task}`);
    }
  }

  async logTimeEntry(): Promise<void> {
    const project = prompt('Project name:');
    const hours = prompt('Hours worked:');
    const description = prompt('Description of work:');

    if (project && hours) {
      const entry = `
## Time Entry - ${new Date().toLocaleDateString()}

**Project:** ${project}  
**Duration:** ${hours} hours  
**Date:** ${new Date().toLocaleDateString()}  
**Time:** ${new Date().toLocaleTimeString()}

**Description:** ${description || 'No description'}

**Billable:** [ ] Yes [ ] No  
**Rate:** $[Rate per hour]  
**Total:** $[Total amount]

---
`;
      this.api.ui.showNotification(`Time logged: ${hours} hours for ${project}`, 'info');
      console.log('Time entry:', entry);
    }
  }
}
