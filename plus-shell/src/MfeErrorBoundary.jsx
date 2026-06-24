import { Component } from "react";

export class MfeErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Erro desconhecido ao carregar o modulo.",
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "sans-serif" }}>
          <h2>Erro ao carregar a pagina</h2>
          <p>{this.state.message}</p>
          <p style={{ color: "#666" }}>
            Verifique se o microfrontend correspondente esta rodando (auth: 4001, media: 4002).
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
