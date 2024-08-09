import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { DNA } from "react-loader-spinner";
import "./index.css";
const Home = () => {
  const username = Cookies.get("username");
  const projectUrl = `http://localhost:3001/projects?username=${username}`;
  const taskUrl = `http://localhost:3001/tasks?username=${username}`;
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [istaskLoading, setIsTaskLoading] = useState(false);
  const [input, setInput] = useState("");
  const [switchh, switchControl] = useState(false);

  const updateInput = (e) => {
    setInput(e.target.value);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(projectUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects);
        } else {
          setError("Failed to fetch projects");
        }
      } catch (error) {
        setError("Error fetching data: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTasks = async () => {
      setIsTaskLoading(true);
      try {
        const response = await fetch(taskUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setTasks(data.tasks);
        } else {
          setError("Failed to fetch tasks");
        }
      } catch (error) {
        setError("Error fetching data: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
    fetchTasks();
  }, []); // Empty dependency array ensures this runs only on component mount

  const createTask = () => {
    switchControl(!switchh);
    setInput("");
  };

  return (
    <div className=" p-3 mb-2 bg-info-subtle text-info-emphasis home-page">
      <>
        <nav className="navbar bg-body-tertiary">
          <div className="container-fluid">
            <a className="navbar-brand" href="#">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQGmsVQFEUstMJ03140zvQoyox8yC0GmjasOq106lmoZUfKPZ6EYQnOBVu24a5XVb5s9M&usqp=CAU"
                alt="Logo"
                width="30"
                height="24"
                class="d-inline-block align-text-top"
              />
              {username} To-do's
            </a>
          </div>
        </nav>
        <h1>Projects</h1>
        {isLoading ? (
          <DNA
            visible={true}
            height="80"
            width="80"
            ariaLabel="dna-loading"
            wrapperStyle={{}}
            wrapperClass="dna-wrapper"
          />
        ) : (
          <>
            {projects.length > 0 ? (
              <ul>
                {projects.map((eachProject) => (
                  <li key={eachProject.projectId}>{eachProject.projectName}</li>
                ))}
              </ul>
            ) : (
              <p>No Projects Assigned Yet</p>
            )}
          </>
        )}

        <h1>Tasks</h1>
        <form class="row g-3">
          <div class="col-auto">
            <label for="inputPassword2" class="visually-hidden">
              Password
            </label>
            <input
              type="text"
              class="form-control"
              id="inputPassword2"
              onChange={updateInput}
              placeholder="Enter New Task"
            />
          </div>
          <div className="col-auto">
            <button
              type="button"
              onClick={createTask}
              className="btn btn-primary mb-3"
            >
              Create
            </button>
            {switchh ? <p>Creating task is in Maintainence</p> : ""}
          </div>
        </form>
        {isLoading ? (
          <DNA
            visible={true}
            height="80"
            width="80"
            ariaLabel="dna-loading"
            wrapperStyle={{}}
            wrapperClass="dna-wrapper"
          />
        ) : (
          <>
            {tasks.length > 0 ? (
              <ul>
                {tasks.map((eachtask) => (
                  <li
                    className="list-group-item list-group-item"
                    key={eachtask.taskId}
                  >
                    <ul class="list-group list-group-horizontal">
                      <li class="list-group-item">{eachtask.taskName}</li>
                      <li class="list-group-item">{eachtask.taskStatus}</li>
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No Projects Assigned Yet</p>
            )}
          </>
        )}
      </>
    </div>
  );
};

export default Home;
