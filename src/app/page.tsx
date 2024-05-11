"use client";
import React, {
  useState,
  useEffect,
  ChangeEventHandler,
  MouseEventHandler,
} from "react";
import "./home.scss";
import { MagnifyingGlass } from "react-loader-spinner";
import { FaSearch, FaCloudRain } from "react-icons/fa";

import { BsClouds, BsFillSunriseFill, BsFillSunsetFill } from "react-icons/bs";
import { LiaTemperatureLowSolid } from "react-icons/lia";
import { WiHumidity } from "react-icons/wi";
import { MdOutlineVisibility, MdWindPower } from "react-icons/md";
import { TiWeatherWindy } from "react-icons/ti";
import { FaWind } from "react-icons/fa6";
import { TbFaceIdError } from "react-icons/tb";
import Image from "next/image";
import ThemeSwapper from "./ThemeSwapper";

interface Location {
  latitude: number | null;
  longitude: number | null;
}

interface Error {
  message: string;
}

interface WeatherData {
  coord: {
    lat: number;
    lon: number;
  };
  weather: [
    {
      main: string;
      description: string;
    }
  ];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level: number;
    grnd_level: number;
  };
  name: string;
  wind: {
    deg: number;
    speed: number;
  };
  visibility: number;
  clouds: {
    all: number;
  };
  sys: {
    sunrise: number;
    sunset: number;
  };
}

const getLocationAsync = () => {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

const apiKey: string = "4d502482481442794edb3e852afae396";

const Home: React.FC = () => {
  const [location, setLocation] = useState<Location>({
    latitude: null,
    longitude: null,
  });
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [inputLocation, setInputLocation] = useState<string>("");
  const [fetchData, setFetchData] = useState<WeatherData | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState("");
  let celciusTemp: number;

  const getCurrentDateTime = () => {
    const now = new Date();

    // Define day names and month names
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Get day, month, year, hours, minutes, and AM/PM
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const day = now.getDate();
    const hours = now.getHours() % 12 || 12; // Convert hours to 12-hour format
    const minutes = now.getMinutes();
    const ampm = now.getHours() < 12 ? "AM" : "PM";

    // Format day and minutes to ensure they have two digits
    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    // Construct the date and time string
    const currentDateTimeString = `${dayName}, ${monthName} ${formattedDay} ${hours}:${formattedMinutes} ${ampm}`;

    return currentDateTimeString;
  };

  const fetchWeatherdata: () => void = async () => {
    setLoading(true);
    let url;
    if (inputLocation.trim() !== "") {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${inputLocation}&appid=${apiKey}`;
    } else if (location.latitude !== null && location.longitude !== null) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}`;
    }
    if (url) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setFetchData(data);
          setError(null);
        } else {
          setError({ message: response.statusText });
        }
      } catch (error) {
        setError({ message: "An error occurred while fetching weather data." });
      } finally {
        setLoading(false);
      }
    }
  };

  // for fetching the location by default -> as soon as the app will load this will work
  const getLocation: () => void = () => {
    setLoading(true);
    getLocationAsync()
      .then((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
      })
      .catch((error) => {
        setError({ message: error.message });
        setLocation({ latitude: null, longitude: null });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleOnChangeLocation: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setInputLocation(event.target.value);
  };

  const handleInputLocation: MouseEventHandler<HTMLButtonElement> = () => {
    fetchWeatherdata();
  };

  // for automatically loading the location of the user
  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    // Fetch weather data whenever location changes
    if (location.latitude !== null || location.longitude !== null) {
      fetchWeatherdata();
    }
  }, [location]);

  // Update the current date and time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(getCurrentDateTime());
    }, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const getTemp = (temp: number | undefined) => {
    if (temp) {
      const result = temp - 273.15;
      return parseFloat(result.toFixed(2));
    }
  };

  const getWeatherDetails: () => React.JSX.Element = () => {
    const weatherDetailsArray = [
      {
        id: 1,
        title: "Clouds",
        icon: <BsClouds size={25} />,
        description: `${fetchData?.clouds.all} %`,
      },
      {
        id: 2,
        title: "Weather Type",
        icon: <TiWeatherWindy size={25} />,
        description: `${fetchData?.weather[0].main}`,
      },
      {
        id: 3,
        title: "Feels Like",
        icon: <LiaTemperatureLowSolid size={25} />,
        description: `${getTemp(fetchData?.main.feels_like)}\u00B0C`,
      },
      {
        id: 4,
        title: "Humidity",
        icon: <WiHumidity size={25} />,
        description: `${fetchData?.main.humidity} %`,
      },
      {
        id: 5,
        title: "Visibility",
        icon: <MdOutlineVisibility size={25} />,
        description: `${fetchData?.visibility} m`,
      },
      {
        id: 6,
        title: "Wind Speed",
        icon: <FaWind size={25} />,
        description: `${fetchData?.wind.speed} m/s`,
      },
      {
        id: 7,
        title: "Wind Direction",
        icon: <MdWindPower size={25} />,
        description: `${fetchData?.wind.deg}\u00B0`,
      },
    ];
    return (
      <ul className="flex justify-center flex-wrap gap-4 w-full mt-8 md:mt-20">
        {weatherDetailsArray.map((weather) => (
          <li
            key={weather.id}
            className="card p-4 w-40 flex flex-col justify-center items-center gap-3 hover:scale-105 transition-all shadow-xl"
          >
            <p>{weather.title}</p>
            <span>{weather.icon}</span>
            <p>{weather.description}</p>
          </li>
        ))}
      </ul>
    );
  };

  const getWeatherImage = (): string => {
    const temp = fetchData?.main.temp;
    const result = temp && temp - 273.15;
    if (result) {
      celciusTemp = parseFloat(result.toFixed(2));
    }
    if (fetchData?.clouds?.all && fetchData?.clouds?.all > 80) {
      return "/sun-and-cloud.png";
    } else if (celciusTemp > 30) {
      return "/sun.png";
    }
    return "/weather.svg";
  };

  return (
    <div className="flex justify-center items-center py-20 px-20">
      <div className="artboard artboard-horizontal phone-5 rounded-3xl">
        <div className="flex justify-center items-center">
          <div className="border-none outline-none flex justify-between items-center pr-0.5">
            <input
              placeholder={fetchData?.name ? fetchData.name : "Enter your city"}
              value={inputLocation}
              onChange={handleOnChangeLocation}
              className="input input-bordered"
            />
            <button
              onClick={handleInputLocation}
              className="input input-bordered max-w-xs ml-4"
            >
              <FaSearch className="font-bold text-xl text-gray-600" />
            </button>
            <ThemeSwapper />
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-center md:h-full w-full mt-8">
          {loading && (
            <div>
              <MagnifyingGlass
                visible={true}
                height="80"
                width="80"
                ariaLabel="magnifying-glass-loading"
                wrapperStyle={{}}
                wrapperClass="magnifying-glass-wrapper"
                glassColor="#c0efff"
                color="black"
              />
            </div>
          )}
          {!loading && !error && fetchData?.coord.lon && (
            <div className="">
              <div className="flex flex-col md:flex-row justify-around items-center">
                <div>
                  <p className="text-5xl md:text-7xl font-extrabold mb-4">
                    {fetchData?.name}
                  </p>
                  <p className="text-md md:text-lg font-semibold mb-4">
                    {getCurrentDateTime()}
                  </p>
                </div>
                <div className="card md:h-96 shadow-xl rounded-3xl p-4 flex flex-col items-center w-72 bg-gradient-to-r from-fuchsia-600 to-purple-600">
                  <div className="badge badge-ghost mb-8 font-semibold">
                    Today
                  </div>
                  <Image
                    className="inline-block text-center"
                    src={getWeatherImage()}
                    alt="weather"
                    height={144}
                    width={144}
                  />
                  <h1 className="font-extrabold text-4xl mt-8 text-white text-balance tracking-tight">
                    {getTemp(fetchData?.main.temp)}&deg;C
                  </h1>
                </div>
              </div>
              {getWeatherDetails()}
            </div>
          )}
          {!loading && error && (
            <div className="text-white flex justify-center items-center flex-col">
              <TbFaceIdError size={50} />
              <p>Error: {error.message}</p>
              <p>Please search another City</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
