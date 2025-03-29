export interface CourseOutcome {
  code: string
}

export interface Question {
  number: string
  co: string
  marks: number
}

export interface ExamSetup {
  name: string
  totalMarks: number
  cos: CourseOutcome[]
  questions: Question[]
}

export interface CalculatedMarks {
  questionMarks: Record<string, number>
  coMarks: Record<string, number>
  totalMarks: number
}

export interface StudentRecord {
  id: string
  marks: Record<string, number>
  coMarks: Record<string, number>
  totalMarks: number
}

