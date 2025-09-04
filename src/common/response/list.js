module.exports = (data) => {
  let count = data.length;

  let general = {
    count,
    result: data,
  };

  return general;
};
