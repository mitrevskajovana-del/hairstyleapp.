import { useEffect, useState } from "react";
import API from "./api";

import Login from "./Login";
import Register from "./Register";
import MyAppointments from "./MyAppointments";
import AdminDashboard from "./AdminDashboard";
import Reviews from "./Reviews";
import Search from "./Search";
import WeatherAdvice from "./WeatherAdvice";

import {
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { motion } from "framer-motion";

import "./App.css";

function formatDuration(minutes) {
  if (!minutes) return "Unknown";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${mins}min`;
}

function App() {
  const [hairstyles, setHairstyles] = useState([]);
  const [topHairstyles, setTopHairstyles] = useState([]);

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedHair, setSelectedHair] = useState("");
  const [showModal, setShowModal] = useState(false);

  // AVAILABLE TIMES
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [salonClosed, setSalonClosed] = useState(false);
  const [workingHours, setWorkingHours] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  useEffect(() => {
    loadHairstyles();
    loadTopHairstyles();
  }, []);

  // Scroll to booking section when coming from Search -> Book
  useEffect(() => {
    const params = new URLSearchParams(
      location.search
    );

    if (params.get("booking") === "true") {
      setTimeout(() => {
        const bookingElement =
          document.querySelector(".booking");

        if (bookingElement) {
          bookingElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  }, [location.search]);

  const loadHairstyles = async () => {
    try {
      const response = await API.get("/hairstyles");
      setHairstyles(response.data);
    } catch (error) {
      console.error(
        "Error loading hairstyles:",
        error
      );
    }
  };

  const loadTopHairstyles = async () => {
    try {
      const response = await API.get(
        "/hairstyles/top"
      );

      setTopHairstyles(response.data);
    } catch (error) {
      console.error(
        "Error loading top hairstyles:",
        error
      );
    }
  };

  // LOAD AVAILABLE TIMES
  const loadAvailableTimes = async (
    selectedDate,
    hairstyleId
  ) => {
    if (!selectedDate || !hairstyleId) {
      setAvailableTimes([]);
      setBookedTimes([]);
      setWorkingHours(null);
      setSalonClosed(false);
      setTime("");
      return;
    }

    try {
      setLoadingTimes(true);
      setTime("");

      const response = await API.get(
        `/appointments/available?date=${selectedDate}&hairstyle=${hairstyleId}`
      );

      setAvailableTimes(
        response.data.availableTimes || []
      );

      setBookedTimes(
        response.data.bookedTimes || []
      );

      setWorkingHours(
        response.data.workingHours || null
      );

      setSalonClosed(
        response.data.closed || false
      );
    } catch (error) {
      console.error(
        "Error loading available times:",
        error
      );

      setAvailableTimes([]);
      setBookedTimes([]);
      setWorkingHours(null);
      setSalonClosed(false);
      setTime("");

      alert(
        error.response?.data?.message ||
          "Could not load available times."
      );
    } finally {
      setLoadingTimes(false);
    }
  };

  const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const bookAppointment = async () => {
    if (!loggedIn) {
      navigate("/login");
      return;
    }

    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!date) {
      alert("Please select a date.");
      return;
    }

    if (!selectedHair) {
      alert("Please select a hairstyle.");
      return;
    }

    if (!time) {
      alert("Please select a free time.");
      return;
    }

    try {
      const selectedHairstyle =
        hairstyles.find(
          (h) => h._id === selectedHair
        );

      await API.post("/appointments", {
        name: name.trim(),
        date,
        time,
        hairstyle: selectedHair,
      });

      setName("");
      setDate("");
      setTime("");
      setSelectedHair("");

      setAvailableTimes([]);
      setBookedTimes([]);
      setWorkingHours(null);
      setSalonClosed(false);

      // Refresh Top 3 after successful booking
      loadTopHairstyles();

      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        navigate("/appointments");
      }, 1500);

      console.log(
        "Booked hairstyle:",
        selectedHairstyle?.name
      );
    } catch (error) {
      console.error(
        "Booking error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Appointment could not be booked."
      );

      // Refresh available times in case
      // somebody booked the slot meanwhile
      if (date && selectedHair) {
        loadAvailableTimes(
          date,
          selectedHair
        );
      }
    }
  };
const selectTopHairstyle = (hairstyleId) => {
  setSelectedHair(hairstyleId);
  setTime("");

  const bookingElement =
    document.querySelector(".booking");

  if (bookingElement) {
    bookingElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};
const getSalonStatus = () => {
  const now = new Date();
  const day = now.getDay();
  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  // Wednesday - closed
  if (day === 3) {
    return {
      open: false,
      text: "SALON CLOSED",
      hours: "Closed today",
    };
  }

  let open;
  let close;

  // Friday, Saturday, Sunday
  if (day === 5 || day === 6 || day === 0) {
    open = 5 * 60;
    close = 19 * 60;
  } else {
    // Monday, Tuesday, Thursday
    open = 9 * 60;
    close = 17 * 60;
  }

  const isOpen =
    currentMinutes >= open &&
    currentMinutes < close;

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(
      mins
    ).padStart(2, "0")}`;
  };

  return {
    open: isOpen,
    text: isOpen
      ? "SALON OPEN"
      : "SALON CLOSED",
    hours: `${formatTime(open)} - ${formatTime(close)}`,
  };
};

const salonStatus = getSalonStatus();
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    setLoggedIn(false);

    navigate("/");
  };
return (
  <Routes>
    {/* HOME */}
    <Route
      path="/"
      element={
        <div className="layout">
          {/* SIDEBAR */}
          <div className="sidebar">
            <h2>HAIR LUX</h2>

            <button
              onClick={() => navigate("/")}
            >
              Dashboard
              
             </button>
                        
               <button
              onClick={() =>
                navigate("/search")
              }
            >
              Search Hairstyles
            </button>

            <button
              onClick={() =>
                navigate("/weather")
              }
            >
              Weather Advice
            </button>
                           <button
              onClick={() =>
                navigate("/reviews")
              }
            >
              Reviews
            </button>
            {loggedIn && (
              <button
                onClick={() =>
                  navigate("/appointments")
                }
              >
                My Appointments
              </button>
            )}

            {!loggedIn && (
              <button
                onClick={() =>
                  navigate("/login")
                }
              >
                Login
              </button>
            )}

            <button
              onClick={() =>
                navigate("/register")
              }
            >
              Register
            </button>

            {loggedIn &&
              role === "admin" && (
                <button
                  onClick={() =>
                    navigate("/admin")
                  }
                >
                  Admin Panel
                </button>
              )}

            {loggedIn && (
              <button
                className="logout"
                onClick={logout}
              >
                Logout
              </button>
            )}

            {/* CONTACT */}
            <div className="sidebar-contact">
              <div className="contact-title">
                CONTACT US
              </div>

              <a href="tel:+38972455907">
                📞 +389 72 455 907
              </a>

              <div className="contact-location">
                📍 Bitola, Macedonia
              </div>
            </div>
          </div>

       {/* MAIN CONTENT */}
<div className="content">

  <button
    onClick={() => {
      document
        .getElementById("booking-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }}
    style={{
      position: "absolute",
      top: "25px",
      right: "40px",
      padding: "12px 22px",
      background: "#000",
      color: "#fff",
      border: "1px solid #fff",
      borderRadius: "10px",
      fontWeight: "bold",
      cursor: "pointer",
      zIndex: 10,
    }}
  >
    BOOK NOW !
  </button>

  <h1>Luxury Hair Styles</h1>

  <p className="subtext">
    Choose your premium style
  </p>

            {/* SALON STATUS */}
            <div className="salon-status">
              <span
                className={
                  salonStatus.open
                    ? "status-dot open"
                    : "status-dot closed"
                }
              ></span>

              <div>
                <strong>
                  {salonStatus.text}
                </strong>

                <small>
                  Today: {salonStatus.hours}
                </small>
              </div>
            </div>

            {/* OSTATOKOT OD TVOJOT CONTENT PRODOLZUVA TUKA */}

              {/* HAIRSTYLES */}
              <div className="grid">
                {hairstyles.map(
                  (hairstyle) => (
                    <motion.div
                      key={hairstyle._id}
                      className="card"
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                    >
                      {hairstyle.image && (
                        <img
                    src={`/images/hair${hairstyles.findIndex((h) => h._id === hairstyle._id) + 1}.jpg`}
                          style={{
                            width: "100%",
                            height: "350px",
                            objectFit:
                              "contain",
                            backgroundColor:
                              "#000",
                            borderRadius:
                              "12px",
                            marginBottom:
                              "15px",
                          }}
                        />
                      )}

                      <h3>
                        {hairstyle.name}
                      </h3>
                      <span className="price">
                        {hairstyle.price} den.
                      </span>

                      <p>
                        ⏱️ Duration:{" "}
                        <strong>
                          {formatDuration(
                            hairstyle.duration
                          )}
                        </strong>
                      </p>
                    </motion.div>
                  )
                )}
              </div>

              {/* TOP 3 MOST REQUESTED */}
              <div
                style={{
                  marginTop: "50px",
                  marginBottom: "40px",
                }}
              >
                <h2
                  style={{
                    textAlign: "center",
                    marginBottom: "10px",
                  }}
                >
                  🏆 TOP 3 MOST REQUESTED
                  HAIRSTYLES
                </h2>

                <p
                  style={{
                    textAlign: "center",
                    marginBottom: "30px",
                    color: "#666",
                  }}
                >
                  The most requested
                  hairstyles by our clients
                </p>

                {topHairstyles.length ===
                0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      background: "#555050",
                      borderRadius: "12px",
                    }}
                  >
                    <p>
                      No hairstyle requests
                      yet.
                    </p>

                    <p
                      style={{
                        color: "#777",
                      }}
                    >
                      Be the first to book
                      your favorite hairstyle!
                    </p>
                  </div>
                ) : (
                  <div
                   style={{
                 display: "grid",
                   gridTemplateColumns:
                 "repeat(3, minmax(0, 1fr))",
                     gap: "12px",
                     }}
                  >
                    {topHairstyles
                      .slice(0, 3)
                      .map(
                        (
                          hairstyle,
                          index
                        ) => (
                          <motion.div
                            key={
                              hairstyle._id
                            }
                            initial={{
                              opacity: 0,
                              y: 20,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              delay:
                                index * 0.1,
                            }}
                        style={{
                           background: "#000",
                           borderRadius: "15px",
                           padding: "12px",
                           textAlign: "center",
                            boxShadow:
                               "0 4px 15px rgba(0,0,0,0.08)",
                           cursor: "pointer",
                              }}
                        onClick={() =>
                           selectTopHairstyle(hairstyle._id)
                          }
                          >
                            {hairstyle.image && (
                              <img
                                src={
                                  hairstyle.image
                                }
                                alt={
                                  hairstyle.name
                                }
                                style={{
                                  width:
                                    "100%",
                                  height:
                                    "280px",
                                  objectFit:
                                    "contain",
                                  backgroundColor:
                                    "#000",
                                  borderRadius:
                                    "12px",
                                  marginBottom:
                                    "15px",
                                }}
                              />
                            )}

                            <div
                              style={{
                                fontSize:
                                  "28px",
                                marginBottom:
                                  "8px",
                              }}
                            >
                              {index ===
                              0
                                ? "🥇"
                                : index ===
                                  1
                                ? "🥈"
                                : "🥉"}
                            </div>

                            <h3>
                              {
                                hairstyle.name
                              }
                            </h3>

                            <p
                              style={{
                                color:
                                  "#777",
                              }}
                            >
                            </p>

                            <p>
                              <strong>
                                {hairstyle.count ||
                                  0}
                              </strong>{" "}
                              booking
                              {(hairstyle.count ||
                                0) !== 1
                                ? "s"
                                : ""}
                            </p>

                            <p>
                              💰{" "}
                              {
                                hairstyle.price
                              }
                              den.
                            </p>

                            <p>
                              ⏱️{" "}
                              {formatDuration(
                                hairstyle.duration
                              )}
                            </p>
                          </motion.div>
                        )
                      )}
                  </div>
                )}
              </div>

              {/* BOOKING */}
              <div
               className="booking"
             id="booking-section"
              >
                <h2>
                  Book Appointment
                </h2>

                {!loggedIn ? (
                  <>
                    <p>
                      Please login to book
                      an appointment.
                    </p>

                    <button
                      onClick={() =>
                        navigate("/login")
                      }
                    >
                      Login to Book
                    </button>
                  </>
                ) : (
                  <>
                    {/* NAME */}
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) =>
                        setName(
                          e.target.value
                        )
                      }
                    />

                    {/* HAIRSTYLE */}
                    <label>
                      Hairstyle
                    </label>

                    <select
                      value={selectedHair}
                      onChange={(e) => {
                        const value =
                          e.target.value;

                        setSelectedHair(
                          value
                        );
                        setTime("");

                        if (
                          value &&
                          date
                        ) {
                          loadAvailableTimes(
                            date,
                            value
                          );
                        } else {
                          setAvailableTimes(
                            []
                          );
                          setBookedTimes(
                            []
                          );
                          setWorkingHours(
                            null
                          );
                          setSalonClosed(
                            false
                          );
                        }
                      }}
                    >
                      <option value="">
                        Select hairstyle
                      </option>

                      {hairstyles.map(
                        (hairstyle) => (
                          <option
                            key={
                              hairstyle._id
                            }
                            value={
                              hairstyle._id
                            }
                          >
                            {
                              hairstyle.name
                            }{" "}
                            -{" "}
                            {
                              hairstyle.price
                            }
                            den. -{" "}
                            {formatDuration(
                              hairstyle.duration
                            )}
                          </option>
                        )
                      )}
                    </select>

                    {/* SELECTED HAIRSTYLE INFO */}
                    {selectedHair && (
                      <div
                        style={{
                          marginTop:
                            "15px",
                          padding:
                            "15px",
                          borderRadius:
                            "10px",
                          background:
                            "#f5f5f5",
                          color: "#111",
                        }}
                      >
                        {(() => {
                          const selected =
                            hairstyles.find(
                              (h) =>
                                h._id ===
                                selectedHair
                            );

                          if (!selected)
                            return null;

                          return (
                            <>
                              <strong>
                                {
                                  selected.name
                                }
                              </strong>

                              <p>
                                Price:{" "}
                                {
                                  selected.price
                                }
                                den.
                              </p>

                              <p>
                                Duration:{" "}
                                {formatDuration(
                                  selected.duration
                                )}
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {/* DATE */}
                    <label
                      style={{
                        display:
                          "block",
                        marginTop:
                          "15px",
                      }}
                    >
                      Appointment date
                    </label>

                    <input
                      type="date"
                      min={getToday()}
                      value={date}
                      onChange={(e) => {
                        const selectedDate =
                          e.target.value;

                        setDate(
                          selectedDate
                        );
                        setTime("");

                        if (
                          selectedDate &&
                          selectedHair
                        ) {
                          loadAvailableTimes(
                            selectedDate,
                            selectedHair
                          );
                        } else {
                          setAvailableTimes(
                            []
                          );
                          setBookedTimes(
                            []
                          );
                          setWorkingHours(
                            null
                          );
                          setSalonClosed(
                            false
                          );
                        }
                      }}
                    />

                    {/* AVAILABLE TIMES */}
                    {date &&
                      selectedHair && (
                        <div
                          style={{
                            marginTop:
                              "20px",
                          }}
                        >
                          <h3
                            style={{
                              color:
                                "#d4a373",
                              marginBottom:
                                "10px",
                            }}
                          >
                            Available Times
                          </h3>

                          {loadingTimes ? (
                            <p>
                              Loading
                              available
                              times...
                            </p>
                          ) : salonClosed ? (
                            <div
                              style={{
                                padding:
                                  "15px",
                                borderRadius:
                                  "10px",
                                background:
                                  "#2a1a1a",
                                border:
                                  "1px solid #8b0000",
                              }}
                            >
                              <strong>
                                Salon is
                                closed on
                                Wednesdays.
                              </strong>
                            </div>
                          ) : (
                            <>
                              {workingHours && (
                                <p
                                  style={{
                                    color:
                                      "#aaa",
                                    marginBottom:
                                      "15px",
                                  }}
                                >
                                Working hours:{" "}
                            Working hours:{" "}
                          <strong>
                           {workingHours.open} - {workingHours.close}
                            </strong>
                                </p>
                              )}

                              {/* FREE TIMES */}
                              {availableTimes.length >
                                0 && (
                                <>
                                  <p
                                    style={{
                                      color:
                                        "#8fd694",
                                      fontWeight:
                                        "bold",
                                    }}
                                  >
                                    🟢 Free
                                  </p>

                                  <div
                                    style={{
                                      display:
                                        "grid",
                                      gridTemplateColumns:
                                        "repeat(3, 1fr)",
                                      gap: "10px",
                                    }}
                                  >
                                    {availableTimes.map(
                                      (
                                        availableTime
                                      ) => (
                                        <button
                                          key={
                                            availableTime
                                          }
                                          type="button"
                                          onClick={() =>
                                            setTime(
                                              availableTime
                                            )
                                          }
                                          style={{
                                            padding:
                                              "10px",
                                            borderRadius:
                                              "8px",
                                            border:
                                              time ===
                                              availableTime
                                                ? "2px solid #fff"
                                                : "1px solid #8fd694",
                                            background:
                                              time ===
                                              availableTime
                                                ? "#d4a373"
                                                : "#16351b",
                                            color:
                                              time ===
                                              availableTime
                                                ? "#000"
                                                : "#8fd694",
                                            cursor:
                                              "pointer",
                                            fontWeight:
                                              "bold",
                                          }}
                                        >
                                          {
                                            availableTime
                                          }
                                        </button>
                                      )
                                    )}
                                  </div>
                                </>
                              )}

                              {/* BOOKED TIMES */}
                              {bookedTimes.length >
                                0 && (
                                <div
                                  style={{
                                    marginTop:
                                      "20px",
                                  }}
                                >
                                  <p
                                    style={{
                                      color:
                                        "#ff8a8a",
                                      fontWeight:
                                        "bold",
                                    }}
                                  >
                                    🔴 Booked
                                  </p>

                                  <div
                                    style={{
                                      display:
                                        "grid",
                                      gridTemplateColumns:
                                        "repeat(3, 1fr)",
                                      gap: "10px",
                                    }}
                                  >
                                    {bookedTimes.map(
                                      (
                                        bookedTime
                                      ) => (
                                        <button
                                          key={
                                            bookedTime
                                          }
                                          type="button"
                                          disabled
                                          style={{
                                            padding:
                                              "10px",
                                            borderRadius:
                                              "8px",
                                            border:
                                              "1px solid #8b0000",
                                            background:
                                              "#301515",
                                            color:
                                              "#ff8a8a",
                                            cursor:
                                              "not-allowed",
                                            textDecoration:
                                              "line-through",
                                          }}
                                        >
                                          {
                                            bookedTime
                                          }
                                        </button>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {availableTimes.length ===
                                0 &&
                                bookedTimes.length >
                                  0 && (
                                  <p
                                    style={{
                                      marginTop:
                                        "15px",
                                      color:
                                        "#ff8a8a",
                                    }}
                                  >
                                    No free
                                    appointments
                                    are
                                    available
                                    for this
                                    hairstyle
                                    on this
                                    date.
                                  </p>
                                )}

                              {availableTimes.length ===
                                0 &&
                                bookedTimes.length ===
                                  0 && (
                                  <p>
                                    No available
                                    times for
                                    this date.
                                  </p>
                                )}
                            </>
                          )}
                        </div>
                      )}

                    {/* SELECTED TIME */}
                    {time && (
                      <div
                        style={{
                          marginTop:
                            "20px",
                          padding:
                            "15px",
                          borderRadius:
                            "10px",
                          background:
                            "#f5f5f5",
                          color: "#111",
                        }}
                      >
                        <strong>
                          Selected time:{" "}
                          {time}
                        </strong>
                      </div>
                    )}

                    {/* CONFIRM BOOKING */}
                    <button
                      onClick={
                        bookAppointment
                      }
                      disabled={
                        !time ||
                        salonClosed
                      }
                      style={{
                        opacity:
                          !time ||
                          salonClosed
                            ? 0.5
                            : 1,
                        cursor:
                          !time ||
                          salonClosed
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      Confirm Booking
                    </button>
                  </>
                )}
              </div>

              {/* SUCCESS MODAL */}
              {showModal && (
                <div className="modal-overlay">
                  <div className="modal-box">
                    <h2>
                      Appointment booked ✨
                    </h2>

                    <p>
                      Your salon appointment
                      was successfully
                      created.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* LOGIN */}
      <Route
        path="/login"
        element={
          <Login
            setLoggedIn={setLoggedIn}
          />
        }
      />

      {/* REGISTER */}
      <Route
        path="/register"
        element={<Register />}
      />

      {/* MY APPOINTMENTS */}
      <Route
        path="/appointments"
        element={
          loggedIn ? (
            <MyAppointments />
          ) : (
            <h1
              style={{
                color: "red",
                textAlign: "center",
              }}
            >
              Please login first 🚫
            </h1>
          )
        }
      />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          loggedIn && role === "admin" ? (
            <AdminDashboard />
          ) : (
            <h1
              style={{
                color: "red",
                textAlign: "center",
              }}
            >
              Access Denied 🚫
            </h1>
          )
        }
      />

      {/* SEARCH */}
      <Route
        path="/search"
        element={<Search />}
      />

           {/* WEATHER */}
      <Route
        path="/weather"
        element={<WeatherAdvice />}
      />

      {/* REVIEWS */}
      <Route
        path="/reviews"
        element={<Reviews />}
      />
    </Routes>
  );
}

export default App;