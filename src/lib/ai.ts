import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { JsonOutputParser } from "@langchain/core/output_parsers";
const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro",
  temperature: 0.5,
  maxRetries: 2,
});

const a = `You are an expert course creator with extensive knowledge in curriculum design and pedagogy. Generate a detailed and structured
  course outline based on the provided course name and user input. The outline should cater to the user's specified learning goals, skill level,
  and preferences,ensuring a clear progression from beginner to advanced topics. For each module, include:
  1. A **module title** that reflects the module's focus and a **brief description** summarizing its objectives and content.
  2. 5 to 10 **lesson titles**.
  3. A **YouTube search query** for each lesson to help users find relevant, high-quality video content to supplement their learning.
  
  Ensure the course:
  - Follows a logical progression, building on prior knowledge and increasing in complexity.
  - Incorporates modern tools, frameworks, and best practices relevant to the subject.
  - Is engaging, practical, and aligned with industry standards.
  - Accounts for the user's stated preferences (e.g., focus on specific tools, duration, or depth).
  Constraints:
  1. Respond ONLY with a VALID JSON object.
  2. Do NOT include markdown, code blocks, or any text outside the JSON structure.
  3. Ensure the JSON is properly formatted and adheres to the specified structure.
  4. Use this EXACT structure:
  {{
    "courseName": "string",
    "modules": [
      {{
        "moduleTitle": "string",
        "lessons": [
          {{
            "lessonTitle": "string",
            "youtubeQuery": "string",
            
          }}
        ]
      }}
    ]
  }}
  5. Include at least 3 to 10 modules, with a minimum of 5 to 10 lessons per module depend on that module size.
  6. Ensure YouTube queries are specific enough to yield relevant results but broad enough to avoid overly niche content.
  7. Practice activities should be practical, achievable, and directly related to the lesson content.`;

const b = `You are an expert at finding most relevant image for course .
  Constraints:
  1. Respond ONLY with a VALID JSON object.
  2. Use this EXACT structure:
  {{
    "search_term":"string"
  }}
`;
const c = `I will provide you with a transcript of a YouTube video. Please summarize the video in a clear, engaging, and concise way. Highlight the main topic, key points, and any important conclusions or tips the speaker mentions. Keep the summary under 200 words unless the content is very detailed.
Constraints:
  1. Respond ONLY with a VALID JSON object.
  2. Use this EXACT structure:
  {{
    "summery":"string"
  }}
`;
const imageWantTemp = `Please provide a good search term  for the course {courseName}. This search term fetch the unsplash API image for the course so make sure that is good search term`;
const summery = `Please Give me summery of this transcript  {transcript}`;
export const prompt_template = ChatPromptTemplate.fromMessages([
  ["system", a],
  [
    "human",
    "Want to Learn about this {course} and if these {units} is relevent to the course content you will  create  modules about this ",
  ],
]);

const imagePrompt = ChatPromptTemplate.fromMessages([
  ["system", b],
  ["human", imageWantTemp],
]);

const summeryPrompt = ChatPromptTemplate.fromMessages([
  ["system", c],
  ["human", summery],
]);

export const courseChain = prompt_template
  .pipe(gemini)
  .pipe(new JsonOutputParser());

export const imageChain = imagePrompt.pipe(gemini).pipe(new JsonOutputParser());
// const res: any = await chain.invoke({ subject: "Backend Development" });

export const summeryChain = summeryPrompt
  .pipe(gemini)
  .pipe(new JsonOutputParser());

/**
 * 
 * "targetAudience": "string describing the intended learners (e.g., beginners, intermediate, professionals)","estimatedDuration": "string describing the approximate time to complete the course (e.g., 4 weeks, 10 hours)",
 * 


**/

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getSummeryResponse(transcript: string): Promise<string> {
  let result: string | undefined = undefined;
  while (!result) {
    try {
      const response: { summery: string } = await summeryChain.invoke({
        transcript: transcript,
      });
      result = response.summery;
    } catch (error) {
      await sleep(1500);
    }
  }
  return result;
}
