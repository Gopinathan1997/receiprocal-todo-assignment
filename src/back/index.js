const express = require("express");
const sqlite3 = require("sqlite3");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");
const { open } = require("sqlite");

const app = express();
const dbPath = path.join(__dirname, "database.db");

app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000" }));

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        userId INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'member'))
      )
    `);

    // Insert sample users
    const sampleUsers = [
      { username: "Virat", password: "Kohli", role: "admin" },
      { username: "Sachin", password: "tendulkar", role: "member" },
      { username: "virendar", password: "sehwag", role: "member" },
    ];

    for (const user of sampleUsers) {
      const { username, password, role } = user;
      const hashedPassword = await bcrypt.hash(password, 10);
      try {
        await db.run(
          "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
          [username, hashedPassword, role]
        );
        console.log(`Sample user ${username} added successfully.`);
      } catch (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          console.log(`Sample user ${username} already exists.`);
        } else {
          console.error("Error inserting sample user:", err);
        }
      }
    }

    await db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        projectId INTEGER PRIMARY KEY AUTOINCREMENT,
        projectName TEXT NOT NULL
      )
    `);

    const sampleProjects = [
      { projectName: "E-commerce App" },
      { projectName: "To-do App" },
      { projectName: "Website Development" },
    ];

    for (const project of sampleProjects) {
      const { projectName } = project;
      try {
        await db.run("INSERT INTO projects (projectName) VALUES (?)", [
          projectName,
        ]);
        console.log(`Sample project ${projectName} added successfully.`);
      } catch (err) {
        console.error("Error inserting sample project:", err);
      }
    }

    // Create user_projects table
    await db.run(`
      CREATE TABLE IF NOT EXISTS user_projects (
        userProjectId INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        projectId INTEGER,
        FOREIGN KEY (userId) REFERENCES users(userId),
        FOREIGN KEY (projectId) REFERENCES projects(projectId)
      )
    `);

    const sampleUserProjects = [
      { userId: 1, projectId: 1 },
      { userId: 2, projectId: 1 },
      { userId: 3, projectId: 2 },
      { userId: 1, projectId: 3 },
      { userId: 2, projectId: 3 },
      { userId: 3, projectId: 3 },
    ];

    for (const userProject of sampleUserProjects) {
      const { userId, projectId } = userProject;
      try {
        await db.run(
          "INSERT INTO user_projects (userId, projectId) VALUES (?, ?)",
          [userId, projectId]
        );
        console.log(
          `User ${userId} assigned to project ${projectId} successfully.`
        );
      } catch (err) {
        console.error("Error inserting user-project assignment:", err);
      }
    }

    await db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        taskId INTEGER PRIMARY KEY AUTOINCREMENT,
        taskName TEXT NOT NULL,
        taskStatus TEXT NOT NULL
      )
    `);

    const sampleTasks = [
      { taskName: "Authentication Handling", taskStatus: "todo" },
      { taskName: "Create Nav-Bar", taskStatus: "completed" },
      { taskName: "Cart Page", taskStatus: "in_progress" },
      { taskName: "Home Page", taskStatus: "in_progress" },
      { taskName: "Payment Page", taskStatus: "in_progress" },
      { taskName: "Database Management", taskStatus: "todo" },
      { taskName: "Front-End Management", taskStatus: "todo" },
      { taskName: "Server Management", taskStatus: "todo" },
    ];

    for (const task of sampleTasks) {
      const { taskName, taskStatus } = task;
      try {
        await db.run("INSERT INTO tasks (taskName,taskStatus) VALUES (?,?)", [
          taskName,
          taskStatus,
        ]);
        console.log(`Sample task ${taskName} added successfully.`);
      } catch (err) {
        console.error("Error inserting sample task:", err);
      }
    }

    // Create task_projects table
    await db.run(`
      CREATE TABLE IF NOT EXISTS task_projects (
        taskProjectId INTEGER PRIMARY KEY AUTOINCREMENT,
        taskId INTEGER,
        projectId INTEGER,
        FOREIGN KEY (taskId) REFERENCES users(taskId),
        FOREIGN KEY (projectId) REFERENCES projects(projectId)
      )
    `);

    const sampleTaskProjects = [
      { taskId: 1, projectId: 1 },
      { taskId: 2, projectId: 1 },
      { taskId: 3, projectId: 1 },
      { taskId: 4, projectId: 1 },
      { taskId: 5, projectId: 1 },
      { taskId: 1, projectId: 2 },
      { taskId: 6, projectId: 2 },
      { taskId: 7, projectId: 2 },
      { taskId: 8, projectId: 3 },
      { taskId: 7, projectId: 3 },
      { taskId: 6, projectId: 3 },
    ];

    for (const taskProject of sampleTaskProjects) {
      const { taskId, projectId } = taskProject;
      try {
        await db.run(
          "INSERT INTO task_projects (taskId, projectId) VALUES (?, ?)",
          [taskId, projectId]
        );
        console.log(
          `task ${taskId} assigned to project ${projectId} successfully.`
        );
      } catch (err) {
        console.error("Error inserting task-project assignment:", err);
      }
    }

    app.listen(3001, () => {
      console.log("Server running at http://localhost:3001");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const authenticateToken = (request, response, next) => {
  let jwtToken;
  console.log(request.authHeader);

  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        next();
      }
    });
  }
};

app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  const validPassword = (password) => {
    return password.length > 7;
  };
  if (!["admin", "member"].includes(role)) {
    return res.status(400).json({ error: "Invalid role specified" });
  }

  try {
    const selectUserQuery = `SELECT * FROM users WHERE username = ?;`;
    const databaseUser = await db.get(selectUserQuery, [username]);

    if (databaseUser) {
      return res
        .status(400)

        .json("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    if (validPassword(password)) {
      await db.run(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        [username, hashedPassword, role]
      );
      res
        .status(200)

        .json("User created successfully");
    } else {
      res.status(400).json("Password is too short");
    }
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const selectUserQuery = `SELECT * FROM users WHERE username = ?;`;
    const databaseUser = await db.get(selectUserQuery, [username]);

    if (!databaseUser) {
      return res.status(400).json({ error: "Invalid Username" });
    }
    const isPasswordMatched = await bcrypt.compare(
      password,
      databaseUser.password
    );
    if (isPasswordMatched) {
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");

      return res.json({ jwtToken, message: "Login success!" });
    } else {
      return res.status(400).json({ error: "Invalid Password" });
    }
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ error: "Server error during login" });
  }
});

app.get("/projects", async (req, res) => {
  const { username } = req.query;
  console.log(username);

  try {
    // Get the user by username
    const user = await db.get("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Get projects associated with the userId
    const projects = await db.all(
      `SELECT DISTINCT projects.projectName, projects.projectId 
FROM projects
JOIN user_projects ON projects.projectId = user_projects.projectId
WHERE user_projects.userId = ?;`,
      [user.userId]
    );

    if (projects.length === 0) {
      return res.status(200).send("No projects found for this user");
    }

    res.status(200).json({ projects });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).send("Server error fetching projects");
  }
});

app.get("/tasks", async (req, res) => {
  const { username } = req.query;
  console.log(username);

  try {
    // Get the user by username
    const user = await db.get("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Get tasks associated with the userId
    const tasks = await db.all(
      `SELECT DISTINCT tasks.taskName,tasks.taskStatus,tasks.taskId
FROM tasks
JOIN task_projects ON tasks.taskId = task_projects.taskId
JOIN user_projects ON user_projects.projectId = task_projects.projectId
WHERE user_projects.userId = ?;`,
      [user.userId]
    );

    if (tasks.length === 0) {
      return res.status(200).send("No tasks found for this user");
    }

    res.status(200).json({ tasks });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).send("Server error fetching projects");
  }
});

app.get("/projects/:projectId", async (req, res) => {
  const { projectId, username } = req.query;
  console.log(username);

  try {
    // Get the user by username
    const user = await db.get("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Get projects associated with the userId
    const tasks = await db.all(
      `SELECT DISTINCT tasks.taskName,tasks.taskStatus,tasks.taskId
FROM tasks
JOIN task_projects ON tasks.taskId = task_projects.taskId 
JOIN projects ON projects.projectId = task_projects.projectId
WHERE task_projects.projectId = ?;`,
      [user.userId]
    );

    if (tasks.length === 0) {
      return res.status(200).send("No tasks found for this Project");
    }

    res.status(200).json({ projects });
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).send("Server error fetching tasks");
  }
});

app.get("/", authenticateToken, async (req, res) => {
  try {
    const { username } = req.user;

    const selectUserQuery = `SELECT * FROM users WHERE username = ?;`;
    const databaseUser = await db.get(selectUserQuery, [username]);

    const selectProjectsQuery = `
      SELECT projects.projectName
      FROM projects
      JOIN user_projects ON projects.projectId = user_projects.projectId
      WHERE user_projects.userId = ?;
    `;
    const projects = await db.all(selectProjectsQuery, [databaseUser.id]);

    return res.status(200).json(projects);
  } catch (err) {
    console.error("Error fetching projects:", err);
    return res.status(500).json({ error: "Server error fetching projects" });
  }
});

module.exports = app;
