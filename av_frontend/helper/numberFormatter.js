import BigNumber from "bignumber.js";

//format number to 4 significant digits
export function formatSignificantNumber(number) {
  if (number === 0) {
    return 0;
  }

  var magnitude = Math.pow(
    10,
    4 - Math.floor(Math.log10(Math.abs(number))) - 1
  );
  var roundedNumber = Math.round(number * magnitude) / magnitude;
  return new BigNumber(roundedNumber).toString();
}

//format number to 2 decimal places
export const formatDecimalValue = (number= 0, digits = 2) => {
  if (number) {
    number = +new BigNumber(number).decimalPlaces(digits, BigNumber.ROUND_DOWN);
    if (Math.abs(number) < 10000) {
    let num =   number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return  num;
    } else if (Math.abs(number) < 1e6) {
      return (number / 1e3).toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "k";
    } else {
      return (number / 1e6).toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "M";
    }
  }else {
    return 0;
  }
};
//convert and format percentage to 2 decimal places dollar value
export const formatPrice = (coinPerc, totalBal) => {
  return new BigNumber(+coinPerc / 100)
    .times(new BigNumber(totalBal))
    .decimalPlaces(2, BigNumber.ROUND_DOWN)
    .toNumber();
};

//Get the current date in the format of YYYY-MM-DD
export const getCurrentDate = () => {
  var date = new Date();
  var month = (date.getMonth() + 1 < 10 ? "0" : "") + (date.getMonth() + 1);
  var day = (date.getDate() < 10 ? "0" : "") + date.getDate();
  var year = date.getFullYear();

  return year + "-" + month + "-" + day;
};
//Get the 20 min ahead time of current time in the format of HH:MM AM/PM
export const getTwentyMinAheadTime = () => {
  var date = new Date();
  date.setMinutes(date.getMinutes() + 20);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;

  return strTime;
};

export function findNearestDay(selectedDay) {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDayIndex = new Date().getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  const selectedDayIndex = daysOfWeek.indexOf(selectedDay);

  // Calculate the difference between selected day and current day
  let dayDifference = selectedDayIndex - currentDayIndex;
  console.log("dayDifference : ", dayDifference);
  if (dayDifference < 0) {
    dayDifference = 7 + dayDifference; // Add 7 to get future dates for days earlier in the week
  }

  // Calculate the nearest future date based on the selected day
  const nearestDate = new Date();
  console.log(nearestDate.getDate(), dayDifference);
  nearestDate.setDate(nearestDate.getDate() + dayDifference);
  // Set hours, minutes, seconds, and milliseconds to 0 (12:00 AM)
  nearestDate.setHours(0, 0, 0, 0);
  console.log("nearestDate : ", nearestDate);

  // Return the nearest date in milliseconds
  return nearestDate.getTime();
}
// format high digit numbers into letter numbers like 1k or 1M
export function formatHugeNumbers(num, decimalPlaces = 2) {
  if (num) {
    // Convert the number to a string and add commas
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}

// validate the input value is a number or not and return the number greater than 0
export const validateInput = (value) => {
  const intValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
  const validatedValue = isNaN(intValue) ? 0 : intValue ;
  return validatedValue;
};
