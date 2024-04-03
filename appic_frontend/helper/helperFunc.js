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

