"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, Table, Share2 } from "lucide-react"

export function ExportButtons() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Export Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <FileText className="h-5 w-5" />
            <span>PDF Report</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Table className="h-5 w-5" />
            <span>CSV Data</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Download className="h-5 w-5" />
            <span>Full Export</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Share2 className="h-5 w-5" />
            <span>Share Link</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
