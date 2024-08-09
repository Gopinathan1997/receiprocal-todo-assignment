import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./index.css";


function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(role);

    if (!username || !password || !role) {
      setErrMsg("All fields are required.");
      return;
    }

    if (password.length < 7) {
      setErrMsg("Password is too short");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          role,
        }),
      });

      const text = await response.text();
      setErrMsg(text);
      console.log("Raw response text:", text);
    } catch (error) {
      console.log(error);
      setErrMsg("Error Occurred");
    }
  };

  return (
    <div className="registration-container">
      <form className="form-container" onSubmit={handleSubmit}>
        <h1 className="text-center">Registration Form</h1>
        <div>
          <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label">
              Username
            </label>
            <input
              type="text"
              class="form-control"
              id="exampleFormControlInput1"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrMsg("");
              }}
            />
          </div>
        </div>
        <div>
          <label for="inputPassword5" class="form-label">
            Password
          </label>
          <input
            type="password"
            id="inputPassword5"
            class="form-control"
            aria-describedby="passwordHelpBlock"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrMsg("");
            }}
          />
          <div id="passwordHelpBlock" class="form-text">
            Your password must be 8-20 characters.
          </div>
        </div>
        <div>
          <label htmlFor="role">Role</label>
          <select
            class="form-select"
            aria-label="Default select example"
            id="role"
            onChange={(e) => {
              console.log(e.target.value);
              setRole(e.target.value);
            }}
          >
            <option value="" selected disabled>
              Select a role
            </option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        </div>
        <button className="btn btn-primary mt-2" type="submit">
          Register
        </button>
        <p>{errMsg}</p>
        <Link to="/login">Already User ?</Link>
      </form>
    </div>
  );
}

export default Register;
