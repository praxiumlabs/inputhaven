import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { nanoid } from 'nanoid'

const s3 = new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9002',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'inputhaven',
    secretAccessKey: process.env.S3_SECRET_KEY || 'inputhaven_dev_2024'
  },
  forcePathStyle: true // Required for MinIO
})

const BUCKET = process.env.S3_BUCKET || 'inputhaven-uploads'

export async function processFileUpload(file: File): Promise<{
  storedName: string
  url: string
  size: number
  mimeType: string
}> {
  const ext = file.name.split('.').pop() || ''
  const storedName = `${nanoid()}.${ext}`
  const key = `uploads/${new Date().toISOString().split('T')[0]}/${storedName}`

  const buffer = await file.arrayBuffer()

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: file.type,
    Metadata: {
      originalName: file.name
    }
  }))

  return {
    storedName: key,
    url: `${process.env.S3_PUBLIC_URL || 'http://localhost:9002'}/${BUCKET}/${key}`,
    size: file.size,
    mimeType: file.type
  }
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key
  })

  return getSignedUrl(s3, command, { expiresIn })
}

export async function deleteFile(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key
  }))
}

export async function uploadBuffer(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
  const ext = filename.split('.').pop() || ''
  const storedName = `${nanoid()}.${ext}`
  const key = `uploads/${new Date().toISOString().split('T')[0]}/${storedName}`

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    Metadata: {
      originalName: filename
    }
  }))

  return `${process.env.S3_PUBLIC_URL || 'http://localhost:9002'}/${BUCKET}/${key}`
}
