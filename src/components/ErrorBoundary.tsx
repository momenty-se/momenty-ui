"use client";

/**
 * Felgränsen — @momenty/ui.
 *
 * Fångar ett renderingsfel i en del av sidan så att resten står kvar. En
 * klasskomponent, eftersom `getDerivedStateFromError` och `componentDidCatch`
 * inte har någon hook-motsvarighet — det är React som kräver formen, inte ett
 * val här.
 *
 * LOGGNINGEN ÄR EN PROP, INTE EN IMPORT. Originalet i momenty-flow anropade
 * appens egen `logError` direkt, vilket band komponenten till en modul som
 * bara finns där. `onError` gör att varje app skickar felet dit den skickar
 * sina andra fel — Sentry, en egen endpoint, eller ingenstans.
 *
 * Utan `onError` sväljs felet tyst, och det är avsiktligt: en felgräns vars
 * enda uppgift blev att krascha på sitt eget loggförsök är värre än ingen
 * felgräns alls.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Visas i stället för barnen när något gått sönder. */
  fallback?: ReactNode;
  /** Namnger delen i loggen, så att felet går att placera på sidan. */
  sectionName?: string;
  onError?: (error: Error, info: { componentStack?: string; sectionName?: string }) => void;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, {
      componentStack: info.componentStack ?? undefined,
      sectionName: this.props.sectionName,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="mo-error-boundary">
        <p className="mo-error-boundary-text">
          Den här delen kom inte fram. Det är vårt fel — resten av sidan
          fungerar, och ingenting du sparat har påverkats.
        </p>
        <button type="button" onClick={this.handleReset} className="mo-error-boundary-retry">
          Försök igen
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
