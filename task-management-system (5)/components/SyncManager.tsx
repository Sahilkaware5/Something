"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload, Copy, Check } from "lucide-react"
import { createDataBackup, restoreFromBackup } from "@/utils/enhancedStorage"

export default function SyncManager() {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [exportedData, setExportedData] = useState("")
  const [importData, setImportData] = useState("")
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [isCopied, setIsCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("text")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const data = createDataBackup()
    setExportedData(data)
    setIsExportDialogOpen(true)
  }

  const handleImport = () => {
    setImportData("")
    setImportStatus("idle")
    setIsImportDialogOpen(true)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportedData)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const downloadAsFile = () => {
    const blob = new Blob([exportedData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tms-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importFromText = () => {
    try {
      const success = restoreFromBackup(importData)
      setImportStatus(success ? "success" : "error")

      if (success) {
        setTimeout(() => {
          setIsImportDialogOpen(false)
          window.location.reload()
        }, 1500)
      }
    } catch (error) {
      console.error("Import error:", error)
      setImportStatus("error")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setImportData(content)
    }
    reader.readAsText(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex space-x-2">
        <Button variant="outline" size="sm" onClick={handleImport} className="bg-background">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport} className="bg-background">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>Copy this data or download as a file to transfer to another device.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="file">File</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="py-4">
              <Textarea value={exportedData} readOnly className="h-[200px] font-mono text-xs" />
              <div className="mt-4 flex justify-end">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="file" className="py-4">
              <div className="flex flex-col items-center justify-center h-[200px] border rounded-md p-4">
                <p className="mb-4 text-center text-muted-foreground">
                  Download your data as a JSON file that you can import on another device.
                </p>
                <Button onClick={downloadAsFile}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Backup File
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>Paste the exported data or upload a backup file.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="file">File</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="py-4">
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste the exported data here..."
                className="h-[200px] font-mono text-xs"
              />
              <div className="mt-4 flex justify-end">
                <Button onClick={importFromText} disabled={!importData.trim() || importStatus === "success"}>
                  {importStatus === "success" ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Imported Successfully!
                    </>
                  ) : (
                    "Import Data"
                  )}
                </Button>
              </div>

              {importStatus === "error" && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>Failed to import data. Please check the format and try again.</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="file" className="py-4">
              <div className="flex flex-col items-center justify-center h-[200px] border rounded-md p-4">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

                {importData ? (
                  <div className="text-center">
                    <p className="mb-4 text-green-600">File loaded successfully!</p>
                    <Button onClick={importFromText} disabled={importStatus === "success"}>
                      {importStatus === "success" ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Imported Successfully!
                        </>
                      ) : (
                        "Import Data from File"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-4 text-muted-foreground">Select a backup file to import your data.</p>
                    <Button onClick={triggerFileInput}>
                      <Upload className="h-4 w-4 mr-2" />
                      Select Backup File
                    </Button>
                  </div>
                )}

                {importStatus === "error" && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>Failed to import data. Please check the file and try again.</AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}

