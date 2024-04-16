import BigNumber from 'bignumber.js';

// Function for formating principal address
export const formatAddress = (address) => {
  if (typeof address !== 'string') {
    return 'Invalid principal id';
  } // Split the address into segments separated by "-"
  const segments = address.split('-');

  // Keep the first and last segments
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  // Replace middle segments with ellipses
  const middleSegmentsCount = segments.length - 2;
  const middleSegments = middleSegmentsCount > 0 ? '...' : '';

  // Join the segments with ellipses
  const shortenedAddress = `${firstSegment}${middleSegments}${lastSegment}`;

  return shortenedAddress;
};

//  Format account id
export function formatAccountId(accountId) {
  // Check if the account id is valid
  if (typeof accountId !== 'string' || accountId.length !== 64) {
    return 'Invalid account id';
  }

  // Extract the first 6 characters and the last 6 characters of the account id
  const firstPart = accountId.substring(0, 5);
  const lastPart = accountId.substring(accountId.length - 3);

  // Combine the first part, ellipses, and the last part
  const shortenedAccountId = `${firstPart}...${lastPart}`;

  return shortenedAccountId;
}

// Get the number of poistion for timeline
export function getPositionNumber(index, isFinal = false) {
  const positions = {
    0: 'First',
    1: 'Second',
    2: 'Third',
    3: 'Fourth',
    4: 'Fifth',
    5: 'Sixth',
    6: 'Seventh',
    7: 'Eighth',
    8: 'Ninth',
    9: 'Tenth',
    10: 'Eleventh',
    11: 'Twelfth',
    12: 'Thirteenth',
    13: 'Fourteenth',
    14: 'Fifteenth',
    15: 'Sixteenth',
    16: 'Seventeenth',
    17: 'Eighteenth',
    18: 'Nineteenth',
    19: 'Twentieth',
    20: 'Twenty-First',
    21: 'Twenty-Second',
    22: 'Twenty-Third',
    23: 'Twenty-Fourth',
    24: 'Twenty-Fifth',
    25: 'Twenty-Sixth',
    26: 'Twenty-Seventh',
    27: 'Twenty-Eighth',
    28: 'Twenty-Ninth',
    29: 'Thirtieth',
    30: 'Thirty-First',
    31: 'Thirty-Second',
    32: 'Thirty-Third',
    33: 'Thirty-Fourth',
    34: 'Thirty-Fifth',
    35: 'Thirty-Sixth',
    36: 'Thirty-Seventh',
    37: 'Thirty-Eighth',
    38: 'Thirty-Ninth',
    39: 'Fortieth',
    40: 'Forty-First',
    41: 'Forty-Second',
    42: 'Forty-Third',
    43: 'Forty-Fourth',
    44: 'Forty-Fifth',
    45: 'Forty-Sixth',
    46: 'Forty-Seventh',
    47: 'Forty-Eighth',
    48: 'Forty-Ninth',
    49: 'Fiftieth',
  };

  if (index in positions) {
    let position = positions[index];
    if (isFinal) {
      position = 'Final';
    }
    return position;
  } else {
    return null; // Handle invalid index
  }
}

// get WeekDay by nuumber
const getWeekDayString = (weekNumber) => {
  var weekdays = ['Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Sat'];
  return weekdays[weekNumber];
};

// Format date for timeline
export const formatDate = (date) => {
  // Extract day, month, and year
  let day = date.getDate();
  let month = date.getMonth() + 1; // Months are zero-indexed, so we add 1
  let year = date.getFullYear();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let weekDay = getWeekDayString(date.getDay());

  if (hour < 10) {
    hour = '0' + String(hour);
  }
  if (minute < 10) {
    minute = '0' + String(minute);
  }
  // Convert date to string
  var dateString = date.toString();

  // Split the string by spaces
  var parts = dateString.split(' ');

  // Extract the time zone information
  var timeZone = parts[parts.length - 3] + ' ' + parts[parts.length - 1];

  // Format the date in non-American way (day-month-year)
  return `${weekDay}, ${day}/${month}/${year}, ${hour}:${minute} ${timeZone}`;
};

