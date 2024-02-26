import { Component, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Linear from "@/components/Linear";

function ErrorPage() {
  return (
    <Linear style={{ height: '100vh' }}>
      <Alert severity="error">This session has crashed ...</Alert>
    </Linear>
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    // Update state to indicate an error has occurred
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error here or send it to a logging service
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render your custom error page here
      return <ErrorPage />;

    }
    // Render the children if no error occurred
    return this.props.children;
  }
}

export default ErrorBoundary;