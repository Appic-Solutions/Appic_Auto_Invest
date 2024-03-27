export default function searchByNameAndSymbol(tokens, query){
    const result = [];
    for (const token of tokens) {
        if (token.coinName && token.coinName.toLowerCase().includes(query.toLowerCase())) {
            result.push(token);
        } else if (token.coinSymbol && token.coinSymbol.toLowerCase().includes(query.toLowerCase())) {
            result.push(token);
        }
    }
    console.log(result)
    return result;
}