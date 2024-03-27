"use client";

import { getState } from "@/redux/store";
import { useSelector } from "react-redux";

// function for generating class name for dark mode

//algorythm: it takes the class name and if the component is activable it generates 4 classes one without active class and white mode the othe one is
// with active class and light mode next one is
//with out active class and dark mode and the last one is
//with active class and dark mode

// in case its not activable it only generate two scenarios which is dark class and without dark class
export default function darkModeClassnamegenerator(className, activable) {
  const isDark = useSelector((state) => state.theme.isDark);

  if (activable) {
    if (isDark == true) {
      return `${className} active dark`;
    } else {
      return `${className} active`;
    }
  } else {
    if (isDark == true) {
      return `${className}  dark`;
    } else {
      return `${className} `;
    }
  }
}


export function darkClassGenerator(isDark,className) {

  if (isDark == true) {
    return `${className}  dark`;
  } else {
    return `${className} `;
  }

}