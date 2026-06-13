import { Groq } from 'groq-sdk';

const groq = new Groq();

type childProfile = {
    childName: string;
    age?: number;
    grade: string;
    preferredLanguage: string;
    favorites: string;
    topic: string;
}

export const createSessionPrompt = (profile: childProfile) => `
You are a curriculum design agent for a voice-first AI mentor that teaches Indian school children through questions.

Your job is to create a compact learning roadmap and the first mentor message for a child.

The child profile:
- Name: ${profile.childName}
- Age: ${profile.age ?? "unknown"}
- Grade: ${profile.grade}
- Preferred language: ${profile.preferredLanguage}
- Favorite things: ${profile.favorites}

The child wants to learn:
"${profile.topic}"

Hard rules:
- The learner is a child. Keep everything child-safe.
- Do not include unsafe, sexual, hateful, violent, self-harm, weapon-making, or dangerous experiment content.
- If the topic is unsafe, set "isSafe" to false and create a gentle safeRedirectMessage.
- The session must be short. It should end after assessment.
- Do not create a long course.
- Use the child's favorite things to personalize examples when useful.
- The mentor should teach by asking questions, not by giving long explanations.
- Keep each phase small.
- Return only valid JSON. No markdown. No extra text.

Roadmap requirements:
- Exactly 4 phases:
  1. prerequisites
  2. core_concepts
  3. real_life
  4. assessment
- prerequisites maxTurns must be 2 or 3.
- core_concepts maxTurns must be 4 or 5.
- real_life maxTurns must be 2 or 3.
- assessment maxTurns must be exactly 3.
- Each phase must have:
  - id
  - title
  - goal
  - maxTurns
  - completionCriteria
- completionCriteria must be an array of short strings.
- Generate exactly 3 assessmentQuestions.
- The first mentor message must:
  - Be under 35 words.
  - Use the child's name if natural.
  - Use the preferred language style.
  - Ask exactly one question.
  - Start the prerequisites phase.
  - Not explain the whole topic.

Return JSON in this exact shape:

{
  "isSafe": true,
  "safeRedirectMessage": null,
  "topic": "clean topic title",
  "personalizedHook": "favorite thing or daily-life hook used",
  "roadmap": {
    "phases": [
      {
        "id": "prerequisites",
        "title": "Prerequisites",
        "goal": "short goal",
        "maxTurns": 3,
        "completionCriteria": ["short criterion"]
      },
      {
        "id": "core_concepts",
        "title": "Core Concepts",
        "goal": "short goal",
        "maxTurns": 5,
        "completionCriteria": ["short criterion"]
      },
      {
        "id": "real_life",
        "title": "Real-Life Connection",
        "goal": "short goal",
        "maxTurns": 3,
        "completionCriteria": ["short criterion"]
      },
      {
        "id": "assessment",
        "title": "Assessment",
        "goal": "Ask 3 fundamental questions",
        "maxTurns": 3,
        "completionCriteria": ["Child answers 3 fundamental questions"]
      }
    ],
    "assessmentQuestions": [
      "question 1",
      "question 2",
      "question 3"
    ]
  },
  "firstMentorMessage": {
    "phase": "prerequisites",
    "text": "short voice-friendly question"
  }
}

If unsafe, return JSON in this exact shape:

{
  "isSafe": false,
  "safeRedirectMessage": "gentle safe message",
  "topic": "clean safe alternative topic",
  "personalizedHook": null,
  "roadmap": null,
  "firstMentorMessage": null
}
`;

export const getLLMResponse = async (prompt: string) => {
    const LLMReply = await groq.chat.completions.create({
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant that checks if the user's input contains any harmful content. If the input is safe, respond with 'Safe'. If the input contains harmful content, respond with 'Harmful' and explain why it is harmful."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "model": "meta-llama/llama-prompt-guard-2-86m",
        "temperature": 1,
        "max_completion_tokens": 100,
        "top_p": 1,
        "stream": false,
        "stop": null
    });

    return LLMReply?.choices[0]?.message.content
}