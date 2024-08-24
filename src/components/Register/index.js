import { Component } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./index.css";

class Register extends Component {
  state = { username: "", password: "", showSubmitError: false, errorMsg: "" };

  onChangeUsername = (event) => {
    this.setState({ username: event.target.value });
  };

  onChangePassword = (event) => {
    this.setState({ password: event.target.value });
  };

  onSubmitSuccess = (jwtToken) => {
    const { history } = this.props;
    Cookies.set("jwt_token", jwtToken, {
      expires: 30,
    });
    history.replace("/");
  };

  onSubmitFailure = (errorMsg) => {
    this.setState({ errorMsg, showSubmitError: true });
  };

  submitForm = async (event) => {
    event.preventDefault();
    // Submit form logic
  };

  render() {
    const { username, password, showSubmitError, errorMsg } = this.state;
    const token = Cookies.get("jwt_token");
    if (token !== undefined) {
      return <Navigate to="/" />;
    }
    return (
      <div className="login-container">
        <form className="form-container" onSubmit={this.submitForm}>
          <h1>Register Form</h1>
          <div className="input-container">
            <label className="input-label" htmlFor="username">
              USERNAME
            </label>
            <input
              type="text"
              id="username"
              value={username}
              className="username-input-field"
              onChange={this.onChangeUsername}
              placeholder="Username"
            />
          </div>
          <div className="input-container">
            <label className="input-label" htmlFor="password">
              PASSWORD
            </label>
            <input
              type="password"
              id="password"
              value={password}
              className="password-input-field"
              onChange={this.onChangePassword}
              placeholder="Password"
            />
          </div>
          <label htmlFor="role">Role</label>
          <select id="role" name="role">
            <option value="admin">Admin</option>
            <option selected value="member">
              Member
            </option>
          </select>
          <button type="submit" className="login-button">
            Register
          </button>
          {showSubmitError && <p className="error-message">*{errorMsg}</p>}
        </form>
      </div>
    );
  }
}

export default Register;
