const green = '#06D6A0';
const yellow = '#FFD166';
const red = '#EF476F';

module.exports = {
  secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'kebab',
  etaEnv: {
    kaschuso: process.env.KASCHUSO_BASE_URL || 'https://kaschuso.so.ch/',
    gyros: process.env.GYROS_BASE_URL || 'http://localhost/',
    colors: {
        insufficient: red,
        sufficient: yellow,
        good: green,
        'Unentschuldigt': red,
        'Entschuldigt': green,
        'Nicht zählend': green,
        'offen': yellow
    }
  }
};
