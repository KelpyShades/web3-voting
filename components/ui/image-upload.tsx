'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: File
  onChange: (file: File | undefined) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  maxSize?: number // in MB
  className?: string
  error?: string
}

export function ImageUpload({
  value,
  onChange,
  onBlur,
  disabled = false,
  placeholder = 'Click to upload an image',
  maxSize = 5, // 5MB default
  className,
  error,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentFileRef = useRef<File | null>(null) // Track current file to prevent race conditions

  // Generate preview when file changes - Fixed version
  const generatePreview = useCallback((file: File) => {
    // Set current file reference
    currentFileRef.current = file

    const reader = new FileReader()
    reader.onload = () => {
      // Only update preview if this is still the current file (prevents race conditions)
      if (currentFileRef.current === file) {
        setPreview(reader.result as string)
      }
    }
    reader.onerror = () => {
      // Handle FileReader errors
      if (currentFileRef.current === file) {
        console.error('Error reading file:', file.name)
        setPreview(null)
      }
    }
    reader.readAsDataURL(file)
  }, []) // Keep empty dependency array since we're using refs

  // Handle file selection
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
          alert(`File size should not exceed ${maxSize}MB`)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          return
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file')
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          return
        }

        // Clear previous preview immediately to prevent showing wrong image
        setPreview(null)

        // Update form state first
        onChange(file)

        // Then generate new preview
        generatePreview(file)
      } else {
        // Handle case where no file is selected (e.g., dialog cancelled)
        currentFileRef.current = null
        setPreview(null)
        onChange(undefined)
      }
    },
    [onChange, maxSize, generatePreview]
  )

  // Initialize preview if value exists - Fixed version
  useEffect(() => {
    if (value && value !== currentFileRef.current) {
      generatePreview(value)
    } else if (!value) {
      currentFileRef.current = null
      setPreview(null)
    }
  }, [value, generatePreview])

  const removeImage = () => {
    currentFileRef.current = null
    onChange(undefined)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        onBlur={onBlur}
        className="hidden"
        disabled={disabled}
      />

      <div
        onClick={openFileDialog}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-3 transition-colors hover:border-gray-400',
          disabled && 'cursor-not-allowed opacity-50',
          error && 'border-red-500',
          'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
        )}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openFileDialog()
          }
        }}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-28 max-w-full rounded-lg object-contain"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2"
              onClick={(e) => {
                e.stopPropagation()
                removeImage()
              }}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="h-28 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <ImageIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium">{placeholder}</p>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, GIF up to {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
