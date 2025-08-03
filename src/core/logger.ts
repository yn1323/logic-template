type LogLevel = 'info' | 'warn' | 'error' | 'debug';

type LogEntry = {
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: unknown;
  executionTime?: number;
};

type ExecutionSummary = {
  totalExecutionTime: number;
  apiCallCount: number;
  successCount: number;
  errorCount: number;
  apiCalls: {
    url: string;
    executionTime: number;
    status: 'success' | 'error';
    statusCode?: number;
  }[];
};

class Logger {
  private logs: LogEntry[] = [];
  private executionSummary: ExecutionSummary = {
    totalExecutionTime: 0,
    apiCallCount: 0,
    successCount: 0,
    errorCount: 0,
    apiCalls: [],
  };

  private log(
    level: LogLevel,
    message: string,
    data?: unknown,
    executionTime?: number,
  ): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data,
      executionTime,
    };

    this.logs.push(entry);

    // Console output with formatting
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (executionTime !== undefined) {
      console.log(
        `${prefix} ${message} (${executionTime.toFixed(2)}ms)`,
        data || '',
      );
    } else {
      console.log(`${prefix} ${message}`, data || '');
    }
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  // Record execution time for operations
  logExecutionTime(
    operation: string,
    executionTime: number,
    data?: unknown,
  ): void {
    this.log('info', `${operation} completed`, data, executionTime);
  }

  // Log data before and after processing
  logDataTransformation(
    operation: string,
    beforeData: unknown,
    afterData: unknown,
  ): void {
    this.info(`${operation} - Before processing:`, beforeData);
    this.info(`${operation} - After processing:`, afterData);
  }

  // Record API call results for summary
  recordApiCall(
    url: string,
    executionTime: number,
    success: boolean,
    statusCode?: number,
  ): void {
    this.executionSummary.apiCallCount++;
    this.executionSummary.totalExecutionTime += executionTime;

    if (success) {
      this.executionSummary.successCount++;
    } else {
      this.executionSummary.errorCount++;
    }

    this.executionSummary.apiCalls.push({
      url,
      executionTime,
      status: success ? 'success' : 'error',
      statusCode,
    });
  }

  // Get execution summary
  getExecutionSummary(): ExecutionSummary {
    return { ...this.executionSummary };
  }

  // Print execution summary
  printExecutionSummary(): void {
    const summary = this.getExecutionSummary();

    console.log('\n=== Execution Summary ===');
    console.log(
      `Total Execution Time: ${summary.totalExecutionTime.toFixed(2)}ms`,
    );
    console.log(`API Calls: ${summary.apiCallCount}`);
    console.log(`Success: ${summary.successCount}`);
    console.log(`Errors: ${summary.errorCount}`);

    if (summary.apiCalls.length > 0) {
      console.log('\nAPI Call Details:');
      summary.apiCalls.forEach((call, index) => {
        const status = call.status === 'success' ? '✓' : '✗';
        const statusCode = call.statusCode ? ` (${call.statusCode})` : '';
        console.log(
          `  ${index + 1}. ${status} ${call.url}${statusCode} - ${call.executionTime.toFixed(2)}ms`,
        );
      });
    }
    console.log('========================\n');
  }

  // Reset logger state
  reset(): void {
    this.logs = [];
    this.executionSummary = {
      totalExecutionTime: 0,
      apiCallCount: 0,
      successCount: 0,
      errorCount: 0,
      apiCalls: [],
    };
  }

  // Get all logs
  getLogs(): LogEntry[] {
    return [...this.logs];
  }
}

// Create singleton instance
const logger = new Logger();

export { logger };
export type { ExecutionSummary, LogEntry, LogLevel };
