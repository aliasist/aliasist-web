import React, { useState } from 'react'
import { Upload, Download, Loader2 } from 'lucide-react'
import { processImage } from './lib/image-processor'

// Dynamic imports for heavy libraries (PDF + Office) to reduce initial bundle size
let processPdf: any
let processOffice: any

interface CleanedFile {
  id: string
  originalName: string
  cleanedBlob: Blob
  removedCount?: number
  verifiedClean?: boolean
}

function App() {
  const [cleanedFiles, setCleanedFiles] = useState<CleanedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragCounter, setDragCounter] = useState(0) // better drag detection

  const isActuallyDragging = dragCounter > 0

  // Keyboard support: Escape clears results
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && cleanedFiles.length > 0) {
        setCleanedFiles([])
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [cleanedFiles.length])

  const processFiles = async (fileList: FileList | File[]) => {
    setIsProcessing(true)
    const newCleaned: CleanedFile[] = []

    for (const file of Array.from(fileList)) {
      try {
        let result: any

        if (file.type.startsWith('image/')) {
          result = await processImage(file)
        } else if (file.type === 'application/pdf') {
          if (!processPdf) {
            const mod = await import('./lib/pdf-processor')
            processPdf = mod.processPdf
          }
          result = await processPdf(file)
        } else if (
          file.name.endsWith('.docx') ||
          file.name.endsWith('.pptx') ||
          file.name.endsWith('.xlsx')
        ) {
          if (!processOffice) {
            const mod = await import('./lib/office-processor')
            processOffice = mod.processOffice
          }
          result = await processOffice(file)
        } else {
          continue
        }

        newCleaned.push({
          id: crypto.randomUUID(),
          originalName: file.name,
          cleanedBlob: result.cleanedBlob,
          removedCount: result.removedCount,
          verifiedClean: result.verifiedClean,
        })
      } catch (err) {
        console.error('Failed to process', file.name)
      }
    }

    setCleanedFiles(prev => [...newCleaned, ...prev])
    setIsProcessing(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragCounter(0)
    processFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragCounter(prev => prev + 1)
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragCounter(prev => prev + 1)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragCounter(prev => Math.max(0, prev - 1))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files)
    e.target.value = ''
  }

  const downloadFile = (file: CleanedFile) => {
    const url = URL.createObjectURL(file.cleanedBlob)
    const a = document.createElement('a')
    a.href = url
    const ext = file.originalName.includes('.')
      ? file.originalName.substring(file.originalName.lastIndexOf('.'))
      : ''
    a.download = file.originalName.replace(ext, `-clean${ext}`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        {/* Minimal Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold tracking-tight">Clearasist</h1>
          <p className="text-muted-foreground mt-1 text-sm">A meta-data cleaner by Aliasist</p>
        </div>

        {/* The Upload Box */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input')?.click()}
          className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all duration-200 ${
            isActuallyDragging
              ? 'border-electric bg-electric/10 scale-[1.01] shadow-lg shadow-electric/10'
              : 'border-border hover:border-electric/40'
          }`}
        >
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*,.pdf,.docx,.pptx,.xlsx"
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="mx-auto w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-5">
            {isProcessing ? (
              <Loader2 className="w-7 h-7 text-electric animate-spin" />
            ) : (
              <Upload className="w-7 h-7 text-muted-foreground" />
            )}
          </div>
          <p className="text-xl font-medium mb-2">
            {isProcessing
              ? 'Cleaning files...'
              : isActuallyDragging
                ? 'Drop to clean'
                : 'Drop files here'}
          </p>
          <p className="text-muted-foreground">
            {isProcessing ? 'This only takes a second' : 'or click to select'}
          </p>


        </div>

        {/* Cleaned Files - Clean & Nice */}
        {cleanedFiles.length > 0 && (
          <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between px-1">
              <div className="text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground">
                {cleanedFiles.length} file{cleanedFiles.length > 1 ? 's' : ''} cleaned
              </div>
              <button
                onClick={() => setCleanedFiles([])}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            </div>

            {cleanedFiles.map((file, index) => (
              <div
                key={file.id}
                onClick={() => downloadFile(file)}
                className="group bg-card border border-border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all hover:border-electric/40 hover:shadow-md active:scale-[0.985] opacity-0 animate-[fadeIn_0.2s_ease_forwards]"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div>
                  <div className="font-medium text-sm pr-4 group-hover:text-electric transition-colors">
                    {file.originalName}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Cleaned
                  </div>
                </div>
                <div className="flex items-center gap-2 text-electric group-hover:text-white transition-colors">
                  <Download size={18} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
