const calculateYieldPerHectare = (totalHarvestAmount, fieldArea) => {
  const harvest = Number(totalHarvestAmount);
  const area = Number(fieldArea);

  if (harvest <= 0) {
    throw new Error("Total harvest amount must be greater than zero.");
  }

  if (area <= 0) {
    throw new Error("Field area must be greater than zero.");
  }

  return Number((harvest / area).toFixed(2));
};

const getYieldStatus = (yieldPerHectare) => {
  if (yieldPerHectare < 2000) {
    return "Low Yield";
  }

  if (yieldPerHectare >= 2000 && yieldPerHectare < 4000) {
    return "Normal Yield";
  }

  return "High Yield";
};

module.exports = {
  calculateYieldPerHectare,
  getYieldStatus,
};