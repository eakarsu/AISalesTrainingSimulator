import React from 'react';

const Badge = ({ value, type }) => {
  const classes = {
    active: 'badge-success', completed: 'badge-success', reviewed: 'badge-success', won: 'badge-success',
    draft: 'badge-warning', in_progress: 'badge-warning', intermediate: 'badge-warning', medium: 'badge-warning',
    archived: 'badge-danger', lost: 'badge-danger', advanced: 'badge-danger', hard: 'badge-danger', high: 'badge-primary',
    beginner: 'badge-info', easy: 'badge-info', low: 'badge-info', paused: 'badge-info',
    common: 'badge-success', occasional: 'badge-warning', rare: 'badge-danger',
    up: 'badge-success', down: 'badge-danger', stable: 'badge-warning'
  };
  return <span className={`badge ${classes[value] || 'badge-primary'}`}>{value}</span>;
};

const columns = {
  scenarios: [
    { key: 'title', label: 'Title' },
    { key: 'industry', label: 'Industry' },
    { key: 'difficulty', label: 'Difficulty', render: v => <Badge value={v} /> },
    { key: 'status', label: 'Status', render: v => <Badge value={v} /> }
  ],
  sessions: [
    { key: 'title', label: 'Title' },
    { key: 'score', label: 'Score', render: v => <span style={{ fontWeight: 600, color: v >= 85 ? '#10b981' : v >= 70 ? '#f59e0b' : '#ef4444' }}>{v?.toFixed(1)}</span> },
    { key: 'duration', label: 'Duration', render: v => `${v} min` },
    { key: 'status', label: 'Status', render: v => <Badge value={v} /> }
  ],
  objections: [
    { key: 'objectionText', label: 'Objection', render: v => v?.substring(0, 60) + '...' },
    { key: 'category', label: 'Category' },
    { key: 'difficulty', label: 'Difficulty', render: v => <Badge value={v} /> },
    { key: 'frequency', label: 'Frequency', render: v => <Badge value={v} /> }
  ],
  pitches: [
    { key: 'title', label: 'Title' },
    { key: 'productName', label: 'Product' },
    { key: 'targetAudience', label: 'Audience' },
    { key: 'score', label: 'Score', render: v => v ? <span style={{ fontWeight: 600, color: v >= 85 ? '#10b981' : '#f59e0b' }}>{v?.toFixed(1)}</span> : '—' },
    { key: 'status', label: 'Status', render: v => <Badge value={v} /> }
  ],
  playbooks: [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'industry', label: 'Industry' },
    { key: 'status', label: 'Status', render: v => <Badge value={v} /> }
  ],
  metrics: [
    { key: 'metricName', label: 'Metric' },
    { key: 'metricValue', label: 'Value', render: (v, item) => {
      if (item.category === 'Revenue') return `$${Number(v).toLocaleString()}`;
      if (['Efficiency', 'Quality'].includes(item.category)) return `${v}%`;
      return v;
    }},
    { key: 'category', label: 'Category' },
    { key: 'period', label: 'Period' },
    { key: 'trend', label: 'Trend', render: v => <Badge value={v} /> }
  ],
  products: [
    { key: 'productName', label: 'Product' },
    { key: 'category', label: 'Category' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'targetMarket', label: 'Target Market' }
  ],
  coaching: [
    { key: 'title', label: 'Title' },
    { key: 'currentPhase', label: 'Phase' },
    { key: 'startDate', label: 'Start' },
    { key: 'endDate', label: 'End' },
    { key: 'status', label: 'Status', render: v => <Badge value={v} /> }
  ],
  scripts: [
    { key: 'title', label: 'Title' },
    { key: 'scriptType', label: 'Type' },
    { key: 'industry', label: 'Industry' },
    { key: 'closingTechnique', label: 'Close Technique' },
    { key: 'status', label: 'Status', render: v => <Badge value={v} /> }
  ],
  emails: [
    { key: 'title', label: 'Title' },
    { key: 'templateType', label: 'Type' },
    { key: 'subject', label: 'Subject' },
    { key: 'conversionRate', label: 'Conv Rate', render: v => v ? `${v}%` : '—' },
    { key: 'status', label: 'Status', render: v => <Badge value={v} /> }
  ],
  deals: [
    { key: 'title', label: 'Deal' },
    { key: 'companyName', label: 'Company' },
    { key: 'dealValue', label: 'Value', render: v => `$${Number(v).toLocaleString()}` },
    { key: 'stage', label: 'Stage' },
    { key: 'outcome', label: 'Outcome', render: v => <Badge value={v} /> }
  ],
  personas: [
    { key: 'name', label: 'Name' },
    { key: 'title', label: 'Title' },
    { key: 'industry', label: 'Industry' },
    { key: 'communicationStyle', label: 'Style' }
  ],
  battlecards: [
    { key: 'competitorName', label: 'Competitor' },
    { key: 'marketShare', label: 'Market Share' },
    { key: 'pricingComparison', label: 'Pricing' }
  ],
  training: [
    { key: 'title', label: 'Module' },
    { key: 'category', label: 'Category' },
    { key: 'difficulty', label: 'Difficulty', render: v => <Badge value={v} /> },
    { key: 'duration', label: 'Duration', render: v => `${v} min` },
    { key: 'completionRate', label: 'Completion', render: v => `${v}%` },
    { key: 'status', label: 'Status', render: v => <Badge value={v} /> }
  ],
  negotiations: [
    { key: 'name', label: 'Tactic' },
    { key: 'category', label: 'Category' },
    { key: 'effectiveness', label: 'Effectiveness', render: v => <Badge value={v} /> },
    { key: 'riskLevel', label: 'Risk', render: v => <Badge value={v} /> }
  ],
  leaderboard: [
    { key: 'rank', label: 'Rank', render: v => <span className={`rank-badge rank-${v <= 3 ? v : 'other'}`} style={{ width: 28, height: 28, fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>#{v}</span> },
    { key: 'userName', label: 'Name' },
    { key: 'totalScore', label: 'Score', render: v => <span style={{ fontWeight: 700, color: '#f4f4f5' }}>{v}</span> },
    { key: 'sessionsCompleted', label: 'Sessions' },
    { key: 'winRate', label: 'Win Rate', render: v => `${v}%` },
    { key: 'badge', label: 'Badge', render: v => <Badge value={v?.toLowerCase()} /> },
    { key: 'period', label: 'Period' }
  ]
};

const formFields = {
  scenarios: [
    { key: 'title', label: 'Title', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'industry', label: 'Industry' },
    { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['beginner', 'intermediate', 'advanced'] },
    { key: 'buyerPersona', label: 'Buyer Persona', type: 'textarea' },
    { key: 'objectives', label: 'Objectives', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'select', options: ['active', 'draft', 'archived'], defaultValue: 'active' }
  ],
  sessions: [
    { key: 'title', label: 'Title', required: true },
    { key: 'scenarioId', label: 'Scenario ID', type: 'number' },
    { key: 'transcript', label: 'Transcript', type: 'textarea' },
    { key: 'score', label: 'Score', type: 'number' },
    { key: 'feedback', label: 'Feedback', type: 'textarea' },
    { key: 'duration', label: 'Duration (min)', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: ['in_progress', 'completed', 'reviewed'], defaultValue: 'in_progress' }
  ],
  objections: [
    { key: 'objectionText', label: 'Objection', type: 'textarea', required: true },
    { key: 'category', label: 'Category' },
    { key: 'suggestedResponse', label: 'Suggested Response', type: 'textarea' },
    { key: 'industry', label: 'Industry' },
    { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['easy', 'medium', 'hard'] },
    { key: 'frequency', label: 'Frequency', type: 'select', options: ['common', 'occasional', 'rare'] }
  ],
  pitches: [
    { key: 'title', label: 'Title', required: true },
    { key: 'pitchText', label: 'Pitch Text', type: 'textarea' },
    { key: 'productName', label: 'Product Name' },
    { key: 'targetAudience', label: 'Target Audience' },
    { key: 'score', label: 'Score', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: ['draft', 'submitted', 'reviewed'], defaultValue: 'draft' }
  ],
  playbooks: [
    { key: 'title', label: 'Title', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'category', label: 'Category' },
    { key: 'steps', label: 'Steps', type: 'textarea' },
    { key: 'bestPractices', label: 'Best Practices', type: 'textarea' },
    { key: 'industry', label: 'Industry' },
    { key: 'status', label: 'Status', type: 'select', options: ['active', 'draft', 'archived'], defaultValue: 'active' }
  ],
  metrics: [
    { key: 'metricName', label: 'Metric Name', required: true },
    { key: 'metricValue', label: 'Value', type: 'number' },
    { key: 'category', label: 'Category' },
    { key: 'period', label: 'Period' },
    { key: 'trend', label: 'Trend', type: 'select', options: ['up', 'down', 'stable'] },
    { key: 'notes', label: 'Notes', type: 'textarea' }
  ],
  products: [
    { key: 'productName', label: 'Product Name', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'features', label: 'Features', type: 'textarea' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'competitiveAdvantage', label: 'Competitive Advantage', type: 'textarea' },
    { key: 'targetMarket', label: 'Target Market' },
    { key: 'category', label: 'Category' }
  ],
  coaching: [
    { key: 'title', label: 'Title', required: true },
    { key: 'goals', label: 'Goals', type: 'textarea' },
    { key: 'milestones', label: 'Milestones', type: 'textarea' },
    { key: 'currentPhase', label: 'Current Phase' },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'endDate', label: 'End Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: ['active', 'completed', 'paused'], defaultValue: 'active' }
  ],
  scripts: [
    { key: 'title', label: 'Title', required: true },
    { key: 'scriptType', label: 'Script Type' },
    { key: 'content', label: 'Script Content', type: 'textarea' },
    { key: 'industry', label: 'Industry' },
    { key: 'talkingPoints', label: 'Talking Points', type: 'textarea' },
    { key: 'closingTechnique', label: 'Closing Technique' },
    { key: 'status', label: 'Status', type: 'select', options: ['active', 'draft', 'archived'], defaultValue: 'active' }
  ],
  emails: [
    { key: 'title', label: 'Title', required: true },
    { key: 'subject', label: 'Subject Line' },
    { key: 'body', label: 'Email Body', type: 'textarea' },
    { key: 'templateType', label: 'Template Type' },
    { key: 'industry', label: 'Industry' },
    { key: 'conversionRate', label: 'Conversion Rate (%)', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: ['active', 'draft', 'archived'], defaultValue: 'active' }
  ],
  deals: [
    { key: 'title', label: 'Deal Title', required: true },
    { key: 'dealValue', label: 'Deal Value ($)', type: 'number' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'industry', label: 'Industry' },
    { key: 'stage', label: 'Stage' },
    { key: 'stakeholders', label: 'Stakeholders', type: 'textarea' },
    { key: 'challenges', label: 'Challenges', type: 'textarea' },
    { key: 'outcome', label: 'Outcome', type: 'select', options: ['won', 'lost', 'in_progress'], defaultValue: 'in_progress' }
  ],
  personas: [
    { key: 'name', label: 'Name', required: true },
    { key: 'title', label: 'Job Title' },
    { key: 'company', label: 'Company Type' },
    { key: 'industry', label: 'Industry' },
    { key: 'painPoints', label: 'Pain Points', type: 'textarea' },
    { key: 'motivations', label: 'Motivations', type: 'textarea' },
    { key: 'communicationStyle', label: 'Communication Style' },
    { key: 'decisionCriteria', label: 'Decision Criteria', type: 'textarea' }
  ],
  battlecards: [
    { key: 'competitorName', label: 'Competitor Name', required: true },
    { key: 'strengths', label: 'Strengths', type: 'textarea' },
    { key: 'weaknesses', label: 'Weaknesses', type: 'textarea' },
    { key: 'ourAdvantage', label: 'Our Advantage', type: 'textarea' },
    { key: 'counterArguments', label: 'Counter Arguments', type: 'textarea' },
    { key: 'pricingComparison', label: 'Pricing Comparison', type: 'textarea' },
    { key: 'marketShare', label: 'Market Share' }
  ],
  training: [
    { key: 'title', label: 'Module Title', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'category', label: 'Category' },
    { key: 'content', label: 'Content', type: 'textarea' },
    { key: 'duration', label: 'Duration (min)', type: 'number' },
    { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['beginner', 'intermediate', 'advanced'] },
    { key: 'completionRate', label: 'Completion Rate (%)', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: ['active', 'draft', 'archived'], defaultValue: 'active' }
  ],
  negotiations: [
    { key: 'name', label: 'Tactic Name', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'category', label: 'Category' },
    { key: 'whenToUse', label: 'When to Use', type: 'textarea' },
    { key: 'example', label: 'Example', type: 'textarea' },
    { key: 'effectiveness', label: 'Effectiveness', type: 'select', options: ['high', 'medium', 'low'] },
    { key: 'riskLevel', label: 'Risk Level', type: 'select', options: ['high', 'medium', 'low'] }
  ],
  leaderboard: [
    { key: 'userName', label: 'User Name', required: true },
    { key: 'totalScore', label: 'Total Score', type: 'number' },
    { key: 'sessionsCompleted', label: 'Sessions Completed', type: 'number' },
    { key: 'winRate', label: 'Win Rate (%)', type: 'number' },
    { key: 'rank', label: 'Rank', type: 'number' },
    { key: 'badge', label: 'Badge' },
    { key: 'period', label: 'Period' }
  ]
};

export function getColumns(featureKey) {
  return columns[featureKey] || [{ key: 'id', label: 'ID' }];
}

export function getFormFields(featureKey) {
  return formFields[featureKey] || [];
}
