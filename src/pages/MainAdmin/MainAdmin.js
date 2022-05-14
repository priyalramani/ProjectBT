import React from 'react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import "./style.css"
const MainAdmin = () => {
  return (<>
  <Sidebar/>
  <div className="right-side">
      <Header/>
      MainAdmin
      </div>
    </>
  )
}

export default MainAdmin