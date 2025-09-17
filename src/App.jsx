import { useEffect, useState } from "react";
import "./App.css";
import Spinner from "./components/Spinner.jsx";
import Search from "./components/Search.jsx";
import MoviesCard from "./components/MoviesCard.jsx";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

function App() {
  const [searchTerm, setSearchTem] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [TrendingMovies,setTrendingMovies]=useState([])


  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        console.log(response);
        throw new Error("Failed to fecth movies");
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.error || "Failed to fetch movies");
        setMovieList([]);
        return;
      }
      setMovieList(data.results);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.log(`Error fetching moviefdsfdsfsdfsds: ${error}`);
      setErrorMessage("Error fetching movies. Please try again later");
    } finally {
      setLoading(false);
    }
  };

 
  const loadTrendingMovies= async()=>{
    try {
       
      const movies = await getTrendingMovies();
      setTrendingMovies(movies)


    } catch (error) {
      console.error(`Error fetching movies:${error} `)
      setErrorMessage("Error fetching movies")
    }
  }


  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

    useEffect(() => {
    loadTrendingMovies()
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Witout the Hassle{" "}
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTem} />
        </header>

        {
          TrendingMovies.length > 0 && (
            <section className="trending">
                  <h2>Trending Movies</h2>
                  <ul>
                    {
                      TrendingMovies.map((movie,index)=>(
                        <li key={movie.$id}>
                          <p>{index+1} </p>
                          <img src={movie.poster_url}></img>
                        </li>
                      ))
                    }
                  </ul>
            </section>
          )
        }
    


        <section className="all-movies">
          <h2 className="mt-[40px] ">All Movies</h2>

          {isLoading ? (
            <Spinner></Spinner>
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage} </p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MoviesCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
