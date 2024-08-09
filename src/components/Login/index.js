import { Component } from "react";
import { Navigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import "./index.css";

class Login extends Component {
  state = { username: "", password: "", showSubmitError: false, errorMsg: "" };

  onChangeUsername = (event) => {
    this.setState({ username: event.target.value, errorMsg: "" });
  };

  onChangePassword = (event) => {
    this.setState({ password: event.target.value, errorMsg: "" });
  };

  onSubmitSuccess = (jwtToken) => {
    const { username } = this.state;
    Cookies.set("username", username);
    Cookies.set("jwt_token", jwtToken, { expires: 30 });
    this.setState({ redirectToHome: true });
  };

  onSubmitFailure = (errorMsg) => {
    this.setState({ errorMsg, showSubmitError: true });
  };

  submitForm = async (event) => {
    event.preventDefault();
    const { username, password } = this.state;
    const userDetails = { username, password };
    const apiUrl = "http://localhost:3001/login";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userDetails),
    };
    //try {
    const response = await fetch(apiUrl, options);
    const data = await response.json();
    const jwtToken = data.jwtToken;

    if (response.ok) {
      this.onSubmitSuccess(jwtToken);
    } else {
      this.onSubmitFailure(data.error);
    }
    /* } catch (error) {
      console.error("Error during login:", error);
      this.onSubmitFailure("An unexpected error occurred. Please try again.");
    } */
  };

  render() {
    const { username, password, showSubmitError, errorMsg, redirectToHome } =
      this.state;
    const token = Cookies.get("jwt_token");
    if (token !== undefined || redirectToHome) {
      return <Navigate to="/" />;
    }
    return (
      <div className="login-container">
        <form className="form-container" onSubmit={this.submitForm}>
          <h1>Login Form</h1>
          <div className="input-container">
            <label className="form-label" htmlFor="username">
              USERNAME
            </label>
            <input
              type="text"
              id="username"
              value={username}
              className="form-control"
              onChange={this.onChangeUsername}
              placeholder="Username"
            />
          </div>
          <div className="input-container">
            <label className="form-label" htmlFor="password">
              PASSWORD
            </label>
            <input
              type="password"
              id="password"
              value={password}
              className="form-control"
              onChange={this.onChangePassword}
              placeholder="Password"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Login
          </button>
          <Link to="/register">New User</Link>
          {showSubmitError && <p className="error-message">*{errorMsg}</p>}
        </form>
      </div>
    );
  }
}

export default Login;
