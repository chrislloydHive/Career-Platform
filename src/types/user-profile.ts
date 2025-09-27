export interface Education {
  institution: string;
  degree: string;
  major?: string;
  minor?: string;
  graduationYear: number;
  honors?: string[];
  gpa?: string;
}

export interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description: string[];
  skills?: string[];
}

export interface UserProfile {
  name: string;
  location: string;
  bio: string;
  linkedInUrl?: string;
  resumeUrl?: string;

  education: Education[];
  experience: Experience[];

  skills: string[];
  strengths: string[];
  interests: string[];
  values: string[];

  careerGoals: string[];
  preferredIndustries: string[];
  preferredLocations: string[];

  interactionHistory: {
    timestamp: Date;
    action: string;
    context: string;
    aiLearning?: string;
  }[];

  aiInsights: {
    timestamp: Date;
    insight: string;
    confidence: number;
    source: string;
  }[];

  lastUpdated: Date;
}

export const LOUISA_PROFILE: UserProfile = {
  name: "Louisa Lloyd",
  location: "Spokane, WA",
  bio: "2023 Gonzaga University graduate (magna cum laude) with a BBA in Marketing and English minor. Driven professional with diverse experience spanning healthcare administration, fitness, marketing, and visual merchandising. Passionate about helping people while working within structured environments.",
  linkedInUrl: "https://www.linkedin.com/in/louisaklloyd/",

  education: [
    {
      institution: "Gonzaga University",
      degree: "Bachelor of Business Administration",
      major: "Marketing",
      minor: "English",
      graduationYear: 2023,
      honors: ["Magna Cum Laude", "President's List (Fall 2019, Fall 2021)", "Dean's List (multiple semesters)"],
      gpa: "Magna Cum Laude"
    },
    {
      institution: "Gonzaga-in-Florence",
      degree: "Study Abroad Program",
      graduationYear: 2021,
      honors: []
    }
  ],

  experience: [
    {
      title: "Personal Trainer",
      company: "Chrome Personal Training Centre",
      location: "Spokane, WA",
      startDate: "2025-01",
      description: [
        "Built strong rapport with diverse clientele",
        "Applied education in strength training and biomechanics",
        "Tailored programming based on individual client needs"
      ],
      skills: ["Personal Training", "Client Relations", "Program Design", "Strength Training", "Biomechanics"]
    },
    {
      title: "Office Administrator & Marketing Manager",
      company: "Built to Move Chiropractic & Sports Rehab",
      location: "Spokane, WA",
      startDate: "2024-01",
      endDate: "2025-01",
      description: [
        "Managed daily clinic operations and patient communications",
        "Led marketing efforts, social media, and community outreach",
        "Ensured clinic visibility through engaging marketing materials and community involvement"
      ],
      skills: ["Healthcare Administration", "Marketing", "Social Media", "Operations Management", "Patient Communication"]
    },
    {
      title: "Visual Merchandising Specialist & Educator",
      company: "Lululemon",
      location: "Spokane & Seattle, WA",
      startDate: "2022-01",
      endDate: "2024-01",
      description: [
        "Led weekly store remerchandising and layout optimization",
        "Developed creative product displays that drove sales",
        "Educated team on design guidelines and product information",
        "Facilitated personalized guest experiences"
      ],
      skills: ["Visual Merchandising", "Retail Operations", "Team Training", "Sales", "Customer Experience"]
    },
    {
      title: "Intern",
      company: "Hey Advertising",
      location: "Seattle, WA",
      startDate: "2020-01",
      endDate: "2021-01",
      description: [
        "Developed case studies with creative samples and campaign performance data",
        "Collaborated on analyzing compelling data and solutions for client pitches",
        "Compiled and showcased agency work for new business development"
      ],
      skills: ["Marketing", "Data Analysis", "Case Study Development", "Campaign Strategy", "Client Pitches"]
    }
  ],

  skills: [
    "Marketing Strategy",
    "Social Media Management",
    "Visual Merchandising",
    "Healthcare Administration",
    "Personal Training",
    "Operations Management",
    "Patient Communication",
    "Team Leadership",
    "Data Analysis",
    "Brand Strategy",
    "Content Creation",
    "Client Relations",
    "Process Optimization"
  ],

  strengths: [
    "Excellent written and verbal communication",
    "Strong relationship building with diverse clients",
    "Strategic and creative problem-solving",
    "Operations management and process optimization",
    "Personalized service approach",
    "Athletic discipline and work ethic",
    "Adaptability across industries"
  ],

  interests: [
    "Health and wellness",
    "Fitness and movement",
    "Marketing and brand strategy",
    "Helping people achieve their goals",
    "Creative problem-solving",
    "Community impact",
    "Professional development"
  ],

  values: [
    "Helping people and making direct impact",
    "Structure and organization",
    "Creativity combined with strategy",
    "Professional growth opportunities",
    "Work-life balance",
    "Health and wellness focus",
    "Clear progression paths"
  ],

  careerGoals: [
    "Combine marketing skills with passion for health and wellness",
    "Work in roles that help people within structured environments",
    "Utilize relationship-building and communication strengths",
    "Find opportunities for professional growth and development",
    "Bridge multiple industries (health tech, wellness marketing, corporate wellness)"
  ],

  preferredIndustries: [
    "Health Technology",
    "Wellness Marketing",
    "Corporate Wellness",
    "Healthcare",
    "Fitness Technology",
    "Consumer Health",
    "Digital Health"
  ],

  preferredLocations: [
    "Spokane, WA",
    "Seattle, WA",
    "Pacific Northwest",
    "Remote (with Pacific Northwest base)"
  ],

  interactionHistory: [],
  aiInsights: [],
  lastUpdated: new Date()
};