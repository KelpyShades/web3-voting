'use client'

import { createClient } from '@/utils/supabase/client'

const BUCKET_NAME = 'candidates'

/**
 * Upload candidate image to Supabase storage
 * @param file - The image file to upload
 * @param candidateId - The candidate ID to use as filename
 * @returns Promise with the public URL of the uploaded image
 */
export async function uploadCandidateImage(
  file: File,
  candidateId: number,
  sessionId?: string
): Promise<string> {
  const supabase = createClient()

  // Create a unique filename with timestamp and candidate ID to prevent collisions
  const fileExtension = file.name.split('.').pop()
  const timestamp = Date.now()
  const uniqueId = sessionId || timestamp
  const fileName = `candidate_${candidateId}_${uniqueId}.${fileExtension}`

  try {
    // Upload the file to the bucket
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false, // Don't replace files - use unique names instead
      })

    if (error) {
      console.error('Error uploading image:', error)
      throw new Error(`Failed to upload image: ${error.message}`)
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image')
    }

    return publicUrlData.publicUrl
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}

/**
 * Upload multiple candidate images
 * @param candidates - Array of candidates with their image files
 * @returns Promise with array of public URLs
 */
export async function uploadMultipleCandidateImages(
  candidates: Array<{ name: string; party: string; image: File }>
): Promise<Array<{ name: string; party: string; imageUrl: string }>> {
  const sessionId = Date.now().toString() // Unique session ID for this batch
  const results: Array<{ name: string; party: string; imageUrl: string }> = []

  // Upload sequentially to avoid race conditions and ensure correct file mapping
  for (let index = 0; index < candidates.length; index++) {
    const candidate = candidates[index]
    const candidateId = index + 1 // IDs start from 1

    console.log(
      `Uploading image for candidate ${candidateId}: ${candidate.name}`
    )
    console.log(
      `File name: ${candidate.image.name}, Size: ${candidate.image.size} bytes`
    )

    try {
      const imageUrl = await uploadCandidateImage(
        candidate.image,
        candidateId,
        sessionId
      )

      results.push({
        name: candidate.name,
        party: candidate.party,
        imageUrl,
      })

      console.log(
        `Successfully uploaded image for ${candidate.name}: ${imageUrl}`
      )
    } catch (error) {
      console.error(
        `Failed to upload image for candidate ${candidate.name}:`,
        error
      )
      throw new Error(
        `Failed to upload image for candidate ${candidate.name}: ${error}`
      )
    }
  }

  return results
}

/**
 * Delete candidate image from storage
 * @param candidatesImageUrls - The candidate image URLs
 */
export async function deleteAllCandidateImages(
  candidatesImageUrls: Array<{ imageUrl: string }>
): Promise<void> {
  const supabase = createClient()
  const fileNames = candidatesImageUrls.map((candidate) => candidate.imageUrl.split('/').pop()).filter((fileName) => fileName !== undefined)

  const { error } = await supabase.storage.from(BUCKET_NAME).remove(fileNames)

  if (error) {
    console.error('Error deleting images from storage:', error)
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}
