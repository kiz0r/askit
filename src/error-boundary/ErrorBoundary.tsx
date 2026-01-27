import React from 'react';
import { ErrorBoundaryUi } from './ErrorBoundaryUi';

type Props = {
  readonly children: React.ReactNode;
  readonly onError: (error: Error) => void;
};

type State = {
  readonly error?: Error;
};

export class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return {
      error,
    };
  }

  state: State = {};

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.error != null) {
      return <ErrorBoundaryUi error={this.state.error} />;
    }

    return this.props.children;
  }
}
