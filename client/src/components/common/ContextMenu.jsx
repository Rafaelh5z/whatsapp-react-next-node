import React, { useEffect, useRef } from "react"

function ContextMenu({options, cordinates, contextMenu, setContextMenu}) {

  const contextMenuRef = useRef(null)

  useEffect(() => {

    const handleClickOutside = (e) => {
        
      if (e.target.id !== "context-opener") {

        if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {

          setContextMenu(false)
        }
      }
    }

    document.addEventListener("click", handleClickOutside)

    return () => document.removeEventListener("click", handleClickOutside)
  }, [contextMenu])

  const handleClick = (e, callback) => {

    e.stopPropagation()

    callback()
    setContextMenu(false)
  }

  return (
    <div 
      className={`
        bg-dropdown-background 
        fixed 
        py-2 
        z-[100]  
        shadow-xl`
      }
      ref={contextMenuRef}
      style={{ 
        top: cordinates.y,
        left: cordinates.x,
      }}
    >
      <ul>
        {
          options.map(({name, callback}) => (
            <li
              key={name}
              className="px-5 py-2 cursor-pointer hover:bg-background-default-hover"
              onClick={() => handleClick(event, callback)}
            >
              <span className="text-white">
                {name}
              </span>
            </li>
          ))
        }
      </ul>
    </div>
  )
}

export default ContextMenu
