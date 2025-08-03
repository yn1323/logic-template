import { useState } from 'react';
import {
  executeUserFocusedScenario,
  executeUserPostScenario,
  type ScenarioExecutionResult,
} from '../scenario/user-post-scenario';

type ExecutionState = 'idle' | 'running' | 'completed' | 'error';

export function ApiTester() {
  const [executionState, setExecutionState] = useState<ExecutionState>('idle');
  const [result, setResult] = useState<ScenarioExecutionResult | null>(null);
  const [focusedUserId, setFocusedUserId] = useState<string>('1');

  const handleExecuteFullScenario = async () => {
    setExecutionState('running');
    setResult(null);

    try {
      const scenarioResult = await executeUserPostScenario();
      setResult(scenarioResult);
      setExecutionState(scenarioResult.success ? 'completed' : 'error');
    } catch (error) {
      const errorResult: ScenarioExecutionResult = {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: 0,
        apiCallsCount: 0,
        processedUsersCount: 0,
        processedPostsCount: 0,
        processedCommentsCount: 0,
      };
      setResult(errorResult);
      setExecutionState('error');
    }
  };

  const handleExecuteFocusedScenario = async () => {
    const userId = Number.parseInt(focusedUserId, 10);
    if (Number.isNaN(userId) || userId <= 0) {
      alert('Please enter a valid user ID (positive number)');
      return;
    }

    setExecutionState('running');
    setResult(null);

    try {
      const scenarioResult = await executeUserFocusedScenario(userId);
      setResult(scenarioResult);
      setExecutionState(scenarioResult.success ? 'completed' : 'error');
    } catch (error) {
      const errorResult: ScenarioExecutionResult = {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: 0,
        apiCallsCount: 0,
        processedUsersCount: 0,
        processedPostsCount: 0,
        processedCommentsCount: 0,
      };
      setResult(errorResult);
      setExecutionState('error');
    }
  };

  const getStatusColor = () => {
    switch (executionState) {
      case 'running':
        return '#2563eb'; // blue
      case 'completed':
        return '#16a34a'; // green
      case 'error':
        return '#dc2626'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusText = () => {
    switch (executionState) {
      case 'running':
        return 'Executing...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return 'Ready';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>API Validation PoC</h1>
      <p>複数API呼び出し後の値の結合・処理検証用システム</p>

      <div style={{ marginBottom: '20px' }}>
        <h2>Execution Controls</h2>

        <div style={{ marginBottom: '15px' }}>
          <button
            onClick={handleExecuteFullScenario}
            disabled={executionState === 'running'}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor:
                executionState === 'running' ? '#d1d5db' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: executionState === 'running' ? 'not-allowed' : 'pointer',
              marginRight: '10px',
            }}
          >
            {executionState === 'running'
              ? 'Running...'
              : 'Execute Full Scenario'}
          </button>

          <span>全ユーザー・投稿・コメントを取得して結合処理を実行</span>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <input
            type="number"
            value={focusedUserId}
            onChange={(e) => setFocusedUserId(e.target.value)}
            placeholder="User ID"
            min="1"
            style={{
              padding: '8px',
              marginRight: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '3px',
              width: '80px',
            }}
          />

          <button
            onClick={handleExecuteFocusedScenario}
            disabled={executionState === 'running'}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor:
                executionState === 'running' ? '#d1d5db' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: executionState === 'running' ? 'not-allowed' : 'pointer',
              marginRight: '10px',
            }}
          >
            {executionState === 'running'
              ? 'Running...'
              : 'Execute Focused Scenario'}
          </button>

          <span>特定ユーザーに絞った結合処理を実行</span>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Execution Status</h2>
        <div
          style={{
            padding: '10px',
            backgroundColor: '#f3f4f6',
            border: `2px solid ${getStatusColor()}`,
            borderRadius: '5px',
            display: 'inline-block',
          }}
        >
          <strong style={{ color: getStatusColor() }}>{getStatusText()}</strong>
          {result && (
            <span style={{ marginLeft: '10px' }}>
              ({result.executionTime}ms, {result.apiCallsCount} API calls)
            </span>
          )}
        </div>
      </div>

      {result && (
        <div>
          <h2>Execution Results</h2>

          {result.success && result.data && (
            <div style={{ marginBottom: '20px' }}>
              <h3>Summary</h3>
              <ul>
                <li>Users processed: {result.processedUsersCount}</li>
                <li>Posts processed: {result.processedPostsCount}</li>
                <li>Comments processed: {result.processedCommentsCount}</li>
                <li>Execution time: {result.executionTime}ms</li>
                <li>API calls made: {result.apiCallsCount}</li>
                <li>Combined data entries: {result.data.length}</li>
              </ul>
            </div>
          )}

          {!result.success && result.error && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#dc2626' }}>Error</h3>
              <p style={{ color: '#dc2626' }}>{result.error}</p>
            </div>
          )}

          <h3>Raw Result Data</h3>
          <pre
            style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '5px',
              padding: '15px',
              overflow: 'auto',
              maxHeight: '500px',
              fontSize: '12px',
              lineHeight: '1.4',
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
