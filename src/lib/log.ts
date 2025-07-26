
import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';

/**
 * A centralized error logging utility.
 * In a Tauri environment, it writes a detailed error report to `tekastory-errors.log`
 * on the user's Desktop and shows a user-friendly alert.
 * In a standard browser environment, it logs the detailed report to the console and shows a simpler alert.
 * This ensures that users can provide detailed bug reports without needing to open developer tools.
 * @param error - The error object that was caught.
 * @param contextMessage - A user-friendly message describing the action that failed (e.g., "Failed to export PDF").
 */
export const logError = async (error: unknown, contextMessage: string) => {
  const timestamp = new Date().toISOString();
  // If the error is a wrapped error, get the original cause for a more useful stack trace.
  const originalError = error instanceof Error && (error as any).cause ? (error as any).cause : error;

  const logContent = `
-----------------------------------------
Timestamp: ${timestamp}
Context: ${contextMessage}
Error: ${error instanceof Error ? error.message : String(error)}
Stack: ${originalError instanceof Error ? originalError.stack : 'No stack available'}
-----------------------------------------\n\n`;

  if ((window as any).__TAURI__) {
    try {
      // In Tauri, append the error to a log file on the desktop.
      await writeTextFile('tekastory-errors.log', logContent, { dir: BaseDirectory.Desktop, append: true });
      const friendlyMessage = `An error occurred: ${contextMessage}. A detailed error log ('tekastory-errors.log') has been saved to your Desktop.

Error: ${error instanceof Error ? error.message : String(error)}`;
      alert(friendlyMessage);
    } catch (logError) {
      // Fallback if writing the log file fails.
      console.error("Failed to write error log:", logError);
      alert(`A critical error occurred, and we were unable to write to the log file. Please check console for details. Error: ${error}`);
    }
  } else {
    // In the browser, just log to console and alert the user.
    console.error(logContent);
    alert(`An error occurred: ${contextMessage}. Please check the browser console for more details. Error: ${error}`);
  }
};
