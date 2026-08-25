import { Component } from "react";
import "./ErrorBoundary.css";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    handleReload = () => {
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h1 className="error-boundary__title">
                        Something went wrong
                    </h1>
                    <p className="error-boundary__message">
                        This part of the page failed to load. You can try again
                        or return to the listings.
                    </p>

                    {process.env.NODE_ENV === "development" &&
                        this.state.error && (
                            <pre className="error-boundary__details">
                                {this.state.error.toString()}
                            </pre>
                        )}

                    <div className="error-boundary__actions">
                        <button
                            type="button"
                            onClick={this.handleReset}
                            className="error-boundary__button error-boundary__button--primary"
                        >
                            Try Again
                        </button>
                        <button
                            type="button"
                            onClick={this.handleReload}
                            className="error-boundary__button"
                        >
                            Back to Listings
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;