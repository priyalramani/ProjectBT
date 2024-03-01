

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import "./style.css";



const MainAdmin1 = () => {



  return (
    <>

      <div
        style={{
          position: "fixed",
          bottom: "10vh",
          left: 0,
          fontSize: "20px",
          zIndex: "9999999999999",
          fontWeight: "bold",
          width: "100px",
          textAlign: "center",
        }}
      >
        {}
      </div>
      <Sidebar  />
      <div
        className="right-side"
        
      >
        <Header />

        <div
          style={
          { display: "flex", height: "100%" }
          }
        ></div>
      </div>
    </>
  );
};

export default MainAdmin1;
