"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SetupForm from "@/components/setup-form"
import MarksEntryForm from "@/components/marks-entry-form"
import type { ExamSetup } from "@/lib/types"
import { GraduationCap } from "lucide-react"

export default function Home() {
  const [examSetup, setExamSetup] = useState<ExamSetup | null>(null)
  const [activeTab, setActiveTab] = useState("setup")

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedSetup = localStorage.getItem("examSetup")
    if (savedSetup) {
      setExamSetup(JSON.parse(savedSetup))
    }
  }, [])

  // Save exam setup to localStorage
  const saveExamSetup = (setup: ExamSetup) => {
    setExamSetup(setup)
    localStorage.setItem("examSetup", JSON.stringify(setup))
    setActiveTab("entry")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-8 border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              <span>Course Outcome (CO) Marks Calculator</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 p-0 rounded-none border-b">
                <TabsTrigger value="setup" className="data-[state=active]:bg-blue-50 rounded-none py-3">
                  Exam Setup
                </TabsTrigger>
                <TabsTrigger
                  value="entry"
                  disabled={!examSetup}
                  className="data-[state=active]:bg-blue-50 rounded-none py-3"
                >
                  Marks Entry & Results
                </TabsTrigger>
              </TabsList>

              <TabsContent value="setup" className="p-6">
                <SetupForm initialSetup={examSetup} onSave={saveExamSetup} />
              </TabsContent>

              <TabsContent value="entry" className="p-6">
                {examSetup && <MarksEntryForm examSetup={examSetup} />}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

