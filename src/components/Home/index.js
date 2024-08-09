import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const Home = () => {
  const url = "http://localhost:3001/projects";
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        console.log(Cookies.get("jwt_token"));
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${Cookies.get("jwt_token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        } else {
          setError("Failed to fetch projects");
        }
      } catch (error) {
        setError("Error fetching data: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []); // Empty dependency array ensures this runs only on component mount

  return (
    <div>
      {isLoading ? (
        <p>Loading projects...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <>
          <h1>Home Page</h1>
          {/* Render projects here */}
          {projects.map((project) => (
            <p key={project.id}>{project.projectName}</p>
          ))}
        </>
      )}
    </div>
  );
};

export default Home;
