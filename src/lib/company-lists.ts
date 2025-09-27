export interface CompanyList {
  name: string;
  companies: Array<{
    name: string;
    url: string;
  }>;
}

export const COMPANY_CATEGORIES: Record<string, CompanyList> = {
  'tech-giants': {
    name: 'Tech Giants',
    companies: [
      { name: 'Google', url: 'https://careers.google.com/jobs/results/' },
      { name: 'Meta', url: 'https://www.metacareers.com/jobs' },
      { name: 'Amazon', url: 'https://www.amazon.jobs/en/search' },
      { name: 'Microsoft', url: 'https://careers.microsoft.com/professionals/us/en/search-results' },
      { name: 'Apple', url: 'https://jobs.apple.com/en-us/search' },
    ],
  },
  'tech-unicorns': {
    name: 'Tech Unicorns',
    companies: [
      { name: 'Stripe', url: 'https://stripe.com/jobs/search' },
      { name: 'Databricks', url: 'https://www.databricks.com/company/careers' },
      { name: 'Canva', url: 'https://www.canva.com/careers/jobs/' },
      { name: 'Figma', url: 'https://www.figma.com/careers/' },
      { name: 'Notion', url: 'https://www.notion.so/careers' },
    ],
  },
  'seattle-tech': {
    name: 'Seattle Tech',
    companies: [
      { name: 'Amazon', url: 'https://www.amazon.jobs/en/search' },
      { name: 'Microsoft', url: 'https://careers.microsoft.com/professionals/us/en/search-results' },
      { name: 'Zillow', url: 'https://www.zillow.com/careers/openings/' },
      { name: 'Redfin', url: 'https://www.redfin.com/careers' },
      { name: 'Expedia', url: 'https://lifeatexpediagroup.com/jobs' },
    ],
  },
  'finance': {
    name: 'Finance & Fintech',
    companies: [
      { name: 'Goldman Sachs', url: 'https://www.goldmansachs.com/careers/' },
      { name: 'JPMorgan Chase', url: 'https://careers.jpmorgan.com/us/en/students/programs' },
      { name: 'Stripe', url: 'https://stripe.com/jobs/search' },
      { name: 'Robinhood', url: 'https://robinhood.com/us/en/careers/' },
      { name: 'Coinbase', url: 'https://www.coinbase.com/careers/positions' },
    ],
  },
  'consulting': {
    name: 'Consulting',
    companies: [
      { name: 'McKinsey', url: 'https://www.mckinsey.com/careers/search-jobs' },
      { name: 'BCG', url: 'https://careers.bcg.com/search' },
      { name: 'Bain', url: 'https://www.bain.com/careers/' },
      { name: 'Deloitte', url: 'https://www2.deloitte.com/us/en/careers/search-jobs.html' },
      { name: 'Accenture', url: 'https://www.accenture.com/us-en/careers/jobsearch' },
    ],
  },
  'healthcare': {
    name: 'Healthcare',
    companies: [
      { name: 'UnitedHealth Group', url: 'https://careers.unitedhealthgroup.com/search' },
      { name: 'Kaiser Permanente', url: 'https://jobs.kaiserpermanente.org/' },
      { name: 'CVS Health', url: 'https://jobs.cvshealth.com/' },
      { name: 'Johnson & Johnson', url: 'https://jobs.jnj.com/' },
      { name: 'Pfizer', url: 'https://www.pfizer.com/about/careers' },
    ],
  },
};

export const POPULAR_COMPANIES = [
  { name: 'Anthropic', url: 'https://boards.greenhouse.io/anthropic' },
  { name: 'OpenAI', url: 'https://openai.com/careers/' },
  { name: 'Airbnb', url: 'https://careers.airbnb.com/' },
  { name: 'Netflix', url: 'https://jobs.netflix.com/search' },
  { name: 'Spotify', url: 'https://www.lifeatspotify.com/jobs' },
  { name: 'Uber', url: 'https://www.uber.com/us/en/careers/' },
  { name: 'Lyft', url: 'https://www.lyft.com/careers' },
  { name: 'DoorDash', url: 'https://careers.doordash.com/' },
  { name: 'Instacart', url: 'https://instacart.careers/current-openings/' },
  { name: 'Snowflake', url: 'https://careers.snowflake.com/us/en' },
];