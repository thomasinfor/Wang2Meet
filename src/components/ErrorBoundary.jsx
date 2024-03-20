import { Component, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import Linear from "@/components/Linear";

function ErrorPage({ link }) {
  console.log(link);
  return (
    <Linear style={{ height: '100vh', gap: '15px' }}>
      <Alert severity="error">This session has crashed ...</Alert>
      <Link href={link} target="_blank">
        <Button startIcon={<ReportProblemIcon/>} sx={{ textTransform: 'none' }}>
          Report an issue
        </Button>
      </Link>
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
    console.log("ErrorBoundary", error, errorInfo);
    const x = new URLSearchParams;
    x.append("entry.549361065", "ERROR LOG:\n\n" + error.stack.toString().slice(0, 1500));
    this.state.reportLink = `https://links.wang.works/w2m-feedback?${x}`;

    if (process.env.NODE_ENV === 'development')
      throw error;
  }

  render() {
    if (this.state.hasError) {
      // Render your custom error page here
      return <ErrorPage link={this.state.reportLink}/>;

    }
    // Render the children if no error occurred
    return this.props.children;
  }
}

export default ErrorBoundary;