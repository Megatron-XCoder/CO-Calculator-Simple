"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, Calculator, Award, CheckCircle2 } from "lucide-react"
import type { ExamSetup, CalculatedMarks } from "@/lib/types"
import { Progress } from "@/components/ui/progress"

interface MarksEntryFormProps {
  examSetup: ExamSetup
}

export default function MarksEntryForm({ examSetup }: MarksEntryFormProps) {
  const [questionMarks, setQuestionMarks] = useState<Record<string, number>>({})
  const [calculatedMarks, setCalculatedMarks] = useState<CalculatedMarks | null>(null)
  const [error, setError] = useState("")

  // Initialize with zeros
  useEffect(() => {
    const initialMarks: Record<string, number> = {}
    examSetup.questions.forEach((q) => {
      initialMarks[q.number] = 0
    })
    setQuestionMarks(initialMarks)
  }, [examSetup.questions])

  const handleMarkChange = (questionNumber: string, value: string) => {
    const numValue = value === "" ? 0 : Number(value)
    const question = examSetup.questions.find((q) => q.number === questionNumber)

    if (question && numValue > question.marks) {
      setError(`Marks cannot exceed maximum marks (${question.marks}) for question ${questionNumber}`)
      return
    }

    setQuestionMarks((prev) => ({
      ...prev,
      [questionNumber]: numValue,
    }))

    setError("")
    // Clear calculated marks when input changes
    setCalculatedMarks(null)
  }

  const calculateMarks = () => {
    // Calculate CO-wise marks
    const coMarks: Record<string, number> = {}
    examSetup.cos.forEach((co) => {
      coMarks[co.code] = 0
    })

    examSetup.questions.forEach((question) => {
      const mark = questionMarks[question.number] || 0
      coMarks[question.co] = (coMarks[question.co] || 0) + mark
    })

    // Calculate total marks
    const totalMarks = Object.values(coMarks).reduce((sum, mark) => sum + mark, 0)

    setCalculatedMarks({
      questionMarks: { ...questionMarks },
      coMarks,
      totalMarks,
    })
  }

  const resetForm = () => {
    // Reset to zeros
    const initialMarks: Record<string, number> = {}
    examSetup.questions.forEach((q) => {
      initialMarks[q.number] = 0
    })
    setQuestionMarks(initialMarks)
    setCalculatedMarks(null)
    setError("")
  }

  return (
      <div className="space-y-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">{examSetup.name}</h2>
          <p className="text-blue-600">Total Marks: {examSetup.totalMarks}</p>
        </div>

        {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-blue-800">Enter Marks</CardTitle>
              <CardDescription>Enter the marks obtained for each question</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {examSetup.questions
                    .sort((a, b) => {
                      // Sort by question number (convert to number if possible)
                      const numA = Number.parseInt(a.number)
                      const numB = Number.parseInt(b.number)
                      return isNaN(numA) || isNaN(numB) ? a.number.localeCompare(b.number) : numA - numB
                    })
                    .map((question) => (
                        <div key={question.number} className="space-y-2">
                          <Label htmlFor={`q-${question.number}`} className="text-blue-700 flex justify-between">
                      <span>
                        Q{question.number} <span className="text-blue-400">({question.co})</span>
                      </span>
                            <span className="text-blue-500">{question.marks} marks</span>
                          </Label>
                          <Input
                              id={`q-${question.number}`}
                              type="number"
                              min="0"
                              max={question.marks}
                              value={questionMarks[question.number] || ""}
                              onChange={(e) => handleMarkChange(question.number, e.target.value)}
                              placeholder={`0-${question.marks}`}
                              className="border-blue-200 focus:border-blue-500"
                          />
                        </div>
                    ))}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                    onClick={calculateMarks}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Calculator className="h-4 w-4 mr-2" /> Calculate Marks
                </Button>
                <Button
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {calculatedMarks ? (
              <Card className="border-blue-200 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Results
                  </CardTitle>
                  <CardDescription className="text-blue-100">Marks obtained in the exam</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-blue-800">
                      {calculatedMarks.totalMarks} / {examSetup.totalMarks}
                    </h3>
                    <p className="text-blue-600">Total Marks</p>
                    <Progress value={(calculatedMarks.totalMarks / examSetup.totalMarks) * 100} className="h-2 mt-2" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      CO-wise Performance
                    </h3>
                    <Table>
                      <TableHeader className="bg-blue-50">
                        <TableRow>
                          <TableHead className="text-blue-700">Course Outcome</TableHead>
                          <TableHead className="text-blue-700 text-right">Marks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(calculatedMarks.coMarks).map(([co, marks]) => {
                          // Calculate total possible marks for this CO
                          const totalPossibleMarks = examSetup.questions
                              .filter((q) => q.co === co)
                              .reduce((sum, q) => sum + q.marks, 0)

                          return (
                              <TableRow key={co}>
                                <TableCell className="font-medium">{co}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex flex-col">
                              <span>
                                {marks} / {totalPossibleMarks}
                              </span>
                                    <Progress value={(marks / totalPossibleMarks) * 100} className="h-1 mt-1" />
                                  </div>
                                </TableCell>
                              </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Question-wise Marks
                    </h3>
                    <Table>
                      <TableHeader className="bg-blue-50">
                        <TableRow>
                          <TableHead className="text-blue-700">Question</TableHead>
                          <TableHead className="text-blue-700">CO</TableHead>
                          <TableHead className="text-blue-700 text-right">Marks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {examSetup.questions.map((question) => (
                            <TableRow key={question.number}>
                              <TableCell className="font-medium">Q{question.number}</TableCell>
                              <TableCell>{question.co}</TableCell>
                              <TableCell className="text-right">
                                {calculatedMarks.questionMarks[question.number]} / {question.marks}
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
          ) : (
              <Card className="border-blue-200 shadow-sm flex items-center justify-center">
                <CardContent className="p-8 text-center text-blue-500">
                  <Award className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">Results will appear here after calculation</p>
                </CardContent>
              </Card>
          )}
        </div>
      </div>
  )
}

