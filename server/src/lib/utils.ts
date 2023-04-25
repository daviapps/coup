export function generateSimpleIdentifier(){
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}
