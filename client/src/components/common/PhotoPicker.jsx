import React from "react"
import ReactDOM from "react-dom"

function PhotoPicker({onChange}) {

  const component = <input id="photo-picker" onChange={onChange} type="file" accept="image/*" hidden />

  return ReactDOM.createPortal(component, document.getElementById("photo-picker-element"))
}

export default PhotoPicker 
