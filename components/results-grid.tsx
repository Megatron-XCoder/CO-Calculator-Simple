"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Download } from "lucide-react"
import type { ExamSetup, StudentRecord } from "@/lib/types"

interface ResultsGridProps {
  examSetup: ExamSetup
  studentRecords: StudentRecord[]
  onDelete: (id: string) => void
}

export default function ResultsGrid({ examSetup, studentRecords, onDelete }: ResultsGridProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Since we no longer have UIDs, we'll just show all records
  const filteredRecords = studentRecords

  const exportToCSV = () => {
    if (studentRecords.length === 0) {
      alert("No records to export")
      return
    }

    let csv = "Record ID,"

    // Add question headers
    examSetup.questions.forEach((question) => {
      csv += `Q${question.number} (${question.co}),`
    })

    // Add CO headers
    examSetup.cos.forEach((co) => {
      csv += `${co.code},`
    })

    csv += "Total\n"

    // Add data rows
    studentRecords.forEach((record) => {
      csv += `${record.id},`

      // Question marks
      examSetup.questions.forEach((question) => {
        csv += `${record.marks[question.number] || 0},`
      })

      // CO marks
      examSetup.cos.forEach((co) => {
        csv += `${record.coMarks[co.code] || 0},`
      })

      // Total
      csv += `${record.totalMarks}\n`
    })

    // Create download link
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute("download", `${examSetup.name}_results.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Results</h2>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" /> Export to CSV
        </Button>
      </div>

      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No records found. Add records in the Marks Entry tab.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Record #</TableHead>
                {examSetup.questions.map((question) => (
                  <TableHead key={question.number}>
                    Q{question.number} ({question.co})
                  </TableHead>
                ))}
                {examSetup.cos.map((co) => (
                  <TableHead key={co.code}>{co.code}</TableHead>
                ))}
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record, index) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>

                  {/* Question marks */}
                  {examSetup.questions.map((question) => (
                    <TableCell key={question.number}>{record.marks[question.number] || 0}</TableCell>
                  ))}

                  {/* CO marks */}
                  {examSetup.cos.map((co) => (
                    <TableCell key={co.code}>{record.coMarks[co.code] || 0}</TableCell>
                  ))}

                  <TableCell>{record.totalMarks}</TableCell>

                  <TableCell>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this record?")) {
                          onDelete(record.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

