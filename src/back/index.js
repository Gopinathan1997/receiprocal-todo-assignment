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
        projectName TEXT NOT NULL UNIQUE
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
        FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE ,
        FOREIGN KEY (projectId) REFERENCES projects(projectId) ON DELETE CASCADE 
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
        taskName TEXT NOT NULL UNIQUE,
        taskStatus TEXT NOT NULL
      )
    `);

    const sampleTasks = [
      { taskName: "Authentication Handling", taskStatus: "Todo" },
      { taskName: "Create Nav-Bar", taskStatus: "Completed" },
      { taskName: "Cart Page", taskStatus: "In Progress" },
      { taskName: "Home Page", taskStatus: "In Progress" },
      { taskName: "Payment Page", taskStatus: "In Progress" },
      { taskName: "Database Management", taskStatus: "Todo" },
      { taskName: "Front-End Management", taskStatus: "Todo" },
      { taskName: "Server Management", taskStatus: "Todo" },
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

    // Create user_tasks table
    await db.run(`
      CREATE TABLE IF NOT EXISTS user_tasks (
        userTaskId INTEGER PRIMARY KEY AUTOINCREMENT,
        taskId INTEGER,
        userId INTEGER,
        FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE ,
        FOREIGN KEY (taskId) REFERENCES tasks(taskId) ON DELETE CASCADE 
      )
    `);

    // Create task_projects table
    await db.run(`
      CREATE TABLE IF NOT EXISTS task_projects (
        taskProjectId INTEGER PRIMARY KEY AUTOINCREMENT,
        taskId INTEGER,
        projectId INTEGER,
        FOREIGN KEY (taskId) REFERENCES users(taskId) ON DELETE CASCADE ,
        FOREIGN KEY (projectId) REFERENCES projects(projectId) ON DELETE CASCADE 
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
      const payload = { username: username, role: databaseUser.role };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");

      return res.json({
        jwtToken,
        role: databaseUser.role,
        message: "Login success!",
      });
    } else {
      return res.status(400).json({ error: "Invalid Password" });
    }
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ error: "Server error during login" });
  }
});

app.get("/allprojects", authenticateToken, async (req, res) => {
  try {
    // Get projects associated with the userId
    const allprojects = await db.all(
      `SELECT distinct * 
FROM projects`
    );

    if (allprojects.length === 0) {
      return res.status(200).send("No projects found ");
    }

    res.status(200).json({ allprojects });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).send("Server error fetching projects");
  }
});

app.get("/projects", authenticateToken, async (req, res) => {
  const { username } = req.query;

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

app.get("/alltasks", authenticateToken, async (req, res) => {
  try {
    // Get projects associated with the userId
    const allTasks = await db.all(
      `SELECT  * 
FROM tasks`
    );

    if (allTasks.length === 0) {
      return res.status(200).send("No Tasks found ");
    }

    res.status(200).json({ allTasks });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).send("Server error fetching projects");
  }
});

app.get("/tasks", async (req, res) => {
  const { username } = req.query;

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

app.post("/newtask", async (req, res) => {
  // Assuming taskName and projectId are directly in req.body
  const { input, projectId } = req.body;

  try {
    // Use placeholders to avoid SQL injection
    const result = await db.run(
      "INSERT INTO tasks (taskName, taskStatus) VALUES (?, 'Todo')",
      [input]
    );
    const taskId = result.lastID;
    console.log(`Task created with ID: ${taskId}`);

    // Insert the taskId and projectId into the task_projects table
    await db.run(
      "INSERT INTO task_projects (taskId, projectId) VALUES (?, ?)",
      [taskId, projectId]
    );

    // Fetch all users to assign the task randomly
    const users = await db.all("SELECT * FROM users");
    if (users.length === 0) {
      throw new Error("No users available to assign the task");
    }

    // Select a random user and assign the task
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const userId = randomUser.userId;
    await db.run("INSERT INTO user_tasks (taskId, userId) VALUES (?, ?)", [
      taskId,
      userId,
    ]);

    res.status(201).json({ message: "Task created successfully" });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT") {
      console.log(err);
      res.status(400).json({ error: "Task name must be unique" });
    } else {
      console.error("Error creating task:", err);
      res.status(500).json({ error: "An error occurred" });
    }
  }
});

module.exports = app;
