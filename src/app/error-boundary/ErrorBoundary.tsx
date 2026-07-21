import * as React from 'react';
import { ErrorBoundaryView } from './ErrorBoundaryView';

type Props = {
  readonly children: React.ReactNode;
  readonly onError: (error: Error) => void;
};

type State = {
  readonly error: Error | null;
};

/**
 * Note: ErrorBoundary is a class component because React does not support error boundaries in function components.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  readonly state: State = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      error,
    };
  }

  readonly componentDidCatch = (error: Error, _info: React.ErrorInfo) => {
    if (this.props.onError != null) {
      this.props.onError(error);
    }
  };

  readonly resetError = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error != null) {
      return <ErrorBoundaryView error={this.state.error} onReset={this.resetError} />;
    }

    return this.props.children;
  }
}
