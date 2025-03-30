"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, Save } from "lucide-react"
import type { ExamSetup, CourseOutcome, Question } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SetupFormProps {
  initialSetup: ExamSetup | null
  onSave: (setup: ExamSetup) => void
}

export default function SetupForm({ initialSetup, onSave }: SetupFormProps) {
  const [examName, setExamName] = useState("")
  const [totalMarks, setTotalMarks] = useState(0)
  const [cos, setCos] = useState<CourseOutcome[]>([{ code: "" }])
  const [questions, setQuestions] = useState<Question[]>([{ number: "", co: "", marks: 0 }])
  const [error, setError] = useState("")

  useEffect(() => {
    if (initialSetup) {
      setExamName(initialSetup.name)
      setTotalMarks(initialSetup.totalMarks)
      setCos(initialSetup.cos.length > 0 ? initialSetup.cos : [{ code: "" }])
      setQuestions(initialSetup.questions.length > 0 ? initialSetup.questions : [{ number: "", co: "", marks: 0 }])
    }
  }, [initialSetup])

  const addCO = () => {
    setCos([...cos, { code: "" }])
  }

  const removeCO = (index: number) => {
    const updatedCOs = [...cos]
    updatedCOs.splice(index, 1)
    setCos(updatedCOs)
  }

  const updateCO = (index: number, value: string) => {
    // Format the CO code to ensure it has the "CO" prefix
    let formattedValue = value.trim()
    if (formattedValue && !formattedValue.toLowerCase().startsWith("co")) {
      formattedValue = "CO" + formattedValue
    }

    const updatedCOs = [...cos]
    updatedCOs[index] = { code: formattedValue }
    setCos(updatedCOs)
  }

  const addQuestion = () => {
    setQuestions([...questions, { number: "", co: "", marks: 0 }])
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questions]
    updatedQuestions.splice(index, 1)
    setQuestions(updatedQuestions)
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: field === "marks" ? Number(value) : value }
    setQuestions(updatedQuestions)
  }

  const handleSubmit = () => {
    // Validate form
    if (!examName) {
      setError("Please enter exam name")
      return
    }

    if (totalMarks <= 0) {
      setError("Please enter valid total marks")
      return
    }

    const validCOs = cos.filter((co) => co.code)
    if (validCOs.length === 0) {
      setError("Please add at least one Course Outcome")
      return
    }

    const validQuestions = questions.filter((q) => q.number && q.co && q.marks > 0)
    if (validQuestions.length === 0) {
      setError("Please add at least one question")
      return
    }

    // Calculate total marks from questions
    const calculatedTotalMarks = validQuestions.reduce((sum, q) => sum + q.marks, 0)
    if (calculatedTotalMarks !== totalMarks) {
      setError(
          `Total marks from questions (${calculatedTotalMarks}) doesn't match the specified total marks (${totalMarks})`,
      )
      return
    }

    // Save setup
    onSave({
      name: examName,
      totalMarks,
      cos: validCOs,
      questions: validQuestions,
    })

    setError("")
  }

  return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Exam Configuration</h2>
          <p className="text-blue-600">
            Define your exam details, course outcomes (COs), and questions with their CO mappings.
          </p>
        </div>

        {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="examName" className="text-blue-700">
              Exam Name
            </Label>
            <Input
                id="examName"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g., Mid Semester Test-2"
                className="border-blue-200 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalMarks" className="text-blue-700">
              Total Marks
            </Label>
            <Input
                id="totalMarks"
                type="number"
                value={totalMarks || ""}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                placeholder="e.g., 20"
                className="border-blue-200 focus:border-blue-500"
            />
          </div>
        </div>

        <Card className="border-blue-200 shadow-sm">
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <CardTitle className="flex justify-between items-center text-blue-800">
              <span>Course Outcomes (COs)</span>
              <Button
                  onClick={addCO}
                  size="sm"
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-2" /> Add CO
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {cos.map((co, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <Label htmlFor={`co-code-${index}`} className="text-blue-700">
                        CO Code
                      </Label>
                      <Input
                          id={`co-code-${index}`}
                          value={co.code}
                          onChange={(e) => updateCO(index, e.target.value)}
                          placeholder="e.g., CO1"
                          className="border-blue-200 focus:border-blue-500"
                      />
                    </div>
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeCO(index)}
                        disabled={cos.length <= 1}
                        className="mt-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-sm">
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <CardTitle className="flex justify-between items-center text-blue-800">
              <span>Questions</span>
              <Button
                  onClick={addQuestion}
                  size="sm"
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Question
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              {questions.map((question, index) => (
                  <div key={index} className="p-4 border border-blue-100 rounded-lg space-y-4 bg-blue-50/30">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`q-number-${index}`} className="text-blue-700">
                          Question Number
                        </Label>
                        <Input
                            id={`q-number-${index}`}
                            value={question.number}
                            onChange={(e) => updateQuestion(index, "number", e.target.value)}
                            placeholder="e.g., 1"
                            className="border-blue-200 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`q-marks-${index}`} className="text-blue-700">
                          Marks
                        </Label>
                        <Input
                            id={`q-marks-${index}`}
                            type="number"
                            value={question.marks || ""}
                            onChange={(e) => updateQuestion(index, "marks", e.target.value)}
                            placeholder="e.g., 5"
                            className="border-blue-200 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`q-co-${index}`} className="text-blue-700">
                          Mapped CO
                        </Label>
                        <Select value={question.co} onValueChange={(value) => updateQuestion(index, "co", value)}>
                          <SelectTrigger id={`q-co-${index}`} className="border-blue-200 focus:border-blue-500">
                            <SelectValue placeholder="Select CO" />
                          </SelectTrigger>
                          <SelectContent>
                            {cos
                                .filter((co) => co.code)
                                .map((co, coIndex) => (
                                    <SelectItem key={coIndex} value={co.code}>
                                      {co.code}
                                    </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeQuestion(index)}
                          disabled={questions.length <= 1}
                          className="mt-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Save className="h-4 w-4 mr-2" /> Save Exam Setup
        </Button>
      </div>
  )
}

