const GetAllUsers = `SELECT users.username
FROM users
JOIN user_projects ON users.userId = user_projects.userId
WHERE user_projects.projectId = 1;`;

const GetAllProjects = `
SELECT projects.projectName
FROM projects
JOIN user_projects ON projects.projectId = user_projects.projectId
WHERE user_projects.userId = 2;
`;
