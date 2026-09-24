function Navbar({ setLoggedIn }) {
  return (
    <div className="navbar">
      <h2>HairStyle App</h2>

      <button onClick={() => {
        localStorage.clear();
        setLoggedIn(false);
      }}>
        Logout
      </button>
    </div>
  );
}

export default Navbar;