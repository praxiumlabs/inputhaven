import nodemailer from 'nodemailer'
import { prisma } from '../lib/prisma'

interface EmailOptions {
  to: string
  subject: string
  html: string
  replyTo?: string
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
})

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Queue the email
    await prisma.emailQueue.create({
      data: {
        to: options.to,
        subject: options.subject,
        body: options.html,
        replyTo: options.replyTo
      }
    })

    // Try to send immediately
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'InputHaven <noreply@inputhaven.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo
    })

    // Mark as sent
    await prisma.emailQueue.updateMany({
      where: { to: options.to, subject: options.subject, status: 'pending' },
      data: { status: 'sent', sentAt: new Date() }
    })

    return true
  } catch (error) {
    console.error('Email send error:', error)
    
    // Mark as failed
    await prisma.emailQueue.updateMany({
      where: { to: options.to, subject: options.subject, status: 'pending' },
      data: { 
        status: 'failed', 
        attempts: { increment: 1 },
        lastError: error instanceof Error ? error.message : 'Unknown error'
      }
    })

    return false
  }
}

// Process email queue (called by cron)
export async function processEmailQueue() {
  const pending = await prisma.emailQueue.findMany({
    where: {
      status: 'pending',
      attempts: { lt: 3 },
      scheduledFor: { lte: new Date() }
    },
    take: 50
  })

  for (const email of pending) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'InputHaven <noreply@inputhaven.com>',
        to: email.to,
        subject: email.subject,
        html: email.body,
        replyTo: email.replyTo || undefined
      })

      await prisma.emailQueue.update({
        where: { id: email.id },
        data: { status: 'sent', sentAt: new Date() }
      })
    } catch (error) {
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: {
          attempts: { increment: 1 },
          lastError: error instanceof Error ? error.message : 'Unknown error'
        }
      })
    }
  }
}
