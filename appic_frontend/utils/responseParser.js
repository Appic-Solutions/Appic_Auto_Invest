export const parseResponseGetAllTokens = (response) => {
  let allToken = [];
  response.forEach((token) => {
    const logo = 'https://cdn.sonic.ooo/icons/' + token.id || questionMarkSrc;
    var tempTkn = { ...token, price: token.price || 0, logo, totalSupply: token?.totalSupply.toString(), fee: token?.fee.toString() };
    allToken.push(tempTkn);
  });

  return allToken;
};

