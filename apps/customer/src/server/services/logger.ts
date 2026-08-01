import { adminDb } from "../../firebase/firebase-admin.ts";
import { FieldValue } from "firebase-admin/firestore";

export type LogLevel = 'info' | 'warn' | 'error';

export const Logger = {
  async log(level: LogLevel, context: string, message: string, metadata: any = {}) {
    const timestamp = new Date().toISOString();
    
    // 1. Console log for real-time monitoring in Cloud Run logs
    const logOutput = `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
    if (level === 'error') {
      console.error(logOutput, JSON.stringify(metadata));
    } else if (level === 'warn') {
      console.warn(logOutput, JSON.stringify(metadata));
    } else {
      console.log(logOutput, JSON.stringify(metadata));
    }

    // 2. Persistent logs in Firestore (Optional - for admin dashboard later)
    try {
      await adminDb.collection("auditLogs").add({
        level,
        context,
        message,
        metadata,
        timestamp: FieldValue.serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to persist audit log", err);
    }
  },

  info(context: string, message: string, metadata?: any) {
    return this.log('info', context, message, metadata);
  },

  warn(context: string, message: string, metadata?: any) {
    return this.log('warn', context, message, metadata);
  },

  error(context: string, message: string, metadata?: any) {
    return this.log('error', context, message, metadata);
  }
};
