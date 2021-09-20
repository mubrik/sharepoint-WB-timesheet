// mini id geerator
function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
};
// delay function, returns promise
function delay(t:number, v) {
  return new Promise(function(resolve) { 
      setTimeout(resolve.bind(null, v), t)
  });
};

export {getRandomInt, delay};