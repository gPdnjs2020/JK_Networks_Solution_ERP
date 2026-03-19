export function calcVAT(total) {
    const supply = Math.round(total / 1.1);
    const vat = total - supply;
  
    return {
      supply,
      vat,
      total,
    };
  }