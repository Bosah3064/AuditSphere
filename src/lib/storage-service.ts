import { createClient } from './supabase/client'

/**
 * Storage Service
 * 
 * Abstracts Supabase Storage operations for handling audit evidence, 
 * PBC requests, and generated reports.
 */

export class StorageService {
  /**
   * Uploads a file to a specified bucket.
   * @param bucketName The name of the storage bucket (e.g., 'evidence', 'pbc-documents')
   * @param file The File object to upload
   * @param path Optional sub-path within the bucket
   */
  static async uploadFile(bucketName: string, file: File, path: string = '') {
    const supabase = createClient()
    
    // Generate a unique file name to prevent collisions
    const fileExtension = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExtension}`
    const fullPath = path ? `${path}/${fileName}` : fileName

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error(`[StorageService] Upload failed:`, error)
      throw error
    }

    return {
      path: data.path,
      fullUrl: supabase.storage.from(bucketName).getPublicUrl(data.path).data.publicUrl
    }
  }

  /**
   * Retrieves a signed URL for a private file.
   */
  static async getSignedUrl(bucketName: string, path: string, expiresIn: number = 3600) {
    const supabase = createClient()
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error(`[StorageService] Failed to generate signed URL:`, error)
      throw error
    }

    return data.signedUrl
  }

  /**
   * Deletes a file from storage.
   */
  static async deleteFile(bucketName: string, path: string) {
    const supabase = createClient()
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path])

    if (error) {
      console.error(`[StorageService] Failed to delete file:`, error)
      throw error
    }

    return true
  }
}
