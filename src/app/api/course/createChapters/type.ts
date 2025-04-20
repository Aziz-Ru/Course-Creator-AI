export interface CourseOutline {
  courseName: string;
  targetAudience: string;
  estimatedDuration: string;
  modules: Module[];
}

export interface Module {
  moduleTitle: string;
  moduleDescription: string;
  learningOutcome: string;
  lessons: Lesson[];
}

export interface Lesson {
  lessonTitle: string;
  lessonDescription: string;
  youtubeQuery: string;
  practiceActivity: string;
}
