import "./index.css";
import { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { ProgressBar } from "react-loader-spinner";

const Manage = () => {
  const [input, setInput] = useState("");
  const projectUrl = `http://localhost:3001/allprojects`;
  const taskUrl = `http://localhost:3001/alltasks`;
  const [projects, setAllProjects] = useState([]);
  const [projectId, setProjectId] = useState("1");
  const [tasks, setAllTasks] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [istaskLoading, setIsTaskLoading] = useState(false);

  const updateInput = (e) => {
    setInput(e.target.value);
    setError("");
  };

  useEffect(() => {
    const fetchAllProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(projectUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          setAllProjects(data.allprojects);
        } else {
          setError("Failed to fetch projects");
        }
      } catch (error) {
        setError("Error fetching data: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAllTasks = async () => {
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
          setAllTasks(data.allTasks);
        } else {
          setError("Failed to fetch tasks");
          setIsTaskLoading(false);
        }
      } catch (error) {
        setError("Error fetching data: " + error.message);
      } finally {
        setIsTaskLoading(false);
      }
    };

    fetchAllProjects();
    fetchAllTasks();
  }, []);

  const createTask = async () => {
    const url = "http://localhost:3001/newtask"; // Ensure this matches your actual API endpoint
    const newTask = {
      input, // Make sure `input` contains the task name
      projectId, // Ensure `projectId` is set correctly
    };

    try {
      if (input.length === 0) {
        setError("Task Name should not be Empty");
      }
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Task created successfully:", result);
        setError(result.message);
        // Update the UI or reset the form
      } else {
        const errorData = await response.json();
        console.error("Failed to create task:", errorData.error);
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }

    setInput(""); // Reset the input field if you're using a form
  };

  const updateProjectId = (e) => {
    setProjectId(e.target.value);
    console.log(e.target.value);
  };
  return (
    <div>
      <h1>Create Task</h1>
      <form className="row g-3">
        <div className="col-auto">
          {isLoading ? (
            <ProgressBar
              visible={true}
              height="80"
              width="80"
              color="#4fa94d"
              ariaLabel="progress-bar-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          ) : (
            <>
              <label>Select Project:</label>
              <select className="form-select mb-1" onChange={updateProjectId}>
                {projects.map((each) => (
                  <option key={each.projectId} value={each.projectId}>
                    {each.projectName}
                  </option>
                ))}
              </select>
            </>
          )}
          <label htmlFor="taskInput" className="visually-hidden">
            Task
          </label>
          <input
            type="text"
            className="form-control"
            id="taskInput"
            onChange={updateInput}
            value={input}
            placeholder="Enter New Task To Add"
          />
        </div>
        <div className="">
          <button
            type="button"
            onClick={createTask}
            className="btn btn-primary mb-3"
          >
            Create
          </button>
          <p className="text-success">{error}</p>
          {istaskLoading ? (
            <ProgressBar
              visible={true}
              height="80"
              width="80"
              color="#4fa94d"
              ariaLabel="progress-bar-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          ) : (
            <div>
              <h1>Delete Task</h1>
              <ul>
                {tasks.map((each) => (
                  <div className="d-flex">
                    <li className="w-25 list-style-type-none">
                      {each.taskName}
                    </li>
                    <button className="badge text-bg-secondary">
                      <MdDelete />
                    </button>
                  </div>
                ))}
              </ul>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default Manage;
