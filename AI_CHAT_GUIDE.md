# AI-Powered Career Chat Guide

## Overview
The Career Chat now uses Claude AI (Anthropic) to provide intelligent, personalized career guidance through natural conversation.

## Features

### 1. Natural Language Understanding
Ask questions naturally, like you would with a real career counselor:
- "I want to work with people but also need flexibility to work from home"
- "What careers combine my love of teaching with my tech background?"
- "I'm feeling stuck in finance, what other options might I have?"
- "Show me high-paying remote roles that don't require a degree"

### 2. Contextual Conversations
The AI remembers your conversation history:
- Builds on previous answers
- Avoids asking the same questions repeatedly
- Understands when you're refining your search
- Connects dots between different parts of the conversation

### 3. Personalized Career Analysis
For each career suggestion, you get:
- **Why it matches**: Specific reasoning based on YOUR needs
- **Strengths**: What makes this a good fit for you
- **Considerations**: Important trade-offs to think about
- **Next steps**: Concrete actions you can take

### 4. Emotional Intelligence
The AI detects and responds to your emotional tone:
- **Excited**: Encourages exploration and provides options
- **Uncertain**: Asks clarifying questions gently
- **Frustrated**: Helps reframe and find new angles
- **Curious**: Provides detailed information and context

### 5. Smart Follow-Up Questions
The AI asks thoughtful questions to understand:
- What matters most to you (growth, impact, money, balance)
- Your background and experience level
- Specific constraints or requirements
- What you're trying to avoid or move towards

## Example Conversations

### Example 1: Career Transition
**You:** "I've been in marketing for 5 years but want to move into healthcare. What are my options?"

**AI:** "That's an exciting transition! Your marketing experience can be incredibly valuable in healthcare. Let me share some careers that bridge both fields...

I found several roles that could be a great fit:

1. **Healthcare Marketing Manager** - Uses your marketing expertise in a healthcare setting
2. **Patient Education Coordinator** - Combines communication skills with helping people
3. **Health IT Product Manager** - Bridges healthcare needs with technology solutions

Would you like to focus more on the patient-facing aspects or strategic/business side?"

### Example 2: Remote Work Priority
**You:** "I need to work remotely but still want to help people directly"

**AI:** "I understand—remote work flexibility is important, but you don't want to lose that personal impact. Great news: there are many careers that offer both!

Here are some strong matches:
- **Virtual Mental Health Counselor**: Direct one-on-one support, fully remote
- **Remote Patient Care Coordinator**: Help patients navigate healthcare remotely
- **Online Fitness Coach**: Personal training and wellness coaching via video

What type of helping appeals to you most—mental health, physical health, or general support?"

### Example 3: Skill-Based Search
**You:** "Show me roles where I can use my training and teaching background"

**AI:** "Your training and teaching skills are valuable in many fields! Let me suggest some careers that leverage your ability to educate and develop others..."

## Best Practices

### 1. Be Specific
- Instead of: "What jobs are good?"
- Try: "What jobs combine data analysis with helping people improve their health?"

### 2. Share Context
- Mention your background: "I have a psychology degree but work in sales"
- State constraints: "I need to make at least $70k and work remotely"
- Express values: "Work-life balance is more important to me than salary"

### 3. Ask Follow-Ups
- "Tell me more about the day-to-day of a UX researcher"
- "What's the career progression like in healthcare IT?"
- "How much training would I need to transition into that role?"

### 4. Explore Tradeoffs
- "What careers offer high salary without long hours?"
- "I want creativity and stability—do those exist together?"
- "Show me options that don't require going back to school"

## How It Works

1. **You ask a question** in natural language
2. **AI analyzes your intent** - understands what you're really asking
3. **Careers are matched** from the database based on your criteria
4. **AI generates a personalized response** explaining why each career fits
5. **Follow-up questions** help refine and deepen the search
6. **Conversation continues** with full context from previous exchanges

## Technical Details

- **Model**: Claude 3.5 Sonnet (Anthropic)
- **Context Window**: Remembers last 6 messages
- **Fallback**: If AI unavailable, uses rule-based matching
- **Response Time**: 2-4 seconds for AI-generated responses

## Tips for Best Results

1. **Start broad, then narrow**: Begin with general interests, then add constraints
2. **Use "I" statements**: "I want...", "I need...", "I'm looking for..."
3. **Mention multiple factors**: "I want X but also Y"
4. **Express uncertainty**: "I'm not sure if I want..." helps AI ask clarifying questions
5. **Be honest**: The AI helps you explore, not judge your choices

## Environment Setup

The AI features require `ANTHROPIC_API_KEY` in `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

Without the API key, the chat falls back to rule-based matching (still functional, but less personalized).