//I want to make higher level component screen to show predefined template token list upon clicking suggestion button . The screen will slide from right side of screen and will take one third of screen width It end  will still attached to right side of screen make css of it using scss 
import React, { useState } from 'react';
import styles from '../../redux/styleComponents/higherOrderComponents/templateModal.scss';
import darkModeClassnamegenerator from '@/utils/darkClassGenerator';
const TemplateModal = ({children,isExpanded,toggleScreen}) => {
  
  // Add more objects with different names and descriptions as needed...
  
  return (
    <div className={darkModeClassnamegenerator("mainContainer")}>
      <div className={`slideInScreen ${isExpanded ? "expanded" : ''}`}>
{/* button to close screen */}
        <button className={"closeButton"} onClick={toggleScreen}>
        <svg xmlns="http://www.w3.org/2000/svg" height="16" width="12" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
    
        </button>
        {children}
      </div>

      {/* Your main content goes here */}
    </div>
  );
};

export default TemplateModal;


