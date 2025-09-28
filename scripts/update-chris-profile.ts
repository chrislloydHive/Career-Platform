import { sql } from '@vercel/postgres';

const dummyProfile = {
  name: "Chris Lloyd",
  location: "Seattle, WA",
  bio: "Experienced software engineer and entrepreneur with a passion for building scalable applications. Strong background in full-stack development, cloud architecture, and product strategy. Looking to leverage technical expertise in leadership roles.",
  linkedInUrl: "https://www.linkedin.com/in/chrislloyd",

  education: [
    {
      institution: "University of Washington",
      degree: "Bachelor of Science",
      major: "Computer Science",
      graduationYear: 2010,
      honors: ["Dean's List"],
      gpa: "3.7"
    }
  ],

  experience: [
    {
      title: "Senior Software Engineer",
      company: "Tech Startup",
      location: "Seattle, WA",
      startDate: "2018",
      endDate: "2025",
      description: [
        "Led development of microservices architecture serving 1M+ users",
        "Architected and implemented CI/CD pipelines reducing deployment time by 60%",
        "Mentored junior engineers and conducted code reviews",
        "Collaborated with product team on roadmap and feature prioritization"
      ],
      skills: ["Node.js", "React", "TypeScript", "AWS", "PostgreSQL", "Docker", "Kubernetes"]
    },
    {
      title: "Full Stack Developer",
      company: "Digital Agency",
      location: "Seattle, WA",
      startDate: "2015",
      endDate: "2018",
      description: [
        "Built and maintained web applications for Fortune 500 clients",
        "Implemented responsive designs and optimized performance",
        "Worked directly with clients to gather requirements and deliver solutions"
      ],
      skills: ["JavaScript", "Python", "React", "Django", "PostgreSQL", "Redis"]
    }
  ],

  skills: [
    "JavaScript/TypeScript",
    "React/Next.js",
    "Node.js",
    "Python",
    "PostgreSQL",
    "AWS/Cloud Architecture",
    "Docker/Kubernetes",
    "System Design",
    "API Design",
    "Team Leadership",
    "Product Strategy",
    "Agile/Scrum"
  ],

  strengths: [
    "Strong technical problem-solving",
    "Strategic thinking and architecture design",
    "Clear communication with technical and non-technical stakeholders",
    "Mentorship and team development",
    "Product-minded engineering approach",
    "Fast learner and adaptable to new technologies"
  ],

  interests: [
    "Building scalable systems",
    "Product strategy and user experience",
    "Team leadership and mentorship",
    "Emerging technologies (AI/ML)",
    "Entrepreneurship",
    "Open source contributions"
  ],

  values: [
    "Technical excellence and craftsmanship",
    "User-focused product development",
    "Continuous learning and growth",
    "Collaborative team culture",
    "Work-life balance",
    "Impactful mission-driven work"
  ],

  careerGoals: [
    "Transition into technical leadership roles (Engineering Manager, VP Engineering)",
    "Build and scale high-performing engineering teams",
    "Work on products with meaningful impact",
    "Combine technical expertise with business strategy",
    "Mentor next generation of engineers"
  ],

  preferredIndustries: [
    "Technology",
    "SaaS",
    "Healthcare Technology",
    "FinTech",
    "Developer Tools",
    "AI/ML",
    "Enterprise Software"
  ],

  preferredLocations: [
    "Seattle, WA",
    "Remote",
    "Pacific Northwest"
  ],

  careerPreferences: {
    whatMatters: [
      "Technical challenges and innovation",
      "Team culture and collaboration",
      "Product impact and user value",
      "Growth and learning opportunities",
      "Work-life balance"
    ],
    idealRole: "Engineering leadership role (EM, Director, VP) at a growth-stage company where I can build teams, influence product strategy, and work on technically challenging problems with real impact.",
    workEnvironment: [
      "Strong engineering culture",
      "Collaborative and transparent",
      "Remote or hybrid friendly",
      "Focus on work-life balance",
      "Modern tech stack"
    ],
    dealBreakers: [
      "Poor work-life balance or on-call hell",
      "Legacy tech with no improvement path",
      "Micromanagement or lack of autonomy",
      "No investment in team growth",
      "Unclear or constantly changing direction"
    ],
    motivations: [
      "Building products people love",
      "Solving complex technical challenges",
      "Growing and mentoring talented teams",
      "Learning new technologies and approaches",
      "Creating leverage through good architecture"
    ],
    skillsToLeverage: [
      "Full-stack development expertise",
      "Cloud architecture and scalability",
      "System design and technical strategy",
      "Team mentorship and code review",
      "Product thinking and user empathy"
    ],
    skillsToGrow: [
      "People management and leadership",
      "Executive communication and influence",
      "Business strategy and P&L management",
      "Organizational design and scaling",
      "AI/ML implementation and strategy"
    ],
    cultureFit: [
      "Values technical excellence",
      "Encourages experimentation and innovation",
      "Prioritizes employee growth and development",
      "Has clear mission and values",
      "Transparent and collaborative leadership"
    ],
    workLifeBalance: "High priority - looking for sustainable pace with flexibility for family and personal time. Prefer standard hours with occasional flexibility rather than constant crunch.",
    compensationPriority: "Important but not primary driver. Looking for $180-250k+ base depending on role, with meaningful equity. Value total comp including benefits, equity upside, and growth potential.",
    customNotes: "After years of hands-on engineering, I'm ready to transition into leadership while staying close to the technical work. I'm most energized when building systems that scale and teams that thrive. Looking for a company with strong product-market fit where I can make a significant impact on both the technology and the team culture."
  },

  interactionHistory: [],
  aiInsights: [],
  lastUpdated: new Date()
};

async function updateProfile() {
  try {
    const userId = 'aa72f0f3-fd33-45db-847b-2a6be7b8af70';

    await sql`
      INSERT INTO user_profiles (
        user_id, name, location, bio, linkedin_url, resume_url,
        education, experience, skills, strengths, interests, values,
        career_goals, preferred_industries, preferred_locations, career_preferences,
        created_at, last_updated
      )
      VALUES (
        ${userId},
        ${dummyProfile.name},
        ${dummyProfile.location},
        ${dummyProfile.bio},
        ${dummyProfile.linkedInUrl},
        ${null},
        ${JSON.stringify(dummyProfile.education)},
        ${JSON.stringify(dummyProfile.experience)},
        ${JSON.stringify(dummyProfile.skills)},
        ${JSON.stringify(dummyProfile.strengths)},
        ${JSON.stringify(dummyProfile.interests)},
        ${JSON.stringify(dummyProfile.values)},
        ${JSON.stringify(dummyProfile.careerGoals)},
        ${JSON.stringify(dummyProfile.preferredIndustries)},
        ${JSON.stringify(dummyProfile.preferredLocations)},
        ${JSON.stringify(dummyProfile.careerPreferences)},
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        name = ${dummyProfile.name},
        location = ${dummyProfile.location},
        bio = ${dummyProfile.bio},
        linkedin_url = ${dummyProfile.linkedInUrl},
        education = ${JSON.stringify(dummyProfile.education)},
        experience = ${JSON.stringify(dummyProfile.experience)},
        skills = ${JSON.stringify(dummyProfile.skills)},
        strengths = ${JSON.stringify(dummyProfile.strengths)},
        interests = ${JSON.stringify(dummyProfile.interests)},
        values = ${JSON.stringify(dummyProfile.values)},
        career_goals = ${JSON.stringify(dummyProfile.careerGoals)},
        preferred_industries = ${JSON.stringify(dummyProfile.preferredIndustries)},
        preferred_locations = ${JSON.stringify(dummyProfile.preferredLocations)},
        career_preferences = ${JSON.stringify(dummyProfile.careerPreferences)},
        last_updated = NOW()
    `;

    console.log('✓ Profile updated successfully for Chris Lloyd');
    console.log('  Name:', dummyProfile.name);
    console.log('  Location:', dummyProfile.location);
    console.log('  Experience roles:', dummyProfile.experience.length);
    console.log('  Skills:', dummyProfile.skills.length);
    console.log('  Preferred industries:', dummyProfile.preferredIndustries.length);
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
}

updateProfile()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });